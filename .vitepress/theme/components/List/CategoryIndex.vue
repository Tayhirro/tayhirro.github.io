<template>
  <div class="category-index">
    <Banner
      type="page"
      title="全部分类"
      desc="浏览所有分类"
      footer=""
      image="https://pan.811520.xyz/2024-10/1730367564-1730367553978.webp"
    />
    
    <div class="category-content">
      <div class="category-grid">
        <a
          v-for="category in categories"
          :key="category.name"
          :href="category.path"
          class="category-card s-card hover"
        >
          <div class="card-icon">
            <i class="iconfont icon-folder"></i>
          </div>
          <div class="card-info">
            <h3 class="card-title">{{ category.name }}</h3>
            <p class="card-count">{{ category.count }} 篇文章</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import Banner from '@/components/Banner.vue'
import { createTaxonomyHref, decodeTaxonomyName } from '@/utils/taxonomy.mjs'

const { theme } = useData()

const categories = computed(() => {
  const catData = theme.value.categoriesData || {}
  return Object.entries(catData).map(([name, data]) => ({
    name: decodeTaxonomyName(name),
    path: createTaxonomyHref('/pages/categories', name),
    count: data.count || 0
  })).sort((a, b) => b.count - a.count)
})

onMounted(() => {
  document.title = `全部分类 | ${theme.value.siteMeta?.title || ''}`
})
</script>

<style lang="scss" scoped>
.category-index {
  .category-content {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
    
    .category-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border-radius: 12px;
      transition: all 0.3s;
      
      .card-icon {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--main-color), var(--main-color-opacity));
        border-radius: 12px;
        
        .iconfont {
          font-size: 28px;
          color: #fff;
        }
      }
      
      .card-info {
        flex: 1;
        
        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--main-font-color);
          margin-bottom: 4px;
        }
        
        .card-count {
          font-size: 14px;
          color: var(--main-font-second-color);
        }
      }
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }
    }
  }
}

@media (max-width: 768px) {
  .category-index {
    .category-content {
      padding: 16px;
    }
    
    .category-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      
      .category-card {
        padding: 16px;
        flex-direction: column;
        text-align: center;
        
        .card-icon {
          width: 48px;
          height: 48px;
          
          .iconfont {
            font-size: 24px;
          }
        }
        
        .card-info {
          .card-title {
            font-size: 14px;
          }
          
          .card-count {
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>
