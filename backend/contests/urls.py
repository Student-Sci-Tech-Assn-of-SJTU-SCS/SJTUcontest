# contests/urls.py
from django.urls import path
from .views import get_all_matches

urlpatterns = [
    path('', get_all_matches, name='get_all_matches'),
]