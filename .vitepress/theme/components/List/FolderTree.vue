<template>
  <div class="folder-tree">
    <!-- 面包屑导航 -->
    <div v-if="breadcrumbs.length > 0" class="breadcrumbs s-card">
      <a href="/pages/categories" class="crumb">
        <i class="iconfont icon-home"></i>
        首页
      </a>
      <template v-for="(crumb, index) in breadcrumbs" :key="index">
        <i class="iconfont icon-arrow-right"></i>
        <a
          :href="`/pages/categories/${crumb.path}`"
          :class="['crumb', { active: index === breadcrumbs.length - 1 }]"
        >
          {{ crumb.name }}
        </a>
      </template>
    </div>

    <!-- 当前层级的文件夹和索引 -->
    <div class="current-level">
      <!-- 子文件夹列表 -->
      <div v-if="currentLevelData.folders.length > 0" class="folders-section">
        <h3 class="section-title">
          <i class="iconfont icon-folder"></i>
          子文件夹
        </h3>
        <div class="folder-grid">
          <a
            v-for="folder in currentLevelData.folders"
            :key="folder.name"
            :href="folder.link"
            class="folder-card s-card hover"
          >
            <i class="iconfont icon-folder"></i>
            <span class="folder-name">{{ folder.name }}</span>
            <span class="folder-desc" v-if="folder.desc">{{ folder.desc }}</span>
          </a>
        </div>
      </div>

      <!-- 索引文件列表 -->
      <div v-if="currentLevelData.indexes.length > 0" class="indexes-section">
        <h3 class="section-title">
          <i class="iconfont icon-article"></i>
          索引文档
        </h3>
        <div class="post-grid">
          <a
            v-for="post in currentLevelData.indexes"
            :key="post.regularPath"
            :href="post.regularPath"
            class="post-card s-card hover"
          >
            <div class="post-cover" v-if="post.cover">
              <img :src="post.cover" :alt="post.title" />
            </div>
            <div class="post-info">
              <h4 class="post-title">{{ post.title }}</h4>
              <p class="post-desc" v-if="post.description">{{ post.description }}</p>
              <div class="post-meta">
                <span class="post-date">{{ formatDate(post.date) }}</span>
              </div>
            </div>
          </a>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="currentLevelData.folders.length === 0 && currentLevelData.indexes.length === 0" class="empty-state">
        <i class="iconfont icon-empty"></i>
        <p>该分类下暂无内容</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const props = defineProps({
  categoryName: {
    type: String,
    default: ''
  },
  postData: {
    type: Array,
    default: () => []
  },
  categoriesData: {
    type: Object,
    default: () => ({})
  }
})

const currentCategory = computed(() => {
  const match = route.path.match(/\/pages\/categories\/(.+)/)
  if (match) {
    return decodeURIComponent(match[1])
  }
  return props.categoryName
})

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const breadcrumbs = computed(() => {
  if (!currentCategory.value) return []
  const parts = currentCategory.value.split('/')
  let path = ''
  return parts.map((part, index) => {
    path += index === 0 ? part : '/' + part
    return {
      name: part,
      path: path.replace(/^\//, '')
    }
  })
})

const normalizePath = (path) => {
  if (typeof path !== 'string') return ''
  let value = decodeURIComponent(path).replace(/\\/g, '/')
  value = value.replace(/^\//, '').replace(/\.html$/, '').replace(/\.md$/, '')
  value = value.replace(/^posts\//, '')
  return value
}

const getCategoryPosts = (category) => {
  const byCategory = props.categoriesData?.[category]?.articles
  if (Array.isArray(byCategory) && byCategory.length > 0) {
    return byCategory
  }
  return props.postData.filter((post) => normalizePath(post?.regularPath).startsWith(`${category}/`))
}

const isIndexFileName = (name) => {
  if (!name) return false
  const lower = name.toLowerCase()
  return name.includes('索引') || lower === 'index' || lower === 'readme'
}

const findIndexFile = (category) => {
  const posts = getCategoryPosts(category)
  const candidates = new Set([
    `${category}/索引`,
    `${category}/index`,
    `${category}/README`,
    `${category}/readme`,
    `${category}/${category.split('/').pop()}索引`,
  ])
  return posts.find((post) => {
    const postPath = normalizePath(post?.regularPath)
    return candidates.has(postPath)
  })
}

const parseIndexContent = (indexPost, category) => {
  const text = indexPost?.content || indexPost?.description || ''
  if (!text) return { folders: [], indexes: [] }

  const folders = []
  const indexes = []
  const seenFolders = new Set()
  const seenIndexes = new Set()
  const postByPath = new Map()

  props.postData.forEach((post) => {
    postByPath.set(normalizePath(post?.regularPath), post)
  })
  
  const linkRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/g
  let match
  
  while ((match = linkRegex.exec(text)) !== null) {
    const name = match[1]
    const link = decodeURIComponent(match[2]).trim()
    if (!link || link.startsWith('http://') || link.startsWith('https://')) continue

    const cleanLink = link.replace(/^\.\//, '').replace(/\.md$/, '')
    
    if (cleanLink.includes('/')) {
      const folderName = cleanLink.split('/')[0]
      if (!seenFolders.has(folderName)) {
        seenFolders.add(folderName)
        folders.push({
          name: folderName,
          link: `/pages/categories/${category}/${folderName}`,
          desc: name
        })
      }
    } else {
      const targetPath = normalizePath(`${category}/${cleanLink}`)
      const post = postByPath.get(targetPath)
      if (post && !seenIndexes.has(post.regularPath)) {
        seenIndexes.add(post.regularPath)
        indexes.push(post)
      }
    }
  }
  
  return { folders, indexes }
}

const currentLevelData = computed(() => {
  const category = currentCategory.value
  if (!category) {
    return { folders: [], indexes: [] }
  }
  
  const indexFile = findIndexFile(category)
  
  if (indexFile) {
    const parsed = parseIndexContent(indexFile, category)
    if (parsed.folders.length > 0 || parsed.indexes.length > 0) {
      return parsed
    }
  }

  const posts = getCategoryPosts(category)
  
  const folders = new Map()
  const indexes = []
  
  posts.forEach(post => {
    const postPath = normalizePath(post?.regularPath)
    if (!postPath) return
    const categoryPath = normalizePath(category)
    if (!postPath.startsWith(`${categoryPath}/`)) return
    const relativePath = postPath.substring(categoryPath.length + 1)
    
    if (!relativePath) {
      return
    }
    
    const parts = relativePath.split('/')
    
    if (parts.length === 1) {
      const fileName = parts[0]
      if (isIndexFileName(fileName)) {
        if (!indexes.find(i => i.regularPath === post.regularPath)) {
          indexes.unshift(post)
        }
      } else {
        if (!indexes.find(i => i.regularPath === post.regularPath)) {
          indexes.push(post)
        }
      }
    } else if (parts.length > 1) {
      const firstFolder = parts[0]
      if (!folders.has(firstFolder)) {
        const folderPath = `${category}/${firstFolder}`
        const folderIndex = posts.find(p => {
          const pPath = p?.regularPath?.replace(/^\//, '').replace('.html', '')
          const normalized = normalizePath(pPath)
          return normalized === `${folderPath}/索引` || normalized === `${folderPath}/index` || normalized === `${folderPath}/readme`
        })
        folders.set(firstFolder, {
          name: firstFolder,
          link: `/pages/categories/${folderPath}`,
          desc: folderIndex?.title || ''
        })
      }
    }
  })
  
  return {
    folders: Array.from(folders.values()),
    indexes: indexes
  }
})
</script>

<style lang="scss" scoped>
.folder-tree {
  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    
    .crumb {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--main-font-second-color);
      font-size: 14px;
      transition: color 0.3s;
      
      &:hover {
        color: var(--main-color);
      }
      
      &.active {
        color: var(--main-font-color);
        font-weight: 600;
        cursor: default;
        
        &:hover {
          color: var(--main-font-color);
        }
      }
      
      .iconfont {
        font-size: 12px;
      }
    }
  }
  
  .current-level {
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--main-font-color);
      
      .iconfont {
        color: var(--main-color);
      }
    }
    
    .folders-section {
      margin-bottom: 32px;
    }
    
    .folder-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      
      .folder-card {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
        border-radius: 12px;
        transition: all 0.3s;
        
        .iconfont {
          font-size: 24px;
          color: var(--main-color);
        }
        
        .folder-name {
          font-weight: 500;
          color: var(--main-font-color);
        }
        
        .folder-desc {
          font-size: 12px;
          color: var(--main-font-second-color);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }
    }
    
    .post-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      
      .post-card {
        display: flex;
        flex-direction: column;
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s;
        
        .post-cover {
          width: 100%;
          height: 140px;
          overflow: hidden;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
          }
        }
        
        .post-info {
          padding: 16px;
          
          .post-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--main-font-color);
            margin-bottom: 8px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .post-desc {
            font-size: 14px;
            color: var(--main-font-second-color);
            margin-bottom: 12px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .post-meta {
            font-size: 12px;
            color: var(--main-font-second-color);
          }
        }
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          
          .post-cover img {
            transform: scale(1.05);
          }
        }
      }
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--main-font-second-color);
      
      .iconfont {
        font-size: 48px;
        margin-bottom: 16px;
        display: block;
      }
    }
  }
}

@media (max-width: 768px) {
  .folder-tree {
    .current-level {
      .folder-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        
        .folder-card {
          padding: 12px;
          
          .folder-name {
            font-size: 14px;
          }
        }
      }
      
      .post-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
