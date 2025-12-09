# SJTUcontest - 科创赛事平台

SJTUcontest 是一个专为上海交通大学学生设计的科创赛事平台，旨在提供便捷的赛事信息发布、队伍组建、新闻公告等功能。

**我们希望大家能随时了解到近期的科创赛事，快速检索到各级赛事的加分信息，解决大家想参赛但找不到队友的问题。**

## 使用指南

首页会滚动轮播 **近期报名的赛事** ，供大家快速访问。

可以在赛事界面根据需要的 **筛选条件** 检索对应的赛事，并可在赛事详情页中查看比赛的 **简介** 、 **地点** 、 **级别** 、 **官网** 、**（可能的）资料** 、 **报名起讫时间** 等，还可直接跳转至本赛事的所有队伍界面，寻找你心仪的队伍/队友，亦或是创建一个新队伍招募队员。

组队界面可以查看 **当前正在招募且未满员** 的队伍，支持根据队伍名称搜索队伍。进入队伍详情页可看到队伍的 **简介** 、 **招募截止时间** 、 **现有成员** 等，并可通过联系队长向其索要 **邀请码** 的方式加入队伍。队长可以编辑队伍的信息，查看队伍的邀请码。 _为你的队伍写好简介和联系方式，更能找到心仪的队友！_

个人主页会显示你的 **昵称** 、 **获奖经历** 、**特长** 和 **加入的队伍**。适当维护个人主页有利于吸引到更优秀的同伴。当然，你加入的队伍不会对其它用户显示。

_计算机学院的同学别忘了通过 SSC 问卷填报自己的获奖情况，这将作为素拓、劳动学时发放和评优评先的参考。_

## 参与贡献

### 主要功能模块

-   **用户认证**: 集成 JAccount 统一身份认证，支持 JWT 登录状态管理。
-   **赛事管理**: 赛事的创建、编辑、展示及搜索。
-   **队伍管理**: 参赛队伍的组建、队员招募、队伍信息编辑。
-   **新闻公告**: 赛事相关新闻和通知的发布与展示。
-   **后台管理**: 管理员面板，用于管理用户、赛事、新闻及内容审核。
-   **内容安全**: 集成阿里云内容安全服务，对发布内容进行自动审核。
-   **定时任务**: 自动清理过期 Token 等维护任务。

### 技术栈

#### Backend
-   **语言**: Python
-   **框架**: Django, Django REST Framework
-   **认证**: Simple JWT, jAccount OAuth2
-   **数据库**: PostgreSQL

#### Frontend
-   **框架**: React, Vite
-   **UI 组件库**: Material-UI (MUI)
-   **路由**: React Router
-   **HTTP 客户端**: Axios
-   **其他工具**: Dayjs, Notistack, Prettier, ESLint

#### DevOps
-   **容器化**: Docker, Docker Compose
-   **Web 服务器**: Nginx

### 项目结构

```
SJTUcontest/
├── backend/                # 后端代码
│   ├── contests/           # 赛事应用
│   ├── news/               # 新闻应用
│   ├── teams/              # 队伍应用
│   ├── users/              # 用户应用
│   ├── SJTUcontest/        # 项目配置
│   ├── cron/               # 定时任务脚本
│   ├── Dockerfile          # 后端构建文件
│   └── requirements.txt    # Python 依赖
├── frontend/               # 前端代码
│   ├── src/                # 源代码
│   ├── public/             # 静态资源
│   ├── Dockerfile          # 前端构建文件
│   └── package.json        # Node.js 依赖
├── docker-compose.yml      # Docker 编排文件
└── README.md               # 项目说明文档
```

### 快速开始 (本地开发)

参考[后端文档](backend/README.md)和[前端文档](frontend/README.md)。

### Docker 部署

本项目支持使用 Docker Compose 一键部署。

1.  确保已安装 Docker 和 Docker Compose。
2.  在 `backend/` 目录下创建 `.env` 文件，并填入生产环境配置 (注意 `DB_HOST` 应设为 `postgres`)。
3.  在 `backend/logs/` 目录下创建 `content_detection_risks.log` (Docker 自动创建可能会遇到权限问题)。 
4.  在根目录下运行:

```bash
docker-compose up -d --build
```

该命令将启动以下服务:
-   `postgres`: 数据库服务
-   `backend`: Django 后端 API
-   `backend-cron`: 定时任务服务
-   `nginx`: 前端静态资源服务及反向代理 (端口 80)

## 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

Copyright (c) 2025 Student Science and Technology Association of SJTU SCS
