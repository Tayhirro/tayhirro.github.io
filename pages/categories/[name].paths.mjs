import { getAllPosts, getAllCategories } from "../../.vitepress/theme/utils/getPostData.mjs";

const postData = await getAllPosts();
const categoriesData = getAllCategories(postData);
const CATEGORY_PATH_TOKEN = "__SLASH__";

const normalizePostPath = (path) => {
  if (typeof path !== "string") return "";
  return decodeURIComponent(path)
    .replace(/^\//, "")
    .replace(/\.html$/, "")
    .replace(/^posts\//, "");
};

const encodeCategoryParam = (name) => name.replaceAll("/", CATEGORY_PATH_TOKEN);

const collectNestedCategories = (posts) => {
  const result = new Set();
  posts.forEach((post) => {
    const fullPath = normalizePostPath(post?.regularPath);
    if (!fullPath) return;
    const segments = fullPath.split("/");
    if (segments.length < 3) return;
    for (let i = 1; i < segments.length - 1; i++) {
      result.add(segments.slice(0, i + 1).join("/"));
    }
  });
  return result;
};

// 分类动态路由
export default {
  paths() {
    const pages = [];
    const names = new Set();
    // 生成每一页的路由参数
    Object.keys(categoriesData).forEach((key) => {
      names.add(key.toString());
    });
    collectNestedCategories(postData).forEach((key) => names.add(key));
    Array.from(names).forEach((name) => {
      pages.push({ params: { name: encodeCategoryParam(name) } });
    });
    console.info("分类动态路由：", pages);
    return pages;
  },
};
