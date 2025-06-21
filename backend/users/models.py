from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # 扩展字段：用户角色
    ROLE_CHOICES = [("user", "User"), ("admin", "Admin")]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")

    # 可以添加更多的扩展字段，如头像、电话等
    avatar_url = models.URLField(null=True, blank=True)
