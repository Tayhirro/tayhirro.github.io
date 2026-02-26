---
title: 分类
aside: false
padding: false
---

<script setup>
import { onMounted, computed, watch } from "vue";
import { useData } from "vitepress"
import Home from "@/views/Home.vue"
import FolderTree from "@/components/List/FolderTree.vue"

const { params, site, theme } = useData();

const categoryName = computed(() => {
  return params.value.name ? decodeURIComponent(params.value.name) : ''
})

onMounted(() => {
  if (params.value.name) {
    document.title = `分类：${params.value.name} | ${site.value.title}`;
  }
});
</script>

<div class="category-page">
  <FolderTree :categoryName="categoryName" :postData="theme.postData" :categoriesData="theme.categoriesData" />
  <Home :showHeader="false" :showCategories="params.name" />
</div>

<style scoped>
.category-page {
  padding: 20px;
}
</style>
