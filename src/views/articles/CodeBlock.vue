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

<style scoped>
.code-block {
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #282c34;
  border: 1px solid #3e4451;
  transition: all 0.3s ease;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #21252b;
  border-bottom: 1px solid #3e4451;
  font-size: 0.9em;
}

.code-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ccc;
}

.language-tag {
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75em;
  font-weight: 600;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  display: flex;
  align-items: center;
  gap: 4px;
  letter-spacing: 0.5px;
}

/* 不同语言的样式 */
.language-tag[data-lang='javascript'],
.language-tag[data-lang='js'] {
  background: linear-gradient(135deg, #f7df1e 0%, #f0db4f 100%);
  color: #000;
}

.language-tag[data-lang='typescript'],
.language-tag[data-lang='ts'] {
  background: linear-gradient(135deg, #3178c6 0%, #235a97 100%);
  color: white;
}

.language-tag[data-lang='python'] {
  background: linear-gradient(135deg, #3776ab 0%, #ffde57 100%);
  color: #000;
}

.language-tag[data-lang='java'] {
  background: linear-gradient(135deg, #ed8b00 0%, #ff6b35 100%);
  color: white;
}

.language-tag[data-lang='cpp'],
.language-tag[data-lang='c++'] {
  background: linear-gradient(135deg, #00599c 0%, #004482 100%);
  color: white;
}

.language-tag[data-lang='c'] {
  background: linear-gradient(135deg, #87ceeb 0%, #4fb3d9 100%);
  color: white;
}

.language-tag[data-lang='html'] {
  background: linear-gradient(135deg, #e34c26 0%, #f06529 100%);
  color: white;
}

.language-tag[data-lang='css'] {
  background: linear-gradient(135deg, #264de4 0%, #2965f1 100%);
  color: white;
}

.language-tag[data-lang='vue'] {
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  color: white;
}

.language-tag[data-lang='react'],
.language-tag[data-lang='jsx'] {
  background: linear-gradient(135deg, #61dafb 0%, #282c34 100%);
  color: #000;
}

.language-tag[data-lang='php'] {
  background: linear-gradient(135deg, #777bb4 0%, #4f5b93 100%);
  color: white;
}

.language-tag[data-lang='go'] {
  background: linear-gradient(135deg, #00add8 0%, #007d9c 100%);
  color: white;
}

.language-tag[data-lang='rust'] {
  background: linear-gradient(135deg, #ce422b 0%, #a73e24 100%);
  color: white;
}

.language-tag[data-lang='sql'] {
  background: linear-gradient(135deg, #336791 0%, #1e4d7b 100%);
  color: white;
}

.language-tag[data-lang='bash'],
.language-tag[data-lang='shell'] {
  background: linear-gradient(135deg, #4eaa25 0%, #3a7c1f 100%);
  color: white;
}

/* 默认样式 */
.language-tag:not([data-lang]) {
  background: linear-gradient(135deg, #61afef 0%, #4a9fd8 100%);
  color: white;
}

.lang-icon {
  font-size: 0.9em;
  margin-right: 2px;
}

.line-count {
  color: #888;
  font-size: 0.85em;
}

.code-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: transparent;
  border: 1px solid #4a4a4a;
  color: #abb2bf;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9em;
}

.action-btn:hover {
  background: #3e4451;
  border-color: #5c6370;
  color: white;
}

.copy-btn:hover {
  border-color: #4caf50;
}

.expand-btn:hover {
  border-color: #2196f3;
}

.code-content {
  position: relative;
  overflow-x: auto;
}

.code-content.collapsed {
  max-height: 400px;
  overflow: hidden;
}

.code-content pre,
.code-content pre *,
.code-content code,
.code-content code * {
  font-family: 'JetBrains Mono', 'Consolas' !important;
  font-weight: 400 !important;
}

.code-content pre {
  margin: 0;
  padding: 16px;
  background: transparent;
  font-size: 1em;
  line-height: 1.6;
  color: #abb2bf;
  letter-spacing: 0.3px;
}

.code-content code {
  background: transparent;
  color: inherit;
  font-family: 'JetBrains Mono', 'Consolas' !important;
  font-weight: 600;
}

.expand-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #21252b;
  color: #abb2bf;
  cursor: pointer;
  font-size: 0.9em;
  border-top: 1px solid #3e4451;
  transition: all 0.2s ease;
}

.expand-hint:hover {
  background: #3e4451;
  color: white;
}

.expand-hint i {
  font-size: 0.8em;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .code-header {
    padding: 10px 12px;
    font-size: 0.85em;
  }

  .code-info {
    gap: 8px;
  }

  .language-tag {
    padding: 1px 6px;
    font-size: 0.75em;
  }

  .action-btn {
    padding: 4px 8px;
    font-size: 0.85em;
  }

  .code-content pre {
    padding: 12px;
    font-size: 0.95em;
  }

  .expand-hint {
    padding: 10px 12px;
    font-size: 0.85em;
  }
}

@media (max-width: 480px) {
  .code-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .code-actions {
    align-self: flex-end;
  }
}
</style>
