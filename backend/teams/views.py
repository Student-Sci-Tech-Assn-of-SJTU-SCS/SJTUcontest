from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now

from .models import Team, UserTeam
from .serializers import TeamCreateRequestSerializer, TeamResponseSerializer
from SJTUcontest.utils import ApiResponse


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_team(request):
    """
    创建一个新的队伍，并设置当前用户为队长。
    如果未提供招募截止时间，则使用比赛报名截止时间。
    同一个用户在同一比赛中只能创建一个队伍。
    每个用户最多在3个尚未报名截止的比赛中创建队伍。
    """
    try:
        serializer = TeamCreateRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return ApiResponse.error(
                message="Invalid data", data=serializer.errors, status_code=400
            )

        contest = serializer.validated_data["contest"]

        # 检查当前用户是否已经在该比赛中是某支队伍的队长
        existing_leader_team = Team.objects.filter(
            contest=contest, team_users__user=request.user, team_users__is_leader=True
        ).first()

        if existing_leader_team:
            return ApiResponse.forbidden(message="你已经在该比赛中创建过队伍")

        # 限制每个用户在报名未截止的比赛中最多创建5个队伍
        active_leader_teams_count = Team.objects.filter(
            team_users__user=request.user,
            team_users__is_leader=True,
            contest__registration_end__gt=now(),
        ).count()

        if active_leader_teams_count >= 5:
            return ApiResponse.forbidden(
                message="你最多只能在5个未截止比赛中创建队伍", status_code=400
            )

        # 创建队伍
        team = Team.objects.create(**serializer.validated_data)

        # 设置当前用户为队长
        UserTeam.objects.create(user=request.user, team=team, is_leader=True)

        return ApiResponse.success(
            data=TeamResponseSerializer(team).data,
            message="队伍创建成功",
            status_code=201,
        )

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_team_by_id(request, team_id):
    """
    根据队伍 ID 获取队伍详情。
    """
    try:
        team = Team.objects.get(id=team_id)

        return ApiResponse.success(
            data=TeamResponseSerializer(team).data,
            message="队伍信息获取成功",
            status_code=200,
        )

    except Team.DoesNotExist:
        return ApiResponse.not_found(message="队伍不存在")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )
