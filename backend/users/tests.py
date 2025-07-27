from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
import uuid

# Since the user's files imply a teams app is present, we import its models for relationship testing.
# If the teams app is not available, these imports and related tests should be commented out.
from teams.models import Team, UserTeam
from contests.models import Contest

User = get_user_model()

# ==========================================================================================
# Test Content:
#
# 1. Register API (/api/users/register/)
#    - Test successful user registration.
#    - Test registration with a duplicate username.
#    - Test registration with invalid data.
#
# 2. Login API (/api/users/login/)
#    - Test successful login with valid credentials.
#    - Test login with an incorrect password.
#    - Test login for a non-existent user.
#
# 3. Logout API (/api/users/logout/)
#    - Test successful logout by blacklisting the refresh token.
#    - Test logout attempt by an unauthenticated user.
#
# 4. Get User Profile API (/api/users/<uuid:user_id>/)
#    - Test successful retrieval of another user's profile.
#    - Test retrieving a non-existent user's profile.
#    - Test retrieval attempt by an unauthenticated user.
#
# 5. Update User Profile API (/api/users/profile/update/)
#    - Test successful update of the user's own profile.
#    - Test partial update of the profile.
#    - Test update attempt by an unauthenticated user.
#
# 6. Get User's Teams API (/api/users/my/teams/)
#    - Test successful retrieval of the user's teams with pagination.
#    - Test retrieval for a user with no teams.
#    - Test retrieval with an out-of-bounds page index.
#    - Test retrieval attempt by an unauthenticated user.
# ==========================================================================================


class UserAPITestCase(TestCase):
    def setUp(self):
        """
        测试前的准备工作 (Setup for tests)
        """
        # 创建测试用户 (Create test users)
        self.user1 = User.objects.create_user(
            username="testuser1",
            password="testpassword123",
            email="user1@test.com",
            nick_name="TestUserOne",
        )
        self.user2 = User.objects.create_user(
            username="testuser2",
            password="testpassword123",
            email="user2@test.com",
            nick_name="TestUserTwo",
        )

        # 为 get_user_teams 测试创建比赛和队伍 (Create contest and team for get_user_teams test)
        self.contest = Contest.objects.create(name="Sample Contest", year=2025)
        self.team = Team.objects.create(
            name="User1's Team", contest=self.contest, expected_members=5
        )
        UserTeam.objects.create(user=self.user1, team=self.team, is_leader=True)

        # 创建API客户端 (Create API client)
        self.client = APIClient()

    def _get_user_tokens(self, user):
        """辅助函数：获取用户的令牌 (Helper function: get tokens for a user)"""
        return RefreshToken.for_user(user)

    # 1. Test Register API
    def test_register_success(self):
        """测试成功注册 (Test successful registration)"""
        url = reverse("register")
        data = {
            "username": "newuser",
            "password": "newpassword123",
            "email": "new@test.com",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["message"], "注册成功")
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_register_duplicate_username(self):
        """测试重复用户名注册 (Test registration with duplicate username)"""
        url = reverse("register")
        data = {
            "username": "testuser1",  # Existing username
            "password": "newpassword123",
            "email": "new@test.com",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, 400) # Assuming serializer validation catches this

    # 2. Test Login & Logout API
    def test_login_and_logout_success(self):
        """测试成功登录和登出 (Test successful login and logout)"""
        # Login
        login_url = reverse("login")
        login_data = {"username": "testuser1", "password": "testpassword123"}
        response = self.client.post(login_url, login_data, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        
        refresh_token = response.data["refresh"]
        access_token = response.data["access"]

        # Logout
        logout_url = reverse("logout")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = self.client.post(logout_url, {"refresh": refresh_token}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "登出成功")

    def test_login_fail_wrong_password(self):
        """测试错误密码登录 (Test login with wrong password)"""
        url = reverse("login")
        data = {"username": "testuser1", "password": "wrongpassword"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, 401)

    # 3. Test Get User Profile API
    def test_get_user_profile_success(self):
        """测试成功获取用户个人信息 (Test successfully getting user profile)"""
        refresh = self._get_user_tokens(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        url = reverse("get_user_profile_by_id", args=[self.user2.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["data"]["nick_name"], self.user2.nick_name)

    def test_get_nonexistent_user_profile(self):
        """测试获取不存在的用户信息 (Test getting a non-existent user profile)"""
        refresh = self._get_user_tokens(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        non_existent_uuid = uuid.uuid4()
        url = reverse("get_user_profile_by_id", args=[non_existent_uuid])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

    def test_get_user_profile_unauthorized(self):
        """测试未认证用户获取信息 (Test getting profile while unauthenticated)"""
        url = reverse("get_user_profile_by_id", args=[self.user2.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)

    # 4. Test Update User Profile API
    def test_update_profile_success(self):
        """测试成功更新个人信息 (Test successfully updating profile)"""
        refresh = self._get_user_tokens(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        url = reverse("update_user_profile")
        data = {
            "nick_name": "UpdatedNickName",
            "experience": "New Experience",
            "advantage": "New Advantage",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["data"]["nick_name"], "UpdatedNickName")

        # 确认数据库已更新 (Verify database was updated)
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.nick_name, "UpdatedNickName")
        self.assertEqual(self.user1.experience, "New Experience")

    def test_update_profile_unauthorized(self):
        """测试未认证用户更新信息 (Test updating profile while unauthenticated)"""
        url = reverse("update_user_profile")
        data = {"nick_name": "ShouldNotUpdate"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, 401)

    # 5. Test Get User's Teams API
    def test_get_my_teams_success(self):
        """测试成功获取我的队伍列表 (Test successfully getting my teams)"""
        refresh = self._get_user_tokens(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        url = reverse("get_user_teams")
        data = {"page_index": 1, "page_size": 10}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["data"]["team_num"], 1)
        self.assertEqual(response.json()["data"]["teams"][0]["name"], "User1's Team")

    def test_get_my_teams_empty(self):
        """测试获取没有队伍的用户的列表 (Test getting teams for a user with no teams)"""
        refresh = self._get_user_tokens(self.user2) # user2 has no teams
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        url = reverse("get_user_teams")
        data = {"page_index": 1, "page_size": 10}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["data"]["team_num"], 0)

    def test_get_my_teams_unauthorized(self):
        """测试未认证用户获取队伍列表 (Test getting teams while unauthenticated)"""
        url = reverse("get_user_teams")
        data = {"page_index": 1, "page_size": 10}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, 401)
