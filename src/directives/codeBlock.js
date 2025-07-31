import { createApp } from 'vue'
import CodeBlock from '../components/CodeBlock.vue'

export const codeBlockDirective = {
  mounted(el) {
    // 查找所有自定义代码块标记
    const codeBlocks = el.querySelectorAll('.custom-code-block')

    codeBlocks.forEach((block, index) => {
      const lang = block.getAttribute('data-lang')
      const code = block.getAttribute('data-code')

      // 创建Vue应用实例来渲染CodeBlock组件
      const app = createApp(CodeBlock, {
        code: code,
        language: lang,
        maxLines: 20,
      })

      // 创建容器并挂载组件
      const container = document.createElement('div')
      app.mount(container)

      // 替换原始元素
      block.parentNode.replaceChild(container, block)
    })
  },

  updated(el) {
    // 当内容更新时重新处理
    this.mounted(el)
  },
}
