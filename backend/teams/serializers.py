from rest_framework import serializers

from .models import Team, UserTeam


class RecruitingTeamRequestSerializer(serializers.Serializer):
    page_index = serializers.IntegerField(min_value=1, required=True)
    page_size = serializers.IntegerField(min_value=1, max_value=100, required=True)


class TeamSearchRequestSerializer(serializers.Serializer):
    team_name = serializers.CharField(max_length=50, required=True, help_text="要搜索的队伍名称")
    page_index = serializers.IntegerField(min_value=1, required=True)
    page_size = serializers.IntegerField(min_value=1, max_value=100, required=True)


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


class TeamInvitationCodeResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ["id", "invitation_code", "invitation_code_created_at"]


class JoinTeamRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ["invitation_code"]


class TeamUpdateRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = [
            "name",
            "introduction",
            "expected_members",
            "recruitment_deadline",
        ]
