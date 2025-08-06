---
layout: post
title: 'Vue3 音频播放器卡片开发记录'
date: 2025-01-27
tags: [Vue3, 前端开发, 组件开发]
categories: [Web]
author: CircleCoder
---

## 前言

在博客系统中，我们经常需要在文章中嵌入音频内容，特别是音乐分享。传统的做法是直接插入音频链接，但这样用户体验不够好。于是我决定开发一个自定义的音频播放器卡片组件，支持网易云音乐链接解析、歌词显示等功能。

## 需求分析

### 功能需求

1. **支持多种音频格式**：主要是网易云音乐链接
2. **自动解析音乐信息**：歌名、歌手、封面、歌词
3. **美观的播放器界面**：现代化的卡片设计
4. **响应式布局**：适配不同屏幕尺寸
5. **Markdown 集成**：通过特殊标签在文章中插入

### 技术需求

- Vue 3 Composition API
- 自定义指令处理 DOM 操作
- 网易云音乐 API 调用
- 响应式设计

## 开发过程

### 第一阶段：基础组件设计

首先创建了基础的音频播放器组件 `MusicPlayer.vue`：

```vue
<template>
  <div class="music-player">
    <div class="player-header">
      <img :src="cover" :alt="title" class="cover" />
      <div class="info">
        <h3>{{ title }}</h3>
        <p>{{ artist }}</p>
      </div>
    </div>
    <div class="player-controls">
      <audio ref="audioRef" :src="url" controls></audio>
    </div>
  </div>
</template>
```

### 第二阶段：网易云音乐 API 集成

为了实现自动解析音乐信息，需要调用网易云音乐的 API：

```javascript
// 获取网易云音乐信息
async function fetchNeteaseInfo(songId) {
  try {
    const response = await fetch(`https://your-api-endpoint/song/${songId}`)
    const data = await response.json()
    return {
      title: data.name,
      artist: data.artist,
      cover: data.album.picUrl,
      lyrics: data.lyrics,
    }
  } catch (error) {
    console.error('Failed to fetch music info:', error)
    return {
      title: '未知歌曲',
      artist: '未知歌手',
      cover: '',
      lyrics: [],
    }
  }
}
```

### 第三阶段：自定义指令开发

为了在 Markdown 渲染后自动替换 media 标签，开发了自定义指令 `mediaBlock.js`：

```javascript
export default {
  async mounted(el) {
    // 处理正常的media标签（开始和结束都在同一个p标签中）
    const normalMediaBlocks = el.querySelectorAll('p')
    for (const block of normalMediaBlocks) {
      const text = block.textContent || ''
      if (text.includes('{% media audio %}') && text.includes('{% endmedia %}')) {
        // 处理逻辑...
      }
    }
  },
}
```

### 第四阶段：处理复杂的 HTML 结构

在实际使用中发现，Markdown 渲染后的 HTML 结构比较复杂，需要处理三种不同的情况：

#### 情况1：正常格式

```html
<p>
  {% media audio %}
  <a href="https://music.163.com/#/song?id=123456">音乐链接</a>
  {% endmedia %}
</p>
```

#### 情况2：带列表的格式

```html
<p>{% media audio %}</p>
<ul>
  <li>
    <a href="https://music.163.com/#/song?id=123456">音乐链接</a><br />
    {% endmedia %}
  </li>
</ul>
```

#### 情况3：分离的格式

```html
<p>{% media audio %}</p>
<ul>
  <li><a href="https://music.163.com/#/song?id=123456">音乐链接</a></li>
</ul>
<p>{% endmedia %}</p>
```

针对这些情况，我们采用了分步处理的策略：

```javascript
// 第一步：处理正常的media标签
const normalMediaBlocks = el.querySelectorAll('p')
for (const block of normalMediaBlocks) {
  // 处理逻辑...
}

// 第二步：处理特殊的ul/li结构
const ulBlocks = el.querySelectorAll('ul')
for (const ulBlock of ulBlocks) {
  // 处理逻辑...
}

// 第三步：处理第三种格式
const endMediaBlocks = el.querySelectorAll('p')
for (const endBlock of endMediaBlocks) {
  // 处理逻辑...
}
```

### 第五阶段：样式优化

为了让播放器看起来更美观，设计了现代化的卡片样式：

```css
.music-player {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: white;
}

.player-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  margin-right: 15px;
  object-fit: cover;
}
```

### 第六阶段：歌词显示功能

为了增强用户体验，添加了歌词显示功能：

```vue
<template>
  <div class="lyrics-container" v-if="lyrics.length > 0">
    <div class="lyrics-title">歌词</div>
    <div class="lyrics-content">
      <p v-for="(line, index) in lyrics" :key="index" class="lyric-line">
        {{ line }}
      </p>
    </div>
  </div>
</template>
```

## 技术难点与解决方案

### 难点1：DOM 结构复杂性

**问题**：Markdown 渲染后的 HTML 结构不固定，需要处理多种情况。

**解决方案**：

- 采用分步处理策略，先处理简单情况，再处理复杂情况
- 使用 `querySelector` 和 `textContent` 进行精确匹配
- 通过 `parentNode` 和 `nextElementSibling` 等 API 进行 DOM 遍历

### 难点2：异步数据加载

**问题**：需要异步获取音乐信息，但 DOM 操作是同步的。

**解决方案**：

- 使用 `async/await` 处理异步操作
- 在获取数据前显示加载状态
- 添加错误处理机制

### 难点3：样式兼容性

**问题**：不同浏览器的音频控件样式差异较大。

**解决方案**：

- 使用自定义的音频控件样式
- 添加浏览器前缀
- 进行跨浏览器测试

## 最终效果

经过多轮迭代和优化，最终的音频播放器卡片具有以下特点：

1. **美观的界面**：现代化的卡片设计，渐变背景
2. **完整的信息**：显示歌名、歌手、封面、歌词
3. **良好的交互**：播放控制、进度条、音量调节
4. **响应式设计**：适配桌面和移动设备
5. **易于使用**：只需在 Markdown 中插入简单的标签

## 使用示例

在 Markdown 文件中，只需要这样写：

```markdown
{% media audio %}

- https://music.163.com/#/song?id=123456
  {% endmedia %}
```

或者：

```markdown
{% media audio %}
https://music.163.com/#/song?id=123456
{% endmedia %}
```

系统会自动解析链接，获取音乐信息，并渲染成美观的播放器卡片。
