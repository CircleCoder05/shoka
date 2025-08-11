---
layout: post
title: 'Vue3 新特性详解'
date: 2025-05-17
tags: [Web, Vue]
comments: true
categories:
  - [Web]
author: CircleCoder
---

## 前言

Vue3作为Vue.js的重大版本更新，带来了许多激动人心的新特性和性能提升。相比Vue2，Vue3在性能、TypeScript支持、组合式API等方面都有显著改进。

---

## Vue3 核心改进

### 1. 性能提升

#### 响应式系统重构

Vue3使用Proxy替代了Vue2的Object.defineProperty，带来了更好的性能和更完整的功能：

```javascript
// Vue2 使用 Object.defineProperty
// 无法监听数组索引和length变化
// 无法监听对象属性的添加和删除

// Vue3 使用 Proxy
// 可以监听所有变化，包括数组索引、对象属性增删等
const reactive = Vue.reactive({
  count: 0,
  list: [1, 2, 3],
})

// 现在可以监听数组索引变化
reactive.list[0] = 10 // 会触发响应式更新
reactive.list.push(4) // 会触发响应式更新
```

#### 编译优化

- **Tree-shaking支持**：只打包使用到的功能
- **静态提升**：将静态节点提升到渲染函数外部
- **Patch Flag**：标记动态节点，优化diff算法
- **Block Tree**：基于动态节点指令构建Block Tree

```javascript
// Vue3 编译后的代码示例
function render() {
  return (
    _openBlock(),
    _createElementBlock('div', null, [
      _createElementVNode('h1', null, 'Hello Vue3'),
      _createElementVNode('p', null, _toDisplayString(message.value), 1 /* TEXT */),
    ])
  )
}
```

### 2. Composition API

#### 为什么需要Composition API？

Vue2的Options API在处理复杂组件时存在以下问题：

- 逻辑分散：相关的逻辑代码分散在不同的选项中
- 代码复用困难：难以提取和复用逻辑
- 类型推导困难：TypeScript支持不够友好

#### 基础用法

```vue
<template>
  <div>
    <h1>{{ count }}</h1>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
    <p>Double: {{ doubleCount }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
const increment = () => count.value++
const decrement = () => count.value--

// 生命周期
onMounted(() => {
  console.log('Component mounted')
})
</script>
```

#### 响应式API详解

```javascript
import { ref, reactive, toRef, toRefs, unref } from 'vue'

// ref: 用于基本类型
const count = ref(0)
const message = ref('Hello')

// reactive: 用于对象
const state = reactive({
  name: 'Vue3',
  version: '3.0',
  features: ['Composition API', 'Teleport', 'Fragments'],
})

// toRef: 将reactive对象的属性转换为ref
const nameRef = toRef(state, 'name')

// toRefs: 将reactive对象的所有属性转换为ref
const { name, version, features } = toRefs(state)

// unref: 获取ref的值，如果是ref则返回.value，否则返回本身
const countValue = unref(count) // 等同于 count.value
const plainValue = unref(42) // 返回 42
```

#### 生命周期钩子

```javascript
import {
  onMounted,
  onUnmounted,
  onUpdated,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
} from 'vue'

export default {
  setup() {
    onBeforeMount(() => {
      console.log('组件挂载前')
    })

    onMounted(() => {
      console.log('组件已挂载')
    })

    onBeforeUpdate(() => {
      console.log('组件更新前')
    })

    onUpdated(() => {
      console.log('组件已更新')
    })

    onBeforeUnmount(() => {
      console.log('组件卸载前')
    })

    onUnmounted(() => {
      console.log('组件已卸载')
    })
  },
}
```

#### 组合式函数（Composables）

```javascript
// useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  const doubleCount = computed(() => count.value * 2)

  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => (count.value = initialValue)

  return {
    count,
    doubleCount,
    increment,
    decrement,
    reset,
  }
}

// 在组件中使用
;<script setup>
  import {useCounter} from './useCounter' const {(count, doubleCount, increment, decrement, reset)}{' '}
  = useCounter(10)
</script>
```

### 3. 新组件和指令

#### Teleport 传送门

Teleport允许我们将组件渲染到DOM树的其他位置，常用于模态框、通知等：

```vue
<template>
  <div>
    <button @click="showModal = true">打开模态框</button>

    <Teleport to="body">
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <h2>模态框标题</h2>
          <p>模态框内容</p>
          <button @click="showModal = false">关闭</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showModal = ref(false)
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
}
</style>
```

#### Fragments 片段

Vue3支持多根节点，无需包裹器：

```vue
<template>
  <!-- Vue2 需要包裹器 -->
  <!-- <div> -->
  <!--   <header>Header</header> -->
  <!--   <main>Main content</main> -->
  <!--   <footer>Footer</footer> -->
  <!-- </div> -->

  <!-- Vue3 支持多根节点 -->
  <header>Header</header>
  <main>Main content</main>
  <footer>Footer</footer>
</template>
```

#### Suspense 异步组件

Suspense用于处理异步组件和异步数据：

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() => import('./AsyncComponent.vue'))
</script>
```

### 4. 新的响应式系统

#### 响应式工具函数

```javascript
import {
  isRef,
  isReactive,
  isReadonly,
  isProxy,
  markRaw,
  shallowRef,
  shallowReactive,
  readonly,
} from 'vue'

// isRef: 检查值是否为ref
console.log(isRef(ref(0))) // true
console.log(isRef(0)) // false

// isReactive: 检查值是否为reactive对象
console.log(isReactive(reactive({}))) // true
console.log(isReactive({})) // false

// isReadonly: 检查值是否为只读
console.log(isReadonly(readonly({}))) // true

// isProxy: 检查值是否为proxy（reactive或readonly）
console.log(isProxy(reactive({}))) // true
console.log(isProxy(readonly({}))) // true

// markRaw: 标记对象为原始对象，不会被代理
const rawObject = markRaw({ count: 0 })
const reactiveObject = reactive(rawObject)
// rawObject.count 的变化不会触发响应式更新

// shallowRef: 浅层ref，只有.value变化时才触发更新
const shallowState = shallowRef({ count: 0 })
shallowState.value.count = 1 // 不会触发更新
shallowState.value = { count: 1 } // 会触发更新

// shallowReactive: 浅层reactive，只有顶层属性变化时才触发更新
const shallowState = shallowReactive({
  nested: { count: 0 },
})
shallowState.nested.count = 1 // 不会触发更新
shallowState.nested = { count: 1 } // 会触发更新
```

#### 响应式转换

```javascript
import { toRaw, markRaw, readonly } from 'vue'

// toRaw: 获取响应式对象的原始对象
const original = toRaw(reactiveObject)

// readonly: 创建只读的响应式对象
const readOnlyState = readonly(reactiveObject)
// readOnlyState.name = 'new name' // 会报错

// markRaw: 标记对象为原始对象
const rawObject = markRaw({ count: 0 })
```

### 5. 改进的模板语法

#### v-model 增强

```vue
<template>
  <!-- Vue2 只能绑定一个值 -->
  <!-- <input v-model="message" /> -->

  <!-- Vue3 支持多个v-model -->
  <input v-model:title="title" v-model:content="content" />

  <!-- 自定义修饰符 -->
  <input v-model:title.trim="title" />

  <!-- 组件上的v-model -->
  <CustomInput v-model:value="message" />
</template>

<script setup>
import { ref } from 'vue'

const title = ref('')
const content = ref('')
const message = ref('')
</script>
```

#### 全局API变更

```javascript
// Vue2
Vue.component('MyComponent', MyComponent)
Vue.directive('my-directive', MyDirective)
Vue.use(MyPlugin)

// Vue3
import { createApp } from 'vue'
import MyComponent from './MyComponent.vue'
import MyDirective from './MyDirective.js'
import MyPlugin from './MyPlugin.js'

const app = createApp(App)

app.component('MyComponent', MyComponent)
app.directive('my-directive', MyDirective)
app.use(MyPlugin)

app.mount('#app')
```

### 6. TypeScript 支持

#### 类型推导

```typescript
// Vue3 提供完整的TypeScript支持
import { ref, reactive, computed } from 'vue'

// ref 的类型推导
const count = ref(0) // 类型为 Ref<number>
const message = ref<string>('Hello') // 显式类型

// reactive 的类型推导
interface User {
  id: number
  name: string
  email: string
}

const user = reactive<User>({
  id: 1,
  name: 'John',
  email: 'john@example.com',
})

// computed 的类型推导
const fullName = computed(() => `${user.firstName} ${user.lastName}`)

// 事件类型
const handleClick = (event: MouseEvent) => {
  console.log(event.target)
}
```

#### 组件类型定义

```typescript
// 定义组件Props类型
interface Props {
  title: string
  count?: number
  items: string[]
}

// 定义组件Emits类型
interface Emits {
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
}

// 使用defineProps和defineEmits
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 或者使用运行时声明
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
  items: { type: Array as PropType<string[]>, required: true },
})
```

### 7. 性能优化特性

#### 静态提升

Vue3会自动提升静态内容，减少渲染开销：

```vue
<template>
  <div>
    <!-- 这些静态内容会被提升 -->
    <h1>Vue3 新特性</h1>
    <p>这是一个静态段落</p>

    <!-- 只有动态内容会参与响应式更新 -->
    <p>{{ dynamicContent }}</p>
  </div>
</template>
```

#### 事件监听器缓存

Vue3会缓存事件监听器，避免重复创建：

```vue
<template>
  <!-- 这些事件监听器会被缓存 -->
  <button @click="handleClick">点击</button>
  <input @input="handleInput" />
</template>
```

### 8. 实际应用示例

#### 组合式API重构示例

```vue
<!-- 重构前：Options API -->
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    <button @click="updateTitle">更新标题</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: 'Vue2 标题',
      description: 'Vue2 描述',
    }
  },
  methods: {
    updateTitle() {
      this.title = '新标题'
    },
  },
}
</script>

<!-- 重构后：Composition API -->
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    <button @click="updateTitle">更新标题</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const title = ref('Vue3 标题')
const description = ref('Vue3 描述')

const updateTitle = () => {
  title.value = '新标题'
}
</script>
```

#### 复杂状态管理

```javascript
// useUser.js
import { ref, computed, reactive } from 'vue'

export function useUser() {
  const user = reactive({
    id: null,
    name: '',
    email: '',
    profile: {
      avatar: '',
      bio: '',
    },
  })

  const isLoggedIn = computed(() => !!user.id)
  const displayName = computed(() => user.name || '匿名用户')

  const login = async (credentials) => {
    try {
      // 模拟API调用
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
      const userData = await response.json()

      Object.assign(user, userData)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    Object.assign(user, {
      id: null,
      name: '',
      email: '',
      profile: { avatar: '', bio: '' },
    })
  }

  const updateProfile = (updates) => {
    Object.assign(user.profile, updates)
  }

  return {
    user: readonly(user),
    isLoggedIn,
    displayName,
    login,
    logout,
    updateProfile,
  }
}
```

---

## 总结

Vue3带来了许多激动人心的新特性：

### 🚀 主要优势

1. **性能提升**：Proxy响应式系统、编译优化、Tree-shaking
2. **组合式API**：更好的逻辑复用和代码组织
3. **TypeScript支持**：完整的类型推导和类型安全
4. **新组件**：Teleport、Suspense、Fragments等
5. **更好的开发体验**：更清晰的API设计、更好的错误提示

### 📚 学习建议

1. **循序渐进**：先掌握Composition API基础，再学习高级特性
2. **实践为主**：通过实际项目来熟悉新特性
3. **关注生态**：了解Vue3生态系统的变化
4. **性能优化**：学习新的性能优化技巧

### 🔄 迁移策略

- **新项目**：直接使用Vue3
- **现有项目**：可以渐进式迁移，Vue3支持Vue2语法
- **团队培训**：重点学习Composition API和新的响应式系统

Vue3不仅是一个版本更新，更是Vue生态的一次重要进化。它为我们提供了更强大、更灵活、更高效的开发工具，值得每个Vue开发者深入学习和使用。
