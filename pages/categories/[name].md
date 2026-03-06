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
const CATEGORY_PATH_TOKEN = '__SLASH__'

const getName = (value) => {
  if (Array.isArray(value)) return value.join('/')
  if (!value) return ''
  return value.replaceAll(CATEGORY_PATH_TOKEN, '/')
}

const categoryName = computed(() => {
  const rawName = getName(params?.value?.name)
  return rawName ? decodeURIComponent(rawName) : ''
})

onMounted(() => {
  const name = getName(params?.value?.name)
  if (name) {
    document.title = `分类：${decodeURIComponent(name)} | ${site.value.title}`;
  }
});
</script>

<div class="category-page">
  <FolderTree :categoryName="categoryName" :postData="theme.postData" :categoriesData="theme.categoriesData" />
  <Home :showHeader="false" :showCategories="categoryName" />
</div>

<style scoped>
.category-page {
  padding: 20px;
}
</style>
