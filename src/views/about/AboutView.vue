<template>
  <PageContainer>
    <main class="profile-page">
      <section class="profile-card portrait-card">
        <header><span>♙</span><h2>人格画像</h2></header>
        <div class="trait-grid">
          <article v-for="item in profile.traits" :key="item.title"><strong>{{ item.title }}</strong><small>{{ item.subtitle }}</small></article>
        </div>
        <img v-if="profile.portrait_url" :src="profile.portrait_url" alt="人物画像" />
      </section>

      <section class="profile-card narrative-card">
        <header><span>✎</span><h2>自我陈述</h2></header>
        <p v-for="paragraph in introductionParagraphs" :key="paragraph">{{ paragraph }}</p>
      </section>

      <section class="profile-card skills-card">
        <header><span>▥</span><h2>能力偏好</h2></header>
        <article v-for="item in profile.skills" :key="item.name"><span>{{ item.name }}</span><i><b :style="{width:`${item.value}%`}"></b></i><strong>{{ item.value }}%</strong></article>
      </section>

      <section class="profile-card timeline-card">
        <header><span>♙</span><h2>人生时间线</h2></header>
        <div>
          <article v-for="item in profile.timeline" :key="item.title"><i></i><strong>{{ item.title }}</strong><small>{{ item.description }}</small></article>
        </div>
      </section>

      <section class="profile-card snapshots-card">
        <header><span>▧</span><h2>理想生活碎片</h2></header>
        <div>
          <article v-for="item in profile.snapshots" :key="item.url"><img :src="item.url" alt="" /><strong>{{ item.title }}</strong><small>{{ item.description }}</small></article>
        </div>
      </section>

      <section class="profile-card contact-card">
        <header><span>➤</span><h2>联系与留言</h2></header>
        <a :href="`mailto:${profile.contact_email}`">✉ {{ profile.contact_email }}</a>
        <p>{{ profile.contact_message }}</p>
        <router-link to="/friends">去留言　♡</router-link>
      </section>
    </main>
  </PageContainer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import PageContainer from '@/components/PageContainer.vue'
import { useAboutStore } from '@/stores/about'

const aboutStore = useAboutStore()
const profile = computed(() => aboutStore.profile)
const introductionParagraphs = computed(() => (profile.value.introduction || '').split(/\n+/).filter(Boolean))
onMounted(aboutStore.loadAboutData)
</script>

<style scoped lang="scss" src="@/styles/sfc/views/about/AboutView.scss"></style>
