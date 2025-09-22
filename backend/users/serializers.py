from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import re

from SJTUcontest.green import detect_content

User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password")

    def validate_password(self, value):
        """
        自定义密码强度验证
        """
        if len(value) < 8:
            raise serializers.ValidationError("密码长度不能少于8位。")

        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("密码必须包含至少一个大写字母。")

        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError("密码必须包含至少一个小写字母。")

        if not re.search(r"[0-9]", value):
            raise serializers.ValidationError("密码必须包含至少一个数字。")

        if not re.search(
            r"[\W_]", value
        ):  # \W 匹配任何非单词字符，等价于 [^a-zA-Z0-9_]
            raise serializers.ValidationError("密码必须包含至少一个特殊字符。")

        return value

    def create(self, validated_data):
        # 使用 create_user 方法来创建用户，它会自动处理密码哈希
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user


class CustomTokenObtainSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # 添加核心用户信息
        user = self.user
        data["user"] = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "nick_name": user.nick_name,
            "is_staff": user.is_staff,
            "is_active": user.is_active,
        }
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "nick_name",
            "experience",
            "advantage",
        ]

    def validate(self, attrs):
        # 获取当前用户
        user = self.context.get("request").user if self.context.get("request") else None
        user_id = str(user.id) if user else "unknown"

        # 审核昵称（仅当内容发生变化时）
        if "nick_name" in attrs and attrs["nick_name"]:
            # 检查内容是否发生变化
            if not self.instance or attrs["nick_name"] != self.instance.nick_name:
                if not detect_content(attrs["nick_name"], user_id, "user.nick_name"):
                    raise serializers.ValidationError(
                        {"nick_name": "昵称审核不通过，请修改"}
                    )

        # 审核经历（仅当内容发生变化时）
        if "experience" in attrs and attrs["experience"]:
            # 检查内容是否发生变化
            if not self.instance or attrs["experience"] != self.instance.experience:
                if not detect_content(attrs["experience"], user_id, "user.experience"):
                    raise serializers.ValidationError(
                        {"experience": "参赛经历审核不通过，请修改"}
                    )

        # 审核特长（仅当内容发生变化时）
        if "advantage" in attrs and attrs["advantage"]:
            # 检查内容是否发生变化
            if not self.instance or attrs["advantage"] != self.instance.advantage:
                if not detect_content(attrs["advantage"], user_id, "user.advantage"):
                    raise serializers.ValidationError(
                        {"advantage": "特长审核不通过，请修改"}
                    )

        return attrs


class jAccountLoginRequestSerializer(serializers.Serializer):
    code = serializers.CharField(required=True)


class UserTeamsRequestSerializer(serializers.Serializer):
    page_index = serializers.IntegerField(min_value=1, required=True)
    page_size = serializers.IntegerField(min_value=1, max_value=100, required=True)


class UserTotalInfoSerializer(serializers.ModelSerializer):
    teams = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "nick_name",
            "experience",
            "advantage",
            "is_staff",
            "is_active",
            "date_joined",
            "last_login",
            "updated_at",
            "created_at",
            "teams",
        ]

    def get_teams(self, obj):
        from teams.models import Team
        from teams.serializers import TeamResponseSerializer

        user_teams = Team.objects.filter(team_users__user=obj)
        return TeamResponseSerializer(user_teams, many=True).data
