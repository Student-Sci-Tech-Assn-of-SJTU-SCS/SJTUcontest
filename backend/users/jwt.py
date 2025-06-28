from rest_framework_simplejwt.tokens import RefreshToken


def generate_new_jwt_tokens(user):
    """
    为用户生成JWT令牌
    """
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def refresh_jwt_tokens(refresh_token):
    """
    刷新JWT令牌
    """
    token = RefreshToken(refresh_token)
    new_tokens = {
        "access": str(token.access_token),
        "refresh": str(token),
    }
    return new_tokens


def drop_jwt_tokens(refresh_token):
    """
    将refresh token加入黑名单
    """
    token = RefreshToken(refresh_token)
    token.blacklist()
