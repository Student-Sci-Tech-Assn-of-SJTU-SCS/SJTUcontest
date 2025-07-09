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
