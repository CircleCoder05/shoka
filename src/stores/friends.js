import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBlogStore } from './blog'

export const useFriendsStore = defineStore('friends', () => {
  const friends = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 计算属性：获取所有友链
  const allFriends = computed(() => {
    return friends.value
  })

  // 计算属性：获取友链总数
  const totalFriends = computed(() => {
    return friends.value.reduce((total, category) => {
      return total + category.items.length
    }, 0)
  })

  // 计算属性：获取分类总数
  const totalCategories = computed(() => {
    return friends.value.length
  })

  // 加载友链数据
  const loadFriends = async () => {
    loading.value = true
    error.value = null

    try {
      const blogStore = useBlogStore()
      const data = await blogStore.load()
      const rows = data.friends || []
      friends.value = rows.reduce((groups, item) => {
        let group = groups.find((entry) => entry.category === item.category)
        if (!group) {
          group = { category: item.category, description: '', items: [] }
          groups.push(group)
        }
        group.items.push({
          id: item.id,
          name: item.name,
          url: item.url,
          avatar: item.avatar_url,
          description: item.description,
          tags: item.tags || [],
          backgroundColor: item.background,
        })
        return groups
      }, [])
    } catch (err) {
      error.value = err.message
      console.error('Failed to load friends:', err)
    } finally {
      loading.value = false
    }
  }

  // 根据分类获取友链
  const getFriendsByCategory = (categoryName) => {
    const category = friends.value.find((cat) => cat.category === categoryName)
    return category ? category.items : []
  }

  // 搜索友链
  const searchFriends = (query) => {
    if (!query) return friends.value

    const searchTerm = query.toLowerCase()
    return friends.value
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (friend) =>
            friend.name.toLowerCase().includes(searchTerm) ||
            friend.description.toLowerCase().includes(searchTerm) ||
            friend.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
        ),
      }))
      .filter((category) => category.items.length > 0)
  }

  return {
    friends,
    loading,
    error,
    allFriends,
    totalFriends,
    totalCategories,
    loadFriends,
    getFriendsByCategory,
    searchFriends,
  }
})
