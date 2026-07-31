import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useBlogStore } from './blog'

export const useConfigStore = defineStore('config', () => {
  const config = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const applyAppearance = (appearance = {}) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (appearance.accent) {
      root.style.setProperty('--color-pink', appearance.accent)
      root.style.setProperty('--primary-color', appearance.accent)
    }
    document.body.style.backgroundImage = appearance.background_url
      ? `url("${appearance.background_url}")`
      : ''
    document.body.style.backgroundSize = appearance.background_url ? 'cover' : ''
    document.body.style.backgroundAttachment = appearance.background_url ? 'fixed' : ''
  }

  // 加载配置
  const loadConfig = async () => {
    if (config.value) return config.value

    loading.value = true
    error.value = null

    try {
      const blogStore = useBlogStore()
      const data = await blogStore.load()
      const blog = data.blog
      const links = blog.settings?.social_links || {}
      const legacyLinks = blog.slug === 'circlecoder' ? {
        github: 'https://github.com/CircleCoder05',
        music: 'https://music.163.com/#/user/home?id=yourid',
        email: 'mailto:3196932484@qq.com',
        twitter: 'https://twitter.com/yourname',
        facebook: 'https://facebook.com/yourname',
        youtube: 'https://youtube.com/yourname',
      } : {}
      const resolvedLinks = Object.keys(links).some(key => links[key]) ? links : legacyLinks
      const social = [
        { name: 'github', icon: 'i-github', url: resolvedLinks.github },
        { name: 'music', icon: 'i-cloud-music', url: resolvedLinks.music },
        { name: 'email', icon: 'i-envelope', url: resolvedLinks.email && !resolvedLinks.email.startsWith('mailto:') ? `mailto:${resolvedLinks.email}` : resolvedLinks.email },
        { name: 'twitter', icon: 'i-twitter', url: resolvedLinks.twitter },
        { name: 'facebook', icon: 'i-facebook', url: resolvedLinks.facebook },
        { name: 'youtube', icon: 'i-youtube', url: resolvedLinks.youtube },
        { name: 'weibo', icon: 'i-weibo', url: resolvedLinks.weibo },
        { name: 'bilibili', icon: 'i-tv', url: resolvedLinks.bilibili },
      ].filter(item => item.url)
      config.value = {
        site: {
          ...(blog.settings || {}),
          bannerTitle: blog.title, bannerSubtitle: blog.subtitle, description: blog.description,
          author: blog.author, avatar: blog.avatar_url, motto: blog.motto,
          social,
        },
        footer: blog.footer || {},
      }
      applyAppearance(blog.settings?.appearance)
    } catch (err) {
      error.value = err.message
      console.error('Failed to load config:', err)
    } finally {
      loading.value = false
    }
  }

  // 计算属性
  const siteConfig = computed(() => config.value?.site || {})
  const colors = computed(() => siteConfig.value.colors || {})
  const fonts = computed(() => siteConfig.value.fonts || {})
  const footer = computed(() => config.value?.footer || {})

  return {
    config,
    loading,
    error,
    siteConfig,
    colors,
    fonts,
    footer,
    loadConfig,
    applyAppearance,
  }
})
