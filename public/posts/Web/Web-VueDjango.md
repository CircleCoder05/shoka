---
layout: post
title: 'Vue+Django 伪前后端分离项目'
date: 2025-05-15
tags: [Web, Vue, Django]
comments: true
categories:
  - [Web]
author: CircleCoder
---

### 前言

笔者自学了 `Vue` 前端工程化开发和 `Django` 后端开发，但是网上关于如何将二者结合成前后端分离项目的教程较少。幸运的是，笔者的导员学姐曾给笔者推荐过一篇博客，记载了二者结合的过程。但是由于年代久远，框架版本过低，一些语法和细节不再适用。于是笔者重新记录一下此过程

### 项目效果

因为只是为了掌握前后端分离的开发过程，重在项目结构和配置上，所以沿用了原博客的项目，非常简单，是一个只可以增添的图书管理系统

![image-20250517144255331](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505171443852.png)

### 项目结构

在 `pycharm` 中新建 `Django` 项目，命名为 `ATS_Web`

新建 `app`，命名为 `myapp`

![image-20250517144511800](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505171445857.png)

模板目录 `template` 是我们用 `Vue` 脚手架创建的前端项目。这里笔者使用的自定义创建，自动生成了路由目录

`dist` 目录是笔者 `build` 后生成的，另外删除了无用`public` 目录

![image-20250517145038451](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505171450534.png)

### 前端

#### main.js

```js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios)

Vue.config.productionTip = false

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')
```

#### components / BookTest.vue

```html
<template>
  <div class="book-manager">
    <div class="input-group">
      <input
        v-model.trim="input"
        placeholder="请输入书名"
        class="book-input"
        @keyup.enter="addBook"
      />
      <button @click="addBook" class="add-button">添加</button>
    </div>

    <table v-if="tableData.length" class="book-table">
      <thead>
        <tr>
          <th width="180px">书名</th>
          <th>添加时间</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in tableData" :key="item.id">
          //...受博客渲染影响，这两行插值不再展示
        </tr>
      </tbody>
    </table>
    <p v-else class="empty-tip">暂无数据</p>
  </div>
</template>

<script>
  export default {
    name: 'BookTest',
    data() {
      return {
        input: '',
        tableData: [],
      }
    },
    created() {
      this.showBook()
    },
    methods: {
      formatTime(isoTime) {
        if (!isoTime) return '--'
        return new Date(isoTime).toLocaleString('zh-CN')
      },
      async showBook() {
        try {
          const res = await this.axios.get('show_books/')
          this.tableData = res.data.list
        } catch (error) {
          console.error('获取数据失败:', error)
        }
      },
      async addBook() {
        if (!this.input) {
          alert('书名不能为空')
          return
        }
        try {
          await this.axios.get('add_book/', {
            params: { book_name: this.input },
          })
          this.input = ''
          await this.showBook()
        } catch (error) {
          console.error('添加失败:', error)
        }
      },
    },
  }
</script>

<style scoped>
  /* 保持你原来的样式不变 */
  .book-manager {
    max-width: 600px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
  }
  .book-input {
    padding: 8px 12px;
    width: 300px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .add-button {
    padding: 8px 16px;
    background: #67c23a;
    color: white;
    border: none;
    border-radius: 4px;
    margin-left: 10px;
    cursor: pointer;
  }
  .book-table {
    width: 100%;
    margin-top: 20px;
    border-collapse: collapse;
  }
  .book-table th,
  .book-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  .book-table th {
    background-color: #f5f5f5;
  }
  .empty-tip {
    color: #999;
    text-align: center;
    margin-top: 20px;
  }
</style>
```

#### router / index.js

```js
import Vue from 'vue'
import VueRouter from 'vue-router'
import BookTest from '@/components/BookTest'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      path: '/',
      name: 'BookTest',
      component: BookTest,
    },
  ],
})
```

####

### 后端

#### settings.py 文件

在 `python3` 中，连接 `MySQL` 的库为 `pymysql` 库，使用 `pip3 install pymysql` 进行安装，直接导入即可使用，但是在 `Django` 中，连接数据库时使用的是 `MySQLdb` 库，需要在 `setting.py` 中导入

```python
import pymysql

pymysql.install_as_MySQLdb()
```

修改数据库配置，这里笔者使用的是 `MySQL`

```python
# Database

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'ats_test',
        'USER': 'root',
        'PASSWORD': 'root',
        'HOST': '127.0.0.1',
    }
}
```

将 `myapp` 添加至 `app` 列表中

```python
# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'myApp',
]
```

#### models.py

定义数据表

```
from django.db import models

class Book(models.Model):
    book_name = models.CharField(max_length=64)
    add_time = models.DateTimeField(auto_now_add=True)
```

#### views.py

编写视图函数

```python
from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from django.http import JsonResponse
from django.core import serializers
from django.utils.timezone import now

from myapp.models import Book
import json

def show_books(request):
    response = {'error_num': 0, 'msg': 'success'}
    try:
        books = Book.objects.all().values('id', 'book_name', 'add_time')
        response['list'] = list(books)  # 直接转为列表
    except Exception as e:
        response.update({'error_num': 1, 'msg': str(e)})
    return JsonResponse(response, safe=False)

def add_book(request):
    response = {'error_num': 0}
    book_name = request.GET.get('book_name')
    if not book_name:
        return JsonResponse({'error_num': 1, 'msg': '书名不能为空'})
    try:
        Book.objects.create(
            book_name=book_name,
            add_time=now()  # 自动添加当前时间
        )
        response['msg'] = '添加成功'
    except Exception as e:
        response.update({'error_num': 1, 'msg': str(e)})
    return JsonResponse(response)

```

#### urls.py

添加 `url`

```python
from django.contrib import admin
from django.urls import path

from myApp import views as BookView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('add_book/',BookView.add_book),
    path('show_books/',BookView.show_books),
]
```

#### 数据库迁移

在本地的MySQL中创建 `ast_test` 数据库后，执行如下命令

```shell
python manage.py makemigrations myapp
python manage.py migrate
```

#### 启动

执行命令

```python
python manage.py runserver
```

若能访问下面两个地址，说明后端编写成功

```shell
http://localhost:8000/add_book/?book_name=test

http://localhost:8000/show_books/
```

### 前后端结合

#### 前端 vue.config.js

因为静态资源 `css`、`js` 位于构建后的 `dist` 目录下，而后端`django` 通过`static` 访问静态资源，所以要修改为如下配置

```js
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/static/', // 所有资源通过/static/路径访问
  outputDir: '../template/dist', // 构建输
})
```

然后执行构建命令，将会生成 `dist` 目录，里面存放静态资源和入口文件 `index.html`

```shell
npm run build
```

#### 后端 views

修改 `view.py`，使得访问 `"/"` 时直接返回 `index.html`

```python
def initPage(request):
    return render(request, 'index.html')
```

相应地，修改 `url.py`

```python
from django.urls import path
from myapp import views as BookView
from django.views.generic import TemplateView
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('add_book/', BookView.add_book),
    path('show_books/', BookView.show_books),

    path('', TemplateView.as_view(template_name='index.html')),
]+ static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
```

#### 后端 settings

修改模板配置

```python
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['template/dist']
        ,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
```

修改静态文件配置

```python
STATIC_URL = 'static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "template/dist"),
]
```

#### 启动项目

执行命令

```shell
python manage.py runserver
```

就能看到我们的网页了
