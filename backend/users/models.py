from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


def generate_default_nickname():
    """生成默认昵称：User + 随机UUID后8位"""
    return f"User{uuid.uuid4().hex[-8:]}"


class User(AbstractUser):
    # 使用UUID作为主键
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # 昵称
    nick_name = models.CharField(
        max_length=30,
        verbose_name="昵称",
        default=generate_default_nickname,
        blank=False,  # 不允许为空
    )

    # 参赛经历
    experience = models.TextField(blank=True, null=True, verbose_name="参赛经历")

    # 特长
    advantage = models.TextField(blank=True, null=True, verbose_name="特长")

    class Meta:
        db_table = "users_user"
        verbose_name = "User"
        verbose_name_plural = "Users"
