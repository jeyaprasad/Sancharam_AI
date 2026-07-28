import math
import os
from datetime import datetime, timezone
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
import pandas as pd

app = Flask(__name__)

# Enable CORS for React frontend running on localhost:5173
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "*"]}})

# Initialize SocketIO and SQLAlchemy
socketio = SocketIO(app, cors_allowed_origins="*")
db = SQLAlchemy()

# ── DATASET LOADING ──────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')

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


def prepare_crime_records():
    """Formats crime zones DataFrame into standardized records."""
    if CRIME_ZONES_DF is None or CRIME_ZONES_DF.empty:
        return []
    df = CRIME_ZONES_DF.copy()
    df['id'] = df['zone_id']
    df['name'] = df['zone_name']
    df['description'] = df['primary_concern']
    df['source'] = 'crime'
    return df.to_dict(orient='records')


def prepare_accident_records():
    """Formats accident blackspots DataFrame into standardized records."""
    if ACCIDENT_BLACKSPOTS_DF is None or ACCIDENT_BLACKSPOTS_DF.empty:
        return []
    df = ACCIDENT_BLACKSPOTS_DF.copy()
    df['id'] = df['zone_id']
    df['name'] = df['zone_name']
    df['description'] = df['primary_cause']
    df['source'] = 'accident'
    return df.to_dict(orient='records')


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


if __name__ == '__main__':
    print("Starting Sancharam Flask Backend on port 5000...")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
