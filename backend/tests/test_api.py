import os
import sys
import pytest

# Add parent directory to sys.path to import Flask app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, db


@pytest.fixture
def client():
    """Pytest fixture initializing Flask test client within application context."""
    app.config['TESTING'] = True
    with app.test_client() as test_client:
        with app.app_context():
            db.create_all()
        yield test_client


def test_health_check(client):
    """1. Test that GET /api/health returns status 200 and JSON body with status: 'ok'."""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data.get('status') == 'ok'


def test_get_risk_zones(client):
    """2. Test that GET /api/risk-zones returns a list with more than 0 items."""
    response = client.get('/api/risk-zones')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_get_risk_zones_crime_filter(client):
    """3. Test that GET /api/risk-zones?type=crime returns only crime-type zones."""
    response = client.get('/api/risk-zones?type=crime')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0
    for zone in data:
        assert zone.get('source') == 'crime' or 'crime' in str(zone.get('zone_type', '')).lower()


def test_risk_score_koyambedu_night(client):
    """4. Test that GET /api/risk-score?lat=13.0695&lng=80.1966&hour=22 returns a score above 60."""
    response = client.get('/api/risk-score?lat=13.0695&lng=80.1966&hour=22')
    assert response.status_code == 200
    data = response.get_json()
    assert 'score' in data
    assert data['score'] > 60


def test_risk_score_anna_nagar_daytime(client):
    """5. Test that GET /api/risk-score?lat=13.0850&lng=80.2101&hour=12 returns a score below 40."""
    response = client.get('/api/risk-score?lat=13.0850&lng=80.2101&hour=12')
    assert response.status_code == 200
    data = response.get_json()
    assert 'score' in data
    assert data['score'] < 40


def test_create_tip(client):
    """6. Test that POST /api/tips with a valid JSON body creates a new tip and returns it with a hash field."""
    payload = {
        'title': 'Test Safety Tip',
        'category': 'safety',
        'location_name': 'Chennai Central',
        'latitude': 13.0827,
        'longitude': 80.2755,
        'content': 'Always keep your belongings secure while waiting on Platform 1.'
    }
    response = client.post('/api/tips', json=payload)
    assert response.status_code in [200, 201]
    data = response.get_json()
    assert 'id' in data
    assert 'hash' in data
    assert len(data['hash']) == 64


def test_verify_fresh_tip(client):
    """7. Test that GET /api/tips/verify/<id> on a freshly created tip returns valid: true."""
    payload = {
        'title': 'Verification Test Tip',
        'category': 'food',
        'location_name': 'Mylapore',
        'content': 'Enjoy hot ghee roast dosa at Rayar Mess.'
    }
    create_res = client.post('/api/tips', json=payload)
    assert create_res.status_code in [200, 201]
    created_tip = create_res.get_json()
    tip_id = created_tip['id']

    verify_res = client.get(f'/api/tips/verify/{tip_id}')
    assert verify_res.status_code == 200
    verify_data = verify_res.get_json()
    assert verify_data.get('valid') is True


def test_generate_itinerary(client):
    """8. Test that POST /api/itinerary returns status 200 and a structured trip itinerary."""
    payload = {
        'destination': 'Chennai',
        'startDate': '2026-08-15',
        'endDate': '2026-08-17',
        'travelers': 2,
        'budget': 'Moderate',
        'travelStyle': 'Cultural',
        'specialInterests': 'History & Food'
    }
    response = client.post('/api/itinerary', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert 'title' in data
    assert 'days' in data
    assert isinstance(data['days'], list)
    assert len(data['days']) > 0

