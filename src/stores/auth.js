import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { apiGet, apiPost } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const ready = ref(false)
  const authenticated = computed(() => Boolean(user.value))

  const restore = async () => {
    if (!localStorage.getItem('shoka_token')) {
      ready.value = true
      return
    }
    try {
      user.value = await apiGet('/api/auth/me')
    } catch {
      localStorage.removeItem('shoka_token')
    } finally {
      ready.value = true
    }
  }

  const authenticate = async (mode, values) => {
    const result = await apiPost(`/api/auth/${mode}`, values)
    localStorage.setItem('shoka_token', result.access_token)
    user.value = result.user
    return result.user
  }

  const logout = () => {
    localStorage.removeItem('shoka_token')
    user.value = null
  }

  return { user, ready, authenticated, restore, authenticate, logout }
})
