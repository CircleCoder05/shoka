<template>
  <footer class="footer">
    <div class="footer-content">
      <p>© 2024 CircleCoder 博客</p>
      <p>空天报国，敢为人先</p>
    </div>
  </footer>
</template>

<script setup>
// 页脚逻辑
</script>

<style scoped>
.footer {
  background: transparent;
  border-top: 1px solid var(--color-divider);
  text-align: center;
  padding: 18px 0;
  color: var(--color-grey);
  font-size: 15px;
  margin-top: 32px;
}

.footer-content {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content p {
  margin: 4px 0;
}

/* 平板端适配 */
@media (max-width: 1024px) {
  .footer {
    padding: 16px 0;
    margin-top: 24px;
  }

  .footer-content {
    padding: 0 16px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .footer {
    padding: 14px 0;
    margin-top: 16px;
  }

  .footer-content {
    padding: 0 12px;
    font-size: 14px;
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  .footer {
    padding: 12px 0;
    margin-top: 12px;
  }

  .footer-content {
    padding: 0 8px;
    font-size: 13px;
  }
}
</style>
