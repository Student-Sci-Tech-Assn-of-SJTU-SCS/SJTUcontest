import mimetypes

from django.core.paginator import Paginator
from django.db.models import F, Q
from django.http import FileResponse
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated

from SJTUcontest.utils import ApiResponse

from .models import Resource
from .serializers import (
    ResourceCreateSerializer,
    ResourceListQuerySerializer,
    ResourceResponseSerializer,
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_resources(request):
    query_serializer = ResourceListQuerySerializer(data=request.query_params)
    if not query_serializer.is_valid():
        return ApiResponse.error(
            message="查询参数无效",
            data=query_serializer.errors,
        )

    params = query_serializer.validated_data
    queryset = Resource.objects.select_related("uploader")

    if params.get("category"):
        queryset = queryset.filter(category=params["category"])
    if params.get("query"):
        keyword = params["query"]
        queryset = queryset.filter(
            Q(title__icontains=keyword) | Q(description__icontains=keyword)
        )

    paginator = Paginator(queryset, params["page_size"])
    page = paginator.get_page(params["page_index"])
    serializer = ResourceResponseSerializer(
        page.object_list,
        many=True,
        context={"request": request},
    )
    return ApiResponse.success(
        data={
            "resources": serializer.data,
            "total_items": paginator.count,
            "total_pages": paginator.num_pages,
            "page_index": page.number,
        },
        message="资料列表获取成功",
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_resource(request, resource_id):
    try:
        resource = Resource.objects.select_related("uploader").get(id=resource_id)
    except Resource.DoesNotExist:
        return ApiResponse.not_found(message="资料不存在")

    serializer = ResourceResponseSerializer(
        resource,
        context={"request": request},
    )
    return ApiResponse.success(data=serializer.data, message="资料获取成功")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_resource(request):
    serializer = ResourceCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return ApiResponse.error(
            message="资料信息无效",
            data=serializer.errors,
        )

    resource = serializer.save(uploader=request.user)
    response = ResourceResponseSerializer(
        resource,
        context={"request": request},
    )
    return ApiResponse.success(
        data=response.data,
        message="资料分享成功",
        status_code=201,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_resource(request, resource_id):
    try:
        resource = Resource.objects.get(id=resource_id)
    except Resource.DoesNotExist:
        return ApiResponse.not_found(message="资料不存在")

    if not resource.attachment:
        return ApiResponse.not_found(message="该分享没有附件")

    try:
        file_handle = resource.attachment.open("rb")
    except FileNotFoundError:
        return ApiResponse.not_found(message="附件文件不存在，请联系管理员")

    Resource.objects.filter(id=resource.id).update(
        download_count=F("download_count") + 1
    )
    content_type = (
        mimetypes.guess_type(resource.original_filename)[0]
        or "application/octet-stream"
    )
    return FileResponse(
        file_handle,
        as_attachment=True,
        filename=resource.original_filename,
        content_type=content_type,
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_resource(request, resource_id):
    try:
        resource = Resource.objects.get(id=resource_id)
    except Resource.DoesNotExist:
        return ApiResponse.not_found(message="资料不存在")

    if resource.uploader_id != request.user.id and not request.user.is_staff:
        return ApiResponse.forbidden(message="只能删除自己上传的资料")

    resource.delete()
    return ApiResponse.success(message="资料删除成功")
