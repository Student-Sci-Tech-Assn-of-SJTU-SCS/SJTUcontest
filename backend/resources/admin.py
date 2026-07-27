from django.contrib import admin

from .models import Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "uploader",
        "file_size",
        "download_count",
        "created_at",
    )
    list_filter = ("category", "created_at")
    search_fields = ("title", "description", "uploader__username")
    readonly_fields = (
        "original_filename",
        "file_size",
        "download_count",
        "created_at",
        "updated_at",
    )
