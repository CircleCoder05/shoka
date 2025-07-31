import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { codeBlockDirective } from './directives/codeBlock.js'
import { imageOptimizeDirective } from './directives/imageOptimize.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 注册代码块指令
app.directive('code-block', codeBlockDirective)

// 注册图片优化指令
app.directive('image-optimize', imageOptimizeDirective)

app.mount('#app')
