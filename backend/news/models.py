from django.utils import timezone
from django.db import models
import uuid


class News(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100, help_text="新闻标题")
    summary = models.TextField(help_text="新闻摘要")
    url = models.URLField(max_length=200, help_text="新闻链接")
    created_at = models.DateTimeField(auto_now_add=True, help_text="新闻创建时间")
    updated_at = models.DateTimeField(auto_now=True, help_text="新闻更新时间")

    class Meta:
        verbose_name = "News"
        verbose_name_plural = "News"
