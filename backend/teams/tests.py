from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta

from contests.models import Contest
from teams.models import Team, UserTeam
from contests.choices import ContestLevel, ContestQuality

User = get_user_model()

#测试内容：1.成功创建队伍 2.无效数据创建队伍 3.重复创建队伍 4.超过创建限制 5.已过期比赛创建队伍 6.未认证用户尝试创建队伍
          
class CreateTeamTestCase(TestCase):
    def setUp(self):
        """
        测试前的准备工作
        """
        # 创建测试用户
        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword",
            nick_name="Test User"
        )
        
        # 创建测试比赛
        self.contest = Contest.objects.create(
            name="Test Contest",
            year=2025,
            place="Shanghai",
            level=ContestLevel.LOCAL,
            quality=ContestQuality.A_LEVEL,
            months=[1, 2],
            keywords=["AI", "CS"],
            registration_start=timezone.now(),
            registration_end=timezone.now() + timedelta(days=30)
        )
        
        # 创建另一个测试比赛
        self.contest2 = Contest.objects.create(
            name="Test Contest 2",
            year=2025,
            place="Beijing",
            level=ContestLevel.REGIONAL,
            quality=ContestQuality.B_LEVEL,
            months=[3, 4],
            keywords=["IS", "EE"],
            registration_start=timezone.now(),
            registration_end=timezone.now() + timedelta(days=60)
        )
        
        # 创建已过期的比赛
        self.expired_contest = Contest.objects.create(
            name="Expired Contest",
            year=2025,
            place="Expired",
            level=ContestLevel.NATIONAL,
            quality=ContestQuality.C_LEVEL,
            months=[5],
            keywords=["AI"],
            registration_start=timezone.now() - timedelta(days=60),
            registration_end=timezone.now() - timedelta(days=30)
        )
        
        # 创建API客户端
        self.client = APIClient()
        
        # 生成JWT token并设置认证头
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_create_team_success(self):
        """
        测试成功创建队伍
        """
        data = {
            "name": "Test Team",
            "introduction": "This is a test team",
            "contest": str(self.contest.id),
            "expected_members": 5,
            "recruitment_deadline": (timezone.now() + timedelta(days=15)).isoformat()
        }
        
        response = self.client.post('/api/teams/create/', data, format='json')
        json_data = response.json()
        # 检查响应状态码
        self.assertEqual(response.status_code, 201)
        
        # 检查响应数据
        self.assertEqual(json_data['message'], "队伍创建成功")
        self.assertEqual(json_data['data']['name'], "Test Team")
        self.assertEqual(json_data['data']['expected_members'], 5)
        self.assertEqual(json_data['data']['existing_members'], 1)
        
        # 检查数据库中的队伍是否创建成功
        team = Team.objects.get(name="Test Team")
        self.assertEqual(team.contest, self.contest)
        self.assertEqual(team.introduction, "This is a test team")
        
        # 检查当前用户是否为队长
        user_team = UserTeam.objects.get(user=self.user, team=team)
        self.assertTrue(user_team.is_leader)
        
        # 检查队伍邀请码是否生成
        self.assertIsNotNone(team.invitation_code)
        self.assertTrue(len(team.invitation_code) > 0)

    def test_create_team_invalid_data(self):
        """
        测试使用无效数据创建队伍
        """
        # 缺少必要字段
        data = {
            "name": "Test Team"
            # 缺少contest, expected_members, recruitment_deadline等必填字段
        }
        
        response = self.client.post('/api/teams/create/', data, format='json')
        json_data = response.json()
        # 检查响应状态码
        self.assertEqual(response.status_code, 400)
        self.assertEqual(json_data['message'], "Invalid data")

    def test_create_team_duplicate_leader_in_same_contest(self):
        """
        测试同一用户在相同比赛中重复创建队伍
        """
        # 先创建一个队伍
        team = Team.objects.create(
            name="Existing Team",
            introduction="Existing team",
            contest=self.contest,
            expected_members=5,
            recruitment_deadline=timezone.now() + timedelta(days=15)
        )
        
        # 将当前用户设为队长
        UserTeam.objects.create(user=self.user, team=team, is_leader=True)
        
        # 尝试再次创建同一比赛的队伍
        data = {
            "name": "Another Team",
            "introduction": "Another test team",
            "contest": str(self.contest.id),
            "expected_members": 4,
            "recruitment_deadline": (timezone.now() + timedelta(days=10)).isoformat()
        }
        
        response = self.client.post('/api/teams/create/', data, format='json')
        json_data = response.json()
        # 检查响应状态码
        self.assertEqual(response.status_code, 403)
        self.assertEqual(json_data['message'], "你已经在该比赛中创建过队伍")

    def test_create_team_exceed_limit(self):
        """
        测试用户创建队伍超过限制（5个）
        """
        # 创建5个队伍，每个在不同的比赛中（都未过期）
        contests = []
        for i in range(5):
            contest = Contest.objects.create(
                name=f"Contest {i+1}",
                year=2025,
                place=f"Place {i+1}",
                level=ContestLevel.LOCAL,
                quality=ContestQuality.C_LEVEL,
                months=[i+1],
                keywords=["AI"],
                registration_start=timezone.now(),
                registration_end=timezone.now() + timedelta(days=30+i)
            )
            contests.append(contest)
            
            team = Team.objects.create(
                name=f"Team {i+1}",
                introduction=f"Team {i+1}",
                contest=contest,
                expected_members=5,
                recruitment_deadline=timezone.now() + timedelta(days=15)
            )
            
            UserTeam.objects.create(user=self.user, team=team, is_leader=True)
        
        # 尝试创建第6个队伍
        data = {
            "name": "Sixth Team",
            "introduction": "Sixth test team",
            "contest": str(self.contest2.id),
            "expected_members": 4,
            "recruitment_deadline": (timezone.now() + timedelta(days=10)).isoformat()
        }
        
        response = self.client.post('/api/teams/create/', data, format='json')
        json_data = response.json()
        # 检查响应状态码
        self.assertEqual(response.status_code, 403)
        self.assertEqual(json_data['message'], "你最多只能在5个未截止比赛中创建队伍")

    def test_create_team_with_expired_contest(self):
        """
        测试在已过期比赛中创建队伍
        """
        # 创建一个已过期比赛的队伍应该成功，因为限制是针对未过期比赛的数量
        data = {
            "name": "Expired Contest Team",
            "introduction": "Team for expired contest",
            "contest": str(self.expired_contest.id),
            "expected_members": 4,
            "recruitment_deadline": (timezone.now() + timedelta(days=10)).isoformat()
        }
        
        response = self.client.post('/api/teams/create/', data, format='json')
        json_data = response.json()
        # 检查响应状态码
        self.assertEqual(response.status_code, 201)
        self.assertEqual(json_data['message'], "队伍创建成功")
        
        # 确认队伍已创建
        team = Team.objects.get(name="Expired Contest Team")
        self.assertEqual(team.contest, self.expired_contest)

    def test_create_team_unauthorized(self):
        """
        测试未认证用户尝试创建队伍
        """
        # 清除认证头
        self.client.credentials()
        
        data = {
            "name": "Unauthorized Team",
            "introduction": "Should not be created",
            "contest": str(self.contest.id),
            "expected_members": 4,
            "recruitment_deadline": (timezone.now() + timedelta(days=10)).isoformat()
        }
        
        response = self.client.post('/api/teams/create/', data, format='json')
        json_response = response.json()
        # 检查响应状态码
        self.assertEqual(response.status_code, 401)