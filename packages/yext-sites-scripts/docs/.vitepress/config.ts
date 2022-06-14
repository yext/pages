import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "Yext Sites Scripts",
  description: "A set of tools to allow development for Yext Sites",
  lastUpdated: true,
  markdown: { attrs: { disable: true } },

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

    sidebar: getSidebar(),
  },
});

function getSidebar() {
  return [
    { text: "Guide", items: [{ text: "Home", link: "/index.html" }] },
    {
      text: "Basics",
      items: [
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
      items: [
        { text: "Entry Points", link: "/advanced/entry-points.html" },
        {
          text: "Vite Build Process",
          link: "/advanced/vite-build-process.html",
        },
      ],
    },
    {
      text: "API",
      items: [{ text: "API Docs", link: "/api/index.html" }],
    },
  ];
}
