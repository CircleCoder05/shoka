<template>
  <div class="valine-comments-section">
    <!-- Valine 容器 -->
    <div class="valine-container" ref="valineContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useCommentsStore } from '../stores/comments.js'
import Valine from 'valine'

const props = defineProps({
  postSlug: {
    type: String,
    required: true,
  },
})

const commentStore = useCommentsStore()
const valineContainer = ref(null)
const valineInstance = ref(null)

// 获取Valine配置
const valineConfig = computed(() => {
  return commentStore.getCommentSystemConfig('valine') || {}
})

// 初始化Valine
const initValine = () => {
  try {
    console.log('开始初始化Valine...')
    console.log('配置:', valineConfig.value)

    // 创建Valine实例
    valineInstance.value = new Valine({
      el: valineContainer.value,
      appId: valineConfig.value.appId,
      appKey: valineConfig.value.appKey,
      placeholder: valineConfig.value.placeholder || 'ヽ(○´∀`)ﾉ♪',
      pageSize: valineConfig.value.pageSize || 10,
      lang: valineConfig.value.lang || 'zh-CN',
      visitor: valineConfig.value.visitor !== false,
      NoRecordIP: valineConfig.value.NoRecordIP || false,
      serverURLs: valineConfig.value.serverURLs,
      avatar: valineConfig.value.avatar || 'retro',
      avatarCDN: valineConfig.value.avatar_cdn || 'https://cravatar.cn/avatar/',
      powerMode: valineConfig.value.powerMode !== false,
      tagMeta: valineConfig.value.tagMeta || {
        visitor: '新朋友',
        master: '主人',
        friend: '小伙伴',
        investor: '金主粑粑',
      },
      tagColor: valineConfig.value.tagColor || {
        master: 'var(--color-orange)',
        friend: 'var(--color-aqua)',
        investor: 'var(--color-pink)',
      },
      tagMember: valineConfig.value.tagMember || {
        master: [],
        friend: [],
        investor: [],
      },
      path: props.postSlug,
      // 其他配置项
      emojiCDN: valineConfig.value.emojiCDN || 'https://cdn.jsdelivr.net/npm/emoji-mart@latest',
      emojiMaps: valineConfig.value.emojiMaps || {},
      enableQQ: true,
      requiredFields: ['nick', 'mail'],
      meta: ['nick', 'mail', 'link'],
      highlight: true,
      enable: true,
    })

    console.log('Valine 初始化成功')
  } catch (error) {
    console.error('Valine 初始化失败:', error)
  }
}

// 监听配置变化
watch(
  () => valineConfig.value,
  () => {
    if (valineInstance.value) {
      // 销毁旧实例
      valineInstance.value.destroy()
      // 重新初始化
      initValine()
    }
  },
  { deep: true },
)

onMounted(() => {
  initValine()
})
</script>

<style scoped>
.valine-comments-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--bg-color, #fff);
  border: 1px solid var(--border-color, #e1e4e8);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.valine-comments-section:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.valine-container {
  min-height: 200px;
}

/* 暗色主题支持 */
html.dark-theme .valine-comments-section {
  background: #383c4a;
  border-color: var(--border-dark-color, #3e4451);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

html.dark-theme .valine-comments-section:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

/* Valine 基础样式优化 */
.v {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.6;
}

/* 评论框样式 */
.v .vwrap {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.v .vwrap .vheader {
  padding: 1rem;
  background: var(--bg-light-color, #f8f9fa);
  border-bottom: 1px solid var(--border-color, #e1e4e8);
}

.v .vwrap .vheader .vinput {
  border: 1px solid var(--border-color, #d1d5da);
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: var(--bg-color, #fff);
  color: var(--text-color, #24292e);
}

.v .vwrap .vheader .vinput:focus {
  outline: none;
  border-color: var(--primary-color, #0366d6);
  box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
}

.v .vwrap .vheader .vinput::placeholder {
  color: var(--text-light-color, #6a737d);
}

.v .vwrap .vbtn {
  background: var(--primary-color, #0366d6);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.v .vwrap .vbtn:hover {
  background: var(--primary-dark-color, #0256cc);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(3, 102, 214, 0.3);
}

.v .vwrap .vbtn:active {
  transform: translateY(0);
}

/* 评论列表样式 */
.v .vlist {
  margin-top: 1rem;
}

.v .vlist .vcard {
  border: 1px solid var(--border-color, #e1e4e8);
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.2s ease;
}

.v .vlist .vcard:hover {
  border-color: var(--primary-color, #0366d6);
  box-shadow: 0 2px 8px rgba(3, 102, 214, 0.1);
}

.v .vlist .vcard .vcontent {
  padding: 1rem;
  color: var(--text-color, #24292e);
  font-size: 0.95rem;
  line-height: 1.6;
}

.v .vlist .vcard .vhead {
  background: var(--bg-light-color, #f6f8fa);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color, #e1e4e8);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.v .vlist .vcard .vhead .vname {
  color: var(--primary-color, #0366d6);
  font-weight: 600;
  text-decoration: none;
}

.v .vlist .vcard .vhead .vname:hover {
  text-decoration: underline;
}

.v .vlist .vcard .vhead .vtime {
  color: var(--text-light-color, #6a737d);
  font-size: 0.85rem;
}

.v .vlist .vcard .vhead .vtag {
  background: var(--primary-color, #0366d6);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* 暗色主题样式覆盖 */
html.dark-theme .v .vwrap {
  background: var(--bg-dark-light-color, #383c4a);
  border-color: var(--border-dark-color, #3e4451);
}

html.dark-theme .v .vwrap .vheader {
  background: var(--bg-dark-color, #2c313c);
  border-color: var(--border-dark-color, #3e4451);
}

html.dark-theme .v .vwrap .vheader .vinput {
  background: var(--bg-dark-color, #2c313c);
  color: var(--text-dark-color, #abb2bf);
  border-color: var(--border-dark-color, #3e4451);
}

html.dark-theme .v .vwrap .vheader .vinput:focus {
  border-color: var(--primary-dark-color, #61afef);
  box-shadow: 0 0 0 3px rgba(97, 175, 239, 0.2);
}

html.dark-theme .v .vwrap .vheader .vinput::placeholder {
  color: var(--text-light-dark-color, #7f848e);
}

html.dark-theme .v .vwrap .vbtn {
  background: var(--primary-dark-color, #61afef);
}

html.dark-theme .v .vwrap .vbtn:hover {
  background: var(--primary-dark-dark-color, #569cd6);
  box-shadow: 0 4px 8px rgba(97, 175, 239, 0.3);
}

html.dark-theme .v .vlist .vcard {
  background: var(--bg-dark-color, #2c313c);
  border-color: var(--border-dark-color, #3e4451);
}

html.dark-theme .v .vlist .vcard:hover {
  border-color: var(--primary-dark-color, #61afef);
  box-shadow: 0 2px 8px rgba(97, 175, 239, 0.2);
}

html.dark-theme .v .vlist .vcard .vcontent {
  color: var(--text-dark-color, #abb2bf) !important;
  background: #383c4a !important;
}

html.dark-theme .v .vlist .vcard .vhead {
  background: var(--bg-dark-light-color, #383c4a);
  border-color: var(--border-dark-color, #3e4451);
}

html.dark-theme .v .vlist .vcard .vhead .vname {
  color: var(--primary-dark-color, #61afef);
}

html.dark-theme .v .vlist .vcard .vhead .vtime {
  color: var(--text-light-dark-color, #7f848e);
}

html.dark-theme .v .vlist .vcard .vhead .vtag {
  background: var(--primary-dark-color, #61afef);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .valine-comments-section {
    padding: 1rem;
    margin-top: 1.5rem;
  }

  .v .vwrap .vheader {
    padding: 0.75rem;
  }

  .v .vwrap .vheader .vinput {
    padding: 0.5rem;
    font-size: 0.85rem;
  }

  .v .vwrap .vbtn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .v .vlist .vcard .vcontent {
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  .v .vlist .vcard .vhead {
    padding: 0.5rem 0.75rem;
  }
}

/* 动画效果 */
.v .vlist .vcard {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滚动条样式 */
.v ::-webkit-scrollbar {
  width: 6px;
}

.v ::-webkit-scrollbar-track {
  background: var(--bg-light-color, #f1f1f1);
  border-radius: 3px;
}

.v ::-webkit-scrollbar-thumb {
  background: var(--border-color, #c1c1c1);
  border-radius: 3px;
}

.v ::-webkit-scrollbar-thumb:hover {
  background: var(--text-light-color, #a8a8a8);
}

html.dark-theme .v ::-webkit-scrollbar-track {
  background: var(--bg-dark-color, #2c313c);
}

html.dark-theme .v ::-webkit-scrollbar-thumb {
  background: var(--border-dark-color, #3e4451);
}

html.dark-theme .v ::-webkit-scrollbar-thumb:hover {
  background: var(--text-light-dark-color, #7f848e);
}

:deep(.vcontent) {
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.vcontent p) {
  margin: 0 !important;
  margin-block-start: 0 !important;
  margin-block-end: 0 !important;
}
</style>
