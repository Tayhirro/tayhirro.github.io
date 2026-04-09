---
title: 分类
aside: false
padding: false
---

<script setup>
import { computed, watch } from "vue";
import { useData } from "vitepress"
import Home from "@/views/Home.vue"
import FolderTree from "@/components/List/FolderTree.vue"
import { decodeTaxonomyName } from "@/utils/taxonomy.mjs"

const { params, site, theme } = useData();

const categoryName = computed(() => {
  return decodeTaxonomyName(params.value.name)
})

watch(
  categoryName,
  (value) => {
    if (value) {
      document.title = `分类：${value} | ${site.value.title}`;
    }
  },
  { immediate: true },
)
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
