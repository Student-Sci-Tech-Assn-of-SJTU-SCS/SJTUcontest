from django.db import models
import uuid

from SJTUcontest.utils import generate_random_string


# Create your models here.
class Team(models.Model):
    # UUID主键
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # 队伍名称
    name = models.CharField(max_length=50, help_text="队伍名称")
    # 队伍简介（请队长同时写上自己的联系方式）
    introduction = models.TextField(blank=True, null=True, help_text="队伍简介")
    # 队伍要参加的比赛
    contest = models.ForeignKey(
        "contests.Contest",
        on_delete=models.CASCADE,
        related_name="teams",
        help_text="队伍要参加的比赛",
    )
    # 队伍已有人数
    existing_members = models.PositiveIntegerField(default=0, help_text="队伍已有人数")
    # 队伍期望人数
    expected_members = models.PositiveIntegerField(default=1, help_text="队伍期望人数")
    # 招募截止日期
    recruitment_deadline = models.DateTimeField(
        null=True, blank=True, help_text="招募截止日期"
    )
    # 队伍邀请码
    invitation_code = models.CharField(
        default=generate_random_string,
        help_text="队伍邀请码",
    )
    # 邀请码创建时间
    invitation_code_created_at = models.DateTimeField(
        auto_now_add=True, help_text="邀请码创建时间"
    )
    # 邀请码是否有效
    is_invitation_code_valid = models.BooleanField(
        default=True, help_text="邀请码是否有效"
    )

    class Meta:
        verbose_name = "Team"
        verbose_name_plural = "Teams"


class UserTeam(models.Model):
    """用户和团队的关联模型"""

    # UUID主键
    id = models.AutoField(primary_key=True, editable=False)
    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="user_teams"
    )
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="team_users")
    is_leader = models.BooleanField(default=False, help_text="是否为队长")

    class Meta:
        verbose_name = "UserTeam"
        verbose_name_plural = "UserTeams"
