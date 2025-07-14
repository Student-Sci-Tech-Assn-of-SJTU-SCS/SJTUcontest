# backend

## 环境配置

1. 安装 **Anaconda**;
2. 创建环境`conda create -n SJTUcontest python=3.11.13`;
3. 激活环境`conda activate SJTUcontest`;
4. 安装依赖`pip install -r requirements.txt`;
5. 执行`python manage.py runserver`, 即可在 **8000** 端口上启动后端开发服务器.

### 定期清理 Django Simple JWT 的 token blacklist

使用系统自带的 cron 任务定期执行清理 JWT 黑名单命令。

编辑当前用户的 cron file:
```bash
crontab -e
```

设置在每天 4:00 执行清理 JWT 黑名单的命令:
```bash
0 4 * * * /path/to/your/venv/bin/python /path/to/manage.py flushexpiredtokens
```
