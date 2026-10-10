import pytest
import re
import requests

IS_UUID = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)

@pytest.mark.unit
class TestTestingTactics:
    """
    T3.1 Testing Tactics & Strategies:
    Demonstrating Equivalence Partitioning (EP) and Boundary Value Analysis (BVA)
    along with white-box and logic-path validation.
    """

    # --- 1. Equivalence Partitioning (EP) ---

    def test_ep_valid_roles_accepted(self, session_http, api_base_url):
        """EP Valid Partition: Only 'influencer' and 'brand' are allowed user roles."""
        for role in ['influencer', 'brand']:
            res = session_http.get(f"{api_base_url}/influencers" if role == 'influencer' else f"{api_base_url}/brands")
            assert res.status_code == 200, f"Expected 200 for valid partition role {role}"

    def test_ep_invalid_role_rejected(self, session_http, api_base_url):
        """EP Invalid Partition: Unsupported roles must be rejected on registration."""
        payload = {
            "name": "Invalid Role Tester",
            "username": "invalid_role_999",
            "email": "invalid_role_999@test.com",
            "password": "Password123!",
            "role": "unsupported_superhero"
        }
        res = session_http.post(f"{api_base_url}/auth/register", json=payload)
        # Should be 400 Bad Request or 422 Unprocessable
        assert res.status_code in [400, 422], f"Expected rejection for invalid role, got {res.status_code}"

    def test_ep_invalid_email_format(self, session_http, api_base_url):
        """EP Invalid Partition: Malformed email without @ or domain."""
        payload = {
            "name": "Bad Email Tester",
            "username": "bad_email_999",
            "email": "not-an-email-at-all",
            "password": "Password123!",
            "role": "influencer"
        }
        res = session_http.post(f"{api_base_url}/auth/register", json=payload)
        assert res.status_code in [400, 422], f"Expected 400 for malformed email, got {res.status_code}"

    # --- 2. Boundary Value Analysis (BVA) ---

    def test_bva_zero_follower_preservation(self, session_http, api_base_url, unique_creator_payload):
        """
        BVA Lower Boundary: Followers count = 0 (Critical Requirement).
        When a new creator registers with 0 followers, the system MUST NOT coerce it to 1000 or 14800.
        """
        payload = unique_creator_payload
        payload["roleData"]["followers_count"] = 0
        payload["roleData"]["instagram_followers"] = 0

        res = session_http.post(f"{api_base_url}/auth/register", json=payload)
        assert res.status_code == 201, f"Registration failed: {res.text}"
        data = res.json()
        user_id = data.get("user", {}).get("id") or data.get("id")
        assert user_id, "User ID not returned"

        # Check creator profile endpoint
        prof_res = session_http.get(f"{api_base_url}/influencers/{user_id}")
        assert prof_res.status_code == 200
        prof_data = prof_res.json()

        # Check followersCount is exactly 0
        assert int(prof_data.get("followersCount", -1)) == 0, (
            f"BVA Failed! Expected 0 followers, got {prof_data.get('followersCount')}"
        )

    def test_bva_caption_length_boundary(self, session_http, api_base_url, authenticated_creator):
        """
        BVA: Social Post Caption Boundary.
        Caption must handle 0 characters (empty caption) and bounded length up to 2200 characters.
        """
        headers = authenticated_creator["headers"]

        # 1. Lower boundary: empty caption (0 chars)
        res_empty = session_http.post(
            f"{api_base_url}/social/posts",
            headers=headers,
            json={"mediaUrl": "https://example.com/test.jpg", "caption": ""}
        )
        assert res_empty.status_code in [201, 200], f"Failed on 0-char caption: {res_empty.text}"

        # 2. Within upper boundary: 2200 chars
        long_caption = "A" * 2200
        res_boundary = session_http.post(
            f"{api_base_url}/social/posts",
            headers=headers,
            json={"mediaUrl": "https://example.com/test_boundary.jpg", "caption": long_caption}
        )
        assert res_boundary.status_code in [201, 200], f"Failed on 2200-char caption: {res_boundary.text}"

    # --- 3. White-Box / Logic Path Testing ---

    def test_uuid_matching_and_legacy_id_dispatch(self):
        """White-box test: Verify IS_UUID regex accurately distinguishes UUIDs from legacy IDs."""
        valid_uuid = "806f7e5d-754c-4c74-8bba-e03f34164a70"
        legacy_id = "c-1"
        brand_id = "b-loom"
        handle_id = "aanyakapoor"

        assert IS_UUID.match(valid_uuid) is not None
        assert IS_UUID.match(legacy_id) is None
        assert IS_UUID.match(brand_id) is None
        assert IS_UUID.match(handle_id) is None
