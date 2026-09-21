from django.contrib import admin

from .models import Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "contest",
        "other_contest_name",
        "uploader",
        "file_size",
        "download_count",
        "created_at",
    )
    list_filter = ("category", "contest", "created_at")
    search_fields = (
        "title",
        "description",
        "contest__name",
        "other_contest_name",
        "uploader__username",
    )
    readonly_fields = (
        "original_filename",
        "file_size",
        "download_count",
        "created_at",
        "updated_at",
    )
