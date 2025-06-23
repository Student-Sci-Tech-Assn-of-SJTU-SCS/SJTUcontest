# 对应 2024 电院素拓条例中的比赛等级

from django.db import models


class ContestLevel(models.TextChoices):
    LOCAL = "local", "local"  # 校院级
    REGIONAL = "regional", "regional"  # 省市级
    NATIONAL = "national", "national"  # 国家级
    INTERNATIONAL = "international", "international"  # 世界级


class ContestQuality(models.TextChoices):
    TOP = "top", "top"  # 专项赛事
    A_LEVEL = "A_level", "A_level"  # A类项目
    B_LEVEL = "B_level", "B_level"  # B类项目
    C_LEVEL = "C_level", "C_level"  # C类项目
    D_LEVEL = "D_level", "D_level"  # D类项目


class ContestKeywords(models.TextChoices):
    AI = "AI", "AI"  # 人工智能
    CS = "CS", "CS"  # 计算机科学
    IS = "IS", "IS"  # 信息安全
    EE = "EE", "EE"  # 电子
    MATH = "math", "math"  # 数学
    INNOVATION = "innovation", "innovation"  # 创新创业
    OTHERS = "others", "others"  # 其他
