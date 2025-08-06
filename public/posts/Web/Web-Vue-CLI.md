---
layout: post
title: "工程化开发和脚手架"
date:   2025-04-23
tags: [Web]
comments: true
categories:
- [Web]
author: CircleCoder
---

### 项目结构

```
my-vue-project/
├── node_modules/       # 项目依赖包
├── public/             # 静态资源目录
│   ├── favicon.ico     # 网站图标
│   └── index.html      # 主HTML文件
├── src/                # 项目源代码目录
│   ├── assets/         # 静态资源（图片、字体等）
│   ├── components/     # Vue组件
│   ├── router/         # 路由配置（如果选择了vue-router）
│   ├── store/          # Vuex状态管理（如果选择了vuex）
│   ├── views/          # 页面级组件
│   ├── App.vue         # 根组件
│   └── main.js         # 应用入口文件，打包运行
├── .gitignore          # Git忽略配置
├── babel.config.js     # Babel配置
├── package.json        # 项目配置和依赖
├── package-lock.json   # 依赖版本锁定文件
└── README.md           # 项目说明文档
```

![image-20250515141533658](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505151415990.png)



### 组件化开发

一个页面可以拆分为一个个组件，**每个组件有自己的结构、样式、行为**

  ![image-20250515141837933](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505151418131.png)



#### 组件结构

![image-20250515142344857](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505151423992.png)



### 组件

#### 局部注册

只能在注册的组件内使用

- 在 `components` 目录下创建 `.vue` 组件，并设置结构、样式、行为

- 在要使用的组件中导入注册

  注意必须大驼峰命名

  ```js
  <script>
  	// 导入
      import BlogSidebar from './components/BlogSidebar.vue'
      import BlogNavbar from './components/BlogNavbar.vue'
      import ProfileSection from './components/ProfileSection.vue'
      import PostsSection from './components/PostsSection.vue'
      import NewPostSection from './components/NewPostSection.vue'
  
      export default {
          name: 'App',
          // 注册
          components: {
            '组件名': 组件对象						// 也可以直接写组件对象
            'BlogSidebar': BlogSiderbar			// BlogSiderbar
          },
      }
  </script>
  ```

- 使用时直接当作  `html` 标签使用

  ```html
  <组件名></组件对象>
  ```



#### 全局注册

在 `main.js` 中进行全局注册

```js
// 导入
import BlogSiderbar fron './components/BlogSiderbar.vue'

// 调用 Vue.component 进行全局注册
// Vue.component('组件名'，组件对象)
Vue.component('BlogSiderbar'，BlogSiderbar)
```



#### 样式冲突 scoped

- 默认组件中的样式是全局生效的

- 可以给组件加上 `scoped` 属性，可以让样式只作用于当前组件

```html
<style scoped>
	// ....
</style>
```



#### data 是函数

保证每个组件，维护独立的一份数据对象

每次创建新的组件实例，都会执行一次 `data` 函数，得到一个新对象

![image-20250515150702425](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505151507541.png)



### 组件通信

组件的数据是独立的，无法直接访问其他组件的数据

![image-20250515151035646](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505151510763.png)

#### 父子通信

![image-20250515151254989](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505151512196.png)

![image-20250515151332965](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505151513078.png)

![image-20250515160055340](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505151600758.png)

![image-20250515160205124](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505151602341.png)



### 插槽

#### 默认插槽

![image-20250515162157382](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505151621759.png)

#### 具名插槽

![image-20250515162420600](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505151624801.png)



#### 作用域插槽

![image-20250515164007017](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505151640277.png)

![image-20250515164052763](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202505151640960.png)



### 路由

