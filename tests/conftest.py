import pytest
import time
import requests

BACKEND_URL = "http://localhost:3001/api"
FRONTEND_URL = "http://localhost:5173"

@pytest.fixture(scope="session")
def api_base_url():
    return BACKEND_URL

@pytest.fixture(scope="session")
def frontend_url():
    return FRONTEND_URL

@pytest.fixture(scope="session")
def session_http():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def unique_creator_payload():
    ts = int(time.time() * 1000) % 10000000
    return {
        "name": f"Test Creator {ts}",
        "username": f"qa_creator_{ts}",
        "email": f"creator_{ts}@qa-brandhub.test",
        "password": "ValidPassword123!",
        "phone": "9876543210",
        "city": "Mumbai",
        "pincode": "400001",
        "role": "influencer",
        "roleData": {
            "niche": "Tech & Gadgets",
            "instagram_handle": f"@qa_creator_{ts}",
            "instagram_followers": 0,
            "youtube_subscribers": 0,
            "snapchat_subscribers": 0,
            "facebook_followers": 0,
            "followers_count": 0,
            "bio": "Authentic creator with zero fake defaults.",
            "reel_price": 2500,
            "post_price": 1500
        }
    }

@pytest.fixture
def unique_brand_payload():
    ts = int(time.time() * 1000) % 10000000
    return {
        "name": f"Test Brand {ts}",
        "username": f"qa_brand_{ts}",
        "email": f"brand_{ts}@qa-brandhub.test",
        "password": "ValidPassword123!",
        "phone": "9876543210",
        "city": "Bengaluru",
        "pincode": "560001",
        "role": "brand",
        "roleData": {
            "business_name": f"Test Ventures {ts}",
            "business_type": "Direct to Consumer",
            "budget_range": "₹50,000 – ₹1,50,000",
            "website": f"https://brand{ts}.example.com",
            "description": "Verified business searching for genuine creators."
        }
    }

@pytest.fixture
def authenticated_creator(session_http, api_base_url, unique_creator_payload):
    reg_res = session_http.post(f"{api_base_url}/auth/register", json=unique_creator_payload)
    assert reg_res.status_code == 201, f"Reg failed: {reg_res.text}"
    user_id = reg_res.json().get("user", {}).get("id")

    login_res = session_http.post(f"{api_base_url}/auth/login", json={
        "email": unique_creator_payload["email"],
        "password": unique_creator_payload["password"]
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json().get("session", {}).get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    return {
        "user_id": user_id,
        "token": token,
        "headers": headers,
        "payload": unique_creator_payload
    }
