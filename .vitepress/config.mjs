import { defineConfig } from "vitepress";
import { createRssFile } from "./theme/utils/generateRSS.mjs";
import { withPwa } from "@vite-pwa/vitepress";
import {
  getAllPosts,
  getAllType,
  getAllCategories,
  getAllArchives,
} from "./theme/utils/getPostData.mjs";
import { jumpRedirect } from "./theme/utils/commonTools.mjs";
import { getThemeConfig } from "./init.mjs";
import markdownConfig from "./theme/utils/markdownConfig.mjs";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import path from "path";

// 辅助函数：转义行内代码和行内数学以外的 < 字符
function escapeAngleBrackets(line) {
  let result = "";
  let i = 0;
  while (i < line.length) {
    // 行内代码：保持原样
    if (line[i] === "`") {
      let count = 0;
      const start = i;
      while (i < line.length && line[i] === "`") { count++; i++; }
      const closer = "`".repeat(count);
      const closerIdx = line.indexOf(closer, i);
      if (closerIdx !== -1) {
        result += line.substring(start, closerIdx + count);
        i = closerIdx + count;
      } else {
        result += line.substring(start);
        i = line.length;
      }
    }
    // 行内数学 $...$：保持原样（避免 \< 破坏 LaTeX）
    else if (line[i] === "$") {
      if (i + 1 < line.length && line[i + 1] === "$") {
        // $$ 在行内 —— 保持到下一个 $$
        const start = i;
        i += 2;
        const closerIdx = line.indexOf("$$", i);
        if (closerIdx !== -1) {
          result += line.substring(start, closerIdx + 2);
          i = closerIdx + 2;
        } else {
          result += line.substring(start);
          i = line.length;
        }
      } else {
        const start = i;
        i += 1;
        const closerIdx = line.indexOf("$", i);
        if (closerIdx !== -1) {
          result += line.substring(start, closerIdx + 1);
          i = closerIdx + 1;
        } else {
          result += line.substring(start);
          i = line.length;
        }
      }
    }
    // < 字符：用 markdown 反斜杠转义
    else if (line[i] === "<") {
      result += "\\<";
      i++;
    } else {
      result += line[i];
      i++;
    }
  }
  return result;
}

// 获取全局数据
const postData = await getAllPosts();

// 获取主题配置
const themeConfig = await getThemeConfig();

// https://vitepress.dev/reference/site-config
export default withPwa(
  defineConfig({
    title: themeConfig.siteMeta.title,
    description: themeConfig.siteMeta.description,
    lang: themeConfig.siteMeta.lang,
    // 简洁的 URL
    cleanUrls: true,
    // 忽略死链接（Obsidian wiki 链接没有 .md 后缀，VitePress 会误报）
    ignoreDeadLinks: true,
    // 最后更新时间戳
    lastUpdated: true,
    // 主题
    appearance: "dark",
    // Head
    head: themeConfig.inject.header,
    // sitemap
    sitemap: {
      hostname: themeConfig.siteMeta.site,
    },
    // 主题配置
    themeConfig: {
      ...themeConfig,
      // 必要数据
      postData: postData,
      tagsData: getAllType(postData),
      categoriesData: getAllCategories(postData),
      archivesData: getAllArchives(postData),
    },
    // markdown
    markdown: {
      math: true,
      lineNumbers: true,
      toc: { level: [1, 2, 3] },
      image: {
        lazyLoading: true,
      },
      config: (md) => markdownConfig(md, themeConfig),
    },
    // 构建排除
    srcExclude: [
      "**/README.md",
      "**/TODO.md",
      "posts/SWE-agent/**",
      "posts/hmdp/**",
      "posts/HMDP-Redis/**",
      "posts/shipany-rich-editor/**",
      "posts/silicon-rider-bench/**",
      "posts/SpringBoot-Notes/**",
    ],
    // transformHead
    transformPageData: async (pageData) => {
      // canonical URL
      const canonicalUrl = `${themeConfig.siteMeta.site}/${pageData.relativePath}`
        .replace(/index\.md$/, "")
        .replace(/\.md$/, "");
      pageData.frontmatter.head ??= [];
      pageData.frontmatter.head.push(["link", { rel: "canonical", href: canonicalUrl }]);
    },
    // transformHtml
    transformHtml: (html) => {
      return jumpRedirect(html, themeConfig);
    },
    // buildEnd
    buildEnd: async (config) => {
      await createRssFile(config, themeConfig);
    },
    // vite
    vite: {
      plugins: [
        // 预处理插件：修复 markdown 中会导致 VitePress 构建失败的内容
        // 1) 替换 Windows 本地图片路径
        // 2) 移除含本地路径的 <img> 标签
        // 3) 将 <img> 远程 URL 标签转为 markdown 语法
        // 4) 转义代码块/行内代码/数学公式以外的 < 字符
        // 不修改源文件，仅在构建时生效
        {
          name: "fix-md-for-vitepress",
          enforce: "pre",
          transform(code, id) {
            if (!id.endsWith(".md")) return;
            // 只处理 posts/ 目录下的文件，不影响 pages/ 等包含 Vue 组件的 md
            if (!id.replace(/\\/g, "/").includes("/posts/")) return;
            let result = code;

            // 替换 markdown 图片语法中的本地路径 ![alt](C:\...)
            result = result.replace(
              /!\[([^\]]*)\]\([A-Z]:\\[^)]+\)/g,
              "![$1]()"
            );

            // 移除含本地路径的 <img> 标签（Typora 生成）
            result = result.replace(
              /<img\s+src="[A-Z]:\\[^"]*"[^>]*\/?>/gi,
              ""
            );

            // 将远程 URL 的 <img> 标签转为 markdown 图片语法
            result = result.replace(
              /<img\s+src="(https?:\/\/[^"]+)"(?:\s+alt="([^"]*)")?[^>]*\/?>/gi,
              (_, src, alt) => `![${alt || ""}](${src})`
            );

            // 逐行处理：转义代码块/行内代码/数学以外的 <
            const lines = result.split("\n");
            let inCodeBlock = false;
            let inFrontmatter = false;
            let inMathBlock = false;

            for (let i = 0; i < lines.length; i++) {
              const trimmed = lines[i].trimStart();

              // 跟踪 YAML frontmatter
              if (i === 0 && trimmed === "---") {
                inFrontmatter = true;
                continue;
              }
              if (inFrontmatter) {
                if (trimmed === "---") inFrontmatter = false;
                continue;
              }

              // 跟踪围栏代码块
              if (trimmed.startsWith("```")) {
                inCodeBlock = !inCodeBlock;
                continue;
              }
              if (inCodeBlock) continue;

              // 跟踪显示数学块 $$
              if (trimmed === "$$") {
                inMathBlock = !inMathBlock;
                continue;
              }
              if (inMathBlock) continue;

              // 跳过没有 < 的行
              if (!lines[i].includes("<")) continue;

              // 转义行内代码和行内数学以外的 <
              lines[i] = escapeAngleBrackets(lines[i]);
            }

            result = lines.join("\n");
            if (result !== code) return result;
          },
        },
        AutoImport({
          imports: ["vue", "vitepress"],
          dts: ".vitepress/auto-imports.d.ts",
        }),
        Components({
          dirs: [".vitepress/theme/components", ".vitepress/theme/views"],
          extensions: ["vue", "md"],
          include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
          dts: ".vitepress/components.d.ts",
        }),
      ],
      resolve: {
        // 配置路径别名
        alias: {
          // eslint-disable-next-line no-undef
          "@": path.resolve(__dirname, "./theme"),
        },
      },
      css: {
        preprocessorOptions: {
          scss: {
            silenceDeprecations: ["legacy-js-api"],
          },
        },
      },
      // 服务器
      server: {
        port: 9877,
      },
      // 构建
      build: {
        minify: "terser",
        terserOptions: {
          compress: {
            pure_funcs: ["console.log"],
          },
        },
      },
    },
    // PWA
    pwa: {
      registerType: "autoUpdate",
      selfDestroying: true,
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        // 资源缓存
        runtimeCaching: [
          {
            urlPattern: /(.*?)\.(woff2|woff|ttf|css)/,
            handler: "CacheFirst",
            options: {
              cacheName: "file-cache",
            },
          },
          {
            urlPattern: /(.*?)\.(ico|webp|png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
            },
          },
          {
            urlPattern: /^https:\/\/cdn2\.codesign\.qq\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "iconfont-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 2,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // 缓存文件
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,gif,svg,woff2,ttf}"],
        // 排除路径
        navigateFallbackDenylist: [/^\/sitemap.xml$/, /^\/rss.xml$/, /^\/robots.txt$/],
      },
      manifest: {
        name: themeConfig.siteMeta.title,
        short_name: themeConfig.siteMeta.title,
        description: themeConfig.siteMeta.description,
        display: "standalone",
        start_url: "/",
        theme_color: "#fff",
        background_color: "#efefef",
        icons: [
          {
            src: "/images/logo/favicon-32x32.webp",
            sizes: "32x32",
            type: "image/webp",
          },
          {
            src: "/images/logo/favicon-96x96.webp",
            sizes: "96x96",
            type: "image/webp",
          },
          {
            src: "/images/logo/favicon-256x256.webp",
            sizes: "256x256",
            type: "image/webp",
          },
          {
            src: "/images/logo/favicon-512x512.webp",
            sizes: "512x512",
            type: "image/webp",
          },
        ],
      },
    },
  }),
);
