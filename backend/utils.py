import secrets
import string
from django.http import JsonResponse
from typing import Any


class ApiResponse:
    """统一API响应格式"""

    @staticmethod
    def success(
        data: Any = None, message: str = "操作成功", status_code: int = 200
    ) -> JsonResponse:
        """成功响应"""
        response_data = {"success": True, "message": message, "data": data}
        return JsonResponse(response_data, status=status_code)

    @staticmethod
    def error(
        message: str = "操作失败", data: Any = None, status_code: int = 400
    ) -> JsonResponse:
        """错误响应"""
        response_data = {"success": False, "message": message, "data": data}
        return JsonResponse(response_data, status=status_code)

    @staticmethod
    def not_found(message: str = "资源未找到", data: Any = None) -> JsonResponse:
        """404响应"""
        return ApiResponse.error(message, data, 404)

    @staticmethod
    def forbidden(message: str = "权限不足", data: Any = None) -> JsonResponse:
        """403响应"""
        return ApiResponse.error(message, data, 403)

    @staticmethod
    def unauthorized(message: str = "未授权", data: Any = None) -> JsonResponse:
        """401响应"""
        return ApiResponse.error(message, data, 401)


def generate_random_string(length: int = 32) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return "".join(secrets.choice(alphabet) for _ in range(length))
