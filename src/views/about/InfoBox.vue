<template>
  <div class="info-box">
    <div class="info-box-background"></div>
    <div class="info-box-content">
      <h2 class="info-box-title">{{ data.title }}</h2>
      <div class="info-box-layout">
        <div class="info-box-text">
          <template v-for="(section, key) in data.sections" :key="key">
            <h3 v-if="section.title">{{ section.title }}</h3>
            <p v-if="section.content">{{ section.content }}</p>
            <ul v-if="section.list" class="info-list">
              <li v-for="(item, index) in section.list" :key="index">{{ item }}</li>
            </ul>
          </template>
        </div>
        <div v-if="data.image" class="info-box-image">
          <img :src="data.image" :alt="data.title" class="info-img" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped lang="scss" src="@/styles/sfc/views/about/InfoBox.scss"></style>
