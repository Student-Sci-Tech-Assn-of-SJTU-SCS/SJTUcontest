from rest_framework import serializers

from SJTUcontest.green import detect_content
from .models import Team, UserTeam


class RecruitingTeamRequestSerializer(serializers.Serializer):
    page_index = serializers.IntegerField(min_value=1, required=True)
    page_size = serializers.IntegerField(min_value=1, max_value=100, required=True)


class TeamSearchRequestSerializer(serializers.Serializer):
    team_name = serializers.CharField(
        max_length=50, required=True, help_text="要搜索的队伍名称"
    )
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

    def validate(self, attrs):
        # 获取当前用户
        user = self.context.get("request").user if self.context.get("request") else None
        user_id = str(user.id) if user else "unknown"

        # 审核队伍名称（创建时总是需要审核）
        if "name" in attrs:
            if not detect_content(attrs["name"], user_id, "team.name"):
                raise serializers.ValidationError(
                    {"name": "队伍名称包含敏感内容，请修改"}
                )

        # 审核队伍简介（创建时总是需要审核）
        if "introduction" in attrs and attrs["introduction"]:
            if not detect_content(attrs["introduction"], user_id, "team.introduction"):
                raise serializers.ValidationError(
                    {"introduction": "队伍简介包含敏感内容，请修改"}
                )

        return attrs


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

    def validate(self, attrs):
        # 获取当前用户
        user = self.context.get("request").user if self.context.get("request") else None
        user_id = str(user.id) if user else "unknown"

        # 审核队伍名称（仅当内容发生变化时）
        if "name" in attrs:
            # 检查内容是否发生变化
            if not self.instance or attrs["name"] != self.instance.name:
                if not detect_content(attrs["name"], user_id, "team.name"):
                    raise serializers.ValidationError(
                        {"name": "队伍名称审核不通过，请修改"}
                    )

        # 审核队伍简介（仅当内容发生变化时）
        if "introduction" in attrs and attrs["introduction"]:
            # 检查内容是否发生变化
            if not self.instance or attrs["introduction"] != self.instance.introduction:
                if not detect_content(
                    attrs["introduction"], user_id, "team.introduction"
                ):
                    raise serializers.ValidationError(
                        {"introduction": "队伍简介审核不通过，请修改"}
                    )

        return attrs
