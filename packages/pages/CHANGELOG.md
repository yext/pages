# 1.0.0-beta.0 (2022-07-22)

### Main Changes

PagesJS has hit beta! :fire: Besides adding new features and bug fixes, yext-sites-scripts has been renamed to pages. Additionally, the former vite-plugin-yext-sites-ssg has been moved under pages as well. This means that you now only need to import @yext/pages in your repo's package.json.

```
"@yext/pages": "1.0.0-beta.0"
```

To import the plugin, use `import yextSSG from "@yext/pages/vite-plugin";`.
To import types in your templates, use `import { TemplateConfig } from "@yext/pages";`.

### Features

- feat: standard dev server index.html
- feat: add relativePrefixToRoot and path to template props
- feat: add getRedirects function
- feat!: change Data interface to TemplateProps
- feat!: move streamOutput up one level
- feat!: change name of GetStaticProps to TransformProps
- feat: support public env vars via YEXT_PUBLIC prefix
- feat: make dynamic the default mode - new flag is -- local
- feat: allow transforms in stream definitions
- chore: upgrade to Vite 3
- feat: support entityIds to TemplateConfig filter
- feat: include charset and viewport in GetHeadConfig
- refactor!: move vite-plugin-yext-sites-ssg into sites-scripts
- refactor!: rename yext-sites-scripts to pages
- feat!: change Default interface to Template
- feat: add alternateLanguageFields to the template config

### Bug Fixes

- fix: handle site-stream.json in local dev
- fix: guard GetHeadConfig and throw warning
- fix: support \_site data in static features
