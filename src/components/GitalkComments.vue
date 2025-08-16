<template>
  <div class="gitalk-comments-section">
    <!-- Gitalk 评论容器 -->
    <div class="gitalk-container" ref="gitalkContainer"></div>

    <!-- 加载提示 -->
    <div v-if="loading" class="loading-comments">
      <div class="loading-spinner"></div>
      <p>正在加载评论区...</p>
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-tip">
      <div class="tip-icon">
        <i class="ic i-info"></i>
      </div>
      <h4>评论加载失败</h4>
      <p>{{ error }}</p>
      <button @click="reloadComments" class="reload-btn">
        <i class="ic i-refresh"></i>
        重新加载
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  postSlug: {
    type: String,
    required: true,
  },
})

const gitalkContainer = ref(null)
const loading = ref(true)
const error = ref(null)

// 从配置文件加载设置
const loadConfig = async () => {
  try {
    loading.value = true
    error.value = null // 清除之前的错误
    console.log('开始加载 Gitalk 配置...')

    const response = await fetch('/gitalk-config.json')
    if (!response.ok) {
      throw new Error(`无法加载 Gitalk 配置: ${response.status} ${response.statusText}`)
    }

    const config = await response.json()
    console.log('加载到的原始配置:', config)

    // 验证配置完整性
    const validation = validateConfig(config)
    console.log('配置验证结果:', validation)

    if (!validation.isValid) {
      throw new Error(`Gitalk 配置验证失败: ${validation.errors.join(', ')}`)
    }

    console.log('配置验证通过，开始初始化 Gitalk...')
    console.log('当前文章路径:', props.postSlug)

    // 初始化 Gitalk
    initGitalk(config)
  } catch (err) {
    console.error('加载配置失败:', err)
    error.value = err.message
    loading.value = false
  }
}

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

// 重新加载评论
const reloadComments = () => {
  loading.value = true
  error.value = null
  loadConfig()
}

// 监听文章路径变化，重新加载评论
watch(
  () => props.postSlug,
  async () => {
    await loadConfig()
  },
  { immediate: true },
) // immediate: true 确保在组件挂载时也加载一次

// 验证配置
const validateConfig = (config) => {
  const errors = []

  if (!config.clientID || config.clientID === 'undefined') {
    errors.push('Gitalk Client ID 未配置或无效')
  }

  if (!config.clientSecret || config.clientSecret === 'undefined') {
    errors.push('Gitalk Client Secret 未配置或无效')
  }

  if (!config.repo || config.repo === 'undefined') {
    errors.push('Gitalk 仓库名称未配置或无效')
  }

  if (!config.owner || config.owner === 'undefined') {
    errors.push('Gitalk 仓库所有者未配置或无效')
  }

  if (!config.admin || !Array.isArray(config.admin) || config.admin.length === 0) {
    errors.push('Gitalk 管理员配置无效')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// 组件挂载
onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.gitalk-comments-section {
  margin-top: 3rem;
  padding: 2rem;
  background: var(--bg-color, #ffffff);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color, #e1e5e9);
}

.comments-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color, #2c3e50);
}

.comments-title i {
  font-size: 1.2rem;
  color: var(--primary-color, #3498db);
}

.comments-description {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-light-color, #7f8c8d);
  line-height: 1.5;
}

.gitalk-container {
  min-height: 400px; /* 确保容器有足够高度 */
  border-radius: 8px;
  overflow: hidden;
}

/* 加载状态 */
.loading-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: var(--text-light-color, #7f8c8d);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color, #e1e5e9);
  border-top: 3px solid var(--primary-color, #3498db);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-dots {
  display: flex;
  gap: 8px;
  margin-top: 1rem;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: var(--primary-color, #3498db);
  border-radius: 50%;
  animation: dots 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes dots {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-comments p {
  margin: 0;
  font-size: 1rem;
}

/* 错误提示 */
.error-tip {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-light-color, #7f8c8d);
  background: var(--bg-light-color, #f9fafb);
  border: 1px solid var(--border-color, #e1e5e9);
  border-radius: 8px;
  margin-top: 2rem;
}

.tip-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--warning-color, #f39c12);
}

.error-tip h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color, #2c3e50);
}

.error-tip p {
  margin: 0 0 1.5rem 0;
  font-size: 0.9rem;
}

.reload-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color, #3498db);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reload-btn:hover {
  background: var(--primary-dark-color, #2980b9);
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .gitalk-comments-section {
    padding: 1rem;
    margin-top: 2rem;
  }

  .gitalk-container {
    min-height: 300px;
  }
}

/* 暗色主题支持 */
html.dark-theme .gitalk-comments-section {
  background: #383c4a;
  border-color: var(--border-dark-color, #3e4451);
}

html.dark-theme .comments-title {
  color: var(--text-dark-color, #abb2bf);
}

html.dark-theme .comments-description {
  color: var(--text-light-dark-color, #7f848e);
}

html.dark-theme .gitalk-container {
  background: var(--bg-dark-light-color, #383c4a);
  border-color: var(--border-dark-color, #3e4451);
}

html.dark-theme .loading-comments {
  color: var(--text-light-dark-color, #7f848e);
}

html.dark-theme .loading-spinner {
  border: 3px solid var(--border-dark-color, #3e4451);
  border-top: 3px solid var(--primary-dark-color, #61afef);
}

html.dark-theme .loading-dots span {
  background: var(--primary-dark-color, #61afef);
}

html.dark-theme .error-tip {
  background: var(--bg-dark-light-color, #383c4a);
  border-color: var(--border-dark-color, #3e4451);
  color: var(--text-light-dark-color, #7f848e);
}

html.dark-theme .tip-icon {
  color: var(--warning-dark-color, #f39c12);
}

html.dark-theme .error-tip h4 {
  color: var(--text-dark-color, #abb2bf);
}

html.dark-theme .error-tip p {
  color: var(--text-light-dark-color, #7f848e);
}

html.dark-theme .reload-btn {
  background: var(--primary-dark-color, #61afef);
}

html.dark-theme .reload-btn:hover {
  background: var(--primary-dark-dark-color, #569cd6);
}

/* Gitalk 暗色主题样式覆盖 */
html.dark-theme .gt-container {
  background: var(--bg-dark-color, #2c313c) !important;
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
  background: var(--bg-dark-light-color, #383c4a) !important;
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
