---
layout: post
title: 'Vue+Django 前后端分离项目开发指南'
date: 2025-05-15
tags: [Web, Vue, Django, 前后端分离]
comments: true
categories:
  - [Web]
author: CircleCoder
---

## 前言

最近在学习前后端分离开发，发现网上关于Vue3和Django结合的教程确实不少，但很多都是把前端构建文件放在Django模板目录中的"伪前后端分离"。笔者想记录一下真正的前后端分离架构是如何实现的，希望能给同样在学习的朋友一些参考。

## 什么是前后端分离？

**前后端分离**这个概念说起来简单，但真正理解的人可能不多：

- **前端**：负责用户界面和交互逻辑，通过HTTP API与后端通信
- **后端**：提供RESTful API服务，处理业务逻辑和数据持久化
- **完全解耦**：前端和后端可以独立开发、测试、部署和扩展

**与混合架构的区别**：

- ❌ 混合架构：前端构建文件放在后端模板目录中，通过后端服务前端页面（我之前就是这么做的）
- ✅ 前后端分离：前端独立部署，通过API调用后端服务

## 项目架构设计

我这次的项目结构是这样的：

```
├── frontend/                 # Vue前端项目
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/                  # Django后端项目
│   ├── manage.py
│   ├── api/                 # Django应用
│   └── requirements.txt
└── README.md
```

## 后端开发 (Django API)

### 1. 创建Django项目

首先创建项目目录和虚拟环境：

```bash
# 创建项目目录
mkdir book-management-system
cd book-management-system

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install django djangorestframework django-cors-headers

# 创建Django项目
django-admin startproject backend
cd backend

# 创建应用
python manage.py startapp api
```

### 2. 配置Django设置

#### settings.py

这里需要特别注意跨域配置，我之前就因为没配置好导致前端无法调用后端API：

```python
# backend/settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',          # DRF
    'corsheaders',            # 跨域支持
    'api',                    # 我们的API应用
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # 必须在CommonMiddleware之前
    'django.middleware.common.CommonMiddleware',
    # ... 其他中间件
]

# 跨域配置
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",    # Vue开发服务器
    "http://localhost:8080",    # Vue CLI开发服务器
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
]

CORS_ALLOW_CREDENTIALS = True

# REST Framework配置
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
}
```

### 3. 数据模型

#### models.py

我设计了一个简单的图书模型：

```python
# api/models.py

from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=200, verbose_name='书名')
    author = models.CharField(max_length=100, verbose_name='作者', blank=True)
    description = models.TextField(verbose_name='描述', blank=True)
    isbn = models.CharField(max_length=13, verbose_name='ISBN', blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '图书'
        verbose_name_plural = '图书'
        ordering = ['-created_at']

    def __str__(self):
        return self.title
```

### 4. 序列化器

#### serializers.py

DRF的序列化器用起来真的很方便：

```python
# api/serializers.py

from rest_framework import serializers
from .models import Book

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'description', 'isbn', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
```

### 5. 视图

#### views.py

使用ViewSet可以自动生成CRUD操作，大大简化了代码：

```python
# api/views.py

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.utils import timezone
from .models import Book
from .serializers import BookSerializer

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def get_queryset(self):
        queryset = Book.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(author__icontains=search) |
                Q(description__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """获取统计信息"""
        total_books = Book.objects.count()
        recent_books = Book.objects.filter(
            created_at__gte=timezone.now() - timezone.timedelta(days=7)
        ).count()

        return Response({
            'total_books': total_books,
            'recent_books': recent_books
        })
```

### 6. URL配置

#### urls.py

DRF的路由器自动生成API端点：

```python
# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import BookViewSet

router = DefaultRouter()
router.register(r'books', BookViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]
```

### 7. 数据库迁移

执行数据库迁移：

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # 创建管理员账户
```

## 前端开发 (Vue3)

### 1. 创建Vue项目

我使用Vue3的最新脚手架：

```bash
# 在项目根目录下
npm create vue@latest frontend
cd frontend

# 选择以下配置：
# ✓ Add TypeScript? No
# ✓ Add JSX Support? No
# ✓ Add Vue Router? Yes
# ✓ Add Pinia? Yes
# ✓ Add Vitest? No
# ✓ Add End-to-End Testing? No
# ✓ Add ESLint? Yes
# ✓ Add Prettier? Yes

# 安装依赖
npm install
npm install axios
```

### 2. 配置API服务

#### api/index.js

我习惯把API配置单独抽出来：

```javascript
// src/api/index.js

import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  },
)

export default api
```

#### api/books.js

图书相关的API调用：

```javascript
// src/api/books.js

import api from './index'

export const bookApi = {
  // 获取所有图书
  getBooks(params = {}) {
    return api.get('/books/', { params })
  },

  // 获取单本图书
  getBook(id) {
    return api.get(`/books/${id}/`)
  },

  // 创建图书
  createBook(data) {
    return api.post('/books/', data)
  },

  // 更新图书
  updateBook(id, data) {
    return api.put(`/books/${id}/`, data)
  },

  // 删除图书
  deleteBook(id) {
    return api.delete(`/books/${id}/`)
  },

  // 搜索图书
  searchBooks(query) {
    return api.get('/books/', { params: { search: query } })
  },

  // 获取统计信息
  getStats() {
    return api.get('/books/stats/')
  },
}
```

### 3. 状态管理

#### stores/books.js

使用Pinia管理状态，比Vuex简单多了：

```javascript
// src/stores/books.js

import { defineStore } from 'pinia'
import { bookApi } from '@/api/books'

export const useBookStore = defineStore('books', {
  state: () => ({
    books: [],
    loading: false,
    error: null,
    stats: null,
  }),

  getters: {
    totalBooks: (state) => state.books.length,
    recentBooks: (state) => state.books.slice(0, 5),
  },

  actions: {
    async fetchBooks(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await bookApi.getBooks(params)
        this.books = data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async createBook(bookData) {
      try {
        const newBook = await bookApi.createBook(bookData)
        this.books.unshift(newBook)
        return newBook
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateBook(id, bookData) {
      try {
        const updatedBook = await bookApi.updateBook(id, bookData)
        const index = this.books.findIndex((book) => book.id === id)
        if (index !== -1) {
          this.books[index] = updatedBook
        }
        return updatedBook
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async deleteBook(id) {
      try {
        await bookApi.deleteBook(id)
        this.books = this.books.filter((book) => book.id !== id)
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async fetchStats() {
      try {
        this.stats = await bookApi.getStats()
      } catch (error) {
        this.error = error.message
      }
    },
  },
})
```

### 4. 组件开发

#### BookList.vue

主要的图书列表组件：

```vue
<!-- src/components/BookList.vue -->
<template>
  <div class="book-list">
    <div class="book-header">
      <h2>图书管理</h2>
      <button @click="showCreateModal = true" class="btn-primary">添加图书</button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="搜索书名、作者或描述..."
        class="search-input"
      />
    </div>

    <!-- 统计信息 -->
    <div v-if="bookStore.stats" class="stats">
      <div class="stat-item">
        <span class="stat-number">{{ bookStore.stats.total_books }}</span>
        <span class="stat-label">总图书数</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ bookStore.stats.recent_books }}</span>
        <span class="stat-label">本周新增</span>
      </div>
    </div>

    <!-- 图书列表 -->
    <div v-if="bookStore.loading" class="loading">加载中...</div>

    <div v-else-if="bookStore.error" class="error">
      {{ bookStore.error }}
    </div>

    <div v-else-if="bookStore.books.length === 0" class="empty">暂无图书数据</div>

    <div v-else class="books-grid">
      <div v-for="book in bookStore.books" :key="book.id" class="book-card">
        <div class="book-info">
          <h3>{{ book.title }}</h3>
          <p v-if="book.author" class="author">作者：{{ book.author }}</p>
          <p v-if="book.description" class="description">
            {{ book.description }}
          </p>
          <p class="isbn" v-if="book.isbn">ISBN：{{ book.isbn }}</p>
          <p class="date">创建时间：{{ formatDate(book.created_at) }}</p>
        </div>
        <div class="book-actions">
          <button @click="editBook(book)" class="btn-edit">编辑</button>
          <button @click="deleteBook(book.id)" class="btn-delete">删除</button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑模态框 -->
    <BookModal
      v-if="showCreateModal || editingBook"
      :book="editingBook"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBookStore } from '@/stores/books'
import BookModal from './BookModal.vue'

const bookStore = useBookStore()
const searchQuery = ref('')
const showCreateModal = ref(false)
const editingBook = ref(null)

// 搜索防抖
let searchTimeout = null
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim()) {
      bookStore.fetchBooks({ search: searchQuery.value })
    } else {
      bookStore.fetchBooks()
    }
  }, 300)
}

const editBook = (book) => {
  editingBook.value = { ...book }
}

const deleteBook = async (id) => {
  if (confirm('确定要删除这本书吗？')) {
    try {
      await bookStore.deleteBook(id)
    } catch (error) {
      console.error('删除失败:', error)
    }
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingBook.value = null
}

const handleSave = async (bookData) => {
  try {
    if (editingBook.value) {
      await bookStore.updateBook(editingBook.value.id, bookData)
    } else {
      await bookStore.createBook(bookData)
    }
    closeModal()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(() => {
  bookStore.fetchBooks()
  bookStore.fetchStats()
})
</script>

<style scoped>
.book-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.book-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
}

.stat-label {
  color: #6c757d;
  font-size: 14px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.book-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.book-info h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.author,
.description,
.isbn,
.date {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.book-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-primary,
.btn-edit,
.btn-delete {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-edit {
  background: #28a745;
  color: white;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #dc3545;
}
</style>
```

### 5. 路由配置

#### router/index.js

简单的路由配置：

```javascript
// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import BookList from '@/components/BookList.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: BookList,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
```

## 部署和运行

### 1. 启动后端服务

```bash
cd backend
python manage.py runserver
# 后端服务运行在 http://localhost:8000
```

### 2. 启动前端服务

```bash
cd frontend
npm run dev
# 前端服务运行在 http://localhost:3000
```

### 3. 生产环境部署

#### 前端构建

```bash
cd frontend
npm run build
# 生成dist目录，可以部署到Nginx、CDN等
```

#### 后端部署

```bash
# 使用Gunicorn部署
pip install gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8000

# 或使用Docker
docker build -t book-api .
docker run -p 8000:8000 book-api
```

## 前后端分离的优势

通过这次实践，我深刻体会到了前后端分离的优势：

1. **技术栈独立**：前后端可以使用最适合的技术栈
2. **团队协作**：前后端团队可以并行开发
3. **部署灵活**：可以独立部署和扩展
4. **维护性**：代码结构清晰，易于维护
5. **可扩展性**：支持多端应用（Web、移动端、桌面端）

## 总结

这次前后端分离项目的开发让我学到了很多。关键点包括：

- 后端提供RESTful API，不负责渲染页面
- 前端通过HTTP API调用后端服务
- 使用CORS处理跨域问题
- 前后端完全解耦，独立部署

相比之前把Vue构建文件放在Django模板目录中的做法，这种架构模式确实更适合现代Web应用开发，提供了更好的可维护性和扩展性。
当然，这只是个简单的示例，实际项目中还需要考虑认证、权限、错误处理、日志记录等更多方面。希望这篇文章能给大家一些启发，也欢迎交流讨论。
