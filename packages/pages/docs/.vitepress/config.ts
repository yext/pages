import { DefaultTheme, defineConfig } from "vitepress";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// eslint-disable-next-line no-unused-vars
const getSidebarSubfolder = (subfolderName: string) => {
  const dirPath = path.resolve(__dirname, "..", subfolderName);
  const files = readdirSync(dirPath);

  return files
    .filter((file) => file.endsWith(".md")) // Include only markdown files
    .map((file) => {
      const name = file.replace(/\.md$/, ""); // Remove the `.md` extension
      let updatedName = name.replace("pages.", "");
      updatedName = updatedName.charAt(0).toUpperCase() + updatedName.slice(1); // Capitalize the first letter

      return {
        text: updatedName,
        link: `${dirPath}/${name}`, // Build relative link
      };
    });
};

const sidebarGuide = (): DefaultTheme.SidebarItem[] => {
  return [
    {
      text: "Introduction",
      collapsed: false,
      items: [
        { text: "What is PagesJS?", link: "intro" },
        { text: "Getting Started", link: "getting-started" },
      ],
    },
    { text: "Config & API Reference", base: "/api/", link: "pages" },
  ];
};

export default defineConfig({
  title: "PagesJS",
  description: "Pages development for Yext.",
  markdown: {
    html: true,
  },
  themeConfig: {
    search: {
      provider: "local",
    },
    nav: [
      { text: "Home", link: "/" },
      {
        text: "Guide",
        link: "/guide//getting-started",
        activeMatch: "/guide/",
      },
      { text: "API Reference", link: "api//pages", activeMatch: "/api/" },
    ],

    sidebar: {
      "/guide/": { base: "/guide/", items: sidebarGuide() },
      "/api/": { base: "/api/", items: [{}] },
    },
    // {
    //   text: "API",
    //   items: getSidebarSubfolder(API_FOLDER),
    // },

    socialLinks: [{ icon: "github", link: "https://github.com/yext/pages" }],
  },
});
