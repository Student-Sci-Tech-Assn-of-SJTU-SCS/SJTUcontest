from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from uuid import UUID
from contests.models import Contest
from .models import Team, UserTeam
from .serializers import TeamCreateRequestSerializer, TeamResponseSerializer, TeamInvitationCodeSerializer
from SJTUcontest.utils import ApiResponse
from django.utils.timezone import now

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_team(request):
    """
    创建一个新的队伍，并设置当前用户为队长。
    如果未提供招募截止时间，则使用比赛报名截止时间。
    同一个用户在同一比赛中只能创建一个队伍。
    每个用户最多在3个尚未报名截止的比赛中创建队伍。
    """
    match_id = request.data.get("match_id")
    if not match_id:
        return ApiResponse.error(message="比赛 ID 不能为空", status_code=400)

    # 确认比赛存在
    try:
        contest = Contest.objects.get(id=match_id)
    except Contest.DoesNotExist:
        return ApiResponse.not_found(message="比赛不存在")

    # 检查当前用户是否已经在该比赛中是某支队伍的队长
    existing_leader_team = Team.objects.filter(
        contest=contest,
        team_users__user=request.user,
        team_users__is_leader=True
    ).first()

    if existing_leader_team:
        return ApiResponse.error(message="你已经在该比赛中创建过队伍", status_code=400)
    
    # 限制每个用户在报名未截止的比赛中最多创建3个队伍
    active_leader_teams_count = Team.objects.filter(
        team_users__user=request.user,
        team_users__is_leader=True,
        contest__registration_end__gt=now()
    ).count()
    if active_leader_teams_count >= 3:
        return ApiResponse.error(message="你最多只能在3个未截止比赛中创建队伍", status_code=400)


    # 校验请求数据
    serializer = TeamCreateRequestSerializer(data=request.data)
    if serializer.is_valid():
        team_data = serializer.validated_data

        # 没有指定招募截止时间，则默认使用比赛报名截止时间
        if not team_data.get("recruitment_deadline"):
            team_data["recruitment_deadline"] = contest.registration_end

        # 创建队伍
        team = Team.objects.create(
            contest=contest,
            existing_members=1,
            **team_data,
        )

        # 设置当前用户为队长
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

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def join_team(request, team_id):
    """
    根据邀请码加入队伍
    """
    match_id = request.data.get("match_id")
    if not match_id:
        return ApiResponse.error(message="比赛 ID 不能为空", status_code=400)
    invit_code = request.data.get("invitation_code")
    try:
        team = Team.objects.get(invitation_code=invit_code)
    except Team.DoesNotExist:
        return ApiResponse.not_found(message="队伍不存在")
    if team.id != team_id:
        return ApiResponse.error(message="邀请码错误", status_code=400)
    if team.is_invitation_code_valid == False:
        return ApiResponse.error(message="邀请码已失效", status_code=400)
    if str(team.contest.id) != match_id:
        print(team.contest.id)
        print(match_id)
        print(team.contest.id.__class__)
        print(match_id.__class__)
        print(team.contest.id == match_id)
        return ApiResponse.error(message="比赛不匹配", status_code=400)
    if team.existing_members >= team.expected_members:
        return ApiResponse.error(message="队伍人数已满", status_code=400)
    UserTeam.objects.create(user=request.user, team=team, is_leader=False)
    team.existing_members += 1
    team.save()
    return ApiResponse.success(
        data=TeamResponseSerializer(team).data,
        message="加入队伍成功",
        status_code=200
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_invitation_code(request, team_id):
    """
    获取队伍的邀请码
    """
    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return ApiResponse.not_found(message="队伍不存在")
    if team.is_invitation_code_valid == False:
        return ApiResponse.error(message="邀请码已失效", status_code=400)
    data = TeamInvitationCodeSerializer(team).data
    return ApiResponse.success(
        message="邀请码获取成功",
        data=data,
        status_code=200
    )
