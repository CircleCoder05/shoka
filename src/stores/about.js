import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { apiGet } from '@/services/api'
import { useBlogStore } from './blog'

const defaults = {
  portrait_url: null,
  introduction: '',
  traits: [],
  skills: [],
  timeline: [],
  snapshots: [],
  contact_email: '',
  contact_message: '',
}

export const useAboutStore = defineStore('about', () => {
  const profile = reactive({ ...defaults })
  const loading = ref(false)
  const error = ref(null)

  async function loadAboutData() {
    loading.value = true
    error.value = null
    try {
      const blogStore = useBlogStore()
      await blogStore.load()
      Object.assign(profile, defaults, await apiGet(`/api/blogs/${encodeURIComponent(blogStore.selectedSlug)}/profile`))
    } catch (reason) {
      error.value = reason.message
    } finally {
      loading.value = false
    }
  }

  return { profile, loading, error, loadAboutData }
})
