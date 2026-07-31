import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

// 生产环境用同域 /api，开发时 Vite proxy 会转发到后端
const STREAM_BASE = import.meta.env.DEV ? 'http://127.0.0.1:8000' : ''

const HISTORY_KEY = 'shoka_pet_chat'

export const usePetStore = defineStore('pet', () => {
  const chatVisible = ref(false)
  const thinking = ref(false)
  const messages = ref([])
  const currentPostSlug = ref('')
  const blogSlug = ref(localStorage.getItem('shoka_blog') || import.meta.env.VITE_BLOG_SLUG || 'circlecoder')
  const petName = ref('小助手')
  const petEnabled = ref(true)
  const thinkingEnabled = ref(false)
  const characters = ref([])
  const activeCharacter = ref('ikun')
  let petApi = null

  function setPetInstance(api) { petApi = api }
  function getPetInstance() { return petApi }

  // 当前激活宠物对象（含 name/image_url/system_prompt），找不到时回退到第一个
  const petCharacter = computed(() =>
    characters.value.find((c) => c.character_key === activeCharacter.value) ||
    characters.value[0] ||
    { character_key: 'ikun', name: '小助手', image_url: '', system_prompt: '' }
  )

  async function loadPetConfig(blog) {
    try {
      const resp = await fetch(`/api/pet/config/${blog}`)
      if (resp.ok) {
        const data = await resp.json()
        characters.value = data.characters || []
        petEnabled.value = data.pet_enabled !== false
        thinkingEnabled.value = data.pet_thinking_enabled === true
        activeCharacter.value = data.active_character || 'ikun'
        const active = petCharacter.value
        petName.value = active?.name || '小助手'
      }
    } catch (err) {
      console.warn('[PetStore] loadPetConfig failed, using defaults:', err)
    }
  }

  // 后端按 NDJSON（每行一个 {"r": 思维链, "c": 正文}）流式返回
  async function readNDJSON(reader, decoder, onData) {
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let nl
      while ((nl = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, nl).trim()
        buffer = buffer.slice(nl + 1)
        if (!line) continue
        try {
          onData(JSON.parse(line))
        } catch {
          console.warn('[PetStore] bad NDJSON line:', line)
        }
      }
    }
  }

  function historyKey() {
    return `${HISTORY_KEY}_${blogSlug.value}_${currentPostSlug.value}`
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(historyKey())
      messages.value = raw ? JSON.parse(raw) : []
    } catch { messages.value = [] }
  }

  function saveHistory() {
    if (messages.value.length > 0) {
      localStorage.setItem(historyKey(), JSON.stringify(messages.value.slice(-40)))
    }
  }

  function clearHistory() {
    messages.value = []
    localStorage.removeItem(historyKey())
  }

  async function fetchSummary(blog, postSlug, title) {
    currentPostSlug.value = postSlug
    blogSlug.value = blog
    loadHistory()
    if (messages.value.length > 0) return
    thinking.value = true
    chatVisible.value = true
    try {
      const token = localStorage.getItem('shoka_token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const resp = await fetch(`${STREAM_BASE}/api/pet/summarize/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ blog_slug: blog, post_slug: postSlug }),
      })
      if (!resp.ok) throw new Error('Summarize failed')
      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      messages.value.push({ role: 'assistant', content: '', reasoning: '' })
      const idx = messages.value.length - 1
      await readNDJSON(reader, decoder, (line) => {
        if (line.r) messages.value[idx].reasoning += line.r
        if (line.c) messages.value[idx].content += line.c
      })
      // 摘要文本已在 messages 中流式显示，不需要再调 petApi.say()
    } catch (err) {
      console.error('[PetStore] fetchSummary error:', err)
      // 移除失败的流式占位消息，关闭空窗口
      if (messages.value.length === 1 && !messages.value[0].content) {
        messages.value = []
        chatVisible.value = false
      }
    } finally {
      thinking.value = false
      saveHistory()
    }
  }

  async function sendMessage(text) {
    console.log('[PetStore] sendMessage called:', text, 'thinking:', thinking.value)
    if (!text.trim() || thinking.value) return
    messages.value.push({ role: 'user', content: text })
    thinking.value = true
    if (petApi) petApi.setState('thinking')
    saveHistory()

    try {
      const token = localStorage.getItem('shoka_token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const url = `${STREAM_BASE}/api/pet/chat`
      console.log('[PetStore] fetching chat:', url)
      const resp = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          blog_slug: blogSlug.value,
          post_slug: currentPostSlug.value,
          history: messages.value.slice(-21),
          message: text,
        }),
      })
      console.log('[PetStore] chat response status:', resp.status)
      if (!resp.ok) throw new Error('Chat failed: ' + resp.status)
      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let reply = ''
      messages.value.push({ role: 'assistant', content: '', reasoning: '' })
      const idx = messages.value.length - 1
      await readNDJSON(reader, decoder, (line) => {
        if (line.r) messages.value[idx].reasoning += line.r
        if (line.c) messages.value[idx].content += line.c
        reply += line.c || ''
      })
      console.log('[PetStore] chat complete, reply length:', reply.length)
    } catch (err) {
      console.error('[PetStore] sendMessage error:', err)
      // 移除失败的流式占位消息，再追加错误提示
      if (messages.value.length > 0 && !messages.value[messages.value.length - 1].content) {
        messages.value.pop()
      }
      messages.value.push({ role: 'assistant', content: '呜~ 脑子有点乱，稍等再问我吧！' })
    } finally {
      thinking.value = false
      if (petApi) petApi.setState('idle')
      saveHistory()
    }
  }

  function enterArticle(blog, postSlug, title) {
    if (currentPostSlug.value !== postSlug) {
      fetchSummary(blog, postSlug, title)
    }
  }

  return {
    chatVisible, thinking, messages, currentPostSlug, blogSlug,
    petName, petEnabled, thinkingEnabled, characters, activeCharacter, petCharacter,
    setPetInstance, getPetInstance, loadPetConfig,
    loadHistory, saveHistory, clearHistory,
    fetchSummary, sendMessage, enterArticle,
  }
})
