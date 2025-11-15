from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from .models import News
from .serializers import NewsRequestSerializer, NewsResponseSerializer
from SJTUcontest.utils import ApiResponse
from contests.models import Contest


@api_view(["GET"])
@permission_classes([AllowAny])
def get_news(request):
    try:
        news = News.objects.all()
        serializer = NewsResponseSerializer(news, many=True)
        return ApiResponse.success(
            data=serializer.data, message="News retrieved successfully"
        )

    except News.DoesNotExist:
        return ApiResponse.not_found(message="News not found")

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["POST"])
@permission_classes([IsAdminUser])
def create_news(request):
    try:
        # 检查比赛是否存在
        contest_id = request.data.get("contest")
        if not contest_id:
            return ApiResponse.error(message="Contest ID is required")

        try:
            contest = Contest.objects.get(id=contest_id)
        except Contest.DoesNotExist:
            return ApiResponse.not_found(message="Contest not found")

        # 检查是否已经存在
        if News.objects.filter(contest=contest).exists():
            return ApiResponse.error(message="This contest is already in news")

        serializer = NewsRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return ApiResponse.error(
                message="Invalid data",
                data=serializer.errors,
            )

        news_data = serializer.validated_data
        news = News.objects.create(**news_data)
        return ApiResponse.success(
            message="News created successfully",
            data=NewsResponseSerializer(news).data,
            status_code=201,
        )

    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def delete_news(request, news_id):
    try:
        news = News.objects.get(id=news_id)
        news.delete()
        return ApiResponse.success(message="News deleted successfully")
    except News.DoesNotExist:
        return ApiResponse.not_found(message="News not found")
    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )


@api_view(["GET"])
@permission_classes([IsAdminUser])
def get_all_contests_for_news(request):
    """获取所有比赛列表，用于管理员选择添加到新闻"""
    try:
        # 获取所有比赛
        contests = Contest.objects.all().order_by("-created_at")
        # 获取已经在新闻中的比赛ID
        news_contest_ids = News.objects.values_list("contest_id", flat=True)

        contests_data = []
        for contest in contests:
            contest_data = {
                "id": str(contest.id),
                "name": contest.name,
                "year": contest.year,
                "level": contest.level,
                "quality": contest.quality,
                "in_news": str(contest.id) in [str(id) for id in news_contest_ids],
            }
            contests_data.append(contest_data)

        return ApiResponse.success(
            data=contests_data, message="Contests retrieved successfully"
        )
    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}", status_code=500
        )
