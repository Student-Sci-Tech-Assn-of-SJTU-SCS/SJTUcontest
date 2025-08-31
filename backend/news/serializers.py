from rest_framework import serializers
from .models import News


class NewsRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = ["title", "summary", "url"]


class NewsResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = ["id", "title", "summary", "url", "created_at", "updated_at"]
