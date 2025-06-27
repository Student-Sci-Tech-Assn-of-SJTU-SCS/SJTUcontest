from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
import json


@ensure_csrf_cookie
@require_http_methods(["GET"])
def get_csrf_token(request):
    """
    获取CSRF令牌的视图
    前端可以通过GET请求获取CSRF令牌
    """
    token = get_token(request)
    return JsonResponse(
        {"csrfToken": token, "message": "CSRF token generated successfully"}
    )


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CSRFTokenView(View):
    """
    基于类的CSRF令牌视图
    """

    def get(self, request):
        token = get_token(request)
        return JsonResponse(
            {"csrfToken": token, "message": "CSRF token generated successfully"}
        )


def csrf_failure_view(request, reason=""):
    """
    CSRF验证失败时的自定义响应
    """
    return JsonResponse(
        {
            "error": "CSRF verification failed",
            "reason": reason,
            "message": "Please refresh the page and try again",
        },
        status=403,
    )
