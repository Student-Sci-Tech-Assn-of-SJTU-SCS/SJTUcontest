# 实现用户数据的序列化和反序列化
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username",
            "password",
            "email",
        ]


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
            "teams",
        ]

    def get_teams(self, obj):
        from teams.models import Team
        from teams.serializers import TeamResponseSerializer

        user_teams = Team.objects.filter(team_users__user=obj)
        return TeamResponseSerializer(user_teams, many=True).data
