---
title: 博客评论系统
date: 2025-01-15
tags: [博客, 评论系统, Gitalk, Valine, GitHub, Vue3]
categories: [杂谈]
abstracts: 本文记录了我为博客实现评论系统的过程，重点介绍Gitalk和Valine两种评论系统的完整配置步骤，包括GitHub OAuth App的创建、LeanCloud的配置、Vue组件的实现等。
---

> 本文记录了我为博客实现评论系统的过程，重点介绍Gitalk和Valine两种评论系统的完整配置步骤，包括GitHub OAuth App的创建、LeanCloud的配置、Vue组件的实现等。

## 评论系统选择

我的博客支持两种评论系统，用户可以根据需要选择使用：

### Gitalk 简介

Gitalk是一个基于GitHub Issues的评论系统，它将每篇文章的评论存储为GitHub仓库中的一个Issue。用户通过GitHub OAuth登录后即可发表评论。

**核心特性：**

- 基于GitHub Issues，数据完全可控
- 支持Markdown格式
- 自动创建Issue，无需手动管理
- 支持回复功能
- 多语言支持
- 完全免费，无广告

### Valine 简介

Valine是一个基于LeanCloud的轻量级评论系统，无需后端，支持多端同步。

**核心特性：**

- 基于LeanCloud，无需自建后端
- 支持Markdown格式
- 支持邮件通知
- 支持评论管理
- 支持多语言
- 免费额度充足

## Gitalk 配置步骤

### 第一步：创建GitHub OAuth App

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

### 第二步：准备GitHub仓库

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

### 第三步：创建配置文件

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

### 第四步：安装Gitalk组件

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

## Valine 配置步骤

### 第一步：登录LeanCloud

访问 [LeanCloud官网](https://www.leancloud.cn/)，注册或登录平台

![image-20250817215052605](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508172150808.png)

### 第二步：创建应用

1. 登录后点击"创建应用"
2. 填写应用信息：
   - 应用名称：你的博客名称（如：My Blog）
   - 应用描述：博客评论系统
3. 选择"开发版"（免费）

![image-20250817214505330](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508172146388.png)

### 第三步：获取应用配置

进入刚刚创建的应用，选择左边的 `设置`>`应用凭证`，然后就能看到你的 `AppID` 和 `AppKey` 了

![image-20250817214735641](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508172147805.png)

### 第四步：创建配置文件

在项目的 `public` 目录下创建 `valine-config.json` 文件：

```json
{
  "appId": "你的LeanCloud App ID",
  "appKey": "你的LeanCloud App Key",
  "path": "window.location.pathname",
  "placeholder": "欢迎留言...",
  "avatar": "monsterid",
  "meta": ["nick", "mail", "link"],
  "pageSize": 10,
  "lang": "zh-CN",
  "visitor": true,
  "highlight": true,
  "recordIP": false,
  "serverURLs": "",
  "emojiCDN": "",
  "emojiMaps": {}
}
```

**配置参数详解：**

| 参数          | 说明               | 示例                                  |
| ------------- | ------------------ | ------------------------------------- |
| `appId`       | LeanCloud的App ID  | `"abc123def456"`                      |
| `appKey`      | LeanCloud的App Key | `"ghi789jkl012"`                      |
| `path`        | 页面路径标识       | `"window.location.pathname"`          |
| `placeholder` | 评论框占位符       | `"欢迎留言..."`                       |
| `avatar`      | 头像样式           | `"monsterid"` (可选：mp, identicon等) |
| `meta`        | 评论者信息字段     | `["nick", "mail", "link"]`            |
| `pageSize`    | 每页评论数         | `10`                                  |
| `lang`        | 界面语言           | `"zh-CN"`                             |
| `visitor`     | 是否显示访问量     | `true`                                |
| `highlight`   | 是否高亮代码       | `true`                                |
| `recordIP`    | 是否记录评论者IP   | `false`                               |

### 第五步：创建Vue组件

在 `src/components/` 目录下创建 `ValineComments.vue` 文件：

```vue
<template>
  <div class="valine-comments-section">
    <div class="valine-container" ref="valineContainer"></div>
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

const valineContainer = ref(null)

// 加载配置
const loadConfig = async () => {
  try {
    const response = await fetch('/valine-config.json')
    if (!response.ok) {
      throw new Error(`配置加载失败: ${response.status}`)
    }

    const config = await response.json()
    const validationResult = validateConfig(config)

    if (!validationResult.valid) {
      throw new Error(validationResult.message)
    }

    await initValine(config)
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

// 验证配置
const validateConfig = (config) => {
  if (!config.appId) {
    return { valid: false, message: 'Valine App ID 未配置' }
  }
  if (!config.appKey) {
    return { valid: false, message: 'Valine App Key 未配置' }
  }

  return { valid: true }
}

// 初始化 Valine
const initValine = async (config) => {
  try {
    await loadValineResources()

    const valine = createValineInstance(config)
    valine.render(valineContainer.value)

    console.log('Valine 初始化成功')
  } catch (error) {
    console.error('Valine 初始化失败:', error)
  }
}

// 加载 Valine 资源
const loadValineResources = () => {
  return new Promise((resolve, reject) => {
    if (window.Valine) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/valine@1.5.1/dist/Valine.min.js'

    script.onload = () => {
      console.log('Valine资源加载成功')
      resolve()
    }

    script.onerror = () => {
      reject(new Error('Valine JS 加载失败'))
    }

    document.head.appendChild(script)
  })
}

// 创建 Valine 实例
const createValineInstance = (config) => {
  return new window.Valine({
    el: valineContainer.value,
    appId: config.appId,
    appKey: config.appKey,
    path: config.path || window.location.pathname,
    placeholder: config.placeholder || '欢迎留言...',
    avatar: config.avatar || 'monsterid',
    meta: config.meta || ['nick', 'mail', 'link'],
    pageSize: config.pageSize || 10,
    lang: config.lang || 'zh-CN',
    visitor: config.visitor !== false,
    highlight: config.highlight !== false,
    recordIP: config.recordIP || false,
    serverURLs: config.serverURLs || '',
    emojiCDN: config.emojiCDN || '',
    emojiMaps: config.emojiMaps || {},
  })
}

onMounted(() => {
  loadConfig()
})
</script>
```

### 第六步：在文章页面中使用

在 `PostView.vue` 中引入并使用：

```vue
<template>
  <!-- 文章内容 -->
  <article class="post-content">
    <!-- ... 文章内容 ... -->
  </article>

  <!-- 评论区 -->
  <ValineComments :post-slug="route.params.slug" />
</template>

<script setup>
import ValineComments from '@/components/ValineComments.vue'
// ... 其他代码 ...
</script>
```

### 第七步：配置邮件提醒功能

valine admin 支持邮件提醒功能，当有新评论时，管理员会收到邮件通知。

#### 创建云引擎

![image-20250817215508129](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508172155467.png)

![image-20250817215529553](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508172155893.png)

![image-20250817215544221](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508172155607.png)

#### git 部署

![image-20250817215710521](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508172157667.png)

![image-20250817215721830](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508172157091.png)

![image-20250817215733412](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508172157791.png)

![image-20250817215800367](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508172158672.png)

![image-20250817215813689](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508172158116.png)

#### 配置环境变量

![image-20250817215844989](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508172158279.png)

![image-20250817215855477](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508172158861.png)

请按照以下表格填写相应的项目环境变量：

| 变量名 | 说明 | 示例 |
| ------ | ---- | ---- |
| SENDER_NAME | 寄件人名称 | CircleCoder – 评论提醒 |
| SITE_NAME | [必填]网站名称 | CircleCoder |
| SITE_URL | [必填]网站地址，地址后方不带 / | https://chenpeiming52001.github.io |
| SMTP_SERVICE | [必填]邮件服务提供商，支持 QQ、163、126 等 | QQ   |
| SMTP_USER | [必填]SMTP 服务用户名，及邮箱地址 | 3196932484@qq.com |
| SMTP_PASS | [必填]SMTP 密码，及授权码 | 123  |
| TEMPLATE_NAME | 邮件模板，默认 default，可以选 rainbow | rainbow |
| TO_EMAIL | 自定义博主收件人 | 3196932484@qq.com |

#### 测试

重启云引擎后，在博客文章页面评论，就可以收到邮件啦！
（注意，站长本人所发表的评论不会通知哦）

![image-20250817220919356](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202508172209498.png)

## 总结

通过以上配置，博客就同时支持Gitalk和Valine两种评论系统了。用户可以根据自己的需求选择：

- **Gitalk**：适合希望完全控制数据的用户，评论存储在GitHub Issues中
- **Valine**：适合希望快速部署的用户，基于LeanCloud，无需自建后端

两种系统都支持Markdown格式，具有良好的用户体验。记得根据实际使用情况调整配置参数，确保评论系统稳定运行。
