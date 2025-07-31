import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { codeBlockDirective } from './directives/codeBlock.js'
import { imageOptimizeDirective } from './directives/imageOptimize.js'
import mediaBlockDirective from './directives/mediaBlock.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 注册代码块指令
app.directive('code-block', codeBlockDirective)

// 注册图片优化指令
app.directive('image-optimize', imageOptimizeDirective)

// 注册媒体块指令
app.directive('media-block', mediaBlockDirective)

app.mount('#app')
