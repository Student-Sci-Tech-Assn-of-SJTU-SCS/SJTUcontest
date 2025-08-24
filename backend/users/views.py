from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.paginator import Paginator

from .serializers import (
    UserProfileSerializer,
    UserRegisterSerializer,
    jAccountLoginRequestSerializer,
    UserTeamsRequestSerializer,
    UserTotalInfoSerializer,
)
from .jaccount import (
    get_jaccount_authorize_url,
    exchange_code_for_tokens,
    get_jaccount_logout_url,
    get_or_create_user_from_jaccount,
    get_jaccount_id,
)
from SJTUcontest.utils import ApiResponse
from teams.models import Team
from teams.serializers import TeamResponseSerializer

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

        # 从 response 中获取 jAccount ID
        jaccount_id = get_jaccount_id(response)

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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    用户登出接口 - 处理本地 JWT 令牌黑名单和 jAccount登出
    """
    try:
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return ApiResponse.error(message="Refresh token is required")

        token = RefreshToken(refresh_token)
        token.blacklist()

        jaccount_logout_url = get_jaccount_logout_url()

        data = {"jaccount_logout_url": jaccount_logout_url}
        return ApiResponse.success(message="登出成功", data=data)

    except TokenError:
        return ApiResponse.error(message="无效的token")
    except Exception as e:
        return ApiResponse.error(message=f"登出失败: {str(e)}", status_code=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_user_teams(request):
    """
    获取用户的所有队伍
    """
    try:
        serializer = UserTeamsRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return ApiResponse.error(message="无效的分页参数", data=serializer.errors)

        teams = Team.objects.filter(team_users__user=request.user)

        page_index = serializer.validated_data["page_index"]
        page_size = serializer.validated_data["page_size"]

        paginator = Paginator(teams, page_size)

        if page_index > paginator.num_pages:
            return ApiResponse.not_found(
                message="请求的页码超出范围",
                data={
                    "total_pages": paginator.num_pages,
                    "page_index": page_index,
                },
            )

        page_teams = paginator.page(page_index)
        teams_serializer = TeamResponseSerializer(page_teams, many=True)

        response_data = {
            "total_pages": paginator.num_pages,
            "page_index": page_index,
            "team_num": len(teams_serializer.data),
            "teams": teams_serializer.data,
        }

        return ApiResponse.success(
            data=response_data,
            message="成功获取用户队伍信息",
        )

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def forbid_user_by_id(request, user_id):
    """
    超级管理员封禁用户接口。
    将用户的 is_active 状态设置为 False。
    """
    try:
        # 检查请求者是否为超级管理员
        if not request.user.is_superuser:
            return ApiResponse.forbidden(
                message="Permission denied. Only super administrators can perform this action.",
            )

        target_user = User.objects.get(id=user_id)

        # 超级管理员不能封禁自己
        if target_user == request.user:
            return ApiResponse.error(message="You cannot ban yourself.")

        # 为了安全，增加一层保护：不允许一个超级管理员封禁另一个超级管理员
        if target_user.is_superuser:
            return ApiResponse.error(message="Super administrators cannot be banned.")

        # 执行封禁操作
        target_user.is_active = False
        target_user.save(update_fields=["is_active"])

        serializer = UserProfileSerializer(target_user)
        return ApiResponse.success(
            data=serializer.data, message="User has been forbidden successfully."
        )

    except User.DoesNotExist:
        return ApiResponse.not_found(message="User not found")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_total_info_by_id(request, user_id):
    """
    获取用户的完整信息，包括基本信息和所在队伍信息。
    只有超级管理员可以访问。
    """
    try:
        if not request.user.is_superuser:
            return ApiResponse.forbidden(
                message="Permission denied. Only super administrators can perform this action.",
            )

        user = User.objects.get(id=user_id)
        serializer = UserTotalInfoSerializer(user)

        return ApiResponse.success(
            data=serializer.data,
            message="User total information retrieved successfully.",
        )

    except User.DoesNotExist:
        return ApiResponse.not_found(message="User not found")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )
