import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { codeBlockDirective } from './directives/codeBlock.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 注册代码块指令
app.directive('code-block', codeBlockDirective)

app.mount('#app')
