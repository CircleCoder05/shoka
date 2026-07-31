<template>
  <section class="comment-system">
    <header class="comment-heading">
      <div>
        <span class="eyebrow">DISCUSSION</span>
        <h2>评论与交流</h2>
        <p>{{ total }} 条评论 · 欢迎留下你的想法</p>
      </div>
      <button class="like-button" :class="{ liked }" :disabled="busyLike" @click="toggleLike">
        <span aria-hidden="true">♥</span>
        {{ liked ? '已点赞' : '点赞' }} {{ likeCount }}
      </button>
    </header>

    <form class="comment-form" @submit.prevent="submitComment">
      <div class="identity-fields">
        <label>昵称<input v-model.trim="form.author_name" maxlength="80" required /></label>
        <label>邮箱（不会公开）<input v-model.trim="form.author_email" type="email" /></label>
      </div>
      <label>评论<textarea v-model.trim="form.content" maxlength="5000" rows="4" required placeholder="认真交流，友善表达。"></textarea></label>
      <div class="form-actions">
        <span>{{ form.content.length }}/5000</span>
        <button class="submit-button" :disabled="submitting">{{ submitting ? '发送中…' : '发表评论' }}</button>
      </div>
    </form>

    <p v-if="error" class="comment-error">{{ error }}</p>
    <div v-if="loading" class="comment-empty">正在加载评论…</div>
    <div v-else-if="!comments.length" class="comment-empty">还没有评论，来坐第一排吧。</div>
    <div v-else class="comment-list">
      <article v-for="comment in comments" :key="comment.id" class="comment-card">
        <div class="comment-avatar">{{ comment.author_name.slice(0, 1).toUpperCase() }}</div>
        <div class="comment-body">
          <div class="comment-meta">
            <strong>{{ comment.author_name }}</strong>
            <span v-if="comment.is_owner_reply" class="owner-badge">博主</span>
            <time>{{ formatDate(comment.created_at) }}</time>
            <button v-if="isBlogOwner" class="comment-delete" @click="removeComment(comment)">删除</button>
          </div>
          <p>{{ comment.content }}</p>
          <div v-if="comment.replies?.length" class="reply-list">
            <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
              <div class="reply-meta">
                <strong>{{ reply.author_name }} <span v-if="reply.is_owner_reply">· 博主</span></strong>
                <button v-if="isBlogOwner" class="comment-delete" @click="removeComment(reply)">删除</button>
              </div>
              <p>{{ reply.content }}</p>
              <time>{{ formatDate(reply.created_at) }}</time>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { apiDelete, apiGet, apiPost } from '@/services/api'
import { useBlogStore } from '@/stores/blog'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({ postSlug: { type: String, required: true } })
const blogStore = useBlogStore()
const authStore = useAuthStore()
const comments = ref([])
const total = ref(0)
const likeCount = ref(0)
const liked = ref(false)
const loading = ref(false)
const submitting = ref(false)
const busyLike = ref(false)
const error = ref('')
const isBlogOwner = computed(() =>
  Boolean(authStore.user?.id && authStore.user.id === blogStore.blog?.owner_id),
)
const form = reactive({
  author_name: localStorage.getItem('shoka_comment_name') || '',
  author_email: localStorage.getItem('shoka_comment_email') || '',
  content: '',
})

function visitorKey() {
  let key = localStorage.getItem('shoka_visitor_key')
  if (!key) {
    key = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
    localStorage.setItem('shoka_visitor_key', key)
  }
  return key
}
const basePath = () =>
  `/api/blogs/${encodeURIComponent(blogStore.selectedSlug)}/posts/${props.postSlug}`

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [thread, likes] = await Promise.all([
      apiGet(`${basePath()}/comments`),
      apiGet(`${basePath()}/likes?client_key=${encodeURIComponent(visitorKey())}`),
    ])
    comments.value = thread.comments
    total.value = thread.total
    likeCount.value = likes.count
    liked.value = likes.liked
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
async function submitComment() {
  submitting.value = true
  error.value = ''
  try {
    await apiPost(`${basePath()}/comments`, form)
    localStorage.setItem('shoka_comment_name', form.author_name)
    localStorage.setItem('shoka_comment_email', form.author_email)
    form.content = ''
    await load()
  } catch (err) {
    error.value = err.message
  } finally {
    submitting.value = false
  }
}
async function toggleLike() {
  busyLike.value = true
  try {
    const result = await apiPost(`${basePath()}/likes`, { client_key: visitorKey() })
    likeCount.value = result.count
    liked.value = result.liked
  } catch (err) {
    error.value = err.message
  } finally {
    busyLike.value = false
  }
}
async function removeComment(comment) {
  if (!confirm('删除这条评论？此操作会同时删除它的回复。')) return
  error.value = ''
  try {
    await apiDelete(`/api/dashboard/comments/${comment.id}`)
    await load()
  } catch (err) {
    error.value = err.message
  }
}
const formatDate = (value) => new Date(value).toLocaleString('zh-CN', { dateStyle: 'medium', timeStyle: 'short' })

onMounted(load)
watch(() => props.postSlug, load)
</script>

<style scoped lang="scss" src="@/styles/sfc/components/CommentSystem.scss"></style>
