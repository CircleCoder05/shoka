import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { apiGet } from '@/services/api'

const DEFAULT_BLOG = import.meta.env.VITE_BLOG_SLUG || 'circlecoder'

export const useBlogStore = defineStore('blog', () => {
  const selectedSlug = ref(localStorage.getItem('shoka_blog') || DEFAULT_BLOG)
  const directory = ref([])
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const blog = computed(() => data.value?.blog || null)
  const posts = computed(() => data.value?.posts || [])
  const categories = computed(() => data.value?.categories || [])

  const loadDirectory = async () => {
    directory.value = await apiGet('/api/blogs')
  }

  const load = async (force = false) => {
    if (!force && data.value?.blog?.slug === selectedSlug.value) return data.value
    loading.value = true
    error.value = null
    try {
      data.value = await apiGet(`/api/blogs/${encodeURIComponent(selectedSlug.value)}`)
      return data.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const select = async (slug) => {
    selectedSlug.value = slug
    localStorage.setItem('shoka_blog', slug)
    data.value = null
    await load(true)
  }

  return { selectedSlug, directory, data, blog, posts, categories, loading, error, loadDirectory, load, select }
})
