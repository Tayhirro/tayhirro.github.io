---
title: 分类
aside: false
padding: false
---

<script setup>
import { onMounted } from "vue";
import { useData } from "vitepress"
import Home from "@/views/Home.vue"
import FolderTree from "@/components/List/FolderTree.vue"

const { params, site, theme } = useData();

onMounted(() => {
  document.title = `分类：${params.value.name} | ${site.value.title}`;
});
</script>

<template>
  <div class="category-page">
    <FolderTree v-if="params.name" :categoryName="params.name" :postData="theme.postData" :categoriesData="theme.categoriesData" />
    <Home :showHeader="false" :showCategories="params.name" />
  </div>
</template>

<style scoped>
.category-page {
  padding: 20px;
}
</style>
