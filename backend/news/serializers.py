from rest_framework import serializers
from .models import News
from contests.serializers import ContestResponseSerializer


class NewsRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = ["contest"]


class NewsResponseSerializer(serializers.ModelSerializer):
    contest = ContestResponseSerializer(read_only=True)

    class Meta:
        model = News
        fields = ["id", "contest"]
