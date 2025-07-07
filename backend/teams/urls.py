# team/urls.py
from django.urls import path

from .views import (
    create_team,
    get_team_by_id,
)

urlpatterns = [
    path("create/", create_team, name="create_team"),
    path("<uuid:team_id>/", get_team_by_id, name="get_team_by_id"),
]
