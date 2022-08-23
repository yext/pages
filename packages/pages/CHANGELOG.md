# 1.0.0-beta.2 (2022-08-23)


### Bug Fixes

* **components:** add environment compatibility to mktgcdn urls ([#167](https://github.com/yext/sites-scripts/issues/167)) ([5565bc7](https://github.com/yext/sites-scripts/commit/5565bc73e9cd153317da9a7dff47b49d28b99733))
* **dev/plugin:** address incompatibilities with windows ([#173](https://github.com/yext/sites-scripts/issues/173)) ([de67065](https://github.com/yext/sites-scripts/commit/de670656d584482f55b18079104dda8d39a53941))
* **dev:** add newline to error messages ([#175](https://github.com/yext/sites-scripts/issues/175)) ([2f88862](https://github.com/yext/sites-scripts/commit/2f888629a77e72a179d73bb057125a6c33df94a1))
* **dev:** honor feature name casing in local dev url (fixes [#121](https://github.com/yext/sites-scripts/issues/121)) ([#146](https://github.com/yext/sites-scripts/issues/146)) ([e6fb9f2](https://github.com/yext/sites-scripts/commit/e6fb9f2f759d9e93101512e2270053a0157beba8))
* **dev:** prevent crashing on empty id ([#169](https://github.com/yext/sites-scripts/issues/169)) ([ffca6de](https://github.com/yext/sites-scripts/commit/ffca6de0d01ffde2cdab1c7bce347cba689fb4f3)), closes [#168](https://github.com/yext/sites-scripts/issues/168)
* improve errors related to undefined getPath (fixes [#130](https://github.com/yext/sites-scripts/issues/130)) ([#138](https://github.com/yext/sites-scripts/issues/138)) ([37b33d0](https://github.com/yext/sites-scripts/commit/37b33d00f75b8acb7e232d2935c173f98347cb21))
* index page incorrectly saying there is no localData (fix [#135](https://github.com/yext/sites-scripts/issues/135)) ([#136](https://github.com/yext/sites-scripts/issues/136)) ([dd272d2](https://github.com/yext/sites-scripts/commit/dd272d2977ac76bf416965382b44fcc199c2c869))
* update bundler plugin copying ([#111](https://github.com/yext/sites-scripts/issues/111)) ([c602104](https://github.com/yext/sites-scripts/commit/c602104d8f921b47842c2a245fa4c89b571caf80)), closes [#109](https://github.com/yext/sites-scripts/issues/109) [#109](https://github.com/yext/sites-scripts/issues/109)
* update getRuntime to work with the plugins system ([#161](https://github.com/yext/sites-scripts/issues/161)) ([02aee27](https://github.com/yext/sites-scripts/commit/02aee279a95f7a82905e463a346aaa5ff7301164))


### Features

* add alternateLanguageFields to the template config ([#112](https://github.com/yext/sites-scripts/issues/112)) ([c53b08d](https://github.com/yext/sites-scripts/commit/c53b08d671ffbd086d5ea19d48855ef297462634))
* **components:** add `Image` component ([#144](https://github.com/yext/sites-scripts/issues/144)) ([f6bad2c](https://github.com/yext/sites-scripts/commit/f6bad2c733a1aff69372babad48b4cc08c17d525))
* **components:** add Address component ([#159](https://github.com/yext/sites-scripts/issues/159)) ([c93b960](https://github.com/yext/sites-scripts/commit/c93b96039163b10123976943d5dd7e89258bc54d))
* **components:** add AnalyticsProvider ([#151](https://github.com/yext/sites-scripts/issues/151)) ([be32c2c](https://github.com/yext/sites-scripts/commit/be32c2cb0577ec904e96be72185eb554cd5d22ab))
* **components:** add Hours component ([#163](https://github.com/yext/sites-scripts/issues/163)) ([b9efd30](https://github.com/yext/sites-scripts/commit/b9efd30e925ad62ca1d37ece7cfae3e6ab70504b))
* **dev:** redirect if url ends in final slash (closes [#143](https://github.com/yext/sites-scripts/issues/143)) ([#148](https://github.com/yext/sites-scripts/issues/148)) ([61d38e9](https://github.com/yext/sites-scripts/commit/61d38e943915d55004e55d1ba4cd556ec7fc9947))
* **dev:** support alternate languages via `locale` query param ([#141](https://github.com/yext/sites-scripts/issues/141)) ([3aa60c8](https://github.com/yext/sites-scripts/commit/3aa60c8d96b279eea5674af6ff0e43f852f00657))
* extract features.json generation into its own command ([#170](https://github.com/yext/sites-scripts/issues/170)) ([6a7f2a4](https://github.com/yext/sites-scripts/commit/6a7f2a43d7429790fd08c4b6935b9f254e8eb4d2))
* **plugin:** validate file sizes (closes [#145](https://github.com/yext/sites-scripts/issues/145)) ([#147](https://github.com/yext/sites-scripts/issues/147)) ([6a16d2a](https://github.com/yext/sites-scripts/commit/6a16d2a7efe3a4f91f096e2b88bcbbddbc53b324))
* **util:** add fetch and runtime functions ([#118](https://github.com/yext/sites-scripts/issues/118)) ([207fc63](https://github.com/yext/sites-scripts/commit/207fc63a2aa69e0d04dc72e32ded98a2a9231bee)), closes [#117](https://github.com/yext/sites-scripts/issues/117) [#119](https://github.com/yext/sites-scripts/issues/119) [#120](https://github.com/yext/sites-scripts/issues/120) [#124](https://github.com/yext/sites-scripts/issues/124) [#125](https://github.com/yext/sites-scripts/issues/125) [#126](https://github.com/yext/sites-scripts/issues/126)
* **util:** add isProduction function ([#150](https://github.com/yext/sites-scripts/issues/150)) ([f89f45d](https://github.com/yext/sites-scripts/commit/f89f45da584ec196f519e30c95124fcf2e4ae11c))



# 1.0.0-beta.1 (2022-08-05)

### Bug Fixes

- **dev:** honor feature name casing in local dev url (fixes [#121](https://github.com/yext/sites-scripts/issues/121)) ([#146](https://github.com/yext/sites-scripts/issues/146)) ([e6fb9f2](https://github.com/yext/sites-scripts/commit/e6fb9f2f759d9e93101512e2270053a0157beba8))
- improve errors related to undefined getPath (fixes [#130](https://github.com/yext/sites-scripts/issues/130)) ([#138](https://github.com/yext/sites-scripts/issues/138)) ([37b33d0](https://github.com/yext/sites-scripts/commit/37b33d00f75b8acb7e232d2935c173f98347cb21))
- index page incorrectly saying there is no localData (fix [#135](https://github.com/yext/sites-scripts/issues/135)) ([#136](https://github.com/yext/sites-scripts/issues/136)) ([dd272d2](https://github.com/yext/sites-scripts/commit/dd272d2977ac76bf416965382b44fcc199c2c869))
- update bundler plugin copying ([#111](https://github.com/yext/sites-scripts/issues/111)) ([c602104](https://github.com/yext/sites-scripts/commit/c602104d8f921b47842c2a245fa4c89b571caf80)), closes [#109](https://github.com/yext/sites-scripts/issues/109) [#109](https://github.com/yext/sites-scripts/issues/109)

### Features

- add alternateLanguageFields to the template config ([#112](https://github.com/yext/sites-scripts/issues/112)) ([c53b08d](https://github.com/yext/sites-scripts/commit/c53b08d671ffbd086d5ea19d48855ef297462634))
- **components:** add `Image` component ([#144](https://github.com/yext/sites-scripts/issues/144)) ([f6bad2c](https://github.com/yext/sites-scripts/commit/f6bad2c733a1aff69372babad48b4cc08c17d525))
- **dev:** redirect if url ends in final slash (closes [#143](https://github.com/yext/sites-scripts/issues/143)) ([#148](https://github.com/yext/sites-scripts/issues/148)) ([61d38e9](https://github.com/yext/sites-scripts/commit/61d38e943915d55004e55d1ba4cd556ec7fc9947))
- **dev:** support alternate languages via `locale` query param ([#141](https://github.com/yext/sites-scripts/issues/141)) ([3aa60c8](https://github.com/yext/sites-scripts/commit/3aa60c8d96b279eea5674af6ff0e43f852f00657))
- **plugin:** validate file sizes (closes [#145](https://github.com/yext/sites-scripts/issues/145)) ([#147](https://github.com/yext/sites-scripts/issues/147)) ([6a16d2a](https://github.com/yext/sites-scripts/commit/6a16d2a7efe3a4f91f096e2b88bcbbddbc53b324))
- **util:** add fetch and runtime functions ([#118](https://github.com/yext/sites-scripts/issues/118)) ([207fc63](https://github.com/yext/sites-scripts/commit/207fc63a2aa69e0d04dc72e32ded98a2a9231bee)), closes [#117](https://github.com/yext/sites-scripts/issues/117) [#119](https://github.com/yext/sites-scripts/issues/119) [#120](https://github.com/yext/sites-scripts/issues/120) [#124](https://github.com/yext/sites-scripts/issues/124) [#125](https://github.com/yext/sites-scripts/issues/125) [#126](https://github.com/yext/sites-scripts/issues/126)
- **util:** add isProduction function ([#150](https://github.com/yext/sites-scripts/issues/150)) ([f89f45d](https://github.com/yext/sites-scripts/commit/f89f45da584ec196f519e30c95124fcf2e4ae11c))

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
