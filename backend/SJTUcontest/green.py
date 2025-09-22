# coding=utf-8
# python version >= 3.6

from django.conf import settings
from alibabacloud_green20220302.client import Client
from alibabacloud_green20220302 import models
from alibabacloud_tea_openapi.models import Config
from datetime import datetime
import json

config = Config(
    access_key_id=settings.ALIBABA_CLOUD_ACCESS_KEY_ID,
    access_key_secret=settings.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
    connect_timeout=10000,  # 连接超时时间 单位毫秒(ms)
    read_timeout=3000,  # 读超时时间 单位毫秒(ms)
    region_id=settings.ALIBABA_CLOUD_REGION_ID,
    endpoint=settings.ALIBABA_CLOUD_ENDPOINT,
)

clt = Client(config)

detection_type = [
    "user.nick_name",
    "user.experience",
    "user.advantage",
    "team.name",
    "team.introduction",
]


def write_detection_log(content):
    with open("content_detection_risks_log.txt", "a") as f:
        f.write("====================\n")
        f.write(datetime.now().strftime("%Y-%m-%d %H:%M:%S\n"))
        f.write(content)
        f.write("\n")


def detect_content(content, user_id, type):
    """内容审核"""
    if type not in detection_type:
        return False

    serviceParameters = {"content": content}
    textModerationPlusRequest = models.TextModerationPlusRequest(
        # 检测类型
        service=(
            "nickname_detection_pro"
            if type in ["user.nick_name", "team.name"]
            else "comment_detection_pro"
        ),
        service_parameters=json.dumps(serviceParameters),
    )

    try:
        response = clt.text_moderation_plus(textModerationPlusRequest)
        if response.status_code == 200:
            # 调用成功
            result = response.body
            if not result.data.risk_level == "none":
                write_detection_log(
                    f"用户 '{user_id}' 提交了 '{type}':\n"
                    f"'{content}'\n"
                    f"但审核不通过:\n{response.body}"
                )
                return False
            return True
        else:
            write_detection_log(
                f"用户 '{user_id}' 提交了 '{type}':\n"
                f"'{content}'\n"
                f"但审核失败:\n"
                f"response not success. status: {response.status_code}, result: {response}"
            )
            return False
    except Exception as err:
        write_detection_log(
            f"用户 '{user_id}' 提交了 '{type}':\n'{content}'\n但审核出错:\n{str(err)}"
        )
        return False
