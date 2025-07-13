from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
import urllib.parse

from .serializers import (
    UserProfileSerializer,
    UserRegisterSerializer,
    jAccountLoginRequestSerializer,
)
from .jaccount import (
    get_jaccount_authorize_url,
    exchange_code_for_tokens,
    decode_id_token,
    get_jaccount_profile,
    get_or_create_user_from_jaccount,
)
from SJTUcontest.utils import ApiResponse

User = get_user_model()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_profile_by_id(request, user_id):
    try:
        user = User.objects.get(id=user_id)

        serializer = UserProfileSerializer(user)
        return ApiResponse.success(data=serializer.data, message="User found")

    except User.DoesNotExist:
        return ApiResponse.not_found(message="User not found")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    try:
        serializer = UserProfileSerializer(
            request.user, data=request.data, partial=True
        )

        if not serializer.is_valid():
            return ApiResponse.error(
                message="Invalid data",
                data=serializer.errors,
            )

        serializer.save()
        return ApiResponse.success(
            data=serializer.data,
            message="用户信息更新成功",
        )

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """
    用户注册接口，仅供测试时使用！
    """
    try:
        serializer = UserRegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return ApiResponse.error(message="Invalid data", data=serializer.errors)

        User.objects.create_user(
            username=serializer.validated_data["username"],
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        return ApiResponse.success(message="注册成功", status_code=201)

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def get_jaccount_auth_url(request):
    try:
        # 生成授权URL
        auth_url = get_jaccount_authorize_url()

        data = {"auth_url": auth_url}
        return ApiResponse.success(data=data, message="请跳转到jAccount进行认证")

    except Exception as e:
        return ApiResponse.error(
            message=f"jAccount登录URL获取失败: {str(e)}", status_code=500
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def login_by_jaccount(request):
    try:
        serializer = jAccountLoginRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return ApiResponse.error(message="Invalid data", data=serializer.errors)

        # 从前端取回授权码
        code = serializer.validated_data["code"]

        # 用授权码向认证服务器申请令牌
        response = exchange_code_for_tokens(code)

        if settings.JACCOUNT_SCOPE == "openid":
            # 解析身份令牌获取用户信息
            id_token = response["id_token"]
            user_info = decode_id_token(id_token)
            jaccount_id = user_info["sub"]  # jAccount账号

        else:
            access_token = response["access_token"]
            user_info = get_jaccount_profile(access_token)

            if settings.JACCOUNT_SCOPE == "basic":
                jaccount_id = user_info["account"]
            elif settings.JACCOUNT_SCOPE == "essential":
                jaccount_id = user_info["entities"][0]["account"]
            else:
                raise Exception(
                    f"Unsupported jAccount scope: {settings.JACCOUNT_SCOPE}"
                )

        # 获取或创建用户
        user = get_or_create_user_from_jaccount(jaccount_id)

        # 更新用户的最后登录时间
        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        # 生成JWT令牌
        refresh = RefreshToken.for_user(user)
        return Response(
            data={
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "nick_name": user.nick_name,
                    "is_staff": user.is_staff,
                    "is_active": user.is_active,
                },
            },
            status=200,
        )

    except Exception as e:
        return ApiResponse.error(message=f"jAccount登录失败: {str(e)}", status_code=500)


# 这东西暂时没用
class JAccountLogoutView(APIView):
    """
    jAccount登出 - 同时处理本地JWT和jAccount登出
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # 先处理本地JWT令牌黑名单
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            # 构造jAccount登出URL
            logout_params = {
                "client_id": settings.JACCOUNT_CLIENT_ID,
                "post_logout_redirect_uri": request.build_absolute_uri("/"),
            }

            logout_url = f"{settings.JACCOUNT_LOGOUT_URL}?{urllib.parse.urlencode(logout_params)}"

            data = {"jaccount_logout_url": logout_url}
            return ApiResponse.success(data=data, message="登出成功")

        except TokenError:
            return ApiResponse.error(message="无效的token")
        except Exception as e:
            return ApiResponse.error(message=f"登出失败: {str(e)}", status_code=500)
