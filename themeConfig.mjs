// 主题配置
export const themeConfig = {
  // 站点信息
  siteMeta: {
    // 站点标题
    title: "Tayhirro's Blog",
    // 站点描述
    description: "用于记录生活的点滴",
    // 站点logo
    logo: "/images/logo/logo.webp",
    // 站点地址
    site: "https://tayhirro.github.io",
    // 语言
    lang: "zh-CN",
    // 作者
    author: {
      name: "tayhirro",
      cover: "/images/logo/logo.webp",
      email: "tayhirro@gmail.com",
      link: "https://tayhirro.github.io",
    },
  },
  // 备案信息
  icp: "",
  // 建站日期
  since: "2026-02-25",
  // 每页文章数据
  postSize: 8,
  // inject
  inject: {
    // 头部
    // https://vitepress.dev/zh/reference/site-config#head
    header: [
      // favicon
      ["link", { rel: "icon", href: "/favicon.ico" }],
      // RSS
      [
        "link",
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "RSS",
          href: "https://tayhirro.github.io/rss.xml",
        },
      ],
      // 预载 CDN
      [
        "link",
        {
          crossorigin: "",
          rel: "preconnect",
          href: "https://s1.hdslb.com",
        },
      ],
      [
        "link",
        {
          crossorigin: "",
          rel: "preconnect",
          href: "https://mirrors.sustech.edu.cn",
        },
      ],
      // HarmonyOS font
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://s1.hdslb.com/bfs/static/jinkela/long/font/regular.css",
        },
      ],
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/lxgw-wenkai-screen-webfont/1.7.0/style.css",
        },
      ],
      // iconfont
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://cdn2.codesign.qq.com/icons/g5ZpEgx3z4VO6j2/latest/iconfont.css",
        },
      ],
      // Embed code
      ["link", { rel: "preconnect", href: "https://use.sevencdn.com" }],
      ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
      [
        "link",
        {
          crossorigin: "anonymous",
          href: "https://use.sevencdn.com/css2?family=Fira+Code:wght@300..700&display=swap",
          rel: "stylesheet",
        },
      ],
      // 预载 DocSearch
      [
        "link",
        {
          href: "https://X5EBEZB53I-dsn.algolia.net",
          rel: "preconnect",
          crossorigin: "",
        },
      ],
    ],
  },
  // 导航栏菜单
  nav: [
    {
      text: "文库",
      items: [
        { text: "文章列表", link: "/pages/archives", icon: "article" },
        { text: "全部分类", link: "/pages/categories", icon: "folder" },
        { text: "全部标签", link: "/pages/tags", icon: "hashtag" },
      ],
    },
    {
      text: "专栏",
      items: [
        { text: "技术分享", link: "/pages/categories/技术分享", icon: "technical" },
        { text: "我的项目", link: "/pages/project", icon: "code" },
        { text: "收藏大全", link: "/pages/project", icon: "tools" },
        { text: "工作备忘", link: "/pages/categories/工作备忘", icon: "people" },
        //{ text: "效率工具", link: "/pages/tools", icon: "tools" },
      ],
    },
    {
      text: "友圈",
      items: [
        { text: "友圈鱼塘", link: "/pages/friends", icon: "fish" },
        { text: "友情链接", link: "/pages/link", icon: "people" },
        { text: "畅所欲言", link: "/pages/message", icon: "chat" },
      ],
    },
    {
      text: "关于",
      items: [
        { text: "关于本站", link: "/pages/about", icon: "contacts" },
        { text: "隐私政策", link: "/pages/privacy", icon: "chat" },
        { text: "版权协议", link: "/pages/cc", icon: "people" },
        { text: "致谢名单", link: "/pages/thanks", icon: "reward" },
      ],
    },
  ],
  // 导航栏菜单 - 左侧
  navMore: [
    {
      name: "博客",
      list: [
        {
          icon: "/images/logo/logo.webp",
          name: "博客主站",
          url: "https://tayhirro.github.io/",
        },
      ],
    },
    {
      name: "常用",
      list: [
        {
          icon: "https://github.githubassets.com/assets/apple-touch-icon-144x144-b882e354c005.png",
          name: "博客仓库",
          url: "https://github.com/Tayhirro/tayhirro.github.io",
        },
      ],
    },
  ],
  // 封面配置
  cover: {
    // 是否开启双栏布局
    twoColumns: false,
    // 是否开启封面显示
    showCover: {
      // 是否开启封面显示 文章不设置cover封面会显示异常，可以设置下方默认封面
      enable: true,
      // 封面布局方式: left | right | both
      coverLayout: 'left',
      // 默认封面(随机展示)
      defaultCover: [
        'https://pan.811520.xyz/2024-10/1728279557702.webp',
        'https://pan.811520.xyz/2024-10/1728387512098.webp'
      ]
    }
  },
  // 页脚信息
  footer: {
    // 社交链接（请确保为偶数个）
    social: [
      {
        icon: "email",
        link: "mailto:tayhirro@gmail.com",
      },
      {
        icon: "github",
        link: "https://github.com/Tayhirro/",
      },
    ],
    // sitemap
    sitemap: [
      {
        text: "我的博客",
        items: [
          { text: "近期文章", link: "/" },
          { text: "全部分类", link: "/pages/categories" },
          { text: "全部标签", link: "/pages/tags" },
          { text: "文章归档", link: "/pages/archives" },
        ],
      },
      {
        text: "页面导航",
        items: [
          { text: "关于本站", link: "/pages/about" },
          { text: "隐私政策", link: "/pages/privacy" },
          { text: "版权协议", link: "/pages/cc" },
        ],
      },
      {
        text: "网站服务",
        items: [
          { text: "站点订阅", link: "https://tayhirro.github.io/rss.xml", newTab: true },
          { text: "问题反馈", link: "https://github.com/Tayhirro/tayhirro.github.io/issues", newTab: true },
        ],
      },
    ],
  },
  // 评论
  comment: {
    enable: false,
    // 评论系统选择
    // artalk / twikoo
    type: "twikoo",
    // artalk
    // https://artalk.js.org/
    artalk: {
      site: "",
      server: "",
    },
    // twikoo
    // https://twikoo.js.org/
    twikoo: {
      js: "",
      envId: "",
      region: "",
      lang: "zh-CN",
    },
  },
  // 侧边栏
  aside: {
    // 站点简介
    hello: {
      enable: true,
      text: "这里是 <strong>tayhirro</strong> 的个人博客，用于<strong>记录生活的点滴</strong>。",
    },
    // 目录
    toc: {
      enable: true,
    },
    // 标签
    tags: {
      enable: true,
    },
    // 倒计时
    countDown: {
      enable: true,
      // 倒计时日期
      data: {
        name: "春节",
        date: "2027-02-06",
      },
    },
    // 站点数据
    siteData: {
      enable: true,
    },
  },
  // 友链
  friends: {
    // 友链朋友圈
    circleOfFriends: "",
    // 动态友链
    dynamicLink: {
      server: "",
      app_token: "",
      table_id: "",
    },
  },
  // 音乐播放器
  // https://github.com/imsyy/Meting-API
  music: {
    enable: false,
    // url
    url: "https://meting-api-ten.vercel.app",
    // id
    id: 8152976493,
    // netease / tencent / kugou
    server: "netease",
    // playlist / album / song
    type: "playlist",
  },
  // 搜索
  // https://www.algolia.com/
  search: {
    enable: false,
    appId: "",
    apiKey: "",
    indexName: "",
  },
  // 打赏
  rewardData: {
    enable: false,
    // 微信二维码
    wechat: "",
    // 支付宝二维码
    alipay: "",
  },
  // 图片灯箱
  fancybox: {
    enable: true,
    js: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.umd.min.js",
    css: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.min.css",
  },
  // 外链中转
  jumpRedirect: {
    enable: true,
    // 排除类名
    exclude: [
      "cf-friends-link",
      "upyun",
      "icp",
      "author",
      "rss",
      "cc",
      "power",
      "social-link",
      "link-text",
      "travellings",
      "post-link",
      "report",
      "more-link",
      "skills-item",
      "right-menu-link",
      "link-card",
    ],
  },
  // 站点统计
  tongji: {
    "51la": "",
  },
};
