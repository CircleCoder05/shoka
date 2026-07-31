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

<style scoped lang="scss" src="@/styles/sfc/components/ValineComments.scss"></style>
