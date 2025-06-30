from rest_framework import serializers

from .models import Contest
from .choices import ContestLevel, ContestQuality, ContestKeywords


class ContestOptionsSerializer(serializers.Serializer):
    """比赛筛选选项的嵌套序列化器"""

    query = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        help_text="搜索关键词，支持比赛名称或地点",
    )
    years = serializers.ListField(
        child=serializers.IntegerField(min_value=2000, max_value=2200),
        required=False,
        allow_empty=True,
    )
    level = serializers.ListField(
        child=serializers.ChoiceField(choices=ContestLevel.choices),
        required=False,
        allow_empty=True,
    )
    quality = serializers.ListField(
        child=serializers.ChoiceField(choices=ContestQuality.choices),
        required=False,
        allow_empty=True,
    )
    months = serializers.ListField(
        child=serializers.IntegerField(min_value=1, max_value=12),
        required=False,
        allow_empty=True,
    )
    keywords = serializers.ListField(
        child=serializers.ChoiceField(choices=ContestKeywords.choices),
        required=False,
        allow_empty=True,
    )


class ContestListRequestSerializer(serializers.Serializer):
    """获取比赛列表的请求体数据模型"""

    # 分页
    page_index = serializers.IntegerField(min_value=1, required=True)
    page_size = serializers.IntegerField(min_value=1, max_value=100, required=True)

    # 筛选条件（可选）
    options = ContestOptionsSerializer(required=False)


class ContestUpdateRequestSerializer(serializers.ModelSerializer):
    """更新比赛的请求体数据模型"""

    class Meta:
        model = Contest
        fields = [
            "name",
            "description",
            "logo",
            "place",
            "level",
            "quality",
            "months",
            "keywords",
            "website",
            "materials",
        ]
        extra_kwargs = {
            "name": {"required": False},
            "place": {"required": False},
            "level": {"required": False},
            "quality": {"required": False},
        }

    level = serializers.ChoiceField(choices=ContestLevel.choices, required=False)
    quality = serializers.ChoiceField(choices=ContestQuality.choices, required=False)
    keywords = serializers.ListField(
        child=serializers.ChoiceField(choices=ContestKeywords.choices),
        required=False,
        allow_empty=True,
    )


class ContestListRespItemSerializer(serializers.ModelSerializer):
    """比赛列表项序列化器"""

    class Meta:
        model = Contest
        fields = ["id", "name", "logo", "keywords"]


class ContestResponseSerializer(serializers.ModelSerializer):
    """比赛响应数据模型"""

    class Meta:
        model = Contest
        fields = "__all__"


class ContestCreateRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contest
        exclude = ["id"]  # 排除id字段，自动生成
