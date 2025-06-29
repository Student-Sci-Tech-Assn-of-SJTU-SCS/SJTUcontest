# users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

from .views import (
    get_user_profile_by_id,
    JAccountLoginView,
    JAccountCallbackView,
    JAccountLogoutView,
)

urlpatterns = [
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", TokenBlacklistView.as_view(), name="logout"),
    path("<uuid:user_id>/", get_user_profile_by_id, name="get_user_profile_by_id"),
    path("jaccount/login/", JAccountLoginView.as_view(), name="jaccount_login"),
    path(
        "jaccount/callback/", JAccountCallbackView.as_view(), name="jaccount_callback"
    ),
    path("jaccount/logout/", JAccountLogoutView.as_view(), name="jaccount_logout"),
]
