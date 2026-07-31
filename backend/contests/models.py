from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import datetime
from pathlib import Path
import uuid
from django.conf import settings
from django.utils.text import get_valid_filename

from .choices import ContestLevel, ContestQuality, ContestKeywords


def contest_attachment_upload_path(instance, filename):
    safe_name = get_valid_filename(Path(filename).name)
    return f"contest_attachments/{instance.contest_id}/{instance.id}/{safe_name}"


# Create your models here.
class Contest(models.Model):
    # UUID主键
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # 比赛名称 唯一 多赛道以括号等方式标识
    name = models.CharField(max_length=100, unique=True)
    # 举办年份
    year = models.IntegerField(
        validators=[
            MinValueValidator(2000),
            MaxValueValidator(2200),
        ],
        default=datetime.now().year,  # 默认为当前年份
        help_text="比赛举办年份",
    )
    # 比赛描述
    description = models.TextField(blank=True, null=True)
    # logo base64编码
    logo = models.TextField(blank=True, null=True)
    # 比赛地点 可填入“不固定”
    place = models.CharField(max_length=100)
    # 赛事级别
    level = models.CharField(max_length=50, choices=ContestLevel.choices)
    # 素拓类别
    quality = models.CharField(max_length=50, choices=ContestQuality.choices)
    # 比赛时间 一个数组，可填入1-12，表示每年大概在哪几个月份举办
    months = ArrayField(
        models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)]),
        size=12,  # 最多12个元素
        default=list,
    )
    # 关键词
    keywords = ArrayField(
        models.CharField(max_length=50, choices=ContestKeywords.choices), default=list
    )
    # 赛事官网链接
    website = models.URLField(max_length=200, blank=True, null=True)
    # 参考学习资料 可为空，为对象的列表，每个对象包含名称和链接
    materials = models.JSONField(
        default=list,
        blank=True,
        help_text="学习资料列表，格式：[{'name': '资料名称', 'url': '链接'}]",
    )
    # 报名开始时间
    registration_start = models.DateTimeField(default=datetime(1234, 5, 6, 7, 8, 9))
    # 报名结束时间
    registration_end = models.DateTimeField(default=datetime(1234, 5, 6, 7, 8, 9))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 队伍表中有外键关联到比赛表，可以反向查询

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Contest"
        verbose_name_plural = "Contests"


class ContestAttachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contest = models.ForeignKey(
        Contest,
        on_delete=models.CASCADE,
        related_name="attachments",
    )
    file = models.FileField(upload_to=contest_attachment_upload_path, max_length=500)
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveBigIntegerField()
    content_type = models.CharField(
        max_length=150,
        default="application/octet-stream",
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_contest_attachments",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "contests_attachment"
        ordering = ["created_at"]
        verbose_name = "比赛附件"
        verbose_name_plural = "比赛附件"

    def __str__(self):
        return f"{self.contest.name} - {self.original_filename}"
