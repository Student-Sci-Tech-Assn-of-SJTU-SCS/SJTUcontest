from rest_framework import serializers

from pathlib import Path

from django.conf import settings

from .models import Contest, ContestAttachment
from .choices import ContestLevel, ContestQuality, ContestKeywords


class ContestOptionsSerializer(serializers.Serializer):
    query = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        help_text="Search keyword, supports contest name or place.",
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
    page_index = serializers.IntegerField(min_value=1, required=True)
    page_size = serializers.IntegerField(min_value=1, max_value=100, required=True)
    options = ContestOptionsSerializer(required=False)


class ContestResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contest
        exclude = ["created_at", "updated_at"]


class ContestAttachmentResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContestAttachment
        fields = [
            "id",
            "original_filename",
            "file_size",
            "content_type",
            "created_at",
        ]


class ContestDetailResponseSerializer(ContestResponseSerializer):
    attachments = ContestAttachmentResponseSerializer(many=True, read_only=True)

    class Meta(ContestResponseSerializer.Meta):
        pass


ALLOWED_ATTACHMENT_EXTENSIONS = {
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


class ContestAttachmentUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)

    def validate_file(self, value):
        extension = Path(value.name).suffix.lower()
        if extension not in ALLOWED_ATTACHMENT_EXTENSIONS:
            allowed = "、".join(sorted(ALLOWED_ATTACHMENT_EXTENSIONS))
            raise serializers.ValidationError(f"不支持该文件类型。允许：{allowed}")

        max_size = settings.CONTEST_ATTACHMENT_MAX_SIZE
        if value.size > max_size:
            max_megabytes = max_size // (1024 * 1024)
            raise serializers.ValidationError(f"文件大小不能超过 {max_megabytes} MB")
        return value


class ContestCreateRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contest
        exclude = ["id", "created_at", "updated_at"]


class ContestTeamsRequestSerializer(serializers.Serializer):
    page_index = serializers.IntegerField(min_value=1, required=True)
    page_size = serializers.IntegerField(min_value=1, max_value=100, required=True)


class ContestRegistrationTeamsOptionsSerializer(serializers.Serializer):
    query = serializers.CharField(max_length=100, required=False, allow_blank=True)
    official_status = serializers.ChoiceField(
        choices=["all", "completed", "not_completed"],
        required=False,
        default="all",
    )
    member_status = serializers.ChoiceField(
        choices=["all", "full", "not_full"],
        required=False,
        default="all",
    )
    deadline_status = serializers.ChoiceField(
        choices=["all", "active", "expired"],
        required=False,
        default="all",
    )


class ContestRegistrationTeamsRequestSerializer(serializers.Serializer):
    page_index = serializers.IntegerField(min_value=1, required=True)
    page_size = serializers.IntegerField(min_value=1, max_value=100, required=True)
    options = ContestRegistrationTeamsOptionsSerializer(required=False)
