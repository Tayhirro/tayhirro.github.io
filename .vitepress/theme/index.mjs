import { h, nextTick } from "vue";
import { createPinia } from "pinia";
import { routeChange } from "@/utils/initTools.mjs";
import { enhanceAppWithTabs } from "vitepress-plugin-tabs/client";
import LazyLoader from "@/components/LazyLoader.vue";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

// 根组件
import App from "@/App.vue";
// 全局样式
import "@/style/main.scss";

// pinia
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// InstantSearch
import InstantSearch from "vue-instantsearch/vue3/es";

// Theme
let mermaidPromise;
const renderMermaid = async () => {
  if (typeof window === "undefined") return;
  const hasMermaidBlock = document.querySelector("pre.mermaid");
  if (!hasMermaidBlock) return;
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((mod) => {
      const mermaid = mod.default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: "default",
      });
      return mermaid;
    });
  }
  const mermaid = await mermaidPromise;
  await nextTick();
  await mermaid.run({ querySelector: "pre.mermaid" });
};

const Theme = {
  // extends: Theme,
  Layout: () => {
    return h(App);
  },
  enhanceApp({ app, router, siteData }) {
    // 挂载
    app.use(pinia);
    app.use(InstantSearch);
    app.component("LazyLoader", LazyLoader);
    // 插件
    enhanceAppWithTabs(app);
    // 路由守卫
    router.onBeforeRouteChange = (to) => {
      routeChange("before", to);
    };
    router.onAfterRouteChanged = (to) => {
      routeChange("after", to);
      void renderMermaid();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("load", () => {
        void renderMermaid();
      });
    }
  },
};

export default Theme;
