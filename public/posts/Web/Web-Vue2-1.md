---
layout: post
title: "Vue2-1"
date:   2025-04-20
tags: [Web]
comments: true
categories:
- [Web]
author: CircleCoder
---

### 指令修饰符

**按键修饰符**

- `@keyup.enter` : 键盘回车弹起事件 

**`v-model` 修饰符**

- `v-model.trim` ：去除首尾空格
- `v-model.number` : 转数字

**事件修饰符**

- `@事件名.stop` : 阻止冒泡
- `@事件名.prevent` : 阻止默认行为

---

### v-bind 控制样式

#### 操作 class

语法：`:class="对象/数组"`

- **对象**

  形式为键值对。键是类名，值是布尔值，表示是否添加这个类的样式

  ```html
  <div class="box" :class="{类名1:布尔值, 类名2:布尔值}"></div>
  ```

  适用场景：一个类反复切换

- **数组**

  数组中所有的类都会添加，本质就是一个 `class` 列表

  ```html
  <div class="box" :class="[类名1, 类名2, 类名3]"></div>
  ```

  适用场景：批量添加或删除类

```html
<div id="app">
    <ul>
      <li v-for="(item, index) in list" :key="item.id" @click="activeIndex = index">
        <a :class="{ active: index === activeIndex }" href="#">{{ item.name }}</a>
      </li>
    </ul>
</div>
```

```js
const app = new Vue({
      el: '#app',
      data: {
        activeIndex: 2, // 记录高亮
        list: [
          { id: 1, name: '京东秒杀' },
          { id: 2, name: '每日特价' },
          { id: 3, name: '品类秒杀' }
        ]
      }
    })
```

![image-20250504233213248](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505042332366.png)

#### 操作 style

语法：`:style = "样式对象"`

```html
<div class="box" :style="{CSS属性名1: CSS属性值, CSS属性名2: CSS属性值}"></div>
```

注意属性值如果是字符串的话要用引号包裹

```html
<div id="app">
    <!-- 外层盒子底色 （黑色） -->
    <div class="progress">
      <!-- 内层盒子 - 进度（蓝色） -->
      <div class="inner" :style="{ width: percent + '%' }">
        <span>{{ percent }}%</span>
      </div>
    </div>
    <button @click="percent = 25">设置25%</button>
    <button @click="percent = 50">设置50%</button>
    <button @click="percent = 75">设置75%</button>
    <button @click="percent = 100">设置100%</button>
</div>
```

```js
const app = new Vue({
      el: '#app',
      data: {
        percent: 30
      }
})
```

![image-20250504233751078](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505042337161.png)

---

### 计算属性

基于现有的数据，计算出来新的属性。当依赖的数据变化时，自动重新计算

#### 默认写法

只能计算得到，不能主动修改

语法：

- 声明在 `computed` 配置项中，一个计算属性**对应一个函数**
- 使用时和普通属性一样 `{{ 计算属性名 }}` （这里不要写成函数形式）

```html
<div id="app">
    <h3>小黑的礼物清单</h3>
    <table>
      <tr>
        <th>名字</th>
        <th>数量</th>
      </tr>
      <tr v-for="(item, index) in list" :key="item.id">
        <td>{{ item.name }}</td>
        <td>{{ item.num }}个</td>
      </tr>
    </table>

    <!-- 目标：统计求和，求得礼物总数 -->
    <p>礼物总数：{{ totalCount }} 个</p>
</div>
```

```js
const app = new Vue({
      el: '#app',
      data: {
        // 现有的数据
        list: [
          { id: 1, name: '篮球', num: 1 },
          { id: 2, name: '玩具', num: 2 },
          { id: 3, name: '铅笔', num: 5 },
        ]
      },
      computed: {
        totalCount () {
          // 基于现有的数据，编写求值逻辑
          // 计算属性函数内部，可以直接通过 this 访问到 app 实例

          // 需求：对 this.list 数组里面的 num 进行求和 → reduce
          let total = this.list.reduce((sum, item) => sum + item.num, 0)
          return total
        }
      }
})
```

![image-20250504234419962](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505042344120.png)

#### 完整写法

语法：

```js
computed: {
	计算属性名: {
		get() {
			计算逻辑
			return 结果
		},
		set(修改的值) {
			修改逻辑
		}
	}
}
```

```js
const app = new Vue({
      el: '#app',
      data: {
        firstName: '刘',
        lastName: '备',
      },
      methods: {
        changeName () {
          this.fullName = '黄忠'
        }
      },
      computed: {
        // 完整写法 → 获取 + 设置
        fullName: {
          // (1) 当fullName计算属性，被获取求值时，执行get（有缓存，优先读缓存）
          //     会将返回值作为，求值的结果
          get () {
            return this.firstName + this.lastName
          },
          // (2) 当fullName计算属性，被修改赋值时，执行set
          //     修改的值，传递给set方法的形参
          set (value) {
            // console.log(value.slice(0, 1))          
            // console.log(value.slice(1))         
            this.firstName = value.slice(0, 1)
            this.lastName = value.slice(1)
          }
        }
      }
})
```

