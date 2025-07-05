from django.core.paginator import Paginator
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
import json

from .models import Contest
from .serializers import (
    ContestListRequestSerializer,
    ContestListRespItemSerializer,
    ContestResponseSerializer,
    ContestCreateRequestSerializer,
)
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
            return ApiResponse.error(
                message="Invalid request data", data={"errors": serializer.errors}
            )

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
            for month in options["months"]:
                queryset = queryset.filter(months__contains=[month])

        if "keywords" in options and options["keywords"]:
            # 过滤包含指定关键词的比赛
            for keyword in options["keywords"]:
                queryset = queryset.filter(keywords__contains=[keyword])

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
        else:
            page_obj = paginator.page(page_index)
            contests = page_obj.object_list

        # 使用序列化器序列化数据
        matches_serializer = ContestListRespItemSerializer(contests, many=True)

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

    except json.JSONDecodeError:
        return ApiResponse.error(message="Invalid JSON format")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def get_match_by_id(request, match_id):
    try:
        contest = Contest.objects.get(id=match_id)
    except Contest.DoesNotExist:
        return ApiResponse.not_found(message="Contest not found")

    # 使用序列化器序列化比赛数据
    serializer = ContestResponseSerializer(contest)

    return ApiResponse.success(data=serializer.data, message="Contest found")


@api_view(["POST"])
@permission_classes([IsAdminUser])
def create_match(request):
    """
    Create a new contest.
    Does NOT accept 'id' in request data — the UUID is auto-generated.
    Only accessible by admin users.
    """
    # 判断是否不小心传了 id 字段
    if "id" in request.data:
        return ApiResponse.error(
            message="You cannot provide 'id' when creating a new contest. It is generated automatically.",
            status_code=400,
        )

    serializer = ContestCreateRequestSerializer(data=request.data)
    if serializer.is_valid():
        contest_data = serializer.validated_data
        contest = Contest.objects.create(**contest_data)

        response_serializer = ContestResponseSerializer(contest)
        return ApiResponse.success(
            message="Contest created successfully",
            data=response_serializer.data,
            status_code=201,
        )

    return ApiResponse.error(
        message="Invalid data",
        data=serializer.errors,
        status_code=400,
    )
