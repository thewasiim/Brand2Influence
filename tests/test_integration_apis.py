import pytest
import requests

@pytest.mark.integration
class TestIntegrationLevel:
    """
    T3.1 Software Testing Level 2: Integration Testing
    Tests the interactions between backend services, database persistence,
    social graphs, and profile lookup pipelines.
    """

    def test_auth_registration_and_login_integration(self, session_http, api_base_url, unique_creator_payload):
        """Integration: Register new user, then perform login using email & password."""
        # 1. Register
        reg_res = session_http.post(f"{api_base_url}/auth/register", json=unique_creator_payload)
        assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"

        # 2. Login
        login_res = session_http.post(f"{api_base_url}/auth/login", json={
            "email": unique_creator_payload["email"],
            "password": unique_creator_payload["password"]
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        data = login_res.json()
        assert "session" in data or "token" in data or "user" in data
        assert data.get("user", {}).get("email") == unique_creator_payload["email"].lower()

    def test_creator_profile_data_contract_integration(self, session_http, api_base_url, unique_creator_payload):
        """Integration: Verify created creator profile matches data contract schema."""
        reg_res = session_http.post(f"{api_base_url}/auth/register", json=unique_creator_payload)
        assert reg_res.status_code == 201
        user_id = reg_res.json().get("user", {}).get("id")

        prof_res = session_http.get(f"{api_base_url}/influencers/{user_id}")
        assert prof_res.status_code == 200
        prof = prof_res.json()

        # Contract assertions
        assert "id" in prof
        assert "userId" in prof
        assert "name" in prof
        assert "followersCount" in prof
        assert "engagementRate" in prof
        assert "posts" in prof
        assert isinstance(prof["posts"], list)
        assert prof["followersCount"] == 0, "New account should have 0 followers"
        assert len(prof["posts"]) == 0, "New account should have 0 posts initially"

    def test_brand_profile_data_contract_integration(self, session_http, api_base_url, unique_brand_payload):
        """Integration: Verify created brand profile matches data contract schema."""
        reg_res = session_http.post(f"{api_base_url}/auth/register", json=unique_brand_payload)
        assert reg_res.status_code == 201
        user_id = reg_res.json().get("user", {}).get("id")

        prof_res = session_http.get(f"{api_base_url}/brands/{user_id}")
        assert prof_res.status_code == 200
        prof = prof_res.json()

        assert "id" in prof
        assert "businessName" in prof
        assert "campaigns" in prof
        assert isinstance(prof["campaigns"], list)

    def test_social_post_publishing_and_feed_integration(self, session_http, api_base_url, authenticated_creator):
        """Integration: Create post -> Verify retrieval from user's posts & explore feed."""
        headers = authenticated_creator["headers"]
        user_id = authenticated_creator["user_id"]
        username = authenticated_creator["payload"]["username"]

        test_caption = f"Integration Test Post for {username}"
        post_payload = {
            "mediaUrl": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
            "mediaType": "image",
            "caption": test_caption
        }

        # 1. Publish post
        create_res = session_http.post(f"{api_base_url}/social/posts", headers=headers, json=post_payload)
        assert create_res.status_code in [201, 200], f"Failed to create post: {create_res.text}"
        created_post = create_res.json()
        post_id = created_post.get("id")
        assert post_id, "No post ID returned"

        # 2. Verify retrieval in user's posts
        user_posts_res = session_http.get(f"{api_base_url}/social/posts/{user_id}")
        assert user_posts_res.status_code == 200
        items = user_posts_res.json().get("items", [])
        matched = [p for p in items if p.get("id") == post_id or p.get("caption") == test_caption]
        assert len(matched) > 0, "Published post did not appear in user's posts endpoint!"

        # 3. Verify retrieval in Explore feed
        explore_res = session_http.get(f"{api_base_url}/social/explore")
        assert explore_res.status_code == 200
        explore_items = explore_res.json().get("items", [])
        assert len(explore_items) > 0, "Explore items should not be empty"

    def test_social_like_and_unlike_integration(self, session_http, api_base_url, authenticated_creator):
        """Integration: Like and Unlike interaction workflow."""
        headers = authenticated_creator["headers"]

        # Create post first
        post_res = session_http.post(
            f"{api_base_url}/social/posts",
            headers=headers,
            json={"mediaUrl": "https://example.com/like_test.jpg", "caption": "Like test"}
        )
        post_id = post_res.json().get("id")

        # 1. Like
        like_res = session_http.post(f"{api_base_url}/social/posts/{post_id}/like", headers=headers)
        assert like_res.status_code in [200, 201]

        # 2. Unlike
        unlike_res = session_http.delete(f"{api_base_url}/social/posts/{post_id}/like", headers=headers)
        assert unlike_res.status_code in [200, 204]

