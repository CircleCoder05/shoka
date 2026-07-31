import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useBlogStore } from './blog'

export const useConfigStore = defineStore('config', () => {
  const config = ref(null)
  const loading = ref(false)
  const error = ref(null)
  let forceNextLoad = false

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

  const socialCatalog = [
    { key: 'github', label: 'GitHub', icon: 'i-github' },
    { key: 'music', label: '网易云音乐', icon: 'i-cloud-music' },
    { key: 'email', label: '邮箱', icon: 'i-envelope' },
    { key: 'twitter', label: 'Twitter', icon: 'i-twitter' },
    { key: 'facebook', label: 'Facebook', icon: 'i-facebook' },
    { key: 'youtube', label: 'YouTube', icon: 'i-youtube' },
    { key: 'weibo', label: '微博', icon: 'i-weibo' },
    { key: 'bilibili', label: 'B站', icon: 'i-tv' },
  ]

  const resolveSocial = (blog) => {
    const hasConfiguredList = Array.isArray(blog.settings?.social_links_list)
    const configuredList = hasConfiguredList ? blog.settings.social_links_list : []
    if (hasConfiguredList) {
      return configuredList
        .filter((item) => item?.url)
        .map((item) => {
          const catalogItem = socialCatalog.find((entry) => entry.key === item.key)
          return {
            name: item.key || 'link',
            label: item.label || catalogItem?.label || item.key || '链接',
            icon: catalogItem?.icon || 'i-link',
            url: item.url,
          }
        })
    }

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
    return socialCatalog
      .map((item) => ({
        name: item.key,
        label: item.label,
        icon: item.icon,
        url: resolvedLinks[item.key],
      }))
      .filter((item) => item.url)
  }

  // 加载配置
  const loadConfig = async () => {
    if (config.value) return config.value

    loading.value = true
    error.value = null

    try {
      const blogStore = useBlogStore()
      const data = await blogStore.load(forceNextLoad)
      forceNextLoad = false
      const blog = data.blog
      const social = resolveSocial(blog).map((item) => ({
        ...item,
        url: item.name === 'email' && !item.url.startsWith('mailto:') ? `mailto:${item.url}` : item.url,
      }))
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

  const invalidateConfig = () => {
    config.value = null
    forceNextLoad = true
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
    invalidateConfig,
    applyAppearance,
  }
})
