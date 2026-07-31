<template>
  <div class="toc-container">
    <!-- 自动折叠开关 -->
    <div class="toc-controls">
      <div class="toggle-switch" @click="toggleAutoCollapse" title="自动折叠">
        <div class="toggle-slider" :class="{ active: autoCollapseEnabled }">
          <span class="toggle-text">{{ autoCollapseEnabled ? '自动折叠' : '手动' }}</span>
        </div>
      </div>
    </div>

    <div class="toc-content" v-if="tocItems.length > 0">
      <ul class="toc-list">
        <li v-for="item in tocItems" :key="item.id" :class="getTocItemClass(item)">
          <div class="toc-item-wrapper">
            <a :href="`#${item.id}`" class="toc-link" @click="scrollToAnchor(item.id, $event)">
              {{ item.text }}
            </a>
            <span
              v-if="!autoCollapseEnabled && item.children && item.children.length"
              class="toc-toggle"
              :class="{ expanded: expandedItems.has(item.id) }"
              @click="toggleItem(item.id)"
            >
              ▶
            </span>
          </div>
          <ul
            v-if="item.children && item.children.length"
            class="toc-children"
            :class="{ expanded: expandedItems.has(item.id) }"
          >
            <li v-for="child in item.children" :key="child.id" :class="getTocItemClass(child)">
              <div class="toc-item-wrapper">
                <a
                  :href="`#${child.id}`"
                  class="toc-link"
                  @click="scrollToAnchor(child.id, $event)"
                >
                  {{ child.text }}
                </a>
                <span
                  v-if="!autoCollapseEnabled && child.children && child.children.length"
                  class="toc-toggle"
                  :class="{ expanded: expandedItems.has(child.id) }"
                  @click="toggleItem(child.id)"
                >
                  ▶
                </span>
              </div>
              <ul
                v-if="child.children && child.children.length"
                class="toc-children"
                :class="{ expanded: expandedItems.has(child.id) }"
              >
                <li
                  v-for="grandChild in child.children"
                  :key="grandChild.id"
                  :class="getTocItemClass(grandChild)"
                >
                  <div class="toc-item-wrapper">
                    <a
                      :href="`#${grandChild.id}`"
                      class="toc-link"
                      @click="scrollToAnchor(grandChild.id, $event)"
                    >
                      {{ grandChild.text }}
                    </a>
                    <span
                      v-if="
                        !autoCollapseEnabled && grandChild.children && grandChild.children.length
                      "
                      class="toc-toggle"
                      :class="{ expanded: expandedItems.has(grandChild.id) }"
                      @click="toggleItem(grandChild.id)"
                    >
                      ▶
                    </span>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div v-else class="toc-empty">
      <p>暂无目录</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})

const tocItems = ref([])
const activeId = ref('')
const expandedItems = ref(new Set())
const manuallyExpandedItems = ref(new Set()) // 记录手动展开的项目
const autoCollapseEnabled = ref(true) // 自动折叠开关 - 默认开启

// 生成目录项
const generateToc = (content) => {
  try {
    if (!content) return []

    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')

    const items = []
    const stack = []

    headings.forEach((heading, index) => {
      try {
        const level = parseInt(heading.tagName.charAt(1))
        const text = heading.textContent.trim()
        let id = heading.id

        // 如果没有 id，生成一个
        if (!id) {
          id = `heading-${index}`
        }

        const item = {
          id,
          text,
          level,
          children: [],
        }

        // 构建层级结构
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop()
        }

        if (stack.length === 0) {
          items.push(item)
        } else {
          stack[stack.length - 1].children.push(item)
        }

        stack.push(item)
      } catch (error) {
        console.warn('TOC: Failed to process heading:', heading, error)
      }
    })

    return items
  } catch (error) {
    console.warn('TOC: Failed to generate TOC:', error)
    return []
  }
}

// 获取目录项样式类
const getTocItemClass = (item) => {
  return {
    'toc-item': true,
    [`toc-level-${item.level}`]: true,
    active: activeId.value === item.id,
    current: activeId.value === item.id,
    'manually-expanded': manuallyExpandedItems.value.has(item.id),
  }
}

// 切换折叠状态
const toggleItem = (itemId) => {
  if (expandedItems.value.has(itemId)) {
    expandedItems.value.delete(itemId)
    manuallyExpandedItems.value.delete(itemId) // 移除手动展开记录
  } else {
    expandedItems.value.add(itemId)
    manuallyExpandedItems.value.add(itemId) // 记录为手动展开
  }
}

// 切换自动折叠模式
const toggleAutoCollapse = () => {
  autoCollapseEnabled.value = !autoCollapseEnabled.value

  if (autoCollapseEnabled.value) {
    // 开启自动折叠时，清空手动展开记录
    manuallyExpandedItems.value.clear()
    // 执行一次自动折叠
    if (activeId.value) {
      smartExpandCollapse(activeId.value)
    }
  } else {
    // 关闭自动折叠时，保持当前展开状态
    console.log('Manual mode enabled')
  }
}

// 滚动到锚点
const scrollToAnchor = (id, event) => {
  try {
    event.preventDefault()

    const element = document.getElementById(id)
    if (element) {
      const headerHeight = 56 // 固定导航栏高度
      const elementTop = element.offsetTop - headerHeight - 20

      window.scrollTo({
        top: elementTop,
        behavior: 'smooth',
      })

      // 更新 URL
      const url = new URL(window.location)
      url.hash = id
      window.history.replaceState(null, '', url)
    }
  } catch (error) {
    console.warn('TOC: Failed to scroll to anchor:', id, error)
  }
}

// 监听滚动，更新当前活动项
const updateActiveItem = () => {
  try {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const headerHeight = 56

    let currentId = ''

    headings.forEach((heading) => {
      try {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= headerHeight + 50) {
          currentId = heading.id
        }
      } catch (error) {
        console.warn('TOC Scroll error for heading:', heading, error)
      }
    })

    if (currentId && activeId.value !== currentId) {
      activeId.value = currentId
      // 在自动模式下，滚动时也触发智能折叠
      if (autoCollapseEnabled.value) {
        smartExpandCollapse(currentId)
      }
    }
  } catch (error) {
    console.warn('TOC updateActiveItem error:', error)
  }
}

// 监听滚动事件
onMounted(() => {
  try {
    window.addEventListener('scroll', updateActiveItem)
  } catch (error) {
    console.warn('TOC: Failed to add scroll listener:', error)
  }
})

onUnmounted(() => {
  try {
    window.removeEventListener('scroll', updateActiveItem)
  } catch (error) {
    console.warn('TOC: Failed to remove scroll listener:', error)
  }
})

// 创建 Intersection Observer
const createIntersectionObserver = () => {
  try {
    if (!window.IntersectionObserver) {
      console.warn('TOC: IntersectionObserver not supported')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let newActiveId = null

        // 找到最合适的活动项
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            try {
              // 确保 boundingClientRect 是属性而不是方法
              const rect = entry.boundingClientRect || entry.getBoundingClientRect?.()
              if (!rect) return

              const headerHeight = 56

              // 选择在视口顶部附近的标题
              if (rect.top <= headerHeight + 100) {
                newActiveId = entry.target.id
              }
            } catch (error) {
              console.warn('TOC IntersectionObserver error:', error)
            }
          }
        })

        // 更新活动项
        if (newActiveId && activeId.value !== newActiveId) {
          activeId.value = newActiveId
          // 智能展开和折叠
          smartExpandCollapse(newActiveId)
        }
      },
      {
        rootMargin: '-56px 0px -50% 0px',
        threshold: [0, 0.1, 0.5, 1],
      },
    )

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')

    headings.forEach((heading) => {
      try {
        observer.observe(heading)
      } catch (error) {
        console.warn('TOC: Failed to observe heading:', heading, error)
      }
    })
  } catch (error) {
    console.warn('TOC: Failed to create IntersectionObserver:', error)
  }
}

// 智能展开和折叠
const smartExpandCollapse = (activeItemId) => {
  // 只在自动折叠模式下执行
  if (!autoCollapseEnabled.value) return

  // 找到所有需要展开的父级
  const findParentIds = (items, targetId, parentIds = []) => {
    for (const item of items) {
      if (item.id === targetId) {
        return parentIds
      }
      if (item.children && item.children.length) {
        const found = findParentIds(item.children, targetId, [...parentIds, item.id])
        if (found) return found
      }
    }
    return null
  }

  const parentIds = findParentIds(tocItems.value, activeItemId)

  // 创建新的展开状态集合
  const newExpandedItems = new Set()

  // 添加包含当前活动项的父级
  if (parentIds) {
    parentIds.forEach((id) => {
      newExpandedItems.add(id)
    })
  }

  // 更新展开状态
  expandedItems.value = newExpandedItems
}

// 初始化时展开所有顶级项目
const initializeExpandedItems = () => {
  // 清空之前的状态
  expandedItems.value.clear()
  manuallyExpandedItems.value.clear()

  if (autoCollapseEnabled.value) {
    // 自动模式下，只展开顶级项目
    tocItems.value.forEach((item) => {
      if (item.children && item.children.length) {
        expandedItems.value.add(item.id)
      }
    })
  } else {
    // 手动模式下，展开所有项目
    const expandAll = (items) => {
      items.forEach((item) => {
        if (item.children && item.children.length) {
          expandedItems.value.add(item.id)
          expandAll(item.children)
        }
      })
    }
    expandAll(tocItems.value)
  }
}

// 监听内容变化
watch(
  () => props.content,
  (newContent) => {
    try {
      tocItems.value = generateToc(newContent)
      // 初始化展开状态
      initializeExpandedItems()
    } catch (error) {
      console.warn('TOC: Failed to update content:', error)
    }
  },
  { immediate: true },
)

onMounted(() => {
  try {
    // 延迟执行，确保 DOM 已渲染
    setTimeout(() => {
      createIntersectionObserver()
    }, 100)
  } catch (error) {
    console.warn('TOC: Failed to mount component:', error)
  }
})
</script>

<style scoped lang="scss" src="@/styles/sfc/components/TableOfContents.scss"></style>
