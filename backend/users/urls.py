# users/urls.py
from django.urls import path
from .views import (
    UserRegisterView,
    UserLoginView,
    logout_view,
    user_profile_view,
    CustomTokenRefreshView,
)
from rest_framework_simplejwt.views import TokenVerifyView

urlpatterns = [
    # 用户认证相关
    path("register/", UserRegisterView.as_view(), name="user_register"),
    path("login/", UserLoginView.as_view(), name="user_login"),
    path("logout/", logout_view, name="user_logout"),
    path("profile/", user_profile_view, name="user_profile"),
    # JWT Token 管理
    path("token/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
]
