# team/urls.py
from django.urls import path

from .views import (
    create_team,
    get_team_by_id,
    get_invitation_code,
    join_team,
)

urlpatterns = [
    path("create/", create_team, name="create_team"),
    path("<uuid:team_id>/", get_team_by_id, name="get_team_by_id"),
    path("<uuid:team_id>/join/", join_team, name="join_team"),
    path("<uuid:team_id>/invitation/", get_invitation_code, name="get_invitation_code"),
]
