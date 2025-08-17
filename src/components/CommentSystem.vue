<template>
  <div class="comment-system">
    <!-- 根据配置显示对应的评论系统 -->
    <GitalkComments
      v-if="commentConfig.type === 'gitalk' && commentConfig.enabled !== false"
      :post-slug="postSlug"
    />

    <ValineComments
      v-else-if="commentConfig.type === 'valine' && commentConfig.enabled !== false"
      :post-slug="postSlug"
    />

    <!-- 评论关闭提示 -->
    <div v-else-if="commentConfig.enabled === false" class="comment-disabled">
      <p>评论功能已关闭</p>
    </div>

    <!-- 默认显示Gitalk -->
    <GitalkComments v-else :post-slug="postSlug" :gitalk-config="commentConfig.gitalk" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useCommentsStore } from '../stores/comments.js'
import GitalkComments from './GitalkComments.vue'
import ValineComments from './ValineComments.vue'

const props = defineProps({
  postSlug: {
    type: String,
    required: true,
  },
  // 文章级别的评论配置，会覆盖全局配置
  articleCommentConfig: {
    type: Object,
    default: () => ({}),
  },
})

const commentStore = useCommentsStore()
const commentConfig = ref({})

// 合并全局配置和文章配置
const mergeConfig = () => {
  const globalConfig = commentStore.getCommentConfig()
  const config = { ...globalConfig }

  // 文章级别配置覆盖全局配置
  if (props.articleCommentConfig.type) {
    config.type = props.articleCommentConfig.type
  }
  if (props.articleCommentConfig.enabled !== undefined) {
    config.enabled = props.articleCommentConfig.enabled
  }
  if (props.articleCommentConfig.valine) {
    config.valine = { ...config.valine, ...props.articleCommentConfig.valine }
  }

  commentConfig.value = config
}

onMounted(async () => {
  // 加载评论配置
  await commentStore.loadCommentConfig()
  mergeConfig()
})

// 监听store中评论配置的变化
watch(
  () => commentStore.commentConfig.value,
  () => {
    mergeConfig()
  },
  { deep: true },
)
</script>

<style scoped>
.comment-system {
  margin-top: 2rem;
}

.comment-disabled {
  text-align: center;
  padding: 2rem;
  color: var(--text-light-color, #666);
  font-style: italic;
  background: var(--bg-light-color, #f8f9fa);
  border-radius: 8px;
  border: 1px dashed var(--border-color, #dee2e6);
}

.comment-disabled p {
  margin: 0;
}
</style>
