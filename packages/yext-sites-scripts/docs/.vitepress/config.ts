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

    nav: [
      { text: "Guide", link: "/index.html", activeMatch: "^/$|^/index.html" },
      { text: "API", link: "/api/index.html", activeMatch: "^/$|^/api/" },
    ],

    sidebar: {
      "/basics/": getSidebar(),
      "/advanced/": getSidebar(),
      "/api/": getSidebar(),
      "/": getSidebar(),
    },
  },
});

function getSidebar() {
  return [
    { text: "Guide", link: "/index.html" },
    {
      text: "Basics",
      children: [
        { text: "Global Data", link: "/basics/global-data.html" },
        { text: "Pages", link: "/basics/pages.html" },
        { text: "Redirects", link: "/basics/redirects.html" },
        { text: "Repo Structure", link: "/basics/repo-structure.html" },
        { text: "Styling", link: "/basics/styling.html" },
        { text: "Templates", link: "/basics/templates.html" },
      ],
    },
    {
      text: "Advanced",
      children: [
        { text: "Entry Points", link: "/advanced/entry-points.html" },
        {
          text: "Vite Build Process",
          link: "/advanced/vite-build-process.html",
        },
      ],
    },
    {
      text: "API",
      children: [{ text: "API Docs", link: "/api/index.html" }],
    },
  ];
}
