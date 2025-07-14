"""
jAccount OAuth2.0 认证相关工具函数
"""

import requests
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
import urllib.parse

from SJTUcontest.utils import generate_random_string

User = get_user_model()


def get_jaccount_authorize_url(state=None):
    """
    生成jAccount授权URL
    """
    params = {
        "response_type": "code",
        "scope": settings.JACCOUNT_SCOPE,
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
        decoded = jwt.decode(
            id_token,
            settings.JACCOUNT_CLIENT_SECRET,
            audience=settings.JACCOUNT_CLIENT_ID,
            issuer=settings.JACCOUNT_ISSUER,
        )
        return decoded

    except jwt.ExpiredSignatureError:
        raise Exception("ID token has expired")

    except jwt.InvalidAudienceError:
        raise Exception("Invalid audience in ID token")

    except jwt.InvalidIssuerError:
        raise Exception("Invalid issuer in ID token")

    except jwt.InvalidSignatureError:
        raise Exception("Invalid signature in ID token")

    except jwt.InvalidTokenError as e:
        raise Exception(f"Invalid ID token: {str(e)}")


def get_or_create_user_from_jaccount(jaccount_username):
    """
    根据jAccount id获取或创建用户
    """

    try:
        email = f"{jaccount_username}@sjtu.edu.cn"

        # 尝试通过用户名查找用户
        user = User.objects.filter(models.Q(username=jaccount_username)).first()

        if not user:
            # 用户不存在，创建新用户
            user = User.objects.create_user(
                username=jaccount_username,  # 使用jAccount账号作为用户名
                email=email,
                password=generate_random_string(16),  # 生成随机密码
            )

        return user

    except Exception as e:
        raise Exception(f"Error looking for/creating user: {str(e)}")


def get_jaccount_profile(access_token):
    """
    获取jAccount用户的个人信息
    """
    params = {
        "access_token": access_token,
    }
    try:
        url = f"{settings.JACCOUNT_PROFILE_URL}?{urllib.parse.urlencode(params)}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        return response.json()
    except requests.RequestException as e:
        raise Exception(f"Failed to get jAccount profile: {str(e)}")


def get_jaccount_id(response):
    if settings.JACCOUNT_SCOPE == "openid":
        # 解析身份令牌获取用户信息
        id_token = response["id_token"]
        user_info = decode_id_token(id_token)
        return user_info["sub"]  # jAccount账号

    else:
        access_token = response["access_token"]
        user_info = get_jaccount_profile(access_token)

        if settings.JACCOUNT_SCOPE == "basic":
            return user_info["account"]
        elif settings.JACCOUNT_SCOPE == "essential":
            return user_info["entities"][0]["account"]
        else:
            raise Exception(f"Unsupported jAccount scope: {settings.JACCOUNT_SCOPE}")


def get_jaccount_logout_url(state=None):
    """
    获取jAccount登出URL
    """
    params = {
        "client_id": settings.JACCOUNT_CLIENT_ID,
        "post_logout_redirect_uri": settings.JACCOUNT_LOGOUT_REDIRECT_URI,
    }

    if state:
        params["state"] = state

    url = f"{settings.JACCOUNT_LOGOUT_URL}?{urllib.parse.urlencode(params)}"
    return url
