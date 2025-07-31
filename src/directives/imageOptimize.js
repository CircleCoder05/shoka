export const imageOptimizeDirective = {
  mounted(el) {
    // 查找所有图片
    const images = el.querySelectorAll('img')

    images.forEach((img) => {
      // 添加图片优化类
      img.classList.add('optimized-image')

      // 设置懒加载
      img.loading = 'lazy'

      // 添加错误处理
      img.onerror = function () {
        this.style.display = 'none'
        console.warn('Image failed to load:', this.src)
      }

      // 添加加载完成后的处理
      img.onload = function () {
        this.style.opacity = '1'
      }

      // 初始透明度为0，加载完成后显示
      img.style.opacity = '0'
      img.style.transition = 'opacity 0.3s ease'

      // 确保图片不会超出容器
      img.style.maxWidth = '100%'
      img.style.height = 'auto'
      img.style.objectFit = 'contain'
    })
  },

  updated(el) {
    // 当内容更新时重新处理图片
    this.mounted(el)
  },
}
