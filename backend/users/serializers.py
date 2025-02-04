# 实现用户数据的序列化和反序列化
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'avatar_url']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()  # 用户名或邮箱
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs.get('identifier')
        password = attrs.get('password')

        # 尝试根据用户名查询用户
        user = None
        if '@' in identifier:  # 如果是邮箱
            user = User.objects.filter(email=identifier).first()
        else:  # 如果是用户名
            user = User.objects.filter(username=identifier).first()

        if user is None:
            raise serializers.ValidationError("无效的用户名或邮箱")

        if not user.check_password(password):
            raise serializers.ValidationError("密码错误")

        attrs['user'] = user
        return attrs