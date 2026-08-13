import hashlib
import math
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
import pandas as pd
import requests

# Load environment variables from .env file if present
load_dotenv()

app = Flask(__name__)

# Enable CORS for React frontend running on localhost:5173
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "*"]}})

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# ── DATASET & DB PATH SETUP ──────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_PATH = os.path.join(BASE_DIR, 'sancharam.db')

# Configure SQLAlchemy with SQLite at backend/sancharam.db
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

GENESIS_HASH = "GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000"
CHAT_SYSTEM_PROMPT = (
    "You are a helpful Tamil Nadu travel guide. The user may write in Tamil script or English. "
    "Always respond in the same language the user used. Keep answers short, practical, and specific to Tamil Nadu. "
    "If asked about a place, include the Tamil name of that place."
)


def format_iso_timestamp(dt):
    """Ensures deterministic ISO timestamp formatting for SQLite naive datetimes."""
    if dt is None:
        dt = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


# ── SQLALCHEMY MODEL: TIP ────────────────────────────────────
class Tip(db.Model):
    __tablename__ = 'tips'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    location_name = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    content = db.Column(db.String(300), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    hash = db.Column(db.String(64), nullable=False)
    prev_hash = db.Column(db.String(64), nullable=True)

    def __init__(self, **kwargs):
        super(Tip, self).__init__(**kwargs)

    def to_dict(self):
        iso_time = format_iso_timestamp(self.created_at)
        coords_str = f"{self.latitude}, {self.longitude}" if (self.latitude is not None and self.longitude is not None) else None
        return {
            'id': self.id,
            'title': self.title,
            'category': self.category,
            'location_name': self.location_name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'coordinates': coords_str,
            'content': self.content,
            'text': self.content,
            'created_at': iso_time,
            'timestamp': iso_time,
            'hash': self.hash,
            'prev_hash': self.prev_hash,
            'verified': True
        }


# Create database tables and seed initial tips if empty
with app.app_context():
    try:
        db.create_all()
        # Test if schema contains prev_hash column
        Tip.query.first()
    except Exception as schema_err:
        print(f"[SCHEMA REBUILD] Re-creating tips table with prev_hash column: {schema_err}")
        db.drop_all()
        db.create_all()

    if Tip.query.count() == 0:
        initial_tips_data = [
            {
                'title': 'Best Morning Filter Coffee & Tiffin',
                'category': 'food',
                'location_name': 'Rayar\'s Mess, Mylapore',
                'latitude': 13.0337,
                'longitude': 80.2686,
                'content': 'Go before 7:30 AM for the freshest filter coffee and hot mini idlis. Cash only payment, tucked inside a heritage Mylapore lane!'
            },
            {
                'title': 'Safe Night Auto-Rickshaw Tip',
                'category': 'safety',
                'location_name': 'Koyambedu Bus Terminus',
                'latitude': 13.0695,
                'longitude': 80.1966,
                'content': 'Use the official prepaid auto booth near Gate 3 late at night. Avoid unmetered autos waiting outside the main road.'
            },
            {
                'title': 'Secret Sunset Over Adyar Estuary',
                'category': 'hidden spot',
                'location_name': 'Broken Bridge, Besant Nagar',
                'latitude': 13.0030,
                'longitude': 80.2725,
                'content': 'Great spot where the river meets the sea. Park near Besant Nagar beach and walk 10 minutes along the shore. Best at 5:30 PM.'
            },
            {
                'title': 'Temple Dress Code & Photography Etiquette',
                'category': 'temple etiquette',
                'location_name': 'Kapaleeshwarar Temple, Mylapore',
                'latitude': 13.0337,
                'longitude': 80.2686,
                'content': 'Shoulders and knees must be covered. Leave footwear at the East Gopuram counter (free). Photography allowed in courtyards but not inside inner sanctum.'
            }
        ]
        running_prev_hash = GENESIS_HASH
        for item in initial_tips_data:
            now = datetime.now(timezone.utc)
            now_iso = format_iso_timestamp(now)
            h_input = f"{running_prev_hash}:{item['content']}:{now_iso}".encode('utf-8')
            h_val = hashlib.sha256(h_input).hexdigest()
            t = Tip(
                title=item['title'],
                category=item['category'],
                location_name=item['location_name'],
                latitude=item['latitude'],
                longitude=item['longitude'],
                content=item['content'],
                created_at=now,
                hash=h_val,
                prev_hash=running_prev_hash
            )
            db.session.add(t)
            db.session.commit()
            running_prev_hash = h_val


CRIME_ZONES_PATH = os.path.join(DATA_DIR, 'chennai_police_crime_zones_2023.csv')
ACCIDENT_BLACKSPOTS_PATH = os.path.join(DATA_DIR, 'tnsta_accident_blackspots_2023.csv')


def load_dataset(filepath, name):
    """Loads a CSV dataset safely into a pandas DataFrame with validation logging."""
    if not os.path.exists(filepath):
        print(f"[ERROR] Missing file: '{name}' not found at {filepath}")
        return None
    try:
        df = pd.read_csv(filepath)
        print(f"[SUCCESS] Loaded '{name}': {len(df)} rows.")
        print(f"  Columns: {list(df.columns)}")
        return df
    except Exception as e:
        print(f"[ERROR] Failed to load dataset '{name}' from {filepath}: {e}")
        return None


# Module-level DataFrames accessible to all routes
CRIME_ZONES_DF = load_dataset(CRIME_ZONES_PATH, 'chennai_police_crime_zones_2023.csv')
ACCIDENT_BLACKSPOTS_DF = load_dataset(ACCIDENT_BLACKSPOTS_PATH, 'tnsta_accident_blackspots_2023.csv')


MIN_BBOX_LAT, MAX_BBOX_LAT = 12.50, 13.30
MIN_BBOX_LNG, MAX_BBOX_LNG = 79.80, 80.35

def is_in_chennai_chengalpattu_bbox(lat, lng):
    try:
        f_lat = float(lat)
        f_lng = float(lng)
        return (MIN_BBOX_LAT <= f_lat <= MAX_BBOX_LAT) and (MIN_BBOX_LNG <= f_lng <= MAX_BBOX_LNG)
    except (ValueError, TypeError):
        return False


def prepare_crime_records():
    """Formats crime zones DataFrame into standardized records filtered to Chennai & Chengalpattu bounding box."""
    if CRIME_ZONES_DF is None or CRIME_ZONES_DF.empty:
        return []
    df = CRIME_ZONES_DF.copy()
    df['id'] = df['zone_id']
    df['name'] = df['zone_name']
    df['description'] = df['primary_concern']
    df['source'] = 'crime'
    records = df.to_dict(orient='records')
    return [r for r in records if is_in_chennai_chengalpattu_bbox(r.get('latitude'), r.get('longitude'))]


def prepare_accident_records():
    """Formats accident blackspots DataFrame into standardized records filtered to Chennai & Chengalpattu bounding box."""
    if ACCIDENT_BLACKSPOTS_DF is None or ACCIDENT_BLACKSPOTS_DF.empty:
        return []
    df = ACCIDENT_BLACKSPOTS_DF.copy()
    df['id'] = df['zone_id']
    df['name'] = df['zone_name']
    df['description'] = df['primary_cause']
    df['source'] = 'accident'
    records = df.to_dict(orient='records')
    return [r for r in records if is_in_chennai_chengalpattu_bbox(r.get('latitude'), r.get('longitude'))]


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculates the great-circle distance between two points on Earth in kilometers."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def calculate_risk_score(lat, lng, hour):
    """
    Computes a risk score (0-100) based on nearby risk zones within 2km
    and a time-of-day multiplier.
    """
    all_zones = prepare_crime_records() + prepare_accident_records()

    # Calculate distance to every zone
    annotated_zones = []
    for zone in all_zones:
        try:
            z_lat = float(zone['latitude'])
            z_lng = float(zone['longitude'])
            dist = haversine_distance(lat, lng, z_lat, z_lng)
            annotated_zones.append({**zone, 'distance_km': dist})
        except (ValueError, TypeError, KeyError):
            continue

    # Sort by distance
    annotated_zones.sort(key=lambda z: z['distance_km'])

    # Find zones within 2 km radius
    nearby_zones = [z for z in annotated_zones if z['distance_km'] <= 2.0]
    nearby_zones_count = len(nearby_zones)

    # Base score assignment based on highest risk level within 2 km
    if nearby_zones:
        risk_levels = [str(z.get('risk_level', '')).lower() for z in nearby_zones]
        if 'high' in risk_levels:
            base_score = 80
        elif 'medium' in risk_levels:
            base_score = 50
        elif 'low' in risk_levels:
            base_score = 20
        else:
            base_score = 10
    else:
        base_score = 10

    # Time-of-day multiplier
    if 0 <= hour < 6:
        multiplier = 1.8
    elif 6 <= hour < 10:
        multiplier = 0.7
    elif 10 <= hour < 17:
        multiplier = 0.5
    elif 17 <= hour < 21:
        multiplier = 0.8
    elif 21 <= hour < 24:
        multiplier = 1.5
    else:
        multiplier = 1.0

    # Compute final capped score
    calculated_score = round(base_score * multiplier, 1)
    final_score = min(100.0, calculated_score)

    # Risk level classification
    if final_score >= 70:
        risk_level_str = 'High'
    elif final_score >= 40:
        risk_level_str = 'Medium'
    elif final_score >= 20:
        risk_level_str = 'Low'
    else:
        risk_level_str = 'Safe'

    # Top 3 nearest zones
    top_3_nearest = [z['name'] for z in annotated_zones[:3]]

    return {
        'score': final_score,
        'risk_level': risk_level_str,
        'hour': hour,
        'nearby_zones_count': nearby_zones_count,
        'nearest_zones': top_3_nearest
    }


def geocode_place(place_name):
    """
    Geocodes a place name string using OpenStreetMap Nominatim API with fallback for common landmarks.
    """
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        'q': f"{place_name}, Tamil Nadu, India",
        'format': 'json',
        'limit': 1
    }
    headers = {
        'User-Agent': 'Sancharam-AI-App/1.0 (contact@sancharam.ai)'
    }
    try:
        res = requests.get(url, params=params, headers=headers, timeout=5)
        if res.status_code == 200:
            data = res.json()
            if data and len(data) > 0:
                return float(data[0]['lat']), float(data[0]['lon'])
    except Exception as e:
        print(f"[GEOCODE WARN] Nominatim lookup for '{place_name}' failed: {e}")

    # Fallback map for popular Tamil Nadu places
    fallback_map = {
        'koyambedu': (13.0695, 80.1966),
        't. nagar': (13.0418, 80.2341),
        't nagar': (13.0418, 80.2341),
        'mylapore': (13.0337, 80.2686),
        'marina beach': (13.0499, 80.2824),
        'marina': (13.0499, 80.2824),
        'adyar': (13.0012, 80.2565),
        'besant nagar': (13.0002, 80.2668),
        'anna nagar': (13.0850, 80.2101),
        'guindy': (13.0067, 80.2022),
        'chennai central': (13.0827, 80.2755),
        'airport': (12.9941, 80.1709),
        'kathipara': (13.0067, 80.2022),
        'velachery': (12.9750, 80.2210),
        'tambaram': (12.9249, 80.1000),
        'madurai': (9.9195, 78.1193),
        'thanjavur': (10.7870, 79.1378),
        'tranquebar': (11.0267, 79.8544),
        'kodaikanal': (10.2381, 77.4892)
    }

    key = place_name.lower().strip()
    for k, coords in fallback_map.items():
        if k in key:
            return coords

    # Default fallback: Chennai City Center
    return 13.0827, 80.2707


def generate_tamil_nadu_travel_reply(msg):
    """
    Intelligent domain-specific fallback generator for Tamil Nadu travel queries.
    Responds in the user's language (Tamil script or English) and includes Tamil place names.
    """
    msg_lower = msg.lower()
    is_tamil_script = any('\u0b80' <= char <= '\u0bff' for char in msg)

    if is_tamil_script:
        if any(w in msg for w in ['சாப்பாடு', 'உணவு', 'சாப்பிட', 'காபி']):
            return "தமிழ்நாட்டின் சிறந்த பாரம்பரிய உணவுகள்: மதுரை ஜிகர்தண்டா (Jigarthanda), செட்டிநாடு காரி தோசை (Chettinad Kari Dosa), மற்றும் மயிலாப்பூர் ஃபில்டர் காபி (Mylapore Filter Coffee). சுவைத்து மகிழுங்கள்!"
        elif any(w in msg for w in ['பாதுகாப்பு', 'இரவு', 'போலீஸ்']):
            return "பாதுகாப்பு குறிப்பு: இரவில் கோயம்பேடு (Koyambedu) அல்லது சென்னை மெட்ரோ ரயில்களைப் பயன்படுத்தவும். அவசர உதவிக்கு காவல்துறை 100 ஐ அழைக்கவும்."
        elif any(w in msg for w in ['இடம்', 'சுற்றுலா', 'கோவில்']):
            return "தமிழ்நாட்டின் வரலாற்று சிறப்புமிக்க இடங்கள்: 1) தஞ்சாவூர் பிரகதீஸ்வரர் கோவில் (Thanjavur Brihadeeswarar Temple) 2) மதுரை மீனாட்சி அம்மன் கோவில் (Madurai Meenakshi Temple) 3) தனுஷ்கோடி (Dhanushkodi) 4) தரங்கம்பாடி (Tranquebar)."
        else:
            return f"வணக்கம்! உங்கள் கேள்வி: '{msg}'. தமிழ்நாட்டின் ஆன்மீகக் கோவில்கள், மலைவாசஸ்தலங்கள் மற்றும் கலாச்சாரம் பற்றி மேலும் அறிய என்னிடம் கேளுங்கள்!"

    # English Language Queries
    if any(w in msg_lower for w in ['food', 'eat', 'coffee', 'restaurant', 'tiffin']):
        return "Must-try Tamil Nadu delicacies: 1) Mylapore Filter Coffee (மயிலாப்பூர் ஃபில்டர் காபி), 2) Madurai Famous Jigarthanda (மதுரை ஜிகர்தண்டா), 3) Chettinad Mansions Feast at Karaikudi (காரைக்குடி செட்டிநாடு உணவு)."
    elif any(w in msg_lower for w in ['safe', 'night', 'emergency', 'police', 'danger']):
        return "Safety Notice: Sancharam Guardian Mode tracks your GPS live. For late-night transit, use prepaid autos at Koyambedu Bus Terminus (கோயம்பேடு பேருந்து நிலையம்). Police Emergency: Call 100."
    elif 'madurai' in msg_lower:
        return "Madurai (மதுரை) - The cultural capital! Visit Meenakshi Amman Temple (மீனாட்சி அம்மன் கோவில்), Thirumalai Nayakkar Palace (திருமலை நாயக்கர் மகால்), and sample night street food."
    elif any(w in msg_lower for w in ['tanjore', 'thanjavur', 'temple', 'chola']):
        return "Thanjavur (தஞ்சாவூர்) - Home to the magnificent Great Living Chola Temple, Brihadeeswarar Temple (பிரகதீஸ்வரர் கோவில்). Unmatched Chola bronze artistry!"
    elif any(w in msg_lower for w in ['chennai', 'beach', 'marina']):
        return "Chennai (சென்னை) - Stroll along Marina Beach (மெரினா கடற்கரை), visit Kapaleeshwarar Temple (கபாலீஸ்வரர் கோவில்) in Mylapore, and explore Fort St. George."
    elif any(w in msg_lower for w in ['kodai', 'kodaikanal', 'hill', 'mountain', 'vattakanal']):
        return "Kodaikanal (கொடைக்கானல்) - Explore quiet Poombarai Village (பூம்பாறை), Dolphin's Nose cliff in Vattakanal (வட்டக்கானல்), and pine forests."
    else:
        return f"Hello! Welcome to Tamil Nadu. Sancharam AI can guide your route safety, heritage spots in Thanjavur (தஞ்சாவூர்), Madurai (மதுரை), or Tranquebar (தரங்கம்பாடி). Ask me any question in English or Tamil!"


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check route returning server status, current timestamp, and dataset load status."""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'datasets': {
            'crime_zones_loaded': CRIME_ZONES_DF is not None,
            'crime_zones_rows': len(CRIME_ZONES_DF) if CRIME_ZONES_DF is not None else 0,
            'accident_blackspots_loaded': ACCIDENT_BLACKSPOTS_DF is not None,
            'accident_blackspots_rows': len(ACCIDENT_BLACKSPOTS_DF) if ACCIDENT_BLACKSPOTS_DF is not None else 0
        }
    }), 200


@app.route('/api/risk-zones', methods=['GET'])
def get_risk_zones():
    """Returns risk zone data filtered by type parameter (crime, accident, or both)."""
    zone_type = request.args.get('type', 'both').lower().strip()

    if zone_type not in ['crime', 'accident', 'both']:
        return jsonify({
            'error': 'Invalid type parameter. Must be one of: crime, accident, both'
        }), 400

    crime_records = prepare_crime_records() if zone_type in ['crime', 'both'] else []
    accident_records = prepare_accident_records() if zone_type in ['accident', 'both'] else []

    combined_records = crime_records + accident_records
    return jsonify(combined_records), 200


@app.route('/api/risk-score', methods=['GET'])
def get_risk_score():
    """
    Returns computed risk score, category, nearby zones count, and nearest 3 zones for given coordinates.
    Query parameters:
      - lat (float, required)
      - lng (float, required)
      - hour (int 0-23, optional - defaults to current hour)
    """
    lat_param = request.args.get('lat')
    lng_param = request.args.get('lng')

    if lat_param is None or lng_param is None:
        return jsonify({
            'error': "Query parameters 'lat' and 'lng' are required."
        }), 400

    try:
        lat = float(lat_param)
        lng = float(lng_param)
    except ValueError:
        return jsonify({
            'error': "Query parameters 'lat' and 'lng' must be valid float numbers."
        }), 400

    hour_param = request.args.get('hour')
    if hour_param is not None and hour_param.strip() != '':
        try:
            hour = int(hour_param)
            if not (0 <= hour <= 23):
                return jsonify({
                    'error': "Query parameter 'hour' must be an integer between 0 and 23."
                }), 400
        except ValueError:
            return jsonify({
                'error': "Query parameter 'hour' must be an integer."
            }), 400
    else:
        hour = datetime.now().hour

    result = calculate_risk_score(lat, lng, hour)
    return jsonify(result), 200


@app.route('/api/nearby-station', methods=['GET'])
def get_nearby_station():
    """
    Returns the nearest police station for a given (lat, lng) location.
    Query parameters:
      - lat (float, required)
      - lng (float, required)
    """
    lat_param = request.args.get('lat')
    lng_param = request.args.get('lng')

    fallback_response = {
        'name': 'Chennai City Police',
        'police_station': 'Chennai City Police',
        'station_name': 'Chennai City Police',
        'district': 'Chennai',
        'police_district': 'Chennai',
        'number': '100',
        'emergency_number': '100',
        'distance_km': None,
        'distance': None
    }

    if lat_param is None or lng_param is None:
        return jsonify({
            'error': "Query parameters 'lat' and 'lng' are required."
        }), 400

    try:
        lat = float(lat_param)
        lng = float(lng_param)
    except ValueError:
        return jsonify({
            'error': "Query parameters 'lat' and 'lng' must be valid float numbers."
        }), 400

    if CRIME_ZONES_DF is None or CRIME_ZONES_DF.empty:
        return jsonify(fallback_response), 200

    closest_station = None
    min_distance = float('inf')

    for _, row in CRIME_ZONES_DF.iterrows():
        try:
            st_lat = float(row['latitude'])
            st_lng = float(row['longitude'])
            st_name = str(row.get('police_station', '')).strip()
            st_district = str(row.get('police_district', '')).strip()

            if not st_name or st_name.lower() in ['nan', 'none']:
                continue

            dist = haversine_distance(lat, lng, st_lat, st_lng)
            if dist < min_distance:
                min_distance = dist
                closest_station = {
                    'name': st_name,
                    'police_station': st_name,
                    'station_name': st_name,
                    'district': st_district,
                    'police_district': st_district,
                    'number': '100',
                    'emergency_number': '100',
                    'distance_km': round(dist, 2),
                    'distance': round(dist, 2)
                }
        except (ValueError, TypeError, KeyError):
            continue

    if closest_station is None:
        return jsonify(fallback_response), 200

    return jsonify(closest_station), 200


@app.route('/api/heatmap', methods=['GET'])
def get_heatmap_data():
    """
    Returns risk zones formatted specifically for a Leaflet heatmap layer.
    Each item in the array has exactly three fields: lat, lng, and intensity.
      - High risk -> intensity 1.0
      - Medium risk -> intensity 0.6
      - Low risk -> intensity 0.2
    """
    all_zones = prepare_crime_records() + prepare_accident_records()
    heatmap_points = []

    for z in all_zones:
        try:
            lat = float(z['latitude'])
            lng = float(z['longitude'])
            risk = str(z.get('risk_level', '')).lower()

            if risk == 'high':
                intensity = 1.0
            elif risk == 'medium':
                intensity = 0.6
            else:
                intensity = 0.2

            heatmap_points.append({
                'lat': lat,
                'lng': lng,
                'intensity': intensity
            })
        except (ValueError, TypeError, KeyError):
            continue

    return jsonify(heatmap_points), 200


@app.route('/api/stats', methods=['GET'])
def get_dataset_stats():
    """
    Returns aggregate statistics about the dataset for dashboard cards on the Safety page.
    """
    all_zones = prepare_crime_records() + prepare_accident_records()
    total_zones = len(all_zones)

    high_count = 0
    medium_count = 0
    low_count = 0
    risk_scores_sum = 0

    def danger_rank(z):
        risk = str(z.get('risk_level', '')).lower()
        base_w = 80 if risk == 'high' else (50 if risk == 'medium' else 20)
        incidents = float(z.get('total_crimes_2023', 0) or z.get('total_accidents_2023', 0) or 0)
        return (base_w, incidents)

    sorted_dangerous = sorted(all_zones, key=danger_rank, reverse=True)
    top_3_dangerous = [z['name'] for z in sorted_dangerous[:3]]

    for z in all_zones:
        risk = str(z.get('risk_level', '')).lower()
        if risk == 'high':
            high_count += 1
            risk_scores_sum += 80
        elif risk == 'medium':
            medium_count += 1
            risk_scores_sum += 50
        else:
            low_count += 1
            risk_scores_sum += 20

    if total_zones > 0:
        avg_risk_score = risk_scores_sum / total_zones
        city_safety_index = round(max(0.0, 100.0 - avg_risk_score), 1)
    else:
        city_safety_index = 100.0

    return jsonify({
        'total_zones': total_zones,
        'high_risk_count': high_count,
        'medium_risk_count': medium_count,
        'low_risk_count': low_count,
        'top_dangerous_zones': top_3_dangerous,
        'city_safety_index': city_safety_index,
        'last_updated': '2023 Annual Police & Road Safety Audit'
    }), 200


@app.route('/api/tips', methods=['GET'])
def get_tips():
    """Returns all tips from SQLite ordered by newest first as a list of JSON objects."""
    tips = Tip.query.order_by(Tip.created_at.desc()).all()
    return jsonify([tip.to_dict() for tip in tips]), 200


@app.route('/api/tips', methods=['POST'])
def create_tip():
    """
    Accepts a JSON body, validates required fields,
    computes a Hash-Chain SHA-256 verification hash by chaining with the previous tip's hash,
    saves to SQLite database, and returns the created tip object with its hash and id.
    """
    data = request.get_json() or {}

    title = str(data.get('title', '')).strip()
    category = str(data.get('category', '')).strip().lower()
    location_name = str(data.get('location_name') or data.get('location') or '').strip()
    content = str(data.get('content') or data.get('text') or '').strip()

    if not title or not category or not location_name or not content:
        return jsonify({
            'error': 'Missing required fields. title, category, location_name (or location), and content (or text) are required.'
        }), 400

    # Parse optional coordinates
    latitude = None
    longitude = None
    if 'latitude' in data and data['latitude'] is not None:
        try:
            latitude = float(data['latitude'])
        except (ValueError, TypeError):
            pass
    if 'longitude' in data and data['longitude'] is not None:
        try:
            longitude = float(data['longitude'])
        except (ValueError, TypeError):
            pass
    if latitude is None and longitude is None and 'coordinates' in data and data['coordinates']:
        try:
            parts = str(data['coordinates']).split(',')
            if len(parts) == 2:
                latitude = float(parts[0].strip())
                longitude = float(parts[1].strip())
        except (ValueError, TypeError):
            pass

    # Hash-Chain concept: Fetch the most recently saved tip in DB
    last_tip = Tip.query.order_by(Tip.id.desc()).first()
    prev_hash = last_tip.hash if last_tip and last_tip.hash else GENESIS_HASH

    # Compute SHA-256 hash of prev_hash + content + timestamp
    now = datetime.now(timezone.utc)
    now_iso = format_iso_timestamp(now)
    hash_input = f"{prev_hash}:{content[:300]}:{now_iso}".encode('utf-8')
    verification_hash = hashlib.sha256(hash_input).hexdigest()

    new_tip = Tip(
        title=title[:100],
        category=category[:50],
        location_name=location_name[:100],
        latitude=latitude,
        longitude=longitude,
        content=content[:300],
        created_at=now,
        hash=verification_hash,
        prev_hash=prev_hash
    )

    db.session.add(new_tip)
    db.session.commit()

    return jsonify(new_tip.to_dict()), 201


@app.route('/api/tips/verify/<int:tip_id>', methods=['GET'])
def verify_tip(tip_id):
    """
    Takes a tip ID, recomputes what the hash should be based on its content, timestamp,
    and previous tip's hash, compares it to the stored hash, and returns JSON object
    with valid: true or valid: false and recomputed hash.
    """
    target_tip = db.session.get(Tip, tip_id)
    if not target_tip:
        return jsonify({'error': f'Tip with ID {tip_id} not found', 'valid': False}), 404

    # Fetch previous tip's hash
    if target_tip.prev_hash:
        prev_hash = target_tip.prev_hash
    else:
        prev_tip = Tip.query.filter(Tip.id < target_tip.id).order_by(Tip.id.desc()).first()
        prev_hash = prev_tip.hash if prev_tip else GENESIS_HASH

    iso_time = format_iso_timestamp(target_tip.created_at)
    hash_input = f"{prev_hash}:{target_tip.content}:{iso_time}".encode('utf-8')
    recomputed_hash = hashlib.sha256(hash_input).hexdigest()

    is_valid = (recomputed_hash == target_tip.hash)

    return jsonify({
        'valid': is_valid,
        'tip_id': target_tip.id,
        'stored_hash': target_tip.hash,
        'recomputed_hash': recomputed_hash,
        'prev_hash': prev_hash
    }), 200


@app.route('/api/analyze-route', methods=['POST'])
def analyze_route():
    """
    Accepts JSON body with origin and destination place names.
    1. Geocodes origin via Nominatim.
    2. Geocodes destination via Nominatim.
    3. Calls OSRM demo API to get actual driving road GeoJSON LineString.
    4. Extracts 8 evenly-spaced waypoints using linear interpolation.
    5. Calculates risk score for each of the 8 waypoints at current hour.
    6. Averages all 8 scores into a single route safety score and risk level string.
    """
    data = request.get_json() or {}
    origin_name = str(data.get('origin', '')).strip()
    dest_name = str(data.get('destination', '')).strip()

    if not origin_name or not dest_name:
        return jsonify({
            'error': "Both 'origin' and 'destination' fields are required in JSON body."
        }), 400

    # 1 & 2. Geocode origin and destination
    lat1, lng1 = geocode_place(origin_name)
    lat2, lng2 = geocode_place(dest_name)

    # 3. Call OSRM demo API to get road LineString geometry
    osrm_url = f"http://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson"
    route_geojson = None
    coords_list = []

    try:
        res = requests.get(osrm_url, timeout=6)
        if res.status_code == 200:
            osrm_data = res.json()
            if osrm_data.get('routes') and len(osrm_data['routes']) > 0:
                route_geometry = osrm_data['routes'][0]['geometry']
                coords_list = route_geometry.get('coordinates', [])
                route_geojson = {
                    'type': 'Feature',
                    'geometry': route_geometry,
                    'properties': {
                        'distance_meters': osrm_data['routes'][0].get('distance', 0),
                        'duration_seconds': osrm_data['routes'][0].get('duration', 0)
                    }
                }
    except Exception as e:
        print(f"[OSRM WARN] OSRM route fetch failed for {origin_name} to {dest_name}: {e}")

    # Fallback straight-line route if OSRM is offline or unreachable
    if not coords_list:
        coords_list = [
            [lng1 + (lng2 - lng1) * (i / 7.0), lat1 + (lat2 - lat1) * (i / 7.0)]
            for i in range(8)
        ]
        route_geojson = {
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': coords_list
            },
            'properties': {'fallback': True}
        }

    # 4. Extract 8 evenly-spaced waypoints from coordinates list
    total_pts = len(coords_list)
    waypoints_raw = []
    if total_pts <= 8:
        waypoints_raw = list(coords_list)
        while len(waypoints_raw) < 8:
            waypoints_raw.append(coords_list[-1])
    else:
        for i in range(8):
            idx = int(round(i * (total_pts - 1) / 7.0))
            waypoints_raw.append(coords_list[idx])

    # 5. Calculate risk score for each of the 8 waypoints
    hour_val = data.get('hour')
    if hour_val is not None:
        try:
            current_hour = int(hour_val)
        except (ValueError, TypeError):
            current_hour = datetime.now().hour
    else:
        current_hour = datetime.now().hour

    waypoint_scores = []
    scores_sum = 0.0

    for idx, pt in enumerate(waypoints_raw):
        w_lng, w_lat = float(pt[0]), float(pt[1])
        score_info = calculate_risk_score(w_lat, w_lng, current_hour)
        score_val = float(score_info['score'])
        scores_sum += score_val

        waypoint_scores.append({
            'waypoint_index': idx + 1,
            'lat': w_lat,
            'lng': w_lng,
            'score': score_val,
            'risk_level': score_info['risk_level'],
            'nearest_zones': score_info['nearest_zones']
        })

    # 6. Average all 8 scores into a single route safety score
    average_corridor_score = round(scores_sum / 8.0, 1)

    if average_corridor_score >= 70:
        corridor_risk_level = 'High'
    elif average_corridor_score >= 40:
        corridor_risk_level = 'Medium'
    elif average_corridor_score >= 20:
        corridor_risk_level = 'Low'
    else:
        corridor_risk_level = 'Safe'

    return jsonify({
        'origin': {
            'name': origin_name,
            'lat': lat1,
            'lng': lng1
        },
        'destination': {
            'name': dest_name,
            'lat': lat2,
            'lng': lng2
        },
        'route_geojson': route_geojson,
        'waypoint_scores': waypoint_scores,
        'average_corridor_score': average_corridor_score,
        'risk_level': corridor_risk_level,
        'hour_evaluated': current_hour
    }), 200


@app.route('/api/chat', methods=['POST'])
def chat_bot():
    """
    Accepts JSON body: { "message": "user question", "language": "tamil" }
    Sends message to OpenAI API (if OPENAI_API_KEY is available) or domain AI fallback
    with system prompt enforcing Tamil Nadu travel guide persona and Tamil place names.
    Returns JSON: { "reply": "...", "language": "tamil" }
    """
    data = request.get_json() or {}
    user_msg = str(data.get('message', '')).strip()
    user_lang = str(data.get('language', 'tamil')).strip()

    if not user_msg:
        return jsonify({'error': 'Message text is required.'}), 400

    reply_text = None

    # Attempt OpenAI API if key configured
    openai_key = os.environ.get('OPENAI_API_KEY')
    if openai_key:
        try:
            import openai
            client = openai.OpenAI(api_key=openai_key)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": CHAT_SYSTEM_PROMPT},
                    {"role": "user", "content": user_msg}
                ],
                max_tokens=350,
                temperature=0.7
            )
            reply_text = response.choices[0].message.content
        except Exception as e:
            print(f"[CHAT OPENAI WARN] OpenAI API call failed: {e}")

    # Fallback to intelligent Tamil Nadu Travel Guide assistant
    if not reply_text:
        reply_text = generate_tamil_nadu_travel_reply(user_msg)

    return jsonify({
        'reply': reply_text,
        'language': user_lang
    }), 200


@app.route('/api/itinerary', methods=['POST'])
def generate_itinerary():
    """
    POST /api/itinerary
    Generates a structured AI itinerary calling OpenAI API when OPENAI_API_KEY is configured.
    Returns HTTP 503 error if key is missing or call fails, so frontend fallback can handle it.
    """
    data = request.get_json() or {}
    user_prompt = data.get('prompt', '')
    destination = data.get('destination', 'Chennai')
    start_date = data.get('startDate', '')
    end_date = data.get('endDate', '')
    travelers = data.get('travelers', 1)
    budget = data.get('budget', 'Moderate')
    travel_style = data.get('travelStyle', 'Cultural')
    special_interests = data.get('specialInterests', 'Food & Heritage')

    openai_key = os.environ.get('OPENAI_API_KEY')
    if not openai_key:
        return jsonify({'error': 'OPENAI_API_KEY is not configured in backend/.env'}), 503

    try:
        import json
        import openai

        client = openai.OpenAI(api_key=openai_key)

        system_prompt = (
            "You are Sancharam AI, an expert travel planner specializing exclusively in Chennai and Chengalpattu districts. "
            "Build a detailed, highly authentic trip itinerary based on user inputs. "
            "You MUST respond with STRICT JSON ONLY. Do NOT include any markdown code blocks, backticks, or extra commentary. "
            "Match this exact JSON schema shape:\n"
            "{\n"
            '  "destination": "Chennai",\n'
            '  "days": [\n'
            "    {\n"
            '      "day": 1,\n'
            '      "title": "Day Title",\n'
            '      "activities": [\n'
            '        { "time": "09:00 AM", "title": "Activity Name", "description": "Details", "location": "Spot Name" }\n'
            "      ]\n"
            "    }\n"
            "  ],\n"
            '  "budget_estimate": "INR 5,000 - 8,000",\n'
            '  "tips": ["Tip 1", "Tip 2"]\n'
            "}"
        )

        user_message = (
            f"User Prompt: {user_prompt}\n"
            f"Destination: {destination}\n"
            f"Dates: {start_date} to {end_date}\n"
            f"Travelers: {travelers}\n"
            f"Budget Tier: {budget}\n"
            f"Travel Style: {travel_style}\n"
            f"Special Interests: {special_interests}"
        )

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=1500,
            temperature=0.7
        )

        raw_content = response.choices[0].message.content.strip()

        # Clean markdown code fences if present
        if raw_content.startswith("```"):
            raw_content = raw_content.split("\n", 1)[-1]
        if raw_content.endswith("```"):
            raw_content = raw_content.rsplit("```", 1)[0]
        raw_content = raw_content.strip()

        parsed_json = json.loads(raw_content)
        return jsonify(parsed_json), 200

    except Exception as e:
        print(f"[ITINERARY OPENAI ERROR] {e}")
        return jsonify({'error': f"OpenAI generation failed: {str(e)}"}), 503


if __name__ == '__main__':
    print("Starting Sancharam Flask Backend on port 5000...")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
