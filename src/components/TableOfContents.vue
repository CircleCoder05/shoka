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

<style scoped>
.toc-container {
  width: 100%;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* 控制按钮样式 */
.toc-controls {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 1rem;
  text-align: center;
}

/* 滑钮样式 */
.toggle-switch {
  display: inline-block;
  cursor: pointer;
  user-select: none;
}

.toggle-slider {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 32px;
  background: #f0f0f0;
  border: 2px solid #ddd;
  border-radius: 16px;
  transition: all 0.3s ease;
  font-size: 0.85em;
  font-weight: 500;
  color: #666;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 2px;
  width: 24px;
  height: 24px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-slider.active {
  background: #e9546b;
  border-color: #e9546b;
  color: #fff;
}

.toggle-slider.active::before {
  transform: translateX(88px);
}

.toggle-text {
  z-index: 1;
  font-weight: 500;
}

.toc-content {
  padding: 0;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin: 0.2rem 0;
  transition: all 0.3s ease;
  text-align: left;
}

/* 多级标题样式 - 减小缩进 */
.toc-level-1 {
  padding-left: 0;
}

.toc-level-2 {
  padding-left: 0.6rem;
}

.toc-level-3 {
  padding-left: 1.2rem;
}

.toc-level-4 {
  padding-left: 1.8rem;
}

.toc-level-5 {
  padding-left: 2.4rem;
}

.toc-level-6 {
  padding-left: 3rem;
}

.toc-item-wrapper {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.toc-toggle {
  cursor: pointer;
  font-size: 0.7em;
  color: #999;
  transition: transform 0.3s ease;
  user-select: none;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: auto; /* 推到右边 */
}

.toc-toggle:hover {
  color: #e9546b;
}

.toc-toggle.expanded {
  transform: rotate(90deg);
}

.toc-link {
  flex: 1;
  padding: 0.4rem 0.6rem;
  color: #666666;
  text-decoration: none;
  border-radius: 4px;
  line-height: 1.4;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  font-weight: 600 !important; /* 中等粗细 */
  font-family:
    'Inter',
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    'Helvetica Neue',
    Helvetica,
    Arial,
    sans-serif !important; /* 中英文混合字体 */
}

/* 更强的选择器确保字体生效 */
.toc-container .toc-link,
.toc-container .toc-item .toc-link,
.toc-container .toc-level-1 .toc-link,
.toc-container .toc-level-2 .toc-link,
.toc-container .toc-level-3 .toc-link,
.toc-container .toc-level-4 .toc-link,
.toc-container .toc-level-5 .toc-link,
.toc-container .toc-level-6 .toc-link {
  font-family:
    'Inter',
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    'Helvetica Neue',
    Helvetica,
    Arial,
    sans-serif !important;
  font-weight: 600 !important;
  color: #666666 !important;
}

/* 不同级别标题的字体大小 - 现代字体 */
.toc-level-1 .toc-link {
  font-size: 1em;
  font-weight: 700 !important;
  font-family:
    'Inter',
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    'Helvetica Neue',
    Helvetica,
    Arial,
    sans-serif !important;
}

.toc-level-2 .toc-link {
  font-size: 0.95em;
  font-weight: 600 !important;
  font-family:
    'Inter',
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    'Helvetica Neue',
    Helvetica,
    Arial,
    sans-serif !important;
}

.toc-level-3 .toc-link {
  font-size: 0.9em;
  font-weight: 600 !important;
  font-family:
    'Inter',
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    'Helvetica Neue',
    Helvetica,
    Arial,
    sans-serif !important;
}

.toc-level-4 .toc-link {
  font-size: 0.85em;
  font-weight: 600 !important;
  font-family:
    'Inter',
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    'Helvetica Neue',
    Helvetica,
    Arial,
    sans-serif !important;
}

.toc-level-5 .toc-link {
  font-size: 0.8em;
  font-weight: 600 !important;
  font-family:
    'Inter',
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    'Helvetica Neue',
    Helvetica,
    Arial,
    sans-serif !important;
}

.toc-level-6 .toc-link {
  font-size: 0.75em;
  font-weight: 600 !important;
  font-family:
    'Inter',
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    'Helvetica Neue',
    Helvetica,
    Arial,
    sans-serif !important;
}

.toc-link:hover {
  color: #e9546b;
  background-color: #f8f9fa;
}

.toc-item.active .toc-link,
.toc-item.current .toc-link {
  color: #e9546b;
  background-color: #f3c1d1;
  font-weight: 700 !important; /* 保持黑体 */
}

/* 手动展开的项目样式 */
.toc-item.manually-expanded .toc-toggle {
  color: #e9546b;
}

.toc-item.manually-expanded .toc-link {
  color: #e9546b;
  font-weight: 700 !important; /* 保持黑体 */
}

.toc-children {
  list-style: none;
  padding: 0;
  margin: 0;
  margin-left: 0;
  max-height: 0;
  overflow: hidden;
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
  opacity: 0;
}

.toc-children.expanded {
  max-height: 1000px;
  opacity: 1;
}

.toc-empty {
  text-align: center;
  padding: 2rem 0;
  color: #999;
  font-size: 0.9em;
}

/* 滚动条样式 */
.toc-container::-webkit-scrollbar {
  width: 4px;
}

.toc-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.toc-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.toc-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 暗色模式样式 */
html.dark-theme .toc-controls {
  border-bottom-color: #3e4451;
}

html.dark-theme .toggle-slider {
  background: #3e4451;
  border-color: #3e4451;
  color: #abb2bf;
}

html.dark-theme .toggle-slider::before {
  background: #21252b;
}

html.dark-theme .toggle-slider.active {
  background: #ed6ea0;
  border-color: #ed6ea0;
  color: #ffffff !important;
}

html.dark-theme .toggle-slider.active .toggle-text {
  color: #ffffff !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toc-container {
    max-height: calc(100vh - 150px);
  }

  .toc-link {
    font-size: 0.85em;
    padding: 0.4rem 0.6rem;
  }
}
</style>
