import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "Pages",
  description: "A set of tools to allow development for Yext Pages",
  lastUpdated: true,
  markdown: { attrs: { disable: true } },

  themeConfig: {
    lastUpdatedText: "Last Updated",
    editLink: {
      pattern:
        "https://github.com/yext/pages/tree/main/packages/pages/docs/:path",
      text: "Edit This Page",
    },
    nav: [
      { text: "Guide", link: "/index.html", activeMatch: "^/$|^/index.html" },
      { text: "API", link: "/api/index.html", activeMatch: "^/$|^/api/" },
    ],
    sidebar: getSidebar(),
  },
});

function getSidebar() {
  return [
    { text: "Guide", items: [{ text: "Home", link: "/index.html" }] },
    {
      text: "API",
      items: [{ text: "API Docs", link: "/api/index.html" }],
    },
  ];
}
