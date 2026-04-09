<!-- 首页 -->
<template>
  <div class="home">
    <Banner v-if="showHeader" :height="store.bannerType" />
    <div class="home-content">
      <div class="posts-content">
        <!-- 分类总览 -->
        <TypeBar :type="showTags ? 'tags' : 'categories'" />
        <!-- 文章列表 -->
        <PostList :listData="postData" />
        <!-- 分页 -->
        <Pagination
          :total="allListTotal"
          :page="Number(page)"
          :limit="postSize"
          :useParams="showCategories || showTags ? true : false"
          :routePath="
            normalizedCategory
              ? createTaxonomyHref('/pages/categories', normalizedCategory)
              : normalizedTag
                ? createTaxonomyHref('/pages/tags', normalizedTag)
                : ''
          "
        />
      </div>
      <!-- 侧边栏 -->
      <Aside />
    </div>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import { createTaxonomyHref, decodeTaxonomyName } from "@/utils/taxonomy.mjs";

const { theme } = useData();
const store = mainStore();
const props = defineProps({
  // 显示首页头部
  showHeader: {
    type: Boolean,
    default: false,
  },
  // 当前页数
  page: {
    type: Number,
    default: 1,
  },
  // 显示分类
  showCategories: {
    type: [null, String],
    default: null,
  },
  // 显示标签
  showTags: {
    type: [null, String],
    default: null,
  },
});

// 每页文章数
const postSize = theme.value.postSize;
const HOME_BLOG_FOLDER = "博客";
const normalizedCategory = computed(() => decodeTaxonomyName(props.showCategories));
const normalizedTag = computed(() => decodeTaxonomyName(props.showTags));

const normalizePostPath = (path) => {
  if (typeof path !== "string") return "";
  return decodeURIComponent(path)
    .replace(/^\//, "")
    .replace(/^posts\//, "")
    .replace(/\.html$/, "");
};

const isHomeBlogPost = (post) => {
  const postPath = normalizePostPath(post?.regularPath);
  if (!postPath.startsWith(`${HOME_BLOG_FOLDER}/`)) return false;
  const fileName = postPath.split("/").pop()?.toLowerCase() || "";
  if (post?.type === "index") return false;
  return !(fileName === "index" || fileName === "readme" || fileName.includes("索引"));
};

const baseData = computed(() => {
  if (normalizedCategory.value) {
    return theme.value.categoriesData[normalizedCategory.value]?.articles || [];
  }
  if (normalizedTag.value) {
    return theme.value.tagsData[normalizedTag.value]?.articles || [];
  }
  return (theme.value.postData || []).filter(isHomeBlogPost);
});

// 列表总数量
const allListTotal = computed(() => {
  return baseData.value.length;
});

// 获得当前页数
const getCurrentPage = () => {
  if (props.showCategories || props.showTags) {
    if (typeof window === "undefined") return 0;
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page");
    if (!page) return 0;
    const currentPage = Number(page);
    return currentPage ? currentPage - 1 : 0;
  }
  return props.page ? props.page - 1 : 0;
};

// 根据页数计算列表数据
const postData = computed(() => {
  const page = getCurrentPage();
  let data = baseData.value;
  // 返回列表
  return data.slice(page * postSize, page * postSize + postSize);
});

// 恢复滚动位置
const restoreScrollY = (val) => {
  if (typeof window === "undefined" || val) return false;
  const scrollY = store.lastScrollY;
  nextTick().then(() => {
    console.log("滚动位置：", scrollY);
    // 平滑滚动
    window.scrollTo({
      top: scrollY,
      behavior: "smooth",
    });
    // 清除滚动位置
    store.lastScrollY = 0;
  });
};

// 监听加载结束
watch(
  () => store.loadingStatus,
  (val) => restoreScrollY(val),
);
</script>

<style lang="scss" scoped>
.home {
  .home-content {
    width: 100%;
    display: flex;
    flex-direction: row;
    .posts-content {
      width: calc(100% - 300px);
      transition: width 0.3s;
    }
    .main-aside {
      width: 300px;
      padding-left: 1rem;
    }
    @media (max-width: 1200px) {
      .posts-content {
        width: 100%;
      }
      .main-aside {
        display: none;
      }
    }
  }
}
</style>
