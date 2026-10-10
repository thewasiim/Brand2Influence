import pytest
import requests

@pytest.mark.system
class TestSystemLevel:
    """
    T3.1 Software Testing Level 3: System Testing
    Validates the end-to-end integrated application against user requirements:
    1. Zero Fake Posts / Videos / Followers on New Accounts
    2. Real Posts Visibility on Profile
    3. Profile Lookup Resolution for All Creators & Brands
    4. Cross-Directory Navigation & Search
    """

    def test_sys_clean_new_account_zero_fake_data(self, session_http, api_base_url, unique_creator_payload):
        """
        System Test: Verify newly created account has NO fake posts,
        NO fake videos, NO fake comments, and 0 fake followers.
        """
        # Register new creator
        reg_res = session_http.post(f"{api_base_url}/auth/register", json=unique_creator_payload)
        assert reg_res.status_code == 201
        user_id = reg_res.json().get("user", {}).get("id")

        # 1. Fetch profile
        prof_res = session_http.get(f"{api_base_url}/influencers/{user_id}")
        assert prof_res.status_code == 200
        prof = prof_res.json()

        assert int(prof.get("followersCount", -1)) == 0, "Fake followers detected on new account!"
        assert int(prof.get("engagementRate", -1)) == 0, "Fake engagement rate detected on new account!"

        # 2. Fetch user's posts
        posts_res = session_http.get(f"{api_base_url}/social/posts/{user_id}")
        assert posts_res.status_code == 200
        items = posts_res.json().get("items", [])
        assert len(items) == 0, f"Expected 0 posts on fresh account, but found {len(items)} fake posts!"

    def test_sys_new_post_appears_on_profile(self, session_http, api_base_url, authenticated_creator):
        """
        System Test: When user creates a post, it must appear on their profile immediately.
        """
        headers = authenticated_creator["headers"]
        user_id = authenticated_creator["user_id"]
        caption = "Verified System Test: My First Real Post 🚀"

        # Publish
        create_res = session_http.post(
            f"{api_base_url}/social/posts",
            headers=headers,
            json={
                "mediaUrl": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600",
                "mediaType": "image",
                "caption": caption
            }
        )
        assert create_res.status_code in [201, 200]
        created_id = create_res.json().get("id")

        # Check profile endpoint directly
        prof_res = session_http.get(f"{api_base_url}/influencers/{user_id}")
        assert prof_res.status_code == 200
        prof = prof_res.json()
        assert len(prof.get("posts", [])) >= 1, "Profile did not include the newly created post!"

        # Check user posts endpoint
        posts_res = session_http.get(f"{api_base_url}/social/posts/{user_id}")
        assert posts_res.status_code == 200
        post_items = posts_res.json().get("items", [])
        assert any(p.get("id") == created_id for p in post_items), "Created post not found in /social/posts/:userId"

    def test_sys_open_other_profiles_resolution(self, session_http, api_base_url):
        """
        System Test: Verify opening other profiles works across all supported ID types:
        - Curated creator ID: 'c-1'
        - Curated creator UUID: '806f7e5d-754c-4c74-8bba-e03f34164a70'
        - Curated creator username: 'aanyakapoor'
        - Curated brand ID: 'b-1'
        - Curated brand slug: 'b-loom'
        """
        # 1. Curated creator by legacy ID
        res_c1 = session_http.get(f"{api_base_url}/influencers/c-1")
        assert res_c1.status_code == 200, f"Failed opening creator c-1: {res_c1.status_code}"
        assert res_c1.json().get("name") == "Aanya Kapoor"

        # 2. Curated creator by UUID
        res_uuid = session_http.get(f"{api_base_url}/influencers/806f7e5d-754c-4c74-8bba-e03f34164a70")
        assert res_uuid.status_code == 200, f"Failed opening creator by UUID: {res_uuid.status_code}"
        assert res_uuid.json().get("name") == "Aanya Kapoor"

        # 3. Curated creator by username
        res_username = session_http.get(f"{api_base_url}/influencers/aanyakapoor")
        assert res_username.status_code == 200, f"Failed opening creator by username: {res_username.status_code}"

        # 4. Curated brand by ID
        res_b1 = session_http.get(f"{api_base_url}/brands/b-1")
        assert res_b1.status_code == 200, f"Failed opening brand b-1: {res_b1.status_code}"
        assert "Blue Tokai" in res_b1.json().get("businessName")

        # 5. Curated brand by slug
        res_bloom = session_http.get(f"{api_base_url}/brands/b-loom")
        assert res_bloom.status_code == 200, f"Failed opening brand b-loom: {res_bloom.status_code}"

    def test_sys_search_and_discovery_pipeline(self, session_http, api_base_url):
        """System Test: Search across creators and brands."""
        search_res = session_http.get(f"{api_base_url}/social/search?q=coffee")
        assert search_res.status_code == 200
        data = search_res.json()
        assert "brands" in data or "influencers" in data or "items" in data
