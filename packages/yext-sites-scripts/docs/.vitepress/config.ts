import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "Yext Sites Scripts",
  description: "A set of tools to allow development for Yext Sites",
  lastUpdated: true,

  themeConfig: {
    repo: "yext/sites-scripts",
    docsDir: "docs",
    docsBranch: "main",
    editLinks: false,
    lastUpdated: "Last Updated",

    nav: [{ text: "API", link: "/api/index.html", activeMatch: "^/$|^/api/" }],

    sidebar: {
      "/api/": getSidebar(),
      "/": getSidebar(),
    },
  },
});

function getSidebar() {
  return [
    {
      text: "Introduction",
      children: [
        { text: "What is Yext Sites Scripts?", link: "/" },
        { text: "API Docs", link: "/api/index.html" },
      ],
    },
    {
      text: "Advanced",
      children: [{ text: "TODO - add stuff", link: "/" }],
    },
  ];
}
