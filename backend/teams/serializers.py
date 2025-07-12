from rest_framework import serializers

from .models import Team, UserTeam


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
            "contest",
            "expected_members",
            "recruitment_deadline",
        ]


class TeamResponseSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(
        source="team_users",
        many=True,
        read_only=True,
    )

    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "introduction",
            "expected_members",
            "existing_members",
            "recruitment_deadline",
            "contest",
            "members",  # 成员列表
        ]


class TeamInvitationCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ["invitation_code", "invitation_code_created_at"]


class TeamUpdateRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = [
            "name",
            "introduction",
            "expected_members",
            "recruitment_deadline",
        ]
