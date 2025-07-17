from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator
from django.db.models import F
from django.utils import timezone

from .models import Team, UserTeam
from .serializers import (
    RecruitingTeamRequestSerializer,
    TeamCreateRequestSerializer,
    TeamResponseSerializer,
    TeamInvitationCodeSerializer,
    TeamUpdateRequestSerializer,
)
from SJTUcontest.utils import ApiResponse


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_teams_recruiting(request):
    """
    获取当前用户可以加入的所有正在招募的队伍。
    """
    try:
        serializer = RecruitingTeamRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return ApiResponse.error(message="Invalid data", data=serializer.errors)

        # 查询所有正在招募的队伍，按创建时间倒序排列
        teams = Team.objects.filter(
            contest__registration_end__gt=timezone.now(),
            existing_members__lt=F("expected_members"),
        ).order_by("-created_at")

        # 分页处理
        page_index = serializer.validated_data["page_index"]
        page_size = serializer.validated_data["page_size"]

        paginator = Paginator(teams, page_size)

        if page_index > paginator.num_pages:
            return ApiResponse.not_found(
                message="Too large page index",
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
            message="Teams recruiting retrieved successfully",
        )

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


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
            return ApiResponse.error(message="Invalid data", data=serializer.errors)

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
            contest__registration_end__gt=timezone.now(),
        ).count()

        if active_leader_teams_count >= 5:
            return ApiResponse.forbidden(message="你最多只能在5个未截止比赛中创建队伍")

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
        )

    except Team.DoesNotExist:
        return ApiResponse.not_found(message="队伍不存在")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
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
    if UserTeam.objects.filter(user=request.user, team=team).exists():
        return ApiResponse.error(message="已在队伍中", status_code=400)
    if team.id != team_id:
        return ApiResponse.error(message="邀请码错误", status_code=400)
    if team.is_invitation_code_valid == False:
        return ApiResponse.error(message="邀请码已失效", status_code=400)
    if str(team.contest.id) != match_id:
        return ApiResponse.error(message="比赛不匹配", status_code=400)
    if team.existing_members >= team.expected_members:
        return ApiResponse.error(message="队伍人数已满", status_code=400)
    UserTeam.objects.create(user=request.user, team=team, is_leader=False)
    team.existing_members += 1
    team.save()
    return ApiResponse.success(
        data=TeamResponseSerializer(team).data, message="加入队伍成功", status_code=200
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
    return ApiResponse.success(message="邀请码获取成功", data=data, status_code=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def quit_team_by_id(request, team_id):
    """
    退出队伍
    """
    try:
        team = Team.objects.get(id=team_id)

        member = UserTeam.objects.filter(user=request.user, team=team).first()
        if not member:
            return ApiResponse.error(message="你不在该队伍中")

        if member.is_leader:
            return ApiResponse.error(message="队长不能退出队伍")

        member.delete()
        team.existing_members -= 1
        team.save()

        return ApiResponse.success(message="退出队伍成功")

    except Team.DoesNotExist:
        return ApiResponse.not_found(message="队伍不存在")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_team_by_id(request, team_id):
    """
    更新队伍信息
    """
    try:
        team = Team.objects.get(id=team_id)

        if not UserTeam.objects.filter(
            user=request.user, team=team, is_leader=True
        ).exists():
            return ApiResponse.forbidden(message="只有队长可以更新队伍信息")

        serializer = TeamUpdateRequestSerializer(team, data=request.data, partial=True)

        if not serializer.is_valid():
            return ApiResponse.error(message="Invalid data", data=serializer.errors)

        updated_team = serializer.save()

        return ApiResponse.success(
            data=TeamResponseSerializer(updated_team).data,
            message="队伍信息更新成功",
        )

    except Team.DoesNotExist:
        return ApiResponse.not_found(message="队伍不存在")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_team_by_id(request, team_id):
    """
    删除队伍
    """
    try:
        team = Team.objects.get(id=team_id)

        if not UserTeam.objects.filter(
            user=request.user, team=team, is_leader=True
        ).exists():
            return ApiResponse.forbidden(message="只有队长可以删除队伍")

        team.delete()

        return ApiResponse.success(message="队伍删除成功", status_code=204)

    except Team.DoesNotExist:
        return ApiResponse.not_found(message="队伍不存在")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )
