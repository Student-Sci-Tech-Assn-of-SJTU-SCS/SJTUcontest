from rest_framework import serializers
from .models import Team, UserTeam
from users.models import User


# 序列化成员信息
class TeamMemberSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="user.id")
    nick_name = serializers.CharField(source="user.nick_name")

    class Meta:
        model = UserTeam
        fields = ["id", "nick_name", "is_leader"]


class TeamCreateRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = [
            "name",
            "introduction",
            "expected_members",
            "recruitment_deadline",
        ]
    def get_members(self, obj):
        user_teams = obj.team_users.select_related("user").all()
        return TeamMemberSerializer(user_teams, many=True).data


class TeamResponseSerializer(serializers.ModelSerializer):
    user_teams = serializers.SerializerMethodField()
    existing_members = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "introduction",
            "expected_members",
            "existing_members",
            "recruitment_deadline",
            "contest",  # 如果你要返回参加的比赛
            "user_teams",  # 成员列表
        ]

    def get_user_teams(self, obj):
        user_teams = obj.team_users.select_related("user").all()
        return TeamMemberSerializer(user_teams, many=True).data

    def get_existing_members(self, obj):
        return obj.team_users.count()

class TeamInvitationCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['invitation_code', 'invitation_code_created_at']