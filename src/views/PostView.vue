<template>
  <div class="post-main-layout">
    <Sidebar class="sidebar" />
    <div class="main-content">
      <div class="post-card-outer">
        <div class="post-content" v-html="htmlContent"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

const markdown = `---\nlayout: post\ntitle: \"Vue+Django 开发前后端分离项目\"\ndate:   2025-05-15\ntags: [Web]\ncomments: true\ncategories:\n- [Web]\nauthor: CircleCoder\n---\n\n### 前言\n\n笔者自学了 \`Vue\` 前端工程化开发和 \`Django\` 后端开发，但是网上关于如何将二者结合成前后端分离项目的教程较少。幸运的是，笔者的导员学姐曾给笔者推荐过一篇博客，记载了二者结合的过程。但是由于年代久远，框架版本过低，一些语法和细节不再适用。于是笔者重新记录一下此过程\n\n### 项目效果\n\n因为只是为了掌握前后端分离的开发过程，重在项目结构和配置上，所以沿用了原博客的项目，非常简单，是一个只可以增添的图书管理系统\n\n![image-20250517144255331](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505171443852.png)\n\n### 项目结构\n\n在 \`pycharm\` 中新建 \`Django\` 项目，命名为 \`ATS_Web\`\n\n新建 \`app\`，命名为 \`myapp\`\n\n![image-20250517144511800](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505171445857.png)\n\n模板目录 \`template\` 是我们用 \`Vue\` 脚手架创建的前端项目。这里笔者使用的自定义创建，自动生成了路由目录\n\n\`dist\` 目录是笔者 \`build\` 后生成的，另外删除了无用\`public\` 目录\n\n![image-20250517145038451](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505171450534.png)\n\n...（内容省略，实际请用完整md内容）`

const htmlContent = ref('')

onMounted(() => {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class=\"hljs\"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
        } catch (__) {}
      }
      return `<pre class=\"hljs\"><code>${md.utils.escapeHtml(str)}</code></pre>`
    },
  })
  htmlContent.value = md.render(markdown)
})
</script>

<style scoped>
.post-main-layout {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 0 64px 0;
  box-sizing: border-box;
}
.sidebar {
  flex: 0 0 280px;
  margin-right: 12px;
  min-width: 220px;
}
.main-content {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.post-card-outer {
  width: 100%;
  max-width: 960px;
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 8px 48px 0 rgba(237, 110, 160, 0.18),
    0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 2.5rem 2.5rem 2.5rem 2.5rem;
  margin: 0 auto;
  overflow: visible;
}
.post-content {
  font-size: 1.1em;
  line-height: 2;
  color: #222;
  word-break: break-word;
  background: #fff;
}
.post-content h1,
.post-content h2,
.post-content h3,
.post-content h4 {
  font-weight: bold;
  margin: 2.2em 0 1em 0;
  line-height: 1.3;
  color: #e9546b;
  border-bottom: 1.5px solid #f3c1d1;
  padding-bottom: 0.2em;
}
.post-content h1 {
  font-size: 2.2em;
}
.post-content h2 {
  font-size: 1.7em;
}
.post-content h3 {
  font-size: 1.3em;
}
.post-content h4 {
  font-size: 1.1em;
}
.post-content p {
  margin: 1.2em 0;
}
.post-content ul,
.post-content ol {
  margin: 1.2em 0 1.2em 2em;
}
.post-content blockquote {
  border-left: 4px solid #ed6ea0;
  background: #f9f9fb;
  color: #888;
  margin: 1.5em 0;
  padding: 1em 1.5em;
  border-radius: 6px;
}
.post-content pre {
  background: #282c34;
  color: #fff;
  border-radius: 8px;
  padding: 1em;
  overflow-x: auto;
  margin: 1.5em 0;
}
.post-content code {
  background: #f6f8fa;
  border-radius: 4px;
  padding: 2px 4px;
  color: #e9546b;
}
.post-content img {
  display: block;
  margin: 2em auto;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(237, 110, 160, 0.1);
  max-width: 100%;
  height: auto;
  box-sizing: border-box;
}
.post-content table {
  border-collapse: collapse;
  margin: 2em 0;
  width: 100%;
  background: #fafafd;
  border-radius: 6px;
  overflow: hidden;
}
.post-content th,
.post-content td {
  border: 1px solid #eee;
  padding: 0.7em 1em;
  text-align: left;
}
.post-content tr:nth-child(even) {
  background: #f7f7fa;
}
</style>
