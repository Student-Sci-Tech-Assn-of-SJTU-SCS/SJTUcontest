from django.urls import path

from .views import get_news, create_news

urlpatterns = [
    path("get/", get_news, name="get_news"),
    path("create/", create_news, name="create_news"),
]
