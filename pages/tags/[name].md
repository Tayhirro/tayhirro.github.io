---
title: 标签
aside: false
padding: false
---

<script setup>
import { computed, watch } from "vue";
import { useData } from "vitepress"
import Home from "@/views/Home.vue"
import { decodeTaxonomyName } from "@/utils/taxonomy.mjs"

const { params, site } = useData();

const tagName = computed(() => decodeTaxonomyName(params.value.name))

watch(
  tagName,
  (value) => {
    if (value) {
      document.title = `标签：${value} | ${site.value.title}`;
    }
  },
  { immediate: true },
)
</script>

<Home :showHeader="false" :showTags="tagName" />
