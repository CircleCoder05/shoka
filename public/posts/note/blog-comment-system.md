---
title: 博客评论系统
date: 2025-01-15
tags: [博客, 评论系统, Gitalk, GitHub, Vue3]
categories: [杂谈]
abstracts: 本文记录了我为博客实现评论系统的过程，重点介绍Gitalk的完整配置步骤，包括GitHub OAuth App的创建、配置文件的设置、Vue组件的实现等。
---

> 本文记录了我为博客实现评论系统的过程，重点介绍Gitalk的完整配置步骤，包括GitHub OAuth App的创建、配置文件的设置、Vue组件的实现等。

## Gitalk 简介

Gitalk是一个基于GitHub Issues的评论系统，它将每篇文章的评论存储为GitHub仓库中的一个Issue。用户通过GitHub OAuth登录后即可发表评论。

**核心特性：**

- 基于GitHub Issues，数据完全可控
- 支持Markdown格式
- 自动创建Issue，无需手动管理
- 支持回复功能
- 多语言支持
- 完全免费，无广告

## 第一步：创建GitHub OAuth App

### 访问GitHub开发者设置

1. 登录你的GitHub账号
2. 点击右上角头像 → Settings
3. 在左侧菜单中找到 "Developer settings"
4. 点击 "OAuth Apps"

![image-20250816173132829](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508161733395.png)

![1755337968423.png](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508161754133.png)

### 创建新的OAuth应用

1. 点击 "New OAuth App" 按钮
2. 填写应用信息：

```
Application name: 你的博客名称（如：My Blog）
Homepage URL: https://你的域名.com
Application description: 博客评论系统
Authorization callback URL: https://你的域名.com
```

![image-20250816175530073](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508161755282.png)

**重要说明：**

- `Homepage URL`：你的博客主页地址
- `Authorization callback URL`：OAuth认证后的回调地址，通常与Homepage URL相同
- 如果是本地开发，可以设置为 `http://localhost:5173`

### 获取应用凭据

创建完成后，你会看到应用的详细信息页面，记录下：

- **Client ID**：公开的客户端标识符
- **Client Secret**：私密的客户端密钥（请妥善保管）

![image-20250816175432237](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508161754507.png)

## 第二步：准备GitHub仓库

### 确保仓库存在

确保你有一个GitHub仓库用于存储评论。如果没有，创建一个新的仓库：

1. 点击GitHub右上角的 "+" 号 → "New repository"
2. 填写仓库名称和描述
3. 选择公开或私有（建议公开）
4. 不要初始化README、.gitignore或license

### 记录仓库信息

记录以下信息：

- **仓库所有者**：你的GitHub用户名
- **仓库名称**：仓库名（不包含用户名）

## 第三步：创建配置文件

在项目的 `public` 目录下创建 `gitalk-config.json` 文件：

```json
{
  "clientID": "你的GitHub OAuth App Client ID",
  "clientSecret": "你的GitHub OAuth App Client Secret",
  "repo": "你的仓库名",
  "owner": "你的GitHub用户名",
  "admin": ["你的GitHub用户名"],
  "labels": ["gitalk", "comment"],
  "perPage": 10,
  "pageSize": 10,
  "visitor": true,
  "distractionFreeMode": false,
  "language": "zh-CN"
}
```

**配置参数详解：**

| 参数                  | 说明                     | 示例                                         |
| --------------------- | ------------------------ | -------------------------------------------- |
| `clientID`            | OAuth App的Client ID     | `"Ov23limxrKTsDTPjKE0h"`                     |
| `clientSecret`        | OAuth App的Client Secret | `"4dab7d271e72b37328ba5f6783c3190a4c609695"` |
| `repo`                | 仓库名（不包含用户名）   | `"my-blog"`                                  |
| `owner`               | GitHub用户名             | `"yourusername"`                             |
| `admin`               | 管理员列表               | `["yourusername"]`                           |
| `labels`              | 评论标签                 | `["gitalk", "comment"]`                      |
| `perPage`             | 每页评论数               | `10`                                         |
| `pageSize`            | 每页评论数（兼容性）     | `10`                                         |
| `visitor`             | 是否允许访客查看         | `true`                                       |
| `distractionFreeMode` | 是否开启免打扰模式       | `false`                                      |
| `language`            | 界面语言                 | `"zh-CN"`                                    |

## 第四步：安装Gitalk组件

### 创建Vue组件

在 `src/components/` 目录下创建 `GitalkComments.vue` 文件：

```vue
<template>
  <div class="gitalk-comments-section">
    <div class="gitalk-container" ref="gitalkContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  postSlug: {
    type: String,
    required: true,
  },
})

const gitalkContainer = ref(null)

// 加载配置
const loadConfig = async () => {
  try {
    const response = await fetch('/gitalk-config.json')
    if (!response.ok) {
      throw new Error(`配置加载失败: ${response.status}`)
    }

    const config = await response.json()
    const validationResult = validateConfig(config)

    if (!validationResult.valid) {
      throw new Error(validationResult.message)
    }

    await initGitalk(config)
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

// 验证配置
const validateConfig = (config) => {
  if (!config.clientID) {
    return { valid: false, message: 'Gitalk Client ID 未配置' }
  }
  if (!config.clientSecret) {
    return { valid: false, message: 'Gitalk Client Secret 未配置' }
  }
  if (!config.repo) {
    return { valid: false, message: 'Gitalk 仓库名未配置' }
  }
  if (!config.owner) {
    return { valid: false, message: 'Gitalk 仓库所有者未配置' }
  }
  if (!config.admin || !Array.isArray(config.admin) || config.admin.length === 0) {
    return { valid: false, message: 'Gitalk 管理员配置无效' }
  }

  return { valid: true }
}

// 初始化 Gitalk
const initGitalk = async (config) => {
  try {
    await loadGitalkResources()

    const gitalk = createGitalkInstance(config)
    gitalk.render(gitalkContainer.value)

    console.log('Gitalk 初始化成功')
  } catch (error) {
    console.error('Gitalk 初始化失败:', error)
  }
}

// 加载 Gitalk 资源
const loadGitalkResources = () => {
  return new Promise((resolve, reject) => {
    if (window.Gitalk) {
      resolve()
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css'

    link.onload = () => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js'

      script.onload = () => {
        console.log('Gitalk资源加载成功')
        resolve()
      }

      script.onerror = () => {
        reject(new Error('Gitalk JS 加载失败'))
      }

      document.head.appendChild(script)
    }

    link.onerror = () => {
      reject(new Error('Gitalk CSS 加载失败'))
    }

    document.head.appendChild(link)
  })
}

// 创建 Gitalk 实例
const createGitalkInstance = (config) => {
  return new window.Gitalk({
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    repo: config.repo,
    owner: config.owner,
    admin: config.admin,
    id: props.postSlug,
    title: props.postSlug,
    labels: config.labels || ['gitalk', 'comment'],
    perPage: config.perPage || 10,
    pageSize: config.pageSize || 10,
    visitor: config.visitor !== false,
    distractionFreeMode: config.distractionFreeMode !== false,
    language: config.language || 'zh-CN',
  })
}

onMounted(() => {
  loadConfig()
})
</script>
```

### 在文章页面中使用

在 `PostView.vue` 中引入并使用：

```vue
<template>
  <!-- 文章内容 -->
  <article class="post-content">
    <!-- ... 文章内容 ... -->
  </article>

  <!-- 评论区 -->
  <GitalkComments :post-slug="route.params.slug" />
</template>

<script setup>
import GitalkComments from '@/components/GitalkComments.vue'
// ... 其他代码 ...
</script>
```
