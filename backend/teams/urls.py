# team/urls.py
from django.urls import path

from .views import (
    create_team,
    get_team_by_id,
    get_invitation_code_by_id,
    get_teams_recruiting,
    join_team_by_id,
    quit_team_by_id,
    update_team_by_id,
    delete_team_by_id,
    search_teams_by_name,
)

urlpatterns = [
    path("", get_teams_recruiting, name="get_teams_recruiting"),
    path("create/", create_team, name="create_team"),
    path("search/", search_teams_by_name, name="search_teams_by_name"),
    path("<uuid:team_id>/", get_team_by_id, name="get_team_by_id"),
    path("<uuid:team_id>/join/", join_team_by_id, name="join_team_by_id"),
    path(
        "<uuid:team_id>/invitation/",
        get_invitation_code_by_id,
        name="get_invitation_code_by_id",
    ),
    path("<uuid:team_id>/quit/", quit_team_by_id, name="quit_team_by_id"),
    path("<uuid:team_id>/update/", update_team_by_id, name="update_team_by_id"),
    path("<uuid:team_id>/delete/", delete_team_by_id, name="delete_team_by_id"),
]
