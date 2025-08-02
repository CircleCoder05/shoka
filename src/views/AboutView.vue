<template>
  <PageContainer>
    <div class="about-content">
      <h1>关于我</h1>

      <div class="intro-section">
        <div class="text-content">
          <h2>欢迎来到我的博客</h2>
          <p>你好！我是一名热爱技术的开发者，专注于前端开发和全栈技术。</p>
          <p>这个博客是我分享技术心得、学习笔记和项目经验的地方。</p>

          <div class="skills">
            <h3>技术栈</h3>
            <div class="skill-tags">
              <span class="skill-tag">Vue.js</span>
              <span class="skill-tag">React</span>
              <span class="skill-tag">Node.js</span>
              <span class="skill-tag">Python</span>
              <span class="skill-tag">Three.js</span>
              <span class="skill-tag">WebGL</span>
            </div>
          </div>
        </div>

        <div class="model-section">
          <h3>我的3D角色</h3>
          <PMXViewer />
        </div>
      </div>

      <div class="contact-section">
        <h3>联系方式</h3>
        <div class="contact-info">
          <div class="contact-item">
            <i class="ic i-mail"></i>
            <span>Email: example@email.com</span>
          </div>
          <div class="contact-item">
            <i class="ic i-github"></i>
            <span>GitHub: github.com/yourname</span>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import PageContainer from '@/components/PageContainer.vue'
import PMXViewer from '@/components/PMXViewer.vue'
</script>

<style scoped>
.about-content {
  max-width: 100%;
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
}

.intro-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  align-items: start;
}

.text-content h2 {
  font-size: 1.8rem;
  color: #34495e;
  margin-bottom: 1rem;
}

.text-content p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
  margin-bottom: 1rem;
}

.skills {
  margin-top: 2rem;
}

.skills h3 {
  font-size: 1.3rem;
  color: #34495e;
  margin-bottom: 1rem;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.model-section h3 {
  font-size: 1.3rem;
  color: #34495e;
  margin-bottom: 1rem;
  text-align: center;
}

.contact-section {
  margin-top: 3rem;
  padding: 2rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.contact-section h3 {
  font-size: 1.3rem;
  color: #34495e;
  margin-bottom: 1rem;
  text-align: center;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  font-size: 1rem;
  color: #555;
}

.contact-item i {
  color: #667eea;
  font-size: 1.2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .intro-section {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  h1 {
    font-size: 2rem;
  }

  .text-content h2 {
    font-size: 1.5rem;
  }

  .text-content p {
    font-size: 1rem;
  }

  .skill-tags {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .about-content {
    padding: 1rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  .contact-section {
    padding: 1rem;
  }
}
</style>
