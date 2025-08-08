# 致 Manifold： 博客搭建与使用说明

本项目是一个基于 Vue3 + Vite 的静态博客系统，是 CircleCoder 为自己和 Manifold 打造的博客。

主题设计参考了 hexo 系列的 shoka 主题，不会用于商用

---

## 快速开始

### 克隆项目（推荐直接克隆 manifold 分支）

- 登录 [GitHub](https://github.com)。
- 直接克隆本仓库的 manifold 分支：
  ```bash
  git clone -b manifold https://github.com/CircleCoder05/shoka.git
  cd manifold
  ```
- 你可以直接在本地修改仓库内容，后续如有问题也方便维护。

### 安装依赖（可跳过）

如你有 Node.js 环境，建议使用 [Node.js](https://nodejs.org/) 16+ 和 [pnpm](https://pnpm.io/) 包管理器。

```bash
pnpm install
```

### 本地预览（可跳过）

如你有本地环境，可运行：

```bash
pnpm dev
```

浏览器访问 http://localhost:5173 查看效果。

> **没有本地环境也没关系！**
> 你可以直接修改仓库内容，然后推送到 GitHub，自动化部署脚本会自动构建并发布到云服务器或 GitHub Pages，你只需等待几分钟即可在线预览。

---

## 主要配置文件说明

所有配置文件都在 `public/` 目录下，**只需修改这些 json/yml 文件即可定制你的博客内容**。

### config.json

网站全局信息配置。

- 位置：`public/config.json`
- 主要字段：
  - `site.bannerTitle`：banner 大标题
  - `site.bannerSubtitle`：banner 副标题
  - `site.description`：网站描述
  - `site.author`：作者名
  - `site.email`：邮箱
  - `site.avatar`：头像图片路径（如 `/img/avatar.png` 或外链）
  - `site.motto`：个性签名
  - `site.social`：社交链接（GitHub、邮箱、音乐等）
  - `footer`：底部备案、起始日期等

### about.json

关于页面内容配置。

- 位置：`public/about.json`
- 主要字段：
  - `profile`：个人信息（头像、昵称、头衔、简介等）
  - `mbti`：MBTI 性格介绍（可选）
  - `academic`：学术成果（可选）
  - `model3d`：3D 形象（可选）
- 头像图片建议放在 `public/img/` 下，路径如 `/img/avatar.png`，也可以用外链（如 `https://xxx.com/avatar.png`）。

#### 3D 形象配置说明

- 在 `public/3d/models-config.json` 中配置 3D 模型信息
- 支持 FBX、GLB 等格式，支持模型切换和交互控制
- **重要**：当 `models-config.json` 中没有配置模型时，系统会自动使用 `public/img/figure.png` 作为静态图片替代，无需额外配置

### friends.json

友链页面配置。

- 位置：`public/friends.json`
- 主要字段：
  - `friends`：数组，每个元素为一个分组（如“好友”、“喜欢的博主”）
    - `category`：分组名
    - `description`：分组描述
    - `items`：友链列表（包含名称、网址、头像、简介、标签等）
- 头像可用网络图片或本地图片（如 `/img/avatar.png` 或外链）。

### category-cover-map.json

分类封面映射表。

- 位置：`public/category-cover-map.json`
- 用于将中文分类名映射为英文 key，便于分类管理和封面图片自动匹配。
- 示例：
  ```json
  {
    "杂谈": "gossip",
    "物理": "physics"
  }
  ```

### images.yml

文章封面图片池。

- 位置：`public/img/images.yml`
- 用于随机分配文章封面（如文章未指定 cover 字段时自动选用）
- 每行一个图片链接，可用外链（推荐）或本地图片路径（如 `/img/xxx.jpg`）。

---

## 图片配置说明（重要！）

- **所有图片字段（如头像、文章封面、友链头像等）都支持两种写法：**
  - **本地图片**：放在 `public/` 目录下，路径以 `/` 开头，如 `/img/avatar.png`、`/posts/physics/cover.jpg`。
  - **外链图片（推荐）**：直接填写图片的完整 URL，如 `https://your-cdn.com/xxx.jpg`。

- **文章封面、友链头像等更推荐使用外链**，这样图片加载更快、不会因本地图片丢失导致显示异常。

- **举例：**
  - 本地图片：`/img/avatar.png`、`/posts/gossip/cover.jpg`
  - 外链图片：`https://oss.yourdomain.com/202503292157001.jpg`

- **注意：**
  - 本地图片必须实际存在于 `public/` 目录下，否则无法显示。
  - 外链图片建议使用稳定的图床或 CDN。

---

## 添加/编辑文章

- 所有文章放在 `public/posts/` 目录下，可以进行一级分类。
- 每篇文章建议使用如下 front matter（开头三条横线之间）：

### Markdown 文章

```markdown
---
title: 文章标题
date: 2025-08-07
categories: [分类名]
tags: [标签1, 标签2]
cover: https://oss.yourdomain.com/202503292157001.jpg # 推荐外链，也可用 /posts/physics/cover.jpg
---

正文内容...
```

### PDF 文章

```markdown
---
title: PDF 文章标题
date: 2025-08-07
type: 'pdf'
path: '/pdf/your-file.pdf'
abstracts: 'PDF 文章摘要内容'
categories: [分类名]
tags: [标签1, 标签2]
cover: https://oss.yourdomain.com/202503292157001.jpg
---

# 这里可以写一些介绍性内容，或者留空
```

- 封面图片建议用外链（如上），如用本地图片，放在对应分类文件夹下，路径如 `/posts/physics/cover.jpg`。
- PDF 文件也需要放在 `public` 目录下。

---

## 上传与部署

### Git 操作部署（推荐）

- 修改完内容后，依次执行：
  ```bash
  git add .
  git commit -m "提交信息"
  git push
  ```
- 推送后，GitHub Actions 会自动构建并部署，无需本地构建。
- 稍等几分钟后即可 http://manifold.buaapgy.cn 上访问你的博客。

---

## 常见问题

- **图片无法显示？**
  - 检查图片路径是否以 `/` 开头，且图片已放在 `public/` 目录下，或外链是否有效。
- **修改配置后无效？**
  - 清除浏览器缓存，或重启本地服务。
- **不会写 Markdown？**
  - 可参考网上的 [Markdown 教程](https://www.markdownguide.org/basic-syntax/)。
- **PDF 文章无法显示？**
  - 确保 PDF 文件已放在 `public/` 目录下，且路径正确。
  - 检查 front matter 中的 `type: "pdf"` 和 `path` 字段是否正确。
- **3D 形象显示为静态图片？**
  - 这是正常现象，当 `models-config.json` 中没有配置模型时，系统会自动使用静态图片替代。
  - 如需显示 3D 模型，请在 `public/3d/models-config.json` 中配置模型信息。

---

## 其它说明

- 本项目无需后端，所有内容均为静态文件，适合个人博客、作品集等用途。
- 如遇到问题可在 GitHub 提 issue，或联系 CircleCoder。

---

祝你玩得开心，打造属于自己的博客！
