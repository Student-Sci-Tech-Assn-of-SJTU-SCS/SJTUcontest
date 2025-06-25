from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MinValueValidator, MaxValueValidator
from .choices import ContestLevel, ContestQuality, ContestKeywords


# Create your models here.
class Contest(models.Model):
    # 自增主键 唯一
    id = models.AutoField(primary_key=True)
    # 比赛名称 唯一 多赛道以括号等方式标识
    name = models.CharField(max_length=100, unique=True)
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

    # 队伍表中有外键关联到比赛表，可以反向查询

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["id"]
        verbose_name = "Contest"
        verbose_name_plural = "Contests"
