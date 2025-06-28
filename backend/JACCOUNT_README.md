# jAccount 认证接入文档

## 配置说明

在使用jAccount认证功能之前，需要配置以下环境变量到 `.env` 文件中：

```env
# jAccount OAuth2 配置
JACCOUNT_CLIENT_ID=your_real_client_id_here
JACCOUNT_CLIENT_SECRET=your_real_client_secret_here
JACCOUNT_AUTHORIZATION_URL=https://jaccount.sjtu.edu.cn/oauth2/authorize
JACCOUNT_TOKEN_URL=https://jaccount.sjtu.edu.cn/oauth2/token
JACCOUNT_LOGOUT_URL=https://jaccount.sjtu.edu.cn/oauth2/logout
JACCOUNT_REDIRECT_URI=http://localhost:8000/api/users/jaccount/callback/
```

## API 接口说明

### 1. 发起jAccount登录

**接口地址**: `GET /api/users/jaccount/login/`

**返回示例**:
```json
{
    "auth_url": "https://jaccount.sjtu.edu.cn/oauth2/authorize?response_type=code&scope=openid&client_id=...",
    "message": "Redirect to jAccount for authentication"
}
```

**使用方式**: 前端获取到 `auth_url` 后，引导用户跳转到该地址进行jAccount登录。

### 2. jAccount登录回调处理

**接口地址**: `GET /api/users/jaccount/callback/`

**说明**: 此接口由jAccount服务器回调，无需前端直接调用。

**返回示例**:
```json
{
    "message": "jAccount login successful",
    "tokens": {
        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    },
    "user": {
        "id": "uuid",
        "username": "张三",
        "email": "zhangsan@sjtu.edu.cn",
        "role": "user",
        "nick_name": "张三",
        "jaccount_id": "zhangsan",
        "student_code": "123456",
        "user_type": "student"
    }
}
```

### 3. jAccount登出

**接口地址**: `POST /api/users/jaccount/logout/`

**请求头**: `Authorization: Bearer <access_token>`

**请求体**:
```json
{
    "refresh": "refresh_token_here"
}
```

**返回示例**:
```json
{
    "message": "Logout successful",
    "jaccount_logout_url": "https://jaccount.sjtu.edu.cn/oauth2/logout?client_id=..."
}
```

## 用户自动创建逻辑

当用户首次通过jAccount登录时，系统会自动创建用户账户：

- `username`: 使用jAccount返回的用户姓名
- `email`: jAccount账号 + "@sjtu.edu.cn"
- `password`: 自动生成的随机密码（用户无需知道）
- `nick_name`: 使用jAccount返回的用户姓名
- `jaccount_id`: jAccount账号
- `student_code`: 学工号
- `user_type`: 身份类型（如：student、teacher等）

## 前端集成示例

### 发起登录
```javascript
// 获取jAccount登录URL
const response = await fetch('/api/users/jaccount/login/');
const data = await response.json();

// 跳转到jAccount登录页面
window.location.href = data.auth_url;
```

### 处理登录成功
登录成功后，jAccount会重定向回您的回调地址，您需要在前端处理这个重定向并获取用户信息和令牌。

### 登出
```javascript
const response = await fetch('/api/users/jaccount/logout/', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        refresh: refreshToken
    })
});

const data = await response.json();
// 可选：跳转到jAccount登出页面实现单点登出
// window.location.href = data.jaccount_logout_url;
```

## 注意事项

1. 请确保在jAccount管理后台正确配置了回调地址
2. 生产环境中请使用HTTPS
3. 妥善保管 `client_id` 和 `client_secret`
4. 系统支持用户重复登录，会自动更新用户信息而不会重复创建账户
