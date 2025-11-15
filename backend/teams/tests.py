from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta
import uuid

from contests.models import Contest
from teams.models import Team, UserTeam
from contests.choices import ContestLevel, ContestQuality

User = get_user_model()

# ==========================================================================================
# Test Content:
#
# 1. Create Team API (/api/teams/create/)
#    - Test successful team creation
#    - Test creation with invalid data
#    - Test duplicate team creation in the same contest by the same leader
#    - Test exceeding the maximum number of active teams a user can create (5)
#    - Test creating a team for an expired contest
#    - Test creation attempt by an unauthenticated user
#
# 2. Get Recruiting Teams API (/api/teams/)
#    - Test successful retrieval of paginated recruiting teams
#    - Test filtering to ensure only non-full, active-recruitment teams are shown
#    - Test with an out-of-bounds page index
#    - Test retrieval by an unauthenticated user
#
# 3. Get Team by ID API (/api/teams/<uuid:team_id>/)
#    - Test successful retrieval of a specific team's details
#    - Test retrieving a non-existent team
#    - Test retrieval by an unauthenticated user
#
# 4. Update Team API (/api/teams/<uuid:team_id>/update/)
#    - Test successful update by the team leader
#    - Test update attempt by a non-leader member
#    - Test update attempt by a non-member
#    - Test update attempt by an unauthenticated user
#
# 5. Get Invitation Code API (/api/teams/<uuid:team_id>/invitation/)
#    - Test successful retrieval of the code by the team leader
#    - Test resetting and retrieving a new code
#    - Test retrieval attempt by a non-leader member
#    - Test retrieval attempt by a non-member
#    - Test retrieval attempt by an unauthenticated user
#
# 6. Join Team API (/api/teams/<uuid:team_id>/join/)
#    - Test successful team join with a valid code
#    - Test joining with an invalid or expired code
#    - Test joining a team that is already full
#    - Test joining a team when the user is already a member
#    - Test join attempt by an unauthenticated user
#
# 7. Quit Team API (/api/teams/<uuid:team_id>/quit/)
#    - Test successful exit by a team member
#    - Test quit attempt by the team leader (which should be forbidden)
#    - Test quit attempt by a user not in the team
#    - Test quit attempt by an unauthenticated user
#
# 8. Delete Team API (/api/teams/<uuid:team_id>/delete/)
#    - Test successful deletion by the team leader
#    - Test deletion attempt by a non-leader member
#    - Test deletion attempt by an unauthenticated user
# ==========================================================================================


class TeamAPITestCase(TestCase):
    def setUp(self):
        """
        Set up initial data for all tests.
        """
        # Create Users
        self.leader_user = User.objects.create_user(
            username="leader", password="password", nick_name="TeamLeader"
        )
        self.member_user = User.objects.create_user(
            username="member", password="password", nick_name="TeamMember"
        )
        self.normal_user = User.objects.create_user(
            username="normal", password="password", nick_name="NormalUser"
        )
        self.another_user = User.objects.create_user(
            username="another", password="password", nick_name="AnotherUser"
        )  # 用于测试创建队伍是否成功以及队伍已满

        # Create Contests
        self.active_contest = Contest.objects.create(
            name="Active Contest",
            year=2025,
            place="Online",
            level=ContestLevel.NATIONAL,
            quality=ContestQuality.A_LEVEL,
            registration_start=timezone.now() - timedelta(days=1),
            registration_end=timezone.now() + timedelta(days=30),
        )
        self.expired_contest = Contest.objects.create(
            name="Expired Contest",
            year=2025,
            place="Offline",
            level=ContestLevel.LOCAL,
            quality=ContestQuality.B_LEVEL,
            registration_start=timezone.now() - timedelta(days=60),
            registration_end=timezone.now() - timedelta(days=30),
        )

        # Create a primary team for testing (update, get, delete, etc.)
        self.team = Team.objects.create(
            name="Test Devils",
            introduction="A team for testing.",
            contest=self.active_contest,
            expected_members=4,
            recruitment_deadline=timezone.now() + timedelta(days=15),
        )
        UserTeam.objects.create(user=self.leader_user, team=self.team, is_leader=True)
        UserTeam.objects.create(user=self.member_user, team=self.team, is_leader=False)
        UserTeam.objects.create(user=self.another_user, team=self.team, is_leader=False)
        self.team.existing_members = 3
        self.team.save()

        # Create a full team for testing join logic
        self.full_team = Team.objects.create(
            name="Full House",
            introduction="This team is full.",
            contest=self.active_contest,
            expected_members=2,
            existing_members=2,
            recruitment_deadline=timezone.now() + timedelta(days=15),
        )
        UserTeam.objects.create(
            user=self.normal_user, team=self.full_team, is_leader=True
        )
        UserTeam.objects.create(
            user=self.member_user, team=self.full_team, is_leader=False
        )

        # API Client
        self.client = APIClient()

        # Authenticate the client for a specific user (can be changed in tests)
        self.authenticate_user(self.leader_user)

    def authenticate_user(self, user):
        """Helper method to authenticate the client for a given user."""
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def tearDown(self):
        """Clean up after each test."""
        self.client.credentials()

    # 1. Test Create Team
    def test_create_team_success(self):
        self.authenticate_user(self.another_user)
        data = {
            "name": "New Awesome Team",
            "introduction": "We are awesome.",
            "contest": str(self.active_contest.id),
            "expected_members": 5,
            "recruitment_deadline": (timezone.now() + timedelta(days=10)).isoformat(),
        }
        response = self.client.post("/api/teams/create/", data, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["message"], "队伍创建成功")
        self.assertTrue(Team.objects.filter(name="New Awesome Team").exists())

    def test_create_team_duplicate_leader_in_same_contest(self):
        # leader_user already has a team in active_contest
        self.authenticate_user(self.leader_user)
        data = {
            "name": "Another Team",
            "introduction": "Trying to create another team.",
            "contest": str(self.active_contest.id),
            "expected_members": 3,
            "recruitment_deadline": (timezone.now() + timedelta(days=10)).isoformat(),
        }
        response = self.client.post("/api/teams/create/", data, format="json")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["message"], "你已经在该比赛中创建过队伍")

    def test_create_team_exceed_limit(self):
        self.authenticate_user(self.normal_user)
        # Create 5 teams for the normal_user
        for i in range(5):
            contest = Contest.objects.create(
                name=f"Contest {i}",
                registration_end=timezone.now() + timedelta(days=10),
            )
            team = Team.objects.create(
                name=f"Limit Test Team {i}",
                contest=contest,
                expected_members=3,
                recruitment_deadline=timezone.now() + timedelta(days=5),
            )
            UserTeam.objects.create(user=self.normal_user, team=team, is_leader=True)

        new_contest = Contest.objects.create(
            name="Contest 6", registration_end=timezone.now() + timedelta(days=10)
        )
        data = {
            "name": "Sixth Team",
            "introduction": "This should fail.",
            "contest": str(new_contest.id),
            "expected_members": 3,
            "recruitment_deadline": (timezone.now() + timedelta(days=5)).isoformat(),
        }
        response = self.client.post("/api/teams/create/", data, format="json")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.json()["message"], "你最多只能在5个未截止比赛中创建队伍"
        )

    def test_create_team_unauthorized(self):
        self.client.credentials()  # Log out
        data = {"name": "Unauthorized Team", "contest": str(self.active_contest.id)}
        response = self.client.post("/api/teams/create/", data, format="json")
        self.assertEqual(response.status_code, 401)

    # 2. Test Get Recruiting Teams
    def test_get_teams_recruiting_success(self):
        self.authenticate_user(self.normal_user)
        data = {"page_index": 1, "page_size": 10}
        response = self.client.post("/api/teams/", data, format="json")
        self.assertEqual(response.status_code, 200)
        json_data = response.json()["data"]
        self.assertEqual(json_data["page_index"], 1)
        # Should find self.team but not self.full_team
        self.assertEqual(json_data["team_num"], 1)
        self.assertEqual(json_data["teams"][0]["name"], "Test Devils")

    def test_get_teams_recruiting_unauthorized(self):
        self.client.credentials()
        data = {"page_index": 1, "page_size": 10}
        response = self.client.post("/api/teams/", data, format="json")
        self.assertEqual(response.status_code, 401)

    # 3. Test Get Team by ID
    def test_get_team_by_id_success(self):
        response = self.client.get(f"/api/teams/{self.team.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["data"]["name"], "Test Devils")

    def test_get_team_by_id_not_found(self):
        non_existent_uuid = uuid.uuid4()
        response = self.client.get(f"/api/teams/{non_existent_uuid}/")
        self.assertEqual(response.status_code, 404)

    def test_get_team_by_id_unauthorized(self):
        self.client.credentials()
        response = self.client.get(f"/api/teams/{self.team.id}/")
        self.assertEqual(response.status_code, 401)

    # 4. Test Update Team
    def test_update_team_by_leader_success(self):
        self.authenticate_user(self.leader_user)
        data = {"introduction": "A new intro", "expected_members": 4}
        response = self.client.post(
            f"/api/teams/{self.team.id}/update/", data, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.team.refresh_from_db()
        self.assertEqual(self.team.introduction, "A new intro")
        self.assertEqual(self.team.expected_members, 4)

    def test_update_team_by_member_forbidden(self):
        self.authenticate_user(self.member_user)
        data = {"introduction": "Member trying to update"}
        response = self.client.post(
            f"/api/teams/{self.team.id}/update/", data, format="json"
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["message"], "只有队长可以更新队伍信息")

    # 5. Test Get Invitation Code
    def test_get_invitation_code_by_leader_success(self):
        self.authenticate_user(self.leader_user)
        response = self.client.get(f"/api/teams/{self.team.id}/invitation/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("invitation_code", response.json()["data"])

    def test_get_invitation_code_by_member_forbidden(self):
        self.authenticate_user(self.member_user)
        response = self.client.get(f"/api/teams/{self.team.id}/invitation/")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["message"], "只有队长可以获取邀请码")

    def test_get_invitation_code_by_non_member_forbidden(self):
        self.authenticate_user(self.normal_user)
        response = self.client.get(f"/api/teams/{self.team.id}/invitation/")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["message"], "只有队长可以获取邀请码")

    # 6. Test Join Team
    def test_join_team_success(self):
        self.authenticate_user(self.normal_user)
        # The leader needs to get the code first
        leader_client = APIClient()
        refresh = RefreshToken.for_user(self.leader_user)
        leader_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        res = leader_client.get(f"/api/teams/{self.team.id}/invitation/")
        invitation_code = res.json()["data"]["invitation_code"]

        data = {"invitation_code": invitation_code}
        response = self.client.post(
            f"/api/teams/{self.team.id}/join/", data, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "加入队伍成功")
        self.assertTrue(
            UserTeam.objects.filter(user=self.normal_user, team=self.team).exists()
        )
        self.team.refresh_from_db()
        self.assertEqual(self.team.existing_members, 4)

    def test_join_team_invalid_code(self):
        self.authenticate_user(self.normal_user)
        data = {"invitation_code": "thisisawrongcode"}
        response = self.client.post(
            f"/api/teams/{self.team.id}/join/", data, format="json"
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["message"], "非法的邀请码")

    def test_join_team_full(self):
        self.authenticate_user(self.another_user)
        data = {"invitation_code": self.full_team.invitation_code}
        response = self.client.post(
            f"/api/teams/{self.full_team.id}/join/", data, format="json"
        )
        self.assertEqual(response.status_code, 400)  # As per view logic
        self.assertEqual(response.json()["message"], "队伍人数已满，请联系队长扩容")

    def test_join_team_already_member(self):
        self.authenticate_user(self.member_user)  # Authenticate as an existing member
        data = {"invitation_code": self.team.invitation_code}
        response = self.client.post(
            f"/api/teams/{self.team.id}/join/", data, format="json"
        )
        self.assertEqual(response.status_code, 400)  # As per view logic
        self.assertEqual(response.json()["message"], "你已经在队伍中")

    # 7. Test Quit Team
    def test_quit_team_by_member_success(self):
        self.authenticate_user(self.member_user)
        response = self.client.post(f"/api/teams/{self.team.id}/quit/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "退出队伍成功")
        self.assertFalse(
            UserTeam.objects.filter(user=self.member_user, team=self.team).exists()
        )
        self.team.refresh_from_db()
        self.assertEqual(self.team.existing_members, 2)

    def test_quit_team_by_leader_forbidden(self):
        self.authenticate_user(self.leader_user)
        response = self.client.post(f"/api/teams/{self.team.id}/quit/")
        self.assertEqual(response.status_code, 400)  # As per view logic
        self.assertEqual(response.json()["message"], "队长不能退出队伍")

    def test_quit_team_by_non_member_error(self):
        self.authenticate_user(self.normal_user)
        response = self.client.post(f"/api/teams/{self.team.id}/quit/")
        self.assertEqual(response.status_code, 400)  # As per view logic
        self.assertEqual(response.json()["message"], "你不在该队伍中")

    # 8. Test Delete Team
    def test_delete_team_by_leader_success(self):
        self.authenticate_user(self.leader_user)
        team_id = self.team.id
        response = self.client.delete(f"/api/teams/{team_id}/delete/")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Team.objects.filter(id=team_id).exists())

    def test_delete_team_by_member_forbidden(self):
        self.authenticate_user(self.member_user)
        response = self.client.delete(f"/api/teams/{self.team.id}/delete/")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["message"], "只有队长可以删除队伍")

    def test_delete_team_unauthorized(self):
        self.client.credentials()
        response = self.client.delete(f"/api/teams/{self.team.id}/delete/")
        self.assertEqual(response.status_code, 401)
