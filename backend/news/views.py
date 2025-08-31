from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from .models import News
from .serializers import NewsRequestSerializer, NewsResponseSerializer
from SJTUcontest.utils import ApiResponse


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
