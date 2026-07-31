<template>
  <PageContainer>
    <template #background>
      <div class="about-background">
        <div class="bg-top"></div>
        <div class="bg-middle"></div>
        <div class="bg-bottom"></div>
      </div>
    </template>

    <div class="about-content">
      <!-- 标题图片 -->
      <div class="title-section">
        <img src="@/assets/images/selftitle.png" alt="关于我" class="title-image" />
      </div>

      <!-- 第一个盒子：个人信息和3D模型 -->
      <div class="main-section">
        <!-- 左侧：个人信息卡片 -->
        <ProfileCard :profile-data="profileData" />

        <!-- 右侧：3D模型展示 -->
        <div class="model-section">
          <div class="model-container">
            <div class="model-title-container">
              <h3>{{ model3dData.title }}</h3>
            </div>
            <ModelViewer :initial-model-key="model3dData.modelKey" />
          </div>
        </div>
      </div>

      <!-- 动态信息盒子 -->
      <div class="info-boxes-container">
        <InfoBox v-for="(boxData, key) in infoBoxes" :key="key" :data="boxData" />
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import PageContainer from '@/components/PageContainer.vue'
import ModelViewer from '@/views/about/ModelViewer.vue'
import ProfileCard from '@/views/about/ProfileCard.vue'
import InfoBox from '@/views/about/InfoBox.vue'
import { useAboutStore } from '@/stores/about.js'

const aboutStore = useAboutStore()

// 计算属性：从store获取数据
const profileData = computed(() => aboutStore.getProfileData())
const model3dData = computed(() => aboutStore.getModel3dData())
const infoBoxes = computed(() => aboutStore.getInfoBoxes())

onMounted(() => {
  aboutStore.loadAboutData()
})
</script>

<style scoped lang="scss" src="@/styles/sfc/views/about/AboutView.scss"></style>
