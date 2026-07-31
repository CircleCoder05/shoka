<template>
  <div class="auth-page">
    <section class="auth-card">
      <p class="auth-eyebrow">SHOKA BLOG</p>
      <h1>{{ isRegister ? '创建你的博客' : '欢迎回来' }}</h1>
      <p class="auth-intro">{{ isRegister ? '注册后即可拥有独立博客和管理后台。' : '登录后管理简介、分类与文章。' }}</p>
      <form @submit.prevent="submit">
        <label v-if="isRegister">用户名<input v-model.trim="form.username" required minlength="3" autocomplete="username" /></label>
        <label v-if="isRegister">邮箱<input v-model.trim="form.email" required type="email" autocomplete="email" /></label>
        <label v-else>用户名或邮箱<input v-model.trim="form.identity" required autocomplete="username" /></label>
        <label>密码<input v-model="form.password" required type="password" minlength="8" autocomplete="current-password" /></label>
        <p v-if="error" class="form-error">{{ error }}</p>
        <button :disabled="submitting">{{ submitting ? '请稍候…' : isRegister ? '注册并进入后台' : '登录' }}</button>
      </form>
      <router-link :to="isRegister ? '/login' : '/register'">
        {{ isRegister ? '已有账号？登录' : '没有账号？注册' }}
      </router-link>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import '@/styles/pages/auth.scss'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const isRegister = computed(() => route.name === 'register')
const form = reactive({ username: '', email: '', identity: '', password: '' })
const error = ref('')
const submitting = ref(false)

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    const payload = isRegister.value
      ? { username: form.username, email: form.email, password: form.password }
      : { identity: form.identity, password: form.password }
    await auth.authenticate(isRegister.value ? 'register' : 'login', payload)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>
