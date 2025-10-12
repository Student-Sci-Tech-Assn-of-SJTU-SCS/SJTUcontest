# users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    register,
    get_user_profile_by_id,
    update_user_profile,
    get_jaccount_auth_url,
    login_by_jaccount,
    logout,
    get_user_teams,
    forbid_user_by_id,
    get_user_total_info_by_id,
    get_user_list,
)

urlpatterns = [
    path("register/", register, name="register"),  # just for test
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", logout, name="logout"),
    path("<uuid:user_id>/", get_user_profile_by_id, name="get_user_profile_by_id"),
    path("profile/update/", update_user_profile, name="update_user_profile"),
    path("jaccount/auth/url/", get_jaccount_auth_url, name="get_jaccount_auth_url"),
    path("jaccount/login/", login_by_jaccount, name="login_by_jaccount"),
    path("my/teams/", get_user_teams, name="get_user_teams"),
    path("<uuid:user_id>/forbid/", forbid_user_by_id, name="forbid_user_by_id"),
    path(
        "<uuid:user_id>/info/",
        get_user_total_info_by_id,
        name="get_user_total_info_by_id",
    ),
    path("list/", get_user_list, name="get_user_list"),
]
