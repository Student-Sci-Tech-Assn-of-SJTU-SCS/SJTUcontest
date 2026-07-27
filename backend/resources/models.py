import uuid
from pathlib import Path

from django.conf import settings
from django.db import models
from django.utils.text import get_valid_filename


def resource_upload_path(instance, filename):
    safe_name = get_valid_filename(Path(filename).name)
    return f"resources/{instance.id}/{safe_name}"


class Resource(models.Model):
    class Category(models.TextChoices):
        CONTEST_MATERIAL = "contest_material", "相关竞赛资料"
        PAST_EXPERIENCE = "past_experience", "往届经验分享"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.CharField(max_length=32, choices=Category.choices)
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    attachment = models.FileField(
        upload_to=resource_upload_path,
        blank=True,
        max_length=500,
    )
    original_filename = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveBigIntegerField(default=0)
    uploader = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="shared_resources",
    )
    download_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resources_resource"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["category", "-created_at"]),
        ]
        verbose_name = "共享资料"
        verbose_name_plural = "共享资料"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Keep metadata correct for both API uploads and Django Admin uploads.
        if self.attachment:
            if not self.original_filename:
                self.original_filename = Path(self.attachment.name).name[:255]
            if not self.file_size:
                self.file_size = self.attachment.size
        else:
            self.original_filename = ""
            self.file_size = 0
        super().save(*args, **kwargs)
