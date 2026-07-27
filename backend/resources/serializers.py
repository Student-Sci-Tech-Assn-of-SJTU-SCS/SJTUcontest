from pathlib import Path

from django.conf import settings
from rest_framework import serializers

from .models import Resource


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".xls",
    ".xlsx",
    ".txt",
    ".md",
    ".csv",
    ".png",
    ".jpg",
    ".jpeg",
    ".zip",
    ".rar",
    ".7z",
}


class ResourceListQuerySerializer(serializers.Serializer):
    category = serializers.ChoiceField(
        choices=Resource.Category.choices,
        required=False,
    )
    query = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )
    page_index = serializers.IntegerField(min_value=1, default=1)
    page_size = serializers.IntegerField(min_value=1, max_value=50, default=12)


class ResourceResponseSerializer(serializers.ModelSerializer):
    category_label = serializers.CharField(
        source="get_category_display",
        read_only=True,
    )
    uploader = serializers.SerializerMethodField()
    has_attachment = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = [
            "id",
            "category",
            "category_label",
            "title",
            "description",
            "original_filename",
            "file_size",
            "has_attachment",
            "uploader",
            "download_count",
            "can_delete",
            "created_at",
            "updated_at",
        ]

    def get_uploader(self, obj):
        return {
            "id": str(obj.uploader_id),
            "nick_name": obj.uploader.nick_name,
        }

    def get_has_attachment(self, obj):
        return bool(obj.attachment)

    def get_can_delete(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return request.user.is_staff or obj.uploader_id == request.user.id


class ResourceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ["category", "title", "description", "attachment"]

    def validate_attachment(self, attachment):
        if not attachment:
            return attachment

        extension = Path(attachment.name).suffix.lower()
        if extension not in ALLOWED_EXTENSIONS:
            allowed = "、".join(sorted(ALLOWED_EXTENSIONS))
            raise serializers.ValidationError(f"不支持该文件类型。允许：{allowed}")

        max_size = settings.RESOURCE_MAX_UPLOAD_SIZE
        if attachment.size > max_size:
            max_megabytes = max_size // (1024 * 1024)
            raise serializers.ValidationError(f"文件大小不能超过 {max_megabytes} MB")

        return attachment

    def validate(self, attrs):
        category = attrs.get("category")
        attachment = attrs.get("attachment")
        description = attrs.get("description", "").strip()

        if category == Resource.Category.CONTEST_MATERIAL and not attachment:
            raise serializers.ValidationError(
                {"attachment": "相关竞赛资料必须包含附件"}
            )
        if category == Resource.Category.PAST_EXPERIENCE and not (
            description or attachment
        ):
            raise serializers.ValidationError(
                {"description": "往届经验分享至少需要填写经验内容或上传附件"}
            )
        return attrs

    def create(self, validated_data):
        attachment = validated_data.get("attachment")
        if attachment:
            validated_data["original_filename"] = Path(attachment.name).name[:255]
            validated_data["file_size"] = attachment.size
        return super().create(validated_data)
