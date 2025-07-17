from django.core.paginator import Paginator
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny


from .models import Contest
from .serializers import (
    ContestListRequestSerializer,
    ContestResponseSerializer,
    ContestCreateRequestSerializer,
    ContestTeamsRequestSerializer,
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

        serializer = ContestResponseSerializer(contest)
        return ApiResponse.success(data=serializer.data, message="Contest found")

    except Contest.DoesNotExist:
        return ApiResponse.not_found(message="Contest not found")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


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
        teams = contest.teams.all()

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
