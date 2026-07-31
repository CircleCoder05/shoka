<template>
  <div class="code-block" :class="{ expanded: isExpanded }">
    <!-- 代码块头部 -->
    <div class="code-header">
      <div class="code-info">
        <span v-if="language" class="language-tag" :data-lang="language.toLowerCase()">
          <span class="lang-icon">{{ getLanguageIcon(language) }}</span>
          {{ language }}
        </span>
        <span class="line-count">{{ lineCount }} lines</span>
      </div>
      <div class="code-actions">
        <button
          v-if="canExpand"
          @click="toggleExpand"
          class="action-btn expand-btn"
          :title="isExpanded ? '收起代码' : '展开代码'"
        >
          <span class="icon">{{ isExpanded ? '▲' : '▼' }}</span>
        </button>
        <button
          @click="copyCode"
          class="action-btn copy-btn"
          :title="copyStatus === 'copied' ? '已复制' : '复制代码'"
        >
          <i class="ic" :class="copyStatus === 'copied' ? 'i-check' : 'i-clipboard'"></i>
        </button>
      </div>
    </div>

    <!-- 代码内容 -->
    <div class="code-content" :class="{ collapsed: !isExpanded && canExpand }">
      <pre><code v-html="highlightedCode"></code></pre>
    </div>

    <!-- 展开提示 -->
    <div v-if="!isExpanded && canExpand" class="expand-hint" @click="toggleExpand">
      <span>点击展开完整代码</span>
      <i class="ic i-chevron-down"></i>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: '',
  },
  maxLines: {
    type: Number,
    default: 20,
  },
})

const isExpanded = ref(false)
const copyStatus = ref('idle') // 'idle', 'copying', 'copied'

// 计算行数
const lineCount = computed(() => {
  return props.code.split('\n').length
})

// 判断是否需要展开功能
const canExpand = computed(() => {
  return lineCount.value > props.maxLines
})

// 高亮代码
const highlightedCode = computed(() => {
  if (props.language && hljs.getLanguage(props.language)) {
    try {
      return hljs.highlight(props.code, { language: props.language }).value
    } catch (e) {
      console.warn('Failed to highlight code:', e)
    }
  }
  return hljs.highlightAuto(props.code).value
})

// 切换展开状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 获取语言图标
const getLanguageIcon = (lang) => {
  const icons = {
    javascript: '⚡',
    js: '⚡',
    typescript: '📘',
    ts: '📘',
    python: '🐍',
    java: '☕',
    cpp: '⚙️',
    'c++': '⚙️',
    c: '🔧',
    html: '🌐',
    css: '🎨',
    vue: '💚',
    react: '⚛️',
    jsx: '⚛️',
    php: '🐘',
    go: '🚀',
    rust: '🦀',
    sql: '🗄️',
    bash: '💻',
    shell: '💻',
  }
  return icons[lang.toLowerCase()] || '📄'
}

// 复制代码
const copyCode = async () => {
  if (copyStatus.value === 'copying') return

  copyStatus.value = 'copying'

  try {
    await navigator.clipboard.writeText(props.code)
    copyStatus.value = 'copied'

    // 2秒后重置状态
    setTimeout(() => {
      copyStatus.value = 'idle'
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code:', err)
    copyStatus.value = 'idle'
  }
}
</script>

<style scoped lang="scss" src="@/styles/sfc/views/articles/CodeBlock.scss"></style>
