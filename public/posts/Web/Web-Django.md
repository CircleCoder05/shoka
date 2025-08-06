---
layout: post
title: "Django"
date:   2025-04-28
tags: [Web]
comments: true
categories:
- [Web]
author: CircleCoder
---

### 创建项目

```
```



### 创建 app

```json
├─app01
│  │  admin.py					# 默认提供了 admin 后台管理	
│  │  apps.py					# app启动类
│  │  models.py					# [重要] 数据库操作
│  │  tests.py					# 单元测试
│  │  views.py					# [重要] 函数
│  │  __init__.py
│  │
│  └─migrations					# 数据库变更记录
│          __init__.py
│
└─DjangoProject
    │  asgi.py
    │  settings.py
    │  urls.py
    │  wsgi.py
    │  __init__.py

```



### 启动运行

#### 注册 app

在 `./DjangoProject/settings.py` 中

```python
INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'app01.apps.App01Config'
]
```

#### 编写 url 

在 `./DjangoProject/url.py` 中

```python
from app01 import views

urlpatterns = [
    path('index/', views.index),
]
```

#### 编写视图函数

在 `./app01/views.py` 中

```python
from django.shortcuts import render,HttpResponse

# Create your views here.
def index(request):
    return HttpResponse('Hello World!')
```

#### 启动

![image-20250515225049161](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505152307773.png)

---

### 项目结构

#### 模板

在 `./app01` 目录下新建模板目录 `templates`，里面放置模板文件

```python
def user_list(request):
    return render(request, 'user_list.html')
```

#### 静态文件

在 `./app01` 目录下新建静态文件目录 `static`，里面放置 `css、js、img` 等静态文件

---

### 模板语法

---

### 请求与响应
