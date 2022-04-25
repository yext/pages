# Repo Structure

Here is the repo structure that the starter will get you set up. The starter repo is pre-configured with Tailwind for styling.

```
.
├── src
│   ├── templates
│   │   ├── template-1.tsx
│   │   └── template-2.tsx
│   ├── pages
│   │   ├── page-1.tsx
│   │   └── page-2.tsx
│   ├── components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── layout.tsx
│   └── global.ts
├── sites-config
│   ├── ci_config.json
├── package.json
├── entry.server.js
├── entry.client.js
├── postcss.config.cjs
├── tailwind.config.js
└── README.md
```

Here are the key files and folders:

### **`src`**

The `src` folder is the key folder in the repo. This is where you will spend most of your time managing your site.

- `templates` - This folder contains page template. Each template references a stream in Yext and turns into a collection of pages based on the entities in the stream. [Learn more about templates](Templates%2017ff9e34f8064fa8bcee1442cfc02e5f.md)
- `pages` - This folder contains static pages. Each file in this folder represents a single page at a single URL.
- `components` - There is nothing special about this folder however it is common convention to store any shared components across pages and templates in this folder.

### **`sites-config`**

Inside the `sites-config` folder is the `ci_config.json` file. This file tells Sites how to build your site. You will not have to edit this file unless you want to customize the build process. You can learn more here.

### **Other Files**

There are some other configuration files that you might want to edit for more advanced use cases.

- `entry.server.js` - This is the entry point on the server for every page. This script runs `reactDom.renderToString`. Learn more here.
- `entry.client.js` - This is the entry point on the client for every page. This script handles hydration. Learn more here.