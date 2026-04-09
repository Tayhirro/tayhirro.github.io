const ROUTE_SLASH_TOKEN = "__SLASH__";

/**
 * 将 VitePress 动态路由参数里的占位符还原成真实分类/标签名
 * @param {unknown} value
 * @returns {string}
 */
export const decodeTaxonomyName = (value) => {
  if (typeof value !== "string") return "";
  return decodeURIComponent(value).replaceAll(ROUTE_SLASH_TOKEN, "/").trim();
};

/**
 * 将分类/标签名转换成安全的站内路径
 * @param {unknown} value
 * @returns {string}
 */
export const encodeTaxonomyPath = (value) => {
  const decoded = decodeTaxonomyName(value).replace(/^[/\\]+|[/\\]+$/g, "");
  if (!decoded) return "";
  return decoded.split("/").map((part) => encodeURIComponent(part)).join("/");
};

/**
 * 生成分类/标签页链接
 * @param {string} basePath
 * @param {unknown} value
 * @returns {string}
 */
export const createTaxonomyHref = (basePath, value) => {
  const taxonomyPath = encodeTaxonomyPath(value);
  return taxonomyPath ? `${basePath}/${taxonomyPath}` : basePath;
};
