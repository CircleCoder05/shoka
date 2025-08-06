---
layout: post
title: "Vue2"
date:   2025-03-17
tags: [Web]
comments: true
categories:
- [Web]
author: CircleCoder
---

### 创建 Vue 实例

```html
<div id='app'>
        <div class="box">
            <h4>自动售货机</h4>
            <button @click="buy(5)">可乐5元</button>
            <button @click="buy(10)">咖啡10元</button>
        </div>
        <p>银行卡余额：{{ money }}</p>
</div>
```

```javascript
// Vue构造器
const app = new Vue({
    el: '#app',					// 配置选择器，指定 Vue 管理的元素
    data: {						// 提供数据
        money: 1000
    },
    methods: {					// 提供方法
        buy(price) {
            this.money -= price
        }
    }
})
```



### 插值表达式

**用途**：利用表达式进行插值，渲染到页面中

**表达式**：可以被求值得一段代码，JS引擎会将其计算出一个结果

**语法**：`{{ 表达式 }}`

**注意事项**：

- 使用的数据必须存在（在 `Vue` 实例中）

- 支持的是表达式，而非语句（比如 `if`、`for`）

- 不能在标签属性中使用插值

  错误示例：`<p title="{{ username }}">example</p>`



### Vue指令

#### v-html 渲染

设置元素的 `innerHTML`

```html
<div id='app'>
	<div v-html="msg"></div>
</div>
```

```javascript
const app = new Vue({
    el: '#app',					// 配置选择器，指定 Vue 管理的元素
    data: {						// 提供数据
        msg: '<a href='http://CircleCoder05.github.io'>CircleCoder的个人技术博客</a>'
    }
})
```

注意变量一定要用 **引号包裹**，否则无法渲染



#### v-show 和 v-if 条件渲染

控制元素的显示隐藏

语法:  

- `v-show="表达式"`、`v-if="表达式"`
- 表达式值为 `true` 时显示，`false` 隐藏

区别：

- `v-show` 相当于切换`display: none`，元素一直存在
- `v-if` 基于条件判断，是否 **创建** 或 **移除** 元素。后面可搭配 `v-else-if`、`v-else` 使用



#### v-on 注册事件

注册事件 = 添加监听 + 提供处理逻辑

语法：

- `v-on:事件名="内联语句"`
- `v-on:事件名="methods中的事件名"`

`v-on:` 可简写为 `@`

``` html
<div id='app'>
    <div v-html="msg">?</div>
    <div class="box">
        <h3>自动售货机</h3>
        <button @click="buy(5)">可乐5元</button>
        <button @click="buy(10)">咖啡10元</button>
    </div>
    <p>银行卡余额：{{ money }}</p>
</div>
```

```javascript
const app = new Vue({
    el: '#app',
    data: {
        money: 100,
        msg: '<a href="https://CircleCoder05.github.io">CircleCoder05的个人技术博客</a>'
    },
    methods: {
        buy(price) {
            this.money -= price
        }
    }
})
```

![image-20250501152654864](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505011527294.png)



#### v-bind 动态设置属性

动态设置 `html` 标签的属性：`src`、`url`、`title` 等

语法：`v-bind:属性名="表达式"`

`v-bind:` 可简写为 `:`

```html
<img v-bind="imgUrl" v-bind="msg">
```



#### v-for 循环渲染

基于数据循环，多次渲染整个元素

遍历数组语法：`v-for="(item, index) in 数组" :key="唯一标识符"`

注意：

- `key` 只能是字符串或整数类型，且必须具有唯一性
- 推荐使用元素的 `id` 作为`key`，不建议使用 `index`

```html
<div id='app'>
    <div class="box">
        <h3>书架</h3>
        <ul>
            <li v-for="(item, index) in booksList" :key="item.id">
                <span>{{ item.name }}:</span>
                &nbsp;
                <span>{{ item.author}}</span>
                &nbsp;
                <button @click="deleteBook(item.id)">删除</button>
            </li>
        </ul>
    </div>
</div>
```

```javascript
const app = new Vue({
    el: '#app',
    data: {
        booksList: [
            { id: 1, name: "《三国演义》", author: "罗贯中" },
            { id: 2, name: "《水浒传》", author: "施耐庵" },
            { id: 3, name: "《西游记》", author: "吴承恩" },
            { id: 4, name: "《红楼梦》", author: "曹雪芹" }
        ]
    },
    methods: {
        deleteBook(id) {
            this.booksList = this.booksList.filter(item => item.id !== id) // 过滤掉id相同的元素
        }
    }
})
```

![image-20250501161904166](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505011619332.png)



#### v-model 双向绑定

```html
<div id='app'>
        <div class="box">
            账户：<input type="text" v-model="username"><br><br>
            密码：<input type="password" v-model="password"><br><br>
            <button @click="login">登录</button>
            <button @click="reset">重置</button>
        </div>
</div>
```

```javascript
const app = new Vue({
    el: '#app',
    data: {
        username: '',
        password: '',
    },
    methods: {
        login() {
            console.log(this.username, this.password)
        },
        reset() {
            this.username = ''
            this.password = ''
        }
    }
})
```

![image-20250501163541079](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505011635201.png)
