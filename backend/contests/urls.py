# contests/urls.py
from django.urls import path

from .views import (
    get_match_teams,
    get_matches,
    create_match,
    get_match_by_id,
    update_match_by_id,
    delete_match_by_id,
)

urlpatterns = [
    path("", get_matches, name="get_all_matches"),
    path("create/", create_match, name="create_match"),
    path("<uuid:match_id>/", get_match_by_id, name="get_match_by_id"),
    path("<uuid:match_id>/update/", update_match_by_id, name="update_match"),
    path("<uuid:match_id>/delete/", delete_match_by_id, name="delete_match"),
    path("<uuid:match_id>/teams/", get_match_teams, name="get_match_teams"),
]
