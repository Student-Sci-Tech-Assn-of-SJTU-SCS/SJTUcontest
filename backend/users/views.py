from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.conf import settings
import urllib.parse
import secrets

from .serializers import UserProfileSerializer
from .jwt import (
    generate_new_jwt_tokens,
)
from .jaccount import (
    get_jaccount_authorize_url,
    exchange_code_for_tokens,
    decode_id_token,
    get_or_create_user_from_jaccount,
)
from utils import ApiResponse

User = get_user_model()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_profile_by_id(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return ApiResponse.not_found(message="User not found")

    serializer = UserProfileSerializer(user)

    return ApiResponse.success(data=serializer.data, message="User found")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return ApiResponse.success(
            data=serializer.data,
            message="用户信息更新成功",
            status_code=200,  # 使用200状态码
        )

    return ApiResponse.error(
        message="更新失败", data=serializer.errors, status_code=400  # 验证失败使用400
    )


class JAccountLoginView(APIView):
    """
    jAccount登录入口 - 重定向到jAccount授权页面
    """

    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # 生成随机state参数防止CSRF攻击
            state = secrets.token_urlsafe(32)

            # 将state存储在session中（用于回调时验证）
            request.session["jaccount_state"] = state

            # 生成授权URL
            auth_url = get_jaccount_authorize_url(state=state)

            data = {"auth_url": auth_url}
            return ApiResponse.success(data=data, message="请跳转到jAccount进行认证")

        except Exception as e:
            return ApiResponse.error(
                message=f"jAccount登录初始化失败: {str(e)}", status_code=500
            )


class JAccountCallbackView(APIView):
    """
    jAccount登录回调处理
    """

    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # 获取授权码
            code = request.GET.get("code")
            state = request.GET.get("state")
            error = request.GET.get("error")

            if error:
                return ApiResponse.error(message=f"jAccount授权错误: {error}")

            if not code:
                return ApiResponse.error(message="未收到授权码")

            # 验证state参数（防止CSRF攻击）
            stored_state = request.session.get("jaccount_state")
            if not stored_state or stored_state != state:
                return ApiResponse.error(message="无效的state参数")

            # 清除session中的state
            request.session.pop("jaccount_state", None)

            # 使用授权码换取令牌
            token_response = exchange_code_for_tokens(code)

            # 解析身份令牌获取用户信息
            id_token = token_response.get("id_token")
            if not id_token:
                return ApiResponse.error(message="未从jAccount收到ID token")

            user_info = decode_id_token(id_token)

            # 获取或创建用户
            user = get_or_create_user_from_jaccount(user_info)

            # 生成JWT令牌
            tokens = generate_new_jwt_tokens(user)

            data = {
                "tokens": tokens,
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "nick_name": user.nick_name,
                },
            }
            return ApiResponse.success(data=data, message="jAccount登录成功")

        except Exception as e:
            return ApiResponse.error(
                message=f"jAccount回调处理失败: {str(e)}", status_code=500
            )


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
