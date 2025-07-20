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
DB_NAME=replace
DB_USER=replace
DB_PASSWORD=replace
DB_HOST=replace
DB_PORT=replace

# Django Secret Key
DJANGO_SECRET_KEY=fake_secret_key_replace_with_real_value

# jAccount OAuth2 配置
JACCOUNT_CLIENT_ID=replace
JACCOUNT_CLIENT_SECRET=replace
JACCOUNT_SCOPE=replace
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
