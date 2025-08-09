from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta
import uuid

from .models import Contest
from teams.models import Team, UserTeam  # Assuming teams app structure is available
from .choices import ContestLevel, ContestQuality, ContestKeywords

User = get_user_model()

# ==========================================================================================
# Test Content:
#
# 1. Get Contest List API (/api/matches/)
#    - Test successful retrieval of paginated contests
#    - Test filtering by query, year, level, quality, and keywords
#    - Test filtering by error option
#    - Test with an out-of-bounds page index
#    - Test with invalid request data (e.g., missing page_index)
#
# 2. Create Contest API (/api/matches/create/)
#    - Test successful creation by an admin user
#    - Test creation attempt by a regular user (should be forbidden)
#    - Test creation attempt by an unauthenticated user
#
# 3. Get Contest by ID API (/api/matches/<uuid:match_id>/)
#    - Test successful retrieval of a specific contest's details
#    - Test retrieving a non-existent contest
#
# 4. Update Contest API (/api/matches/<uuid:match_id>/update/)
#    - Test successful update by an admin user
#    - Test update attempt by a regular user (should be forbidden)
#    - Test updating a non-existent contest
#
# 5. Delete Contest API (/api/matches/<uuid:match_id>/delete/)
#    - Test successful deletion by an admin user
#    - Test deletion attempt by a regular user (should be forbidden)
#
# 6. Get Contest Teams API (/api/matches/<uuid:match_id>/teams/)
#    - Test successful retrieval by an authenticated user
#    - Test filtering to ensure only recruiting teams are shown
#    - Test retrieval by an unauthenticated user
#    - Test retrieving teams for a non-existent contest
# ==========================================================================================


class ContestAPITestCase(TestCase):
    def setUp(self):
        """
        Set up test data and clients.
        """
        # Create users
        self.user = User.objects.create_user(
            username="testuser", password="testpassword", nick_name="Test User"
        )
        self.admin_user = User.objects.create_superuser(
            username="adminuser", password="adminpassword", nick_name="Admin User"
        )

        # Create contests
        self.contest1 = Contest.objects.create(
            name="AI Innovation Challenge",
            year=2024,
            place="Shanghai",
            level=ContestLevel.NATIONAL,
            quality=ContestQuality.A_LEVEL,
            months=[10, 11],
            keywords=[ContestKeywords.AI, ContestKeywords.INNOVATION],
            registration_start=timezone.now(),
            registration_end=timezone.now() + timedelta(days=30),
        )
        self.contest2 = Contest.objects.create(
            name="Cyber Security Contest",
            year=2025,
            place="Beijing",
            level=ContestLevel.REGIONAL,
            quality=ContestQuality.B_LEVEL,
            months=[5],
            keywords=[ContestKeywords.CS, ContestKeywords.IS],
            registration_start=timezone.now(),
            registration_end=timezone.now() + timedelta(days=60),
        )

        # Create a team for get_match_teams test
        self.recruiting_team = Team.objects.create(
            name="Pioneers",
            introduction="A team for AI challenge",
            contest=self.contest1,
            expected_members=5,
            existing_members=3,  # Not full
            recruitment_deadline=timezone.now() + timedelta(days=15),  # Not expired
        )
        UserTeam.objects.create(
            user=self.user, team=self.recruiting_team, is_leader=True
        )

        self.full_team = Team.objects.create(
            name="Veterans",
            introduction="A full team",
            contest=self.contest1,
            expected_members=3,
            existing_members=3,  # Full
            recruitment_deadline=timezone.now() + timedelta(days=15),
        )

        # API Client
        self.client = APIClient()

        # Generate tokens for authentication
        user_refresh = RefreshToken.for_user(self.user)
        self.user_access_token = str(user_refresh.access_token)
        admin_refresh = RefreshToken.for_user(self.admin_user)
        self.admin_access_token = str(admin_refresh.access_token)

    # Test: POST /api/matches/
    def test_get_matches_success(self):
        data = {"page_index": 1, "page_size": 10}
        response = self.client.post("/api/matches/", data, format="json")
        self.assertEqual(response.status_code, 200)
        json_data = response.json()
        self.assertEqual(json_data["data"]["match_num"], 2)

    def test_get_matches_with_filter(self):
        data = {
            "page_index": 1,
            "page_size": 10,
            "options": {
                "query": "AI",
                "years": [2024],
                "level": [ContestLevel.NATIONAL],
                "quality": [ContestQuality.A_LEVEL],
                "keywords": [ContestKeywords.AI],
            },
        }
        response = self.client.post("/api/matches/", data, format="json")
        self.assertEqual(response.status_code, 200)
        json_data = response.json()
        self.assertEqual(json_data["data"]["match_num"], 1)

    def test_get_matches_with_invalid_option(self):
        """
        Test GET /api/matches/ with various invalid filter options.
        The serializer should catch these errors and return a 400 status.
        """
        invalid_options_scenarios = {
            "invalid_year_type": {"years": ["not-a-year"]},
            "invalid_year_value": {"years": [9999]},
            "invalid_level": {"level": ["invalid-level"]},
            "invalid_quality": {"quality": ["invalid-quality"]},
            "invalid_month_type": {"months": ["not-a-month"]},
            "invalid_month_value_low": {"months": [0]},
            "invalid_month_value_high": {"months": [13]},
            "invalid_keyword": {"keywords": ["invalid-keyword"]},
        }

        for description, options in invalid_options_scenarios.items():
            with self.subTest(description=description):
                data = {
                    "page_index": 1,
                    "page_size": 10,
                    "options": options,
                }
                response = self.client.post("/api/matches/", data, format="json")
                self.assertEqual(response.status_code, 400)
                self.assertEqual(response.json()["message"], "Invalid data")

    def test_get_matches_pagination_out_of_bounds(self):
        data = {"page_index": 99, "page_size": 10}
        response = self.client.post("/api/matches/", data, format="json")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["message"], "Too large page index")

    def test_get_matches_invalid_data(self):
        data = {"page_size": 10}  # Missing page_index
        response = self.client.post("/api/matches/", data, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["message"], "Invalid data")

    # Test: POST /api/matches/create/
    def test_create_match_admin_success(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_access_token}")
        data = {
            "name": "New Awesome Contest",
            "year": 2025,
            "place": "Online",
            "level": ContestLevel.INTERNATIONAL,
            "quality": ContestQuality.TOP,
            "months": [8],
            "keywords": [ContestKeywords.OTHERS],
        }
        response = self.client.post("/api/matches/create/", data, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["message"], "Contest created successfully")
        self.assertTrue(Contest.objects.filter(name="New Awesome Contest").exists())

    def test_create_match_regular_user_forbidden(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.user_access_token}")
        data = {
            "name": "Should Fail Contest",
            "year": 2025,
            "place": "Anywhere",
            "level": "local",
            "quality": "C_level",
        }
        response = self.client.post("/api/matches/create/", data, format="json")
        self.assertEqual(response.status_code, 403)

    def test_create_match_unauthorized(self):
        self.client.credentials()  # Clear auth
        data = {
            "name": "Should Fail Contest",
            "year": 2025,
            "place": "Anywhere",
            "level": "local",
            "quality": "C_level",
        }
        response = self.client.post("/api/matches/create/", data, format="json")
        self.assertEqual(response.status_code, 401)

    # Test: GET /api/matches/<uuid:match_id>/
    def test_get_match_by_id_success(self):
        response = self.client.get(f"/api/matches/{self.contest1.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["data"]["name"], self.contest1.name)

    def test_get_match_by_id_not_found(self):
        non_existent_uuid = uuid.uuid4()
        response = self.client.get(f"/api/matches/{non_existent_uuid}/")
        self.assertEqual(response.status_code, 404)

    # Test: POST /api/matches/<uuid:match_id>/update/
    def test_update_match_admin_success(self):
        """
        Test that an admin can successfully update all updatable fields of a contest.
        """
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_access_token}")

        # Prepare a dictionary with new values for all updatable fields
        updated_data = {
            "name": "Updated AI Challenge Name",
            "year": 2025,
            "description": "This is an updated description for the test.",
            "logo": "data:image/png;base64,UPDATEDLOGO",
            "place": "Updated Place",
            "level": ContestLevel.INTERNATIONAL,
            "quality": ContestQuality.TOP,
            "months": [1, 2, 3],
            "keywords": [ContestKeywords.EE, ContestKeywords.MATH],
            "website": "https://updated.example.com",
            "materials": [
                {"name": "Updated Material", "url": "https://updated.material.link"}
            ],
            "registration_start": timezone.now() + timedelta(days=10),
            "registration_end": timezone.now() + timedelta(days=40),
        }

        # The request data needs to have datetime objects serialized to string
        request_data = updated_data.copy()
        request_data["registration_start"] = request_data[
            "registration_start"
        ].isoformat()
        request_data["registration_end"] = request_data["registration_end"].isoformat()

        response = self.client.post(
            f"/api/matches/{self.contest1.id}/update/", request_data, format="json"
        )
        self.assertEqual(response.status_code, 200)

        # Refresh the object from the database to get the new values
        self.contest1.refresh_from_db()

        # Assert that each field has been updated correctly
        self.assertEqual(self.contest1.name, updated_data["name"])
        self.assertEqual(self.contest1.year, updated_data["year"])
        self.assertEqual(self.contest1.description, updated_data["description"])
        self.assertEqual(self.contest1.logo, updated_data["logo"])
        self.assertEqual(self.contest1.place, updated_data["place"])
        self.assertEqual(self.contest1.level, updated_data["level"])
        self.assertEqual(self.contest1.quality, updated_data["quality"])
        self.assertEqual(self.contest1.months, updated_data["months"])
        self.assertEqual(self.contest1.keywords, updated_data["keywords"])
        self.assertEqual(self.contest1.website, updated_data["website"])
        self.assertEqual(self.contest1.materials, updated_data["materials"])
        # For datetime fields, compare dates to avoid microsecond precision issues
        self.assertEqual(
            self.contest1.registration_start.date(),
            updated_data["registration_start"].date(),
        )
        self.assertEqual(
            self.contest1.registration_end.date(),
            updated_data["registration_end"].date(),
        )

    def test_update_match_regular_user_forbidden(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.user_access_token}")
        data = {"place": "Should not update"}
        response = self.client.post(
            f"/api/matches/{self.contest1.id}/update/", data, format="json"
        )
        self.assertEqual(response.status_code, 403)

    def test_update_match_not_found(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_access_token}")
        non_existent_uuid = uuid.uuid4()
        data = {"place": "Should not update"}
        response = self.client.post(
            f"/api/matches/{non_existent_uuid}/update/", data, format="json"
        )
        self.assertEqual(response.status_code, 404)

    # Test: DELETE /api/matches/<uuid:match_id>/delete/
    def test_delete_match_admin_success(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_access_token}")
        contest_id = self.contest2.id
        response = self.client.delete(f"/api/matches/{contest_id}/delete/")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Contest.objects.filter(id=contest_id).exists())

    def test_delete_match_regular_user_forbidden(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.user_access_token}")
        response = self.client.delete(f"/api/matches/{self.contest1.id}/delete/")
        self.assertEqual(response.status_code, 403)

    # Test: POST /api/matches/<uuid:match_id>/teams/
    def test_get_match_teams_success(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.user_access_token}")
        data = {"page_index": 1, "page_size": 10}
        response = self.client.post(
            f"/api/matches/{self.contest1.id}/teams/", data, format="json"
        )
        self.assertEqual(response.status_code, 200)
        json_data = response.json()
        self.assertEqual(json_data["data"]["team_num"], 1)
        self.assertEqual(
            json_data["data"]["teams"][0]["name"], self.recruiting_team.name
        )

    def test_get_match_teams_unauthorized(self):
        self.client.credentials()
        data = {"page_index": 1, "page_size": 10}
        response = self.client.post(
            f"/api/matches/{self.contest1.id}/teams/", data, format="json"
        )
        self.assertEqual(response.status_code, 401)

    def test_get_match_teams_contest_not_found(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.user_access_token}")
        non_existent_uuid = uuid.uuid4()
        data = {"page_index": 1, "page_size": 10}
        response = self.client.post(
            f"/api/matches/{non_existent_uuid}/teams/", data, format="json"
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["message"], "Contest not found")
