from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import render

# Create your views here.

@require_http_methods(["POST"])
def get_all_matches(request):
    """
    View to get all matches.
    Only accepts POST requests.
    """
    return HttpResponse("hello, here are all matches")
