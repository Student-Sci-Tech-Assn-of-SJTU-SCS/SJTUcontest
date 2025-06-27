from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class UserRole(models.TextChoices):
    USER = "user", "user"
    ADMIN = "admin", "admin"


class User(AbstractUser):
    # 使用UUID作为主键
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # 用户角色
    role = models.CharField(max_length=10, choices=UserRole.choices, default="user")

    # 昵称
    nick_name = models.CharField(max_length=30, verbose_name="昵称")

    # 参赛经历
    experience = models.TextField(blank=True, null=True, verbose_name="参赛经历")

    # 特长
    advantage = models.TextField(blank=True, null=True, verbose_name="特长")
