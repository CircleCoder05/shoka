<template>
  <div class="toc-container">
    <div class="toc-content" v-if="tocItems.length > 0">
      <ul class="toc-list">
        <li v-for="item in tocItems" :key="item.id" :class="getTocItemClass(item)">
          <div class="toc-item-wrapper">
            <span
              v-if="item.children && item.children.length"
              class="toc-toggle"
              :class="{ expanded: expandedItems.has(item.id) }"
              @click="toggleItem(item.id)"
            >
              ▶
            </span>
            <a :href="`#${item.id}`" class="toc-link" @click="scrollToAnchor(item.id, $event)">
              {{ item.text }}
            </a>
          </div>
          <ul
            v-if="item.children && item.children.length"
            class="toc-children"
            :class="{ expanded: expandedItems.has(item.id) }"
          >
            <li v-for="child in item.children" :key="child.id" :class="getTocItemClass(child)">
              <div class="toc-item-wrapper">
                <span
                  v-if="child.children && child.children.length"
                  class="toc-toggle"
                  :class="{ expanded: expandedItems.has(child.id) }"
                  @click="toggleItem(child.id)"
                >
                  ▶
                </span>
                <a
                  :href="`#${child.id}`"
                  class="toc-link"
                  @click="scrollToAnchor(child.id, $event)"
                >
                  {{ child.text }}
                </a>
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
                    <span
                      v-if="grandChild.children && grandChild.children.length"
                      class="toc-toggle"
                      :class="{ expanded: expandedItems.has(grandChild.id) }"
                      @click="toggleItem(grandChild.id)"
                    >
                      ▶
                    </span>
                    <a
                      :href="`#${grandChild.id}`"
                      class="toc-link"
                      @click="scrollToAnchor(grandChild.id, $event)"
                    >
                      {{ grandChild.text }}
                    </a>
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
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})

const tocItems = ref([])
const activeId = ref('')
const expandedItems = ref(new Set())

// 生成目录项
const generateToc = (content) => {
  if (!content) return []

  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')

  const items = []
  const stack = []

  headings.forEach((heading, index) => {
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
  })

  return items
}

// 获取目录项样式类
const getTocItemClass = (item) => {
  return {
    'toc-item': true,
    active: activeId.value === item.id,
    current: activeId.value === item.id,
  }
}

// 切换折叠状态
const toggleItem = (itemId) => {
  if (expandedItems.value.has(itemId)) {
    expandedItems.value.delete(itemId)
  } else {
    expandedItems.value.add(itemId)
  }
}

// 滚动到锚点
const scrollToAnchor = (id, event) => {
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
}

// 监听滚动，更新当前活动项
const updateActiveItem = () => {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const headerHeight = 56

  let currentId = ''

  headings.forEach((heading) => {
    const rect = heading.getBoundingClientRect()
    if (rect.top <= headerHeight + 50) {
      currentId = heading.id
    }
  })

  activeId.value = currentId
}

// 创建 Intersection Observer
const createIntersectionObserver = () => {
  if (!window.IntersectionObserver) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
          // 自动展开包含当前活动项的父级
          expandParentItems(entry.target.id)
        }
      })
    },
    {
      rootMargin: '-56px 0px -50% 0px',
      threshold: 0,
    },
  )

  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  headings.forEach((heading) => {
    observer.observe(heading)
  })
}

// 展开包含指定项的父级
const expandParentItems = (itemId) => {
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

  const parentIds = findParentIds(tocItems.value, itemId)
  if (parentIds) {
    parentIds.forEach((id) => {
      expandedItems.value.add(id)
    })
  }
}

// 监听内容变化
watch(
  () => props.content,
  (newContent) => {
    tocItems.value = generateToc(newContent)
  },
  { immediate: true },
)

onMounted(() => {
  // 延迟执行，确保 DOM 已渲染
  setTimeout(() => {
    createIntersectionObserver()
  }, 100)
})
</script>

<style scoped>
.toc-container {
  width: 100%;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
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
  margin: 0.25rem 0;
  transition: all 0.3s ease;
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
}

.toc-toggle:hover {
  color: #e9546b;
}

.toc-toggle.expanded {
  transform: rotate(90deg);
}

.toc-link {
  flex: 1;
  padding: 0.5rem 0.75rem;
  color: #666;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9em;
  line-height: 1.4;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toc-link:hover {
  color: #e9546b;
  background-color: #f8f9fa;
}

.toc-item.active .toc-link,
.toc-item.current .toc-link {
  color: #e9546b;
  background-color: #f3c1d1;
  font-weight: 500;
}

.toc-children {
  list-style: none;
  padding: 0;
  margin: 0;
  margin-left: 1rem;
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
