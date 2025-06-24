# Django CSRF 配置指南

## 概述

本项目已配置好Django的CSRF防护以支持前后端分离架构。这个配置允许React前端安全地与Django后端进行通信。

## 配置说明

### 1. 后端配置

#### 已安装的包
- `django-cors-headers`: 处理跨域资源共享(CORS)
- `djangorestframework`: Django REST框架
- `djangorestframework-simplejwt`: JWT认证

#### 关键设置 (settings.py)

```python
# CORS配置
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React默认端口
    "http://localhost:5173",  # Vite默认端口
]

# CSRF配置
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
CSRF_COOKIE_HTTPONLY = False  # 允许JavaScript访问
CSRF_COOKIE_SAMESITE = "Lax"
```

### 2. API端点

#### 获取CSRF令牌
```
GET /api/csrf/
```
返回格式：
```json
{
    "csrfToken": "your-csrf-token-here",
    "message": "CSRF token generated successfully"
}
```

### 3. 前端使用方法

#### 方法一：使用提供的工具函数

```javascript
import { csrfFetch, loginUser } from './utils/csrf.js';

// 登录示例
try {
    const result = await loginUser('username', 'password');
    console.log('登录成功:', result);
} catch (error) {
    console.error('登录失败:', error);
}

// 通用API调用
const response = await csrfFetch('/api/some-endpoint/', {
    method: 'POST',
    body: JSON.stringify({ data: 'example' })
});
```

#### 方法二：手动处理

```javascript
// 1. 首先获取CSRF令牌
const csrfResponse = await fetch('http://localhost:8000/api/csrf/', {
    credentials: 'include'
});
const { csrfToken } = await csrfResponse.json();

// 2. 在后续请求中包含令牌
const response = await fetch('http://localhost:8000/api/auth/login/', {
    method: 'POST',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({
        username: 'your-username',
        password: 'your-password'
    })
});
```

#### 方法三：使用Axios (推荐)

```javascript
import axios from 'axios';

// 配置axios实例
const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
    withCredentials: true
});

// 请求拦截器自动添加CSRF令牌
api.interceptors.request.use(async (config) => {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
});
```

### 4. 重要注意事项

#### 开发环境 vs 生产环境

**开发环境设置** (当前配置):
```python
DEBUG = True
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False
CORS_ALLOW_ALL_ORIGINS = True  # 仅在DEBUG=True时
```

**生产环境设置** (需要修改):
```python
DEBUG = False
CSRF_COOKIE_SECURE = True  # 仅HTTPS
SESSION_COOKIE_SECURE = True  # 仅HTTPS
CORS_ALLOW_ALL_ORIGINS = False
ALLOWED_HOSTS = ['your-domain.com']
CSRF_TRUSTED_ORIGINS = ['https://your-frontend-domain.com']
```

#### Cookie设置说明

- `CSRF_COOKIE_HTTPONLY = False`: 允许JavaScript读取CSRF cookie
- `CSRF_COOKIE_SAMESITE = "Lax"`: 防止CSRF攻击同时允许合法的跨站请求
- `CORS_ALLOW_CREDENTIALS = True`: 允许跨域请求携带Cookie

### 5. 安全最佳实践

1. **始终验证来源**: 在生产环境中，严格限制`CORS_ALLOWED_ORIGINS`和`CSRF_TRUSTED_ORIGINS`
2. **使用HTTPS**: 在生产环境中启用`CSRF_COOKIE_SECURE`和`SESSION_COOKIE_SECURE`
3. **令牌管理**: 前端应该处理令牌过期和刷新
4. **错误处理**: 实现适当的CSRF错误处理和重试机制

### 6. 故障排除

#### 常见错误及解决方案

**403 Forbidden: CSRF verification failed**
- 确保请求头包含正确的`X-CSRFToken`
- 检查`CSRF_TRUSTED_ORIGINS`设置
- 确保请求包含`credentials: 'include'`

**CORS错误**
- 检查`CORS_ALLOWED_ORIGINS`设置
- 确保前端请求包含正确的Origin头

**Cookie未设置**
- 确保首先访问`/api/csrf/`端点
- 检查`CORS_ALLOW_CREDENTIALS`设置

### 7. 测试

启动后端服务器：
```bash
cd backend
python manage.py runserver
```

测试CSRF端点：
```bash
curl -c cookies.txt http://localhost:8000/api/csrf/
curl -b cookies.txt -H "X-CSRFToken: $(grep csrftoken cookies.txt | cut -f7)" \
     -X POST http://localhost:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test"}'
```

## 总结

这个配置提供了一个安全且灵活的CSRF防护方案，适用于前后端分离的架构。它允许前端应用安全地与Django后端通信，同时保持足够的安全性来防止CSRF攻击。
