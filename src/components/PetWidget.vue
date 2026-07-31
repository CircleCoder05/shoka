<template>
  <div class="pet-root">
    <!-- 聊天窗口 — 只在启用且文章页可用 -->
    <div v-if="chatOpen" class="pet-chat" :style="chatStyle">
      <div class="pet-chat-header">
        <span>
          <span class="pet-avatar" :style="avatarStyle"></span>
          {{ petStore.petName }}
        </span>
        <div>
          <button class="pet-btn-clear" title="清空对话" @click="petStore.clearHistory()">清空</button>
          <button class="pet-btn-close" @click="chatOpen = false">✕</button>
        </div>
      </div>
      <div ref="chatBody" class="pet-chat-body">
        <div v-for="(msg, i) in displayMessages" :key="i" :class="['pet-msg', msg.role]">
          <span class="pet-msg-label">{{ msg.role === 'user' ? '你' : petStore.petName }}</span>
          <details v-if="msg.role === 'assistant' && msg.reasoning" class="pet-msg-thinking">
            <summary>思考过程</summary>
            <div class="thinking-content">{{ msg.reasoning }}</div>
          </details>
          <span class="pet-msg-text">{{ msg.content }}</span>
        </div>
        <div v-if="showThinking" class="pet-msg assistant">
          <span class="pet-msg-label">{{ petStore.petName }}</span>
          <span class="pet-msg-text thinking">
            <span class="think-dot"></span><span class="think-dot"></span><span class="think-dot"></span>
          </span>
        </div>
      </div>
      <form class="pet-chat-input" @submit.prevent="handleSend">
        <input
          ref="inputEl"
          v-model="inputText"
          :placeholder="`问${petStore.petName}关于这篇文章的任何问题…`"
          :disabled="petStore.thinking"
        />
        <button type="submit" :disabled="petStore.thinking || !inputText.trim()">发送</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePetStore } from '@/stores/pet'
import { petFrameStyle } from '@/utils/petSprite'

const route = useRoute()
const petStore = usePetStore()
const inputText = ref('')
const chatBody = ref(null)
const inputEl = ref(null)
const chatOpen = ref(false)

const PET_SIZE = 128

const avatarStyle = computed(() => {
  const char = petStore.petCharacter
  return petFrameStyle(char.image_url, 26)
})

// ---- 只在文章页才能开对话框 ----
const isArticlePage = computed(() => route.name === 'post' || route.name === 'post-demo')

watch(isArticlePage, (onArticle) => {
  if (!onArticle) chatOpen.value = false
})

// 同步 petStore 的 chatVisible（fetchSummary 会设置它）
watch(() => petStore.chatVisible, (v) => {
  if (v && isArticlePage.value) chatOpen.value = true
})

watch(chatOpen, (v) => {
  petStore.chatVisible = v
  if (v) petPosition.value = readPetPosition()
})

// ---- 打开聊天框时读取宠物当前位置，定位到宠物旁边 ----
// widget 在 auto-mount 时可能因 storageKey 未生效而写到默认 key `agent-pet:position`，
// 两个 key 都读，优先 shoka_pet。
const PET_POSITION_KEY = 'shoka_pet:position'
const PET_POSITION_KEY_FALLBACK = 'agent-pet:position'
const petPosition = ref({ right: 24, bottom: 24 })

function readPetPosition() {
  for (const key of [PET_POSITION_KEY, PET_POSITION_KEY_FALLBACK]) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const pos = JSON.parse(raw)
        if (typeof pos.right === 'number' && typeof pos.bottom === 'number') return pos
      }
    } catch { /* ignore */ }
  }
  return { right: 24, bottom: 24 }
}

const CHAT_W = 360
const CHAT_H = 440
const GAP = 10

// 根据宠物位置动态选择聊天框方向：优先上方，不够则下方，再不行左/右侧，兜底右下角
function computeChatStyle(pos) {
  const vw = window.innerWidth || 1280
  const vh = window.innerHeight || 800
  const petTop = vh - pos.bottom - PET_SIZE // 宠物顶边距视口顶
  const rightNow = () => Math.max(8, Math.min(pos.right, vw - CHAT_W - 8))

  // 上方：宠物顶边以上有足够空间
  if (petTop >= CHAT_H + GAP) {
    return { right: rightNow(), bottom: pos.bottom + PET_SIZE + GAP }
  }
  // 下方：宠物底边以下有足够空间
  if (pos.bottom >= CHAT_H + GAP) {
    return { right: rightNow(), bottom: pos.bottom - CHAT_H - GAP }
  }
  // 左右侧：宠物高度方向上可错开摆放
  const vertRoom = petTop + PET_SIZE >= CHAT_H
  const top = Math.max(8, Math.min(petTop + PET_SIZE / 2 - CHAT_H / 2, vh - CHAT_H - 8))
  const sideRight = (r) => Math.max(8, Math.min(r, vw - CHAT_W - 8))
  // 左侧（宠物左边有空间，聊天框在宠物右侧同排）
  if (vertRoom && pos.right + PET_SIZE + GAP + CHAT_W <= vw) {
    return { right: sideRight(pos.right + PET_SIZE + GAP), bottom: vh - top - CHAT_H }
  }
  // 右侧（宠物右边有空间）
  if (vertRoom && pos.right >= CHAT_W + GAP) {
    return { right: sideRight(pos.right - CHAT_W - GAP), bottom: vh - top - CHAT_H }
  }
  // 兜底：贴右下角
  return { right: Math.max(8, Math.min(24, vw - CHAT_W - 8)), bottom: 24 }
}

const chatStyle = computed(() => {
  if (!chatOpen.value) return { display: 'none' }
  const s = computeChatStyle(petPosition.value)
  return {
    '--chat-right': `${s.right}px`,
    '--chat-bottom': `${s.bottom}px`,
  }
})

// ---- 思考中过滤掉空的流式占位消息 ----
const isEmptyPlaceholder = (msg) => msg.role === 'assistant' && !msg.content && !msg.reasoning

const displayMessages = computed(() => {
  const msgs = petStore.messages
  if (!petStore.thinking || msgs.length === 0) return msgs
  const last = msgs[msgs.length - 1]
  if (isEmptyPlaceholder(last)) return msgs.slice(0, -1)
  return msgs
})

const showThinking = computed(() => {
  if (!petStore.thinking) return false
  const last = petStore.messages[petStore.messages.length - 1]
  return !last || last.role !== 'assistant' || isEmptyPlaceholder(last)
})

// ---- 初始化：加载后端配置 + 注入样式 + 绑定事件 ----
let pollTimer = null

function injectPetStyles(host) {
  if (!host?.shadowRoot) return
  const style = document.createElement('style')
  style.textContent = `
    .ap-sprite { width: ${PET_SIZE}px !important; height: ${PET_SIZE}px !important; }
    .ap-image { width: ${PET_SIZE}px !important; height: ${PET_SIZE}px !important; }
    .ap-bubble { display: none !important; }
  `
  host.shadowRoot.appendChild(style)
}

onMounted(async () => {
  const blog = localStorage.getItem('shoka_blog') || import.meta.env.VITE_BLOG_SLUG || 'circlecoder'
  await petStore.loadPetConfig(blog)

  // 等待 agent-pet auto-mount 完成
  pollTimer = setInterval(() => {
    const api = window.AgentPet
    if (!api?.mounted) return
    clearInterval(pollTimer)
    petStore.setPetInstance(api)

    if (!petStore.petEnabled) {
      // 已禁用 → 卸掉精灵，不响应点击
      api.unmount()
      return
    }

    // 更新名称
    api.configure({
      name: petStore.petName,
      storageKey: 'shoka_pet',
      imageUrl: petStore.petCharacter.image_url,
      useCodexAtlas: true,
    })
    petStore.setPetInstance(api)

    // 注入放大 + 隐藏气泡样式
    const host = document.querySelector('[data-agent-pet-host]')
    injectPetStyles(host)

    // 绑定点击：只在文章页打开聊天
    if (host) host.addEventListener('click', () => {
      if (isArticlePage.value) chatOpen.value = !chatOpen.value
    })
  }, 200)
})

onBeforeUnmount(() => { clearInterval(pollTimer) })

// ---- 后台保存配置后，即时更新精灵角色/名称 ----
let applying = false
async function applyPetConfig() {
  const api = petStore.getPetInstance()
  if (!api || applying) return
  applying = true
  try {
    if (!petStore.petEnabled) {
      if (api.mounted) api.unmount()
      return
    }
    if (!api.mounted) api.mount()
    api.configure({
      name: petStore.petName,
      storageKey: 'shoka_pet',
      imageUrl: petStore.petCharacter.image_url,
      useCodexAtlas: true,
    })
  } finally {
    applying = false
  }
}
watch(
  () => [petStore.petName, petStore.activeCharacter.value, petStore.petEnabled],
  () => applyPetConfig(),
)

// ---- 发送消息 ----
function handleSend() {
  const text = inputText.value.trim()
  if (!text) return
  petStore.sendMessage(text)
  inputText.value = ''
}

// ---- 自动滚动 ----
watch(() => petStore.messages.length, async () => {
  await nextTick()
  if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight
})

watch(
  () => {
    const last = petStore.messages[petStore.messages.length - 1]
    return (last?.content?.length || 0) + (last?.reasoning?.length || 0)
  },
  async () => {
    await nextTick()
    if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
)
</script>

<style scoped lang="scss" src="@/styles/sfc/components/PetWidget.scss"></style>
