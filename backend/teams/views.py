from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from uuid import UUID
from contests.models import Contest
from .models import Team, UserTeam
from .serializers import TeamCreateRequestSerializer, TeamResponseSerializer
from SJTUcontest.utils import ApiResponse


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_team(request):
    """
    创建一个新的队伍，并设置当前用户为队长。
    如果未提供招募截止时间，则使用比赛报名截止时间。
    """
    match_id = request.data.get("match_id")
    if not match_id:
        return ApiResponse.error(message="比赛 ID 不能为空", status_code=400)

    try:
        UUID(str(match_id))
    except ValueError:
        return ApiResponse.error(message="比赛 ID 格式非法", status_code=400)

    serializer = TeamCreateRequestSerializer(data=request.data)
    if serializer.is_valid():
        try:
            contest = Contest.objects.get(id=match_id)
        except Contest.DoesNotExist:
            return ApiResponse.not_found(message="比赛不存在")

        team_data = serializer.validated_data

        # 如果没有提供招募截止时间，则使用比赛报名截止时间
        if not team_data.get("recruitment_deadline"):
            team_data["recruitment_deadline"] = contest.registration_deadline

        # 创建 Team 对象
        team = Team.objects.create(
            contest=contest,
            existing_members=1,
            **team_data,
        )

        # 创建 UserTeam，设为队长
        UserTeam.objects.create(user=request.user, team=team, is_leader=True)

        return ApiResponse.success(
            data=TeamResponseSerializer(team).data,
            message="队伍创建成功",
            status_code=201,
        )

    return ApiResponse.error(
        message="参数校验失败", data=serializer.errors, status_code=400
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_team_by_id(request, team_id):
    """
    根据队伍 ID 获取队伍详情。
    """
    # 1. 检查 team_id 是否是合法 UUID 格式
    try:
        UUID(str(team_id))
    except ValueError:
        return ApiResponse.error(message="队伍 ID 格式非法", status_code=400)

    # 2. 查询队伍是否存在
    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return ApiResponse.not_found(message="队伍不存在")

    # 3. 成功返回
    return ApiResponse.success(
        data=TeamResponseSerializer(team).data,
        message="队伍信息获取成功",
        status_code=200,
    )
