"""
jAccount OAuth2.0 认证相关工具函数
"""

import requests
import jwt
import secrets
import string
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
import urllib.parse

from utils import generate_random_string

User = get_user_model()

def get_jaccount_authorize_url(state=None):
    """
    生成jAccount授权URL
    """
    params = {
        "response_type": "code",
        "scope": "openid",
        "client_id": settings.JACCOUNT_CLIENT_ID,
        "redirect_uri": settings.JACCOUNT_REDIRECT_URI,
    }

    if state:
        params["state"] = state

    url = f"{settings.JACCOUNT_AUTHORIZATION_URL}?{urllib.parse.urlencode(params)}"
    return url


def exchange_code_for_tokens(code):
    """
    使用授权码换取访问令牌和身份令牌
    """
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.JACCOUNT_REDIRECT_URI,
        "client_id": settings.JACCOUNT_CLIENT_ID,
        "client_secret": settings.JACCOUNT_CLIENT_SECRET,
    }

    try:
        response = requests.post(settings.JACCOUNT_TOKEN_URL, data=data, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise Exception(f"Failed to exchange code for tokens: {str(e)}")


def decode_id_token(id_token):
    """
    解析身份令牌，获取用户信息
    注意：这里使用 verify=False，在生产环境中应该验证签名
    """
    try:
        # 在生产环境中，应该使用client_secret验证签名
        # 这里暂时跳过验证，仅解码
        decoded = jwt.decode(id_token, options={"verify_signature": False})
        return decoded
    except jwt.InvalidTokenError as e:
        raise Exception(f"Invalid ID token: {str(e)}")


def get_or_create_user_from_jaccount(user_info):
    """
    根据jAccount用户信息获取或创建用户
    """
    jaccount_username = user_info.get("sub")  # jAccount账号

    # 构造email
    email = f"{jaccount_username}@sjtu.edu.cn"

    try:
        # 尝试通过用户名查找用户
        user = User.objects.filter(models.Q(username=jaccount_username)).first()

        if not user:
            # 用户不存在，创建新用户
            user = User.objects.create_user(
                username=jaccount_username,  # 使用jAccount账号作为用户名
                email=email,
                password=generate_random_string(16),  # 生成随机密码
            )

    except Exception as e:
        raise Exception(f"Error creating/updating user: {str(e)}")

    return user
