from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.db.models import Q
import json

from .models import Contest
from .serializers import ContestListRequestSerializer, ContestListRespItemSerializer, ContestResponseSerializer
from utils import ApiResponse

@require_http_methods(["POST"])
def get_matches(request):
    """
    View to get all matches with filtering and pagination.
    Only accepts POST requests.
    """
    try:
        # 解析请求体
        request_data = json.loads(request.body)
        
        # 验证请求数据
        serializer = ContestListRequestSerializer(data=request_data)
        if not serializer.is_valid():
            return ApiResponse.error(
                message="Invalid request data",
                data={"errors": serializer.errors}
            )
        
        validated_data = serializer.validated_data
        
        # 获取查询参数
        query = request.GET.get('query', '').strip()
        
        # 构建查询集
        queryset = Contest.objects.all()
        
        # 搜索过滤（基于查询参数）
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) | 
                Q(place__icontains=query)
            )
        
        # 筛选条件过滤
        options = validated_data.get('options', {})
        
        if 'level' in options and options['level']:
            queryset = queryset.filter(level__in=options['level'])
            
        if 'quality' in options and options['quality']:
            queryset = queryset.filter(quality__in=options['quality'])
            
        if 'months' in options and options['months']:
            # 过滤包含指定月份的比赛
            for month in options['months']:
                queryset = queryset.filter(months__contains=[month])
                
        if 'keywords' in options and options['keywords']:
            # 过滤包含指定关键词的比赛
            for keyword in options['keywords']:
                queryset = queryset.filter(keywords__contains=[keyword])
        
        # 分页处理
        page_index = validated_data['page_index']
        page_size = validated_data['page_size']
        
        paginator = Paginator(queryset, page_size)
        total = paginator.count
        
        # 页码现在从1开始，直接使用
        if page_index > paginator.num_pages:
            contests = Contest.objects.none()
        else:
            page_obj = paginator.page(page_index)
            contests = page_obj.object_list
        
        # 使用序列化器序列化数据
        matches_serializer = ContestListRespItemSerializer(contests, many=True)
        
        # 构建响应数据并使用响应序列化器
        response_data = {
            "total_pages": paginator.num_pages,
            "page_index": page_index,
            "match_num": total,
            "matches": matches_serializer.data
        }
        
        return ApiResponse.success(
            data=response_data,
            message="Contests retrieved successfully"
        )
        
    except json.JSONDecodeError:
        return ApiResponse.error(message="Invalid JSON format")
        
    except Exception as e:
        return ApiResponse.error(
            message=f"Internal server error: {str(e)}",
            status_code=500
        )

@require_http_methods(["GET"])
def get_match_by_id(request, match_id):
    try:
        contest = Contest.objects.get(id=match_id)
    except Contest.DoesNotExist:
        return ApiResponse.not_found(message="Contest not found")
    
    # 使用序列化器序列化比赛数据
    serializer = ContestResponseSerializer(contest)
    
    return ApiResponse.success(
        data=serializer.data,
        message="Contest found"
    )
