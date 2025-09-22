# backend

## 环境配置

1. 安装 **Anaconda**;
2. 创建环境`conda create -n SJTUcontest python=3.11.13`;
3. 激活环境`conda activate SJTUcontest`;
4. 安装依赖`pip install -r requirements.txt`;
5. 执行`python manage.py runserver`, 即可在 **8000** 端口上启动后端开发服务器.

**在`backend/`目录下创建`.env`文件并配置以下字段：**
```
# 把以下字段改为你自己的数据库配置信息
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=

# Django Secret Key
DJANGO_SECRET_KEY=

# jAccount OAuth2 配置
JACCOUNT_CLIENT_ID=
JACCOUNT_CLIENT_SECRET=
JACCOUNT_SCOPE=

# 阿里云内容机审配置
ALIBABA_CLOUD_ACCESS_KEY_ID=
ALIBABA_CLOUD_ACCESS_KEY_SECRET=
```

## 定期清理 Django Simple JWT 的 token blacklist

使用系统自带的 cron 任务定期执行清理 JWT 黑名单命令。

编辑当前用户的 cron file:
```bash
crontab -e
```

设置在每天 4:00 执行清理 JWT 黑名单的命令:
```bash
0 4 * * * /path/to/your/venv/bin/python /path/to/manage.py flushexpiredtokens
```
