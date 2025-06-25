from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import render
from .models import Contest
from django.http import JsonResponse

@require_http_methods(["POST"])
def get_all_matches(request):
    """
    View to get all matches.
    Only accepts POST requests.
    """
    return HttpResponse("hello, here are all matches")

@require_http_methods(["GET"])
def get_match_by_id(request, match_id):
    try:
        contest = Contest.objects.get(id=match_id)
    except Contest.DoesNotExist:
        return JsonResponse({
            "success": False,
            "message": "Contest not found",
            "data": None
        }, status=404)
    
    data = {
        "id": contest.id,
        "name": contest.name,
        "description": contest.description or "",
        "logo": contest.logo or "",
        "place": contest.place or "",
        "level": contest.level or "",
        "quality": contest.quality or "",
        "months": contest.months or [],
        "keywords": contest.keywords or [],
        "website": contest.website or "",
        "materials": contest.materials or [],
    }
    
    return JsonResponse({
        "success": True,
        "message": "Contest found",
        "data": data,
    })
