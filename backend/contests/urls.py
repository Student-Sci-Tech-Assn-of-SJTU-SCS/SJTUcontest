# contests/urls.py
from django.urls import path

from .views import (
    get_matches,
    get_match_by_id,
    create_match,
)

urlpatterns = [
    path("", get_matches, name="get_all_matches"),
    path("<uuid:match_id>/", get_match_by_id, name="get_match_by_id"),
    path("create/", create_match, name="create_match"),
]
