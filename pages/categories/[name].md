---
title: 分类
aside: false
padding: false
---

<script setup>
import { onMounted, computed } from "vue";
import { useData, useRoute } from "vitepress"
import Home from "@/views/Home.vue"
import FolderTree from "@/components/List/FolderTree.vue"

const route = useRoute()
const { site, theme } = useData();

const categoryName = computed(() => {
  const name = route.params?.name
  return name ? decodeURIComponent(name) : ''
})

onMounted(() => {
  const name = route.params?.name
  if (name) {
    document.title = `分类：${name} | ${site.value.title}`;
  }
});
</script>

<template>
  <div class="category-page">
    <FolderTree v-if="categoryName" :categoryName="categoryName" :postData="theme.postData" :categoriesData="theme.categoriesData" />
    <Home :showHeader="false" :showCategories="route.params?.name" />
  </div>
</template>

<style scoped>
.category-page {
  padding: 20px;
}
</style>
