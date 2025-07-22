from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator
from django.db.models import F
from django.utils import timezone
from datetime import timedelta


from .models import Team, UserTeam
from .serializers import (
    RecruitingTeamRequestSerializer,
    TeamCreateRequestSerializer,
    TeamResponseSerializer,
    TeamInvitationCodeSerializer,
    JoinTeamRequestSerializer,
    TeamUpdateRequestSerializer,
)
from SJTUcontest.utils import ApiResponse, generate_random_string


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
            recruitment_deadline__gt=timezone.now(),
            existing_members__lt=F("expected_members"),
        ).order_by("-updated_at")

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
def join_team_by_id(request, team_id):
    """
    根据邀请码加入队伍
    """
    try:
        serializer = JoinTeamRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return ApiResponse.error(message="Invalid data", data=serializer.errors)

        invitation_code = serializer.validated_data["invitation_code"]

        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return ApiResponse.forbidden("非法的邀请码")

        # 邀请码合法：is_valid and 未过期
        if (
            team.invitation_code != invitation_code
            or not team.is_invitation_code_valid
            or (timezone.now() - team.invitation_code_created_at) >= timedelta(days=1)
        ):
            return ApiResponse.forbidden("非法的邀请码")

        # 检查用户是否已经在队伍中
        if UserTeam.objects.filter(user=request.user, team=team).exists():
            return ApiResponse.forbidden("你已经在队伍中")
        if team.existing_members >= team.expected_members:
            return ApiResponse.error(
                message="队伍人数已满，请联系队长扩容", status_code=400
            )

        UserTeam.objects.create(user=request.user, team=team, is_leader=False)
        team.existing_members += 1
        team.save()

        return ApiResponse.success(
            data=TeamResponseSerializer(team).data,
            message="加入队伍成功",
            status_code=200,
        )

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_invitation_code_by_id(request, team_id):
    """
    获取队伍的邀请码
    """
    try:
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return ApiResponse.not_found(message="队伍不存在")

        if not UserTeam.objects.filter(
            user=request.user, team=team, is_leader=True
        ).exists():
            return ApiResponse.forbidden(message="只有队长可以获取邀请码")

        # 邀请码合法条件：is_valid and 超过创建时间一天
        is_valid = team.is_invitation_code_valid
        is_not_expired = (timezone.now() - team.invitation_code_created_at) < timedelta(
            days=1
        )

        if is_valid and is_not_expired:
            data = TeamInvitationCodeSerializer(team).data
            return ApiResponse.success(
                message="邀请码获取成功", data=data, status_code=200
            )
        else:
            # 重置邀请码
            team.invitation_code = generate_random_string()
            team.is_invitation_code_valid = True
            team.invitation_code_created_at = timezone.now()
            team.save()

            data = TeamInvitationCodeSerializer(team).data
            return ApiResponse.success(
                message="邀请码已重置", data=data, status_code=200
            )

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


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
