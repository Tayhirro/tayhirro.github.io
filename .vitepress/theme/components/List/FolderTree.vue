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

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const breadcrumbs = computed(() => {
  if (!props.categoryName) return []
  const parts = props.categoryName.split('/')
  let path = ''
  return parts.map((part, index) => {
    path += index === 0 ? part : '/' + part
    return {
      name: part,
      path: path.replace(/^\//, '')
    }
  })
})

const findIndexFile = (category) => {
  return props.postData.find(post => {
    const path = post?.regularPath
    if (!path) return false
    const postPath = path.replace(/^\//, '').replace('.html', '')
    const targetPath = category + '/索引' 
    const targetPath2 = category + '/index'
    const targetPath3 = category + '/README'
    return postPath === targetPath || postPath === targetPath2 || postPath === targetPath3
  })
}

const parseIndexContent = (indexPost) => {
  if (!indexPost || !indexPost.description) return { folders: [], indexes: [] }
  
  const desc = indexPost.description
  const folders = []
  const indexes = []
  
  const linkRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/g
  let match
  
  while ((match = linkRegex.exec(desc)) !== null) {
    const name = match[1]
    const link = match[2]
    
    if (link.includes('/')) {
      const folderName = link.split('/')[0]
      if (!folders.find(f => f.name === folderName)) {
        folders.push({
          name: folderName,
          link: `/${props.postData[0]?.regularPath?.split('/')[1] || 'posts'}/${link}`,
          desc: name
        })
      }
    }
  }
  
  return { folders, indexes }
}

const currentLevelData = computed(() => {
  if (!props.categoryName) {
    return { folders: [], indexes: [] }
  }
  
  const category = props.categoryName
  const indexFile = findIndexFile(category)
  
  if (indexFile) {
    const parsed = parseIndexContent(indexFile)
    if (parsed.folders.length > 0 || parsed.indexes.length > 0) {
      return parsed
    }
  }
  
  const posts = props.postData.filter(post => {
    const path = post?.regularPath
    if (typeof path !== 'string') return false
    const postPath = path.replace(/^\//, '').replace('.html', '')
    return postPath.startsWith(category + '/') || postPath === category
  })
  
  const folders = new Map()
  const indexes = []
  
  posts.forEach(post => {
    const path = post?.regularPath
    if (typeof path !== 'string') return
    const postPath = path.replace(/^\//, '').replace('.html', '')
    const relativePath = postPath.substring(category.length + 1)
    
    if (!relativePath) {
      return
    }
    
    const parts = relativePath.split('/')
    
    if (parts.length === 1) {
      const fileName = parts[0]
      if (fileName.includes('索引') || fileName.includes('index') || fileName === 'README') {
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
          return pPath === folderPath + '/索引' || pPath === folderPath + '/index' || pPath === folderPath + '/README'
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
