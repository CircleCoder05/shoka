<template>
  <div class="gitalk-comments-section">
    <div class="gitalk-container" ref="gitalkContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useCommentsStore } from '../stores/comments.js'

const props = defineProps({
  postSlug: {
    type: String,
    required: true,
  },
})

const commentStore = useCommentsStore()
const gitalkContainer = ref(null)
const loading = ref(true)
const error = ref(null)

// 获取Gitalk配置
const gitalkConfig = computed(() => {
  return commentStore.getCommentSystemConfig('gitalk') || {}
})

// 初始化 Gitalk
const initGitalk = (config) => {
  try {
    // 检查Gitalk是否已加载
    if (typeof window.Gitalk === 'undefined') {
      // 动态加载Gitalk CSS和JS
      loadGitalkResources()
        .then(() => {
          createGitalkInstance(config)
        })
        .catch((err) => {
          console.error('加载Gitalk资源失败:', err)
          error.value = '加载Gitalk资源失败'
          loading.value = false
        })
    } else {
      createGitalkInstance(config)
    }
  } catch (err) {
    console.error('初始化Gitalk失败:', err)
    error.value = '初始化Gitalk失败'
    loading.value = false
  }
}

// 加载Gitalk资源
const loadGitalkResources = () => {
  return new Promise((resolve, reject) => {
    // 加载CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css'
    link.onload = () => {
      // 加载JS
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js'
      script.onload = () => {
        console.log('Gitalk资源加载成功')
        resolve()
      }
      script.onerror = () => reject(new Error('Gitalk JS加载失败'))
      document.head.appendChild(script)
    }
    link.onerror = () => reject(new Error('Gitalk CSS加载失败'))
    document.head.appendChild(link)
  })
}

// 创建Gitalk实例
const createGitalkInstance = (config) => {
  try {
    console.log('开始创建 Gitalk 实例...')
    console.log('文章路径:', props.postSlug)
    console.log('Gitalk 配置:', config)

    // 验证GitHub仓库配置
    const expectedRepoUrl = `https://github.com/${config.owner}/${config.repo}`
    console.log('预期的仓库URL:', expectedRepoUrl)
    console.log('GitHub API URL:', `https://api.github.com/repos/${config.owner}/${config.repo}`)

    const gitalk = new window.Gitalk({
      clientID: config.clientID,
      clientSecret: config.clientSecret,
      repo: config.repo,
      owner: config.owner,
      admin: config.admin,
      id: props.postSlug, // 文章的唯一标识
      title: props.postSlug, // 文章标题
      labels: config.labels, // 可选，文章标签
      perPage: config.perPage, // 每页评论数
      pageSize: config.pageSize, // 每页评论数
      visitor: config.visitor, // 是否开启访客评论
      distractionFreeMode: config.distractionFreeMode, // 是否开启免打扰模式
      language: config.language, // 可选，语言
      // 其他 Gitalk 配置项
    })

    console.log('Gitalk 实例创建成功，开始渲染...')
    console.log('容器元素:', gitalkContainer.value)

    // 渲染到容器
    gitalk.render(gitalkContainer.value)

    console.log('Gitalk 初始化成功')
    loading.value = false
  } catch (err) {
    console.error('创建Gitalk实例失败:', err)
    error.value = '创建Gitalk实例失败'
    loading.value = false
  }
}

// 监听配置变化
watch(
  () => gitalkConfig.value,
  (newConfig) => {
    if (newConfig && Object.keys(newConfig).length > 0) {
      console.log('Gitalk配置更新，重新初始化...')
      initGitalk(newConfig)
    }
  },
  { immediate: true, deep: true },
)

onMounted(() => {
  // 如果已经有配置，直接初始化
  if (gitalkConfig.value && Object.keys(gitalkConfig.value).length > 0) {
    console.log('组件挂载，开始初始化Gitalk...')
    initGitalk(gitalkConfig.value)
  }
})
</script>

<style scoped>
.gitalk-comments-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--bg-color, #fff);
  border: 1px solid var(--border-color, #e1e4e8);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.gitalk-container {
  min-height: 200px;
}

/* 暗色主题支持 */
html.dark-theme .gitalk-comments-section {
  background: #383c4a;
  border-color: var(--border-dark-color, #3e4451);
}

/* Gitalk 暗色主题样式覆盖 */
html.dark-theme .gt-container {
  background: transparent !important;
  color: var(--text-dark-color, #abb2bf) !important;
}

html.dark-theme .gt-header {
  background: var(--bg-dark-light-color, #383c4a) !important;
  border-color: var(--border-dark-color, #3e4451) !important;
}

html.dark-theme .gt-header-textarea {
  background: var(--bg-dark-color, #2c313c) !important;
  color: var(--text-dark-color, #abb2bf) !important;
  border-color: var(--border-dark-color, #3e4451) !important;
}

html.dark-theme .gt-header-textarea::placeholder {
  color: var(--text-light-dark-color, #7f848e) !important;
}

html.dark-theme .gt-header-controls {
  background: var(--bg-dark-light-color, #383c4a) !important;
}

html.dark-theme .gt-btn {
  background: var(--primary-dark-color, #61afef) !important;
  color: white !important;
  border-color: var(--primary-dark-color, #61afef) !important;
}

html.dark-theme .gt-btn:hover {
  background: var(--primary-dark-dark-color, #569cd6) !important;
}

html.dark-theme .gt-comments {
  background: transparent !important;
}

html.dark-theme .gt-comment {
  background: var(--bg-dark-color, #2c313c) !important;
  border-color: var(--border-dark-color, #3e4451) !important;
}

html.dark-theme .gt-comment-content {
  color: var(--text-dark-color, #abb2bf) !important;
}

html.dark-theme .gt-comment-body {
  color: var(--text-dark-color, #abb2bf) !important;
}

html.dark-theme .gt-comment-header {
  background: var(--bg-dark-light-color, #383c4a) !important;
  border-color: var(--border-dark-color, #3e4451) !important;
}

html.dark-theme .gt-comment-username {
  color: var(--primary-dark-color, #61afef) !important;
}

html.dark-theme .gt-comment-date {
  color: var(--text-light-dark-color, #7f848e) !important;
}

html.dark-theme .gt-meta {
  background: var(--bg-dark-light-color, #383c4a) !important;
  border-color: var(--border-dark-color, #3e4451) !important;
}

html.dark-theme .gt-meta-text {
  color: var(--text-light-dark-color, #7f848e) !important;
}

html.dark-theme .gt-avatar {
  border-color: var(--border-dark-color, #3e4451) !important;
}

html.dark-theme .gt-avatar-github {
  background: var(--primary-dark-color, #61afef) !important;
}

html.dark-theme .gt-avatar-github:hover {
  background: var(--primary-dark-dark-color, #569cd6) !important;
}
</style>
