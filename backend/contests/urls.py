# contests/urls.py
from django.urls import path
from contests import views 
urlpatterns = [
    path("<int:matches_id>/", views.detail_view, name="get_match_by_id"),
]
