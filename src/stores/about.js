import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAboutStore = defineStore('about', () => {
  // 状态
  const aboutData = ref({})
  const loading = ref(false)
  const error = ref(null)

  // 加载关于页面数据
  const loadAboutData = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/about.json')
      if (!response.ok) {
        throw new Error('Failed to load about data')
      }
      aboutData.value = await response.json()
    } catch (err) {
      error.value = err.message
      console.error('Failed to load about data:', err)
    } finally {
      loading.value = false
    }
  }

  // 通用数据获取方法
  const getData = (key) => {
    return aboutData.value[key] || {}
  }

  // 获取个人信息数据
  const getProfileData = () => {
    return getData('profile')
  }

  // 获取3D模型数据
  const getModel3dData = () => {
    return (
      aboutData.value.model3d || {
        title: '我的3D形象',
        modelKey: 'joseph02',
      }
    )
  }

  // 获取信息盒子数据 - 通用方法
  const getInfoBoxes = () => {
    const boxes = {}

    // 遍历aboutData中除了profile和model3d之外的所有数据
    Object.keys(aboutData.value).forEach((key) => {
      if (key !== 'profile' && key !== 'model3d') {
        const data = aboutData.value[key]

        // 构建通用盒子数据
        const boxData = {
          title: data.title,
          image: data.image || null,
          sections: {},
        }

        // 处理sections数据
        Object.keys(data).forEach((sectionKey) => {
          if (sectionKey !== 'title' && sectionKey !== 'image') {
            const section = data[sectionKey]

            if (typeof section === 'object' && section !== null && !Array.isArray(section)) {
              // 如果是对象（非数组），直接作为section
              boxData.sections[sectionKey] = section
            } else if (Array.isArray(section)) {
              // 如果是数组，转换为content
              boxData.sections[sectionKey] = {
                content: section.join('\n\n'),
              }
            } else {
              // 如果是字符串，转换为content
              boxData.sections[sectionKey] = {
                content: section,
              }
            }
          }
        })

        boxes[key] = boxData
      }
    })

    return boxes
  }

  return {
    // 状态
    aboutData,
    loading,
    error,

    // 方法
    loadAboutData,
    getProfileData,
    getModel3dData,
    getInfoBoxes,
  }
})
