from django.contrib import admin

from .models import ContestAttachment


@admin.register(ContestAttachment)
class ContestAttachmentAdmin(admin.ModelAdmin):
    list_display = (
        "original_filename",
        "contest",
        "file_size",
        "uploaded_by",
        "created_at",
    )
    search_fields = ("original_filename", "contest__name")
    readonly_fields = (
        "original_filename",
        "file_size",
        "content_type",
        "uploaded_by",
        "created_at",
    )
