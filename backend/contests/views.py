import mimetypes
from pathlib import Path

from django.http import FileResponse
from rest_framework.decorators import (
    api_view,
    parser_classes,
    permission_classes,
)
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.core.paginator import Paginator
from django.db.models import Q, F
from django.utils import timezone

from .models import Contest, ContestAttachment
from .serializers import (
    ContestListRequestSerializer,
    ContestResponseSerializer,
    ContestCreateRequestSerializer,
    ContestTeamsRequestSerializer,
    ContestRegistrationTeamsRequestSerializer,
    ContestAttachmentResponseSerializer,
    ContestAttachmentUploadSerializer,
    ContestDetailResponseSerializer,
)
from teams.serializers import TeamResponseSerializer
from SJTUcontest.utils import ApiResponse


@api_view(["POST"])
@permission_classes([AllowAny])
def get_matches(request):
    """
    View to get all matches with filtering and pagination.
    Only accepts POST requests.
    """
    try:
        serializer = ContestListRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return ApiResponse.error(message="Invalid data", data=serializer.errors)

        validated_data = serializer.validated_data

        # 构建查询集
        queryset = Contest.objects.all()

        # 筛选条件过滤
        options = validated_data.get("options", {})

        if "query" in options and options["query"]:
            queryset = queryset.filter(
                Q(name__icontains=options["query"])
                | Q(place__icontains=options["query"])
            )

        if "years" in options and options["years"]:
            queryset = queryset.filter(year__in=options["years"])

        if "level" in options and options["level"]:
            queryset = queryset.filter(level__in=options["level"])

        if "quality" in options and options["quality"]:
            queryset = queryset.filter(quality__in=options["quality"])

        if "months" in options and options["months"]:
            # 过滤包含指定月份的比赛
            queryset = queryset.filter(months__overlap=options["months"])

        if "keywords" in options and options["keywords"]:
            # 过滤包含指定关键词的比赛
            queryset = queryset.filter(keywords__overlap=options["keywords"])

        # 分页处理
        page_index = validated_data["page_index"]
        page_size = validated_data["page_size"]

        queryset = queryset.order_by("-created_at")
        paginator = Paginator(queryset, page_size)

        # 检查页码是否超出范围
        if page_index > paginator.num_pages:
            return ApiResponse.not_found(
                message="Too large page index",
                data={
                    "total_pages": paginator.num_pages,
                    "page_index": page_index,
                },
            )

        page_contests = paginator.page(page_index)

        # 使用序列化器序列化数据
        matches_serializer = ContestResponseSerializer(page_contests, many=True)

        # 构建响应数据并使用响应序列化器
        response_data = {
            "total_pages": paginator.num_pages,
            "page_index": page_index,
            "match_num": len(matches_serializer.data),
            "matches": matches_serializer.data,
        }

        return ApiResponse.success(
            data=response_data, message="Contests retrieved successfully"
        )

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["POST"])
@permission_classes([IsAdminUser])
def create_match(request):
    """
    Create a new contest.
    Does NOT accept 'id' in request data — the UUID is auto-generated.
    Only accessible by admin users.
    """
    try:
        serializer = ContestCreateRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return ApiResponse.error(
                message="Invalid data",
                data=serializer.errors,
            )

        contest_data = serializer.validated_data
        contest = Contest.objects.create(**contest_data)

        response_serializer = ContestResponseSerializer(contest)
        return ApiResponse.success(
            message="Contest created successfully",
            data=response_serializer.data,
            status_code=201,
        )

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def get_match_by_id(request, match_id):
    try:
        contest = Contest.objects.get(id=match_id)

        serializer = ContestDetailResponseSerializer(contest)
        return ApiResponse.success(data=serializer.data, message="Contest found")

    except Contest.DoesNotExist:
        return ApiResponse.not_found(message="Contest not found")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["POST"])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
def upload_match_attachment(request, match_id):
    try:
        contest = Contest.objects.get(id=match_id)
    except Contest.DoesNotExist:
        return ApiResponse.not_found(message="Contest not found")

    serializer = ContestAttachmentUploadSerializer(data=request.data)
    if not serializer.is_valid():
        return ApiResponse.error(
            message="附件无效",
            data=serializer.errors,
        )

    uploaded_file = serializer.validated_data["file"]
    attachment = ContestAttachment.objects.create(
        contest=contest,
        file=uploaded_file,
        original_filename=Path(uploaded_file.name).name[:255],
        file_size=uploaded_file.size,
        content_type=uploaded_file.content_type or "application/octet-stream",
        uploaded_by=request.user,
    )
    return ApiResponse.success(
        data=ContestAttachmentResponseSerializer(attachment).data,
        message="附件上传成功",
        status_code=201,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def download_match_attachment(request, match_id, attachment_id):
    try:
        attachment = ContestAttachment.objects.get(
            id=attachment_id,
            contest_id=match_id,
        )
    except ContestAttachment.DoesNotExist:
        return ApiResponse.not_found(message="附件不存在")

    try:
        file_handle = attachment.file.open("rb")
    except FileNotFoundError:
        return ApiResponse.not_found(message="附件文件不存在，请联系管理员")

    content_type = (
        attachment.content_type
        or mimetypes.guess_type(attachment.original_filename)[0]
        or "application/octet-stream"
    )
    return FileResponse(
        file_handle,
        as_attachment=True,
        filename=attachment.original_filename,
        content_type=content_type,
    )


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def delete_match_attachment(request, match_id, attachment_id):
    try:
        attachment = ContestAttachment.objects.get(
            id=attachment_id,
            contest_id=match_id,
        )
    except ContestAttachment.DoesNotExist:
        return ApiResponse.not_found(message="附件不存在")

    attachment.delete()
    return ApiResponse.success(message="附件删除成功")


@api_view(["POST"])
@permission_classes([IsAdminUser])
def update_match_by_id(request, match_id):
    try:
        contest = Contest.objects.get(id=match_id)

        serializer = ContestCreateRequestSerializer(
            instance=contest, data=request.data, partial=True
        )
        if not serializer.is_valid():
            return ApiResponse.error(
                message="Invalid data",
                data=serializer.errors,
            )

        updated_contest = serializer.save()

        return ApiResponse.success(
            message="Contest updated successfully",
            data=ContestResponseSerializer(updated_contest).data,
        )

    except Contest.DoesNotExist:
        return ApiResponse.not_found(message="Contest not found")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def delete_match_by_id(request, match_id):
    try:
        contest = Contest.objects.get(id=match_id)
        contest.delete()
        return ApiResponse.success(
            message="Contest deleted successfully", status_code=204
        )

    except Contest.DoesNotExist:
        return ApiResponse.not_found(message="Contest not found")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_match_teams(request, match_id):
    try:
        contest = Contest.objects.get(id=match_id)

        serializer = ContestTeamsRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return ApiResponse.error(message="Invalid data", data=serializer.errors)

        # 获取比赛的所有队伍
        teams = contest.teams.filter(
            recruitment_deadline__gt=timezone.now(),
            existing_members__lt=F("expected_members"),
        ).order_by("-updated_at")

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
            data=response_data, message="Teams in this contest retrieved successfully"
        )

    except Contest.DoesNotExist:
        return ApiResponse.not_found(message="Contest not found")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["POST"])
@permission_classes([IsAdminUser])
def get_match_registration_teams(request, match_id):
    """
    管理员查看某个比赛当前正在报名/招募的队伍。
    """
    try:
        contest = Contest.objects.get(id=match_id)

        serializer = ContestRegistrationTeamsRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return ApiResponse.error(message="Invalid data", data=serializer.errors)

        all_teams = contest.teams.all()
        active_teams = all_teams.filter(
            recruitment_deadline__gt=timezone.now(),
            existing_members__lt=F("expected_members"),
        )
        active_teams_count = active_teams.count()
        official_registered_teams = all_teams.filter(
            official_registration_completed=True
        ).count()
        total_teams = all_teams.count()

        teams = all_teams
        options = serializer.validated_data.get("options") or {}
        query = options.get("query")
        official_status = options.get("official_status", "all")
        member_status = options.get("member_status", "all")
        deadline_status = options.get("deadline_status", "all")

        if query:
            teams = teams.filter(name__icontains=query)

        if official_status == "completed":
            teams = teams.filter(official_registration_completed=True)
        elif official_status == "not_completed":
            teams = teams.filter(official_registration_completed=False)

        if member_status == "full":
            teams = teams.filter(existing_members__gte=F("expected_members"))
        elif member_status == "not_full":
            teams = teams.filter(existing_members__lt=F("expected_members"))

        if deadline_status == "active":
            teams = teams.filter(recruitment_deadline__gt=timezone.now())
        elif deadline_status == "expired":
            teams = teams.filter(recruitment_deadline__lte=timezone.now())

        teams = teams.order_by("-updated_at")

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
            "contest": ContestResponseSerializer(contest).data,
            "total_pages": paginator.num_pages,
            "page_index": page_index,
            "team_num": len(teams_serializer.data),
            "active_teams": active_teams_count,
            "total_teams": total_teams,
            "official_registered_teams": official_registered_teams,
            "teams": teams_serializer.data,
        }

        return ApiResponse.success(
            data=response_data,
            message="Contest registration teams retrieved successfully",
        )

    except Contest.DoesNotExist:
        return ApiResponse.not_found(message="Contest not found")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )
