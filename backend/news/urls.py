from django.urls import path

from .views import get_news, create_news, delete_news, get_all_contests_for_news

urlpatterns = [
    path("all/", get_news, name="get_news"),
    path("create/", create_news, name="create_news"),
    path("delete/<int:news_id>/", delete_news, name="delete_news"),
    path("contests/", get_all_contests_for_news, name="get_all_contests_for_news"),
]
