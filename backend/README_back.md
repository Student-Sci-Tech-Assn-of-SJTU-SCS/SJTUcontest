# backend

## 环境配置
导出本地conda环境：

```conda env export --no-builds -n SJTUcontest > environment.yml```

使用 environment.yml 创建环境:

```conda env create -f environment.yml```

## 运行方法

```python manage.py makemigrations```

```python manage.py migrate```

```python manage.py runserver```

建议使用postman测试