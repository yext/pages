#### 1.0.0-rc.8 (2024-01-19)

##### Chores

*  remove binaries (a6ccbf28)
* **dev:**  deprecate alternateLanguageFields (#470) (f7ff7bf9)

##### New Features

* **dev:**
  *  pass slug field stream name(s) to the cli (#472) (912787a3)
  *  pass slugField to generate-test-data if provided (#463) (090022d4)
  *  update serverless function types in upgrade script (#465) (292bdb3c)
  *  add slugField to TemplateConfig (#460) (58644df4)
  *  add pageUrlField to generated configs (#459) (d5784e02)
  *  add pageUrlField to TemplateConfig (#458) (5deaf543)
  *  upgrade search-ui-react and search-headless-react (#456) (767a8194)
* **util:**  add dynamic function (#461) (d521e236)

##### Bug Fixes

* **dev:**
  *  remove websocket error (#473) (c4b708ec)
  *  filter out static templates when determining slug fields (#471) (f4024645)
  *  index page urls using `--no-prod-url` (#469) (fc684885)
  *  locale query params not part of request (#468) (04beac56)
  *  upgrade script when using scope (#464) (76c2ad21)
* **plugin:**
  *  make min Node 20 version 20.2.0 (#467) (3c762ac8)
  *  polyfill node for serverless functions (#457) (4bb76530)

#### 1.0.0-rc.7 (2023-12-21)

##### Chores

* **deps:**
  *  remove Vite as a dependency (b0eb12c4)
  *  updates all dependencies (#449) (2abc8594)
  *  update most dependencies (#445) (e003894f)
*  fix changelog (91d666af)

##### Documentation Changes

*  auto generate markdown files  (#441) (70a25bea)

##### New Features

* **dev:**
  *  upgrade script updates Pages version (#451) (4dd2b42e)
  *  upgrade script replaces build:local with build (#452) (c3f4019e)
* **deps:**  update to Vite 5 (#446) (9bc25aae)

##### Bug Fixes

* **dev:**  make production the default for yextrc (#455) (7a59db19)
* **plugin:**
  *  allow "main" function exports and actually fail the build (#453) (c9156163)
  *  manifest not created correctly (#450) (4d97390f)

#### 1.0.0-rc.6 (2023-11-21)

##### Chores

*  add env var test (#438) (3ebe6b50)
*  remove babel (#427) (7188a1eb)
* **dev:**  use logWarning for index page messages (#426) (70f4d14f)

##### New Features

*  add node engines to upgrade script (#444) (205db3e5)
* **dev:**  
  *  better error message for CLI not installed (#413) (b73cb1c6)
  *  replace fetch imports in upgrade command (#435) (4483dd93)
* **dev/plugin:**
  *  support secrets (#433) (2df1478a)
  *  add localization to static pages (#430) (9d241f86)
* **plugin:**  
  *  add ts-morph for client templates (#414) (cb9f5980)
  *  create and bundle client templates (#420) (ba4647aa)
* **util:**
  *  added jstest workflow (#405) (9d125fae)
  *  pass optional list of domains into isProduction (#417) (dd0820b6)

##### Bug Fixes

* **plugin:**
  *  generate templates/artifacts during build (#418) (17971e70)
  *  templateModule cache incorrect type (#411) (2f60f4d0)
  *  remove old artifactStructure assets (#443) (7568568d)
  *  add plugin to support subfoldered public assets (#431) (#442) (79dab524)
  *  client template cleanup works with scope (#439) (f1ef96f0)
  *  address "Cannot find module" for deno module imports (#424) (12fac105)
*  adjust how site-stream.json is migrated  (#436) (b912ea39)
*  remove assetsDir support for config.yaml (#434) (bd592c51)
*  fix watch command (#428) (46a9454d)
* **dev/plugin:**
  *  custom _client not working with React 17 (#419) (c0f2c7be)
  *  clearer error for non-string getPath value (#425) (8e0646bc)
  *  support HTML in Content fields (#422) (8a7a60d1)
* **dev:**  
  *  prevent duplicate stream definitions (#408) (72302ae2)
  *  use Vite instead of esbuild, also Vitest (#416) (67f29ebe)
  *  include document support for static page `getPath` functions. (#421) (c7ae21a9)

##### Refactors

*  remove duplicate makeClientFiles (#437) (11fb8ada)

#### 1.0.0-rc.5 (2023-10-10)

##### New Features

* **dev:**
  *  set siteInternalHostName locally (#401) (07d77e97)
  *  add noMigration flag for upgrade (#400) (62670993)
  *  add scope to yextrc (#397) (609e471a)
  *  add upgrade command (#395) (41e21259)
* **plugin:**  move urlWriteback into pagesJS (#393) (b6b040d7)

##### Bug Fixes

* **plugin:**  remove import meta resolve (#403) (f5afbeaf)
* **pages-plugins:**  slugManager searchIds not working on webhook update (#399) (9ae11b06)

##### Other Changes

*  pages@1.0.0-rc.5 (391ea0cf)

##### Reverts

* **dev:**  use esbuild instead of ts-morph to parse template configs (#396) (c5c2d656)

##### New Features

* **dev:**
  *  set siteInternalHostName locally (#401) (07d77e97)
  *  add noMigration flag for upgrade (#400) (62670993)
  *  add scope to yextrc (#397) (609e471a)
  *  add upgrade command (#395) (41e21259)
* **plugin:**  move urlWriteback into pagesJS (#393) (b6b040d7)

##### Bug Fixes

* **plugin:**  remove import meta resolve (#403) (f5afbeaf)
* **pages-plugins:**  slugManager searchIds not working on webhook update (#399) (9ae11b06)

##### Reverts

* **dev:**  use esbuild instead of ts-morph to parse template configs (#396) (c5c2d656)

#### 1.0.0-rc.4 (2023-09-20)

##### Chores

*  fix changelogs (c0d3aa07)

##### Bug Fixes

* **dev:**  env vars through ts-morph double quoted (#394) (dc5032c8)

#### 1.0.0-rc.3 (2023-09-20)

##### New Features

* **plugin:**  include static assets in platform (#392) (5932e264)

##### Bug Fixes

*  empty yaml leads to parse error (#391) (a1632ce8)
* **dev:**
  *  fix dev and tests on Windows (#386) (16ee235d)
  *  use ts-morph to parse template configs (#387) (bc51b803)
  *  serverless functions body format consistency (#385) (a2ad104a)

#### 1.0.0-rc.2 (2023-09-01)

##### Chores

* **dev:**  update missing localData message (#381) (2f33ce02)
*  update changelog (4d8d3d8d)

##### New Features

*  add templates and artifacts generation commands (#383) (4dd8dd1e)

##### Bug Fixes

*  serverless function imports (#384) (d95fa418)
*  env vars causing error on feature generation (#380) (b8bb7a87)

#### 1.0.0-rc.1 (2023-08-21)

##### Chores

*  update non-major dependencies (#373) (fa613e3b)

##### New Features

* **dev:**  export createServer and add --port arg (#375) (3c1d05f6)
* **dev/plugin:** redo reverse proxy setup (#376) (a6408020)

##### Bug Fixes

* **dev:**
  *  add more esbuild loaders (#379) (ed5937fb)
  *  qa improvements for .yextrc init (#368) (0c38b240)
  *  hydration does not reflect template data mutations (#365) (30b9382a)
*  async serverless functions and body parsing (#378) (ba2d5ce4)
*  update paths to support usage in monorepos (#377) (4cf67c99)
* **plugin:**  polyfill upgrade breaking build (#374) (d376d4c1)

#### 1.0.0-rc.0 (2023-08-02)

##### Chores

*  update changelog and release version (1283e9e7)
*  update changelog and release version (be69d2d0)
*  update changelog and release version (e3b7928c)
*  migrate from Yargs to CommanderJS (#351) (f37b727a)

##### New Features

* **dev:**
  *  link entityId to KG (#354) (09bceb92)
  *  add links to Yext account and documentation on index page (#357) (dd56dca4)
  *  default hydrate to true (#359) (b4b84f62)
  *  support document typing (#332) (8800df0a)
  *  styled index page (#326) (0a0da397)
  *  add .yextrc support for auto yext init (#329) (1755018d)
* **dev/plugin:**
  *  support React 18 (#353) (366d2931)
  *  upgrade to Vite 4 (#350) (29c7fb75)
  *  add Generator plugin to ci.json during build (#311) (73aec942)
* **plugin:**
  *  add reverse proxy support (#318) (68cd81d2)
  *  fail the build when there are errors (#314) (f90db5b9)
* **components:**  add Clusterer component. (#313) (c7d97413)

##### Bug Fixes

* **dev:**
  *  server crashes instead of producing 500 error (#366) (9056b3a1)
  *  scope/domain omitted in dynamic mode (#367) (b1971c3c)
  *  opening browser tab not working (#355) (0b5e490e)
  *  fixed URI encoding issue  (#346) (d24cfa9f)
  *  static page locale support (#339) (f6d60695)
  *  index page QA - update warning/info text and add favicon (#333) (b02fe061)
  *  qa updates for `.yextrc` CLI (#336) (b34df159)
  *  duplicated generate-test-data (#334) (589149ac)
  *  add additional filetypes to esbuild loader for features.json (#331) (c9d50205)
  *  handle ico import (#322) (65a224b8)
* **util:**
  *  deno version not properly set (#364) (c590208f)
  *  update isProduction to check for RPs (#342) (37e26980)
* **plugin:**
  *  fail platform build when PagesJS build fails (fix #347) (#348) (eeb962c8)
  *  include scope for ci.json generation (#343) (6102c745)
  *  app lang not properly set (#344) (c98e1384)
  *  finalize reverse proxy support (#330) (c6e59c9b)
  *  cache dynamic import of plugin render templates (#325) (d199cfc3)
  *  use vite-plugin-node-polyfills (#316) (45d0f922)
  *  remove space from pluginName (#315) (877fb024)

##### Other Changes

*  pages@1.0.0-beta.23 (8b3454f3)

##### Performance Improvements

* **plugin:**  do not report gzipped size (#323) (833b98d4)

##### Refactors

*  restore command handlers (#356) (657c3e0c)
*  use nullish coalescing in features.ts (#363) (d7e098f7)
*  use values instead of entries in createFreaturesJson (#362) (93568160)

#### 1.0.0-beta.26 (2023-07-19)

##### Bug Fixes

* **util:**  update isProduction to check for RPs (#342) (51248ac6)

#### 1.0.0-beta.25 (2023-07-17)

##### Performance Improvements

* **plugin:**  remove manifest from TemplateProps (#338) (dc66bb28)

##### Bug Fixes

* **dev:**
  * add additional filetypes to esbuild loader for features.json (#331) (cbf416ba)
* **plugin:**
  *  app lang not properly set (#344) (ea833e07)
  *  finalize reverse proxy support (#330) (c6e59c9b)
  *  app lang not properly set (#344) (0d13be1a)
* **util:**  update isProduction to check for RPs (#342) (604f22f1)

#### 1.0.0-beta.24 (2023-07-17)

##### Performance Improvements

* **plugin:**  remove manifest from TemplateProps (#338) (dc66bb28)

##### Bug Fixes

* **plugin:**
  *  app lang not properly set (#344) (ea833e07)
  *  finalize reverse proxy support (#330) (c6e59c9b)
* **util:**  update isProduction to check for RPs (#342) (604f22f1)

#### 1.0.0-beta.23 (2023-06-29)

##### New Features

* **plugin:**
  *  add reverse proxy support (#318) (68cd81d2)
  *  fail the build when there are errors (#314) (f90db5b9)
* **components:**  add Clusterer component. (#313) (c7d97413)
* **dev/plugin:**  add Generator plugin to ci.json during build (#311) (73aec942)

##### Bug Fixes

* **plugin:**
  *  cache dynamic import of plugin render templates (#325) (d199cfc3)
  *  use vite-plugin-node-polyfills (#316) (45d0f922)
  *  remove space from pluginName (#315) (877fb024)
* **dev:**  handle ico import (#322) (65a224b8)

#### 1.0.0-beta.22 (2023-05-23)

##### Bug Fixes

* **plugin:**  update the single file size limit (#312) (f14472c5)

#### 1.0.0-beta.21 (2023-04-19)

##### Bug Fixes

* **dev:**  properly support slugs with URL-encoded characters (#299) (759c500e)

#### 1.0.0-beta.20 (2023-03-21)

##### Other Changes

*  pages@1.0.0-beta.19" (a4fb349a)

#### 1.0.0-beta.18 (2023-03-16)

##### New Features

* **plugin:**  generate functionMetadata.json (#293) (0d452a19)
* **dev:**  list serverless functions on index page (#291) (7a4277e4)

##### Other Changes

*  pages@1.0.0-beta.17 (9ded0694)
*  pages@1.0.0-beta.17" (71b3474f)

#### 1.0.0-beta.17 (2023-02-15)

##### Bug Fixes

* **dev:**  use Vite JS API for build command (#288) (70e08fc7)

##### Other Changes

*  pages@1.0.0-beta.17" (71b3474f)
*  pages@1.0.0-beta.17 (5e37ab55)

#### 1.0.0-beta.16 (2023-01-24)

##### Chores

* **dev/plugin:**  add file extension to node_module/file import (#282) (876f4868)

##### New Features

* **util:**  define Vite .env variables for use in application (#281) (a64eddf7)

##### Bug Fixes

* **plugin:**  use relative path for css/js imports (#285) (24bab120)

#### 1.0.0-beta.15 (2022-12-16)

##### Chores

*  add CODEOWNERS file (#277) (8233357f)

##### New Features

*  gracefully handle Analytics failures in the `Link` Component. (#280) (bef4685c)
* **dev:**  fix linux support + static site acceptance across OS (#275) (968c97e1)

##### Bug Fixes

* **util:**  improve runtime environment checking (#272) (b54cec94)

#### 1.0.0-beta.14 (2022-12-07)

##### Chores

*  add prod url message (#267) (bb18aa69)

##### Documentation Changes

* **util:**  update documentation url (#274) (1c2122ba)

##### Bug Fixes

* **dev:**  fix dev command on Windows (#276) (b359e352)

#### 1.0.0-beta.13 (2022-11-30)

##### Chores

*  update GH workflows to remove deprecation warnings (#262) (5d61180d)

##### New Features

* **dev:**  use new available port if default dev server port is occupied (#264) (cfe504c4)

##### Bug Fixes

* **components:**  add empty string fallback for when publisher is null (#257) (7d309256)

#### 1.0.0-beta.12 (2022-11-17)

##### Bug Fixes

* **dev:**  add back favicon support in dev mode (#259) (fb6e18c7)

#### 1.0.0-beta.11 (2022-11-16)

##### New Features

* **dev:**  document.slug URLs in dev mode (#256) (9cc7e357)

#### 1.0.0-beta.10 (2022-11-10)

##### Documentation Changes

* **components:**  add link stories (#238) (1e52a761)

##### New Features

* **components:**
  *  make check for publisher in getDirections be case-insensitive (#255) (e20e1af8)
  *  add `LocationMap` component (#242) (261a960a)
  *  support pageDomain param (#239) (2591572d)
* **dev/plugin:**
  *  add build command with scope flag (#249) (55dddec3)
  *  multibrand setup support in dev and vite-plugin build (#246) (0dce72a0)
* **dev:**
  *  add flags to features command for multibrand setup (#248) (6de548c5)
  *  add Scope Flag to Dev Command (#247) (f4f7607c)

##### Bug Fixes

* **components:**
  *  add loading eager to image (#252) (06f5ecc8)
  *  make fixed Image width and height optional (#241) (36d87cc8)
* **plugin:**  remove configuration parameter for vite-plugin (#250) (f94d5beb)
* **dev:**
  *  parse multiple stream documents (#245) (17718ce2)
  *  interpreting contentType when serving templates (4c25b93a)

#### 1.0.0-beta.9 (2022-10-04)

##### Bug Fixes

* **components:**  remove `process?` optional chaining (#237) (b48875ba)

#### 1.0.0-beta.8 (2022-10-04)

##### Performance Improvements

* **plugin:**  dedupe the css file list to avoid unnecessary imports (#235) (8d96efc9)

#### 1.0.0-beta.7 (2022-09-30)

##### Chores

* **components:**
  *  bump yext/analytics version (#231) (373ac02b)
  *  upgrade storybook to use vite (#217) (16fd089c)
*  remove vitepress and use storybook (#221) (5d757d06)
*  add prepare script for @yext/pages (#214) (0e2d0f67)

##### Documentation Changes

* **components:**  add address stories (#227) (82fa43f0)

##### New Features

* **components:**
  *  add Map component (#171) (c41d3239)
  *  enable debugging for Analytics in dev mode (#226) (02327faf)
* **dev:**  allow render-only templates to work (#219) (ac1eab96)

##### Bug Fixes

* **components:**  set sizes attribute for images (#232) (3c843b3e)
*  features command when using top-level await (#230) (9f32e197)
* **dev:**  remove final slash from static page urls on index (#220) (6aac7bc9)

#### 1.0.0-beta.6 (2022-09-08)

##### Chores

*  swap changelog generation to generate-changelog (#204) (31812d2d)
*  upgrade all non-major dependencies (#203) (4e085034)
*  auto-format and lint as pre-commit hook (#198) (b6c72c77)

##### New Features

* **components:**  add getDirections function (#172) (88166d02)
* **util:**  add isServerSide to getRuntime (#193) (769c9288)

##### Bug Fixes

* **components:**
  *  image url not using correct env in all cases (#205) (fd5924a0)
  *  export Hours (#190) (3493c272)
* **dev:**
  *  local dev not working on linux distros (#199) (123ed619)
  *  remove spaces causing client/server console error (#196) (b1f7f40c)

##### Reverts

* **components:**  remove hours until css issue is fixed (#202) (c54573e2)

# 1.0.0-beta.5 (2022-08-30)

### Bug Fixes

- **components:** add environment compatibility to mktgcdn urls ([#167](https://github.com/yext/sites-scripts/issues/167)) ([5565bc7](https://github.com/yext/sites-scripts/commit/5565bc73e9cd153317da9a7dff47b49d28b99733))
- **components:** fix un-gated window access in analytics component ([#186](https://github.com/yext/sites-scripts/issues/186)) ([47c7589](https://github.com/yext/sites-scripts/commit/47c75894b5a21a5fa8526eca7bdfad2b49c5e169))
- **components:** image url now correctly handles envs ([#192](https://github.com/yext/sites-scripts/issues/192)) ([b5d3db0](https://github.com/yext/sites-scripts/commit/b5d3db073ea36086036de1f99ffc106fcd8e5c24))
- **dev/plugin:** address incompatibilities with windows ([#173](https://github.com/yext/sites-scripts/issues/173)) ([de67065](https://github.com/yext/sites-scripts/commit/de670656d584482f55b18079104dda8d39a53941))
- **dev:** add newline to error messages ([#175](https://github.com/yext/sites-scripts/issues/175)) ([2f88862](https://github.com/yext/sites-scripts/commit/2f888629a77e72a179d73bb057125a6c33df94a1))
- **dev:** fix template path import for windows ([#177](https://github.com/yext/sites-scripts/issues/177)) ([9a8b7f3](https://github.com/yext/sites-scripts/commit/9a8b7f3e885bf61f0bc549cf360e028c6ada6060)), closes [#170](https://github.com/yext/sites-scripts/issues/170) [#173](https://github.com/yext/sites-scripts/issues/173)
- **dev:** honor feature name casing in local dev url (fixes [#121](https://github.com/yext/sites-scripts/issues/121)) ([#146](https://github.com/yext/sites-scripts/issues/146)) ([e6fb9f2](https://github.com/yext/sites-scripts/commit/e6fb9f2f759d9e93101512e2270053a0157beba8))
- **dev:** prevent crashing on empty id ([#169](https://github.com/yext/sites-scripts/issues/169)) ([ffca6de](https://github.com/yext/sites-scripts/commit/ffca6de0d01ffde2cdab1c7bce347cba689fb4f3)), closes [#168](https://github.com/yext/sites-scripts/issues/168)
- improve errors related to undefined getPath (fixes [#130](https://github.com/yext/sites-scripts/issues/130)) ([#138](https://github.com/yext/sites-scripts/issues/138)) ([37b33d0](https://github.com/yext/sites-scripts/commit/37b33d00f75b8acb7e232d2935c173f98347cb21))
- index page incorrectly saying there is no localData (fix [#135](https://github.com/yext/sites-scripts/issues/135)) ([#136](https://github.com/yext/sites-scripts/issues/136)) ([dd272d2](https://github.com/yext/sites-scripts/commit/dd272d2977ac76bf416965382b44fcc199c2c869))
- **plugin:** add features.json generation back to build plugin ([#187](https://github.com/yext/sites-scripts/issues/187)) ([4650f55](https://github.com/yext/sites-scripts/commit/4650f5574fedcc1acbf2b75e18201cda962c98ac))
- update bundler plugin copying ([#111](https://github.com/yext/sites-scripts/issues/111)) ([c602104](https://github.com/yext/sites-scripts/commit/c602104d8f921b47842c2a245fa4c89b571caf80)), closes [#109](https://github.com/yext/sites-scripts/issues/109) [#109](https://github.com/yext/sites-scripts/issues/109)
- update getRuntime to work with the plugins system ([#161](https://github.com/yext/sites-scripts/issues/161)) ([02aee27](https://github.com/yext/sites-scripts/commit/02aee279a95f7a82905e463a346aaa5ff7301164))
- **util:** guard window check when getting deno version ([#188](https://github.com/yext/sites-scripts/issues/188)) ([e9e4cd1](https://github.com/yext/sites-scripts/commit/e9e4cd1a1cbbb80ed1bc6bf3e6932132a9cdde8d))

### Features

- add alternateLanguageFields to the template config ([#112](https://github.com/yext/sites-scripts/issues/112)) ([c53b08d](https://github.com/yext/sites-scripts/commit/c53b08d671ffbd086d5ea19d48855ef297462634))
- **components:** add `Image` component ([#144](https://github.com/yext/sites-scripts/issues/144)) ([f6bad2c](https://github.com/yext/sites-scripts/commit/f6bad2c733a1aff69372babad48b4cc08c17d525))
- **components:** add Address component ([#159](https://github.com/yext/sites-scripts/issues/159)) ([c93b960](https://github.com/yext/sites-scripts/commit/c93b96039163b10123976943d5dd7e89258bc54d))
- **components:** add AnalyticsProvider ([#151](https://github.com/yext/sites-scripts/issues/151)) ([be32c2c](https://github.com/yext/sites-scripts/commit/be32c2cb0577ec904e96be72185eb554cd5d22ab))
- **components:** add Hours component ([#163](https://github.com/yext/sites-scripts/issues/163)) ([b9efd30](https://github.com/yext/sites-scripts/commit/b9efd30e925ad62ca1d37ece7cfae3e6ab70504b))
- **components:** add Link component ([#158](https://github.com/yext/sites-scripts/issues/158)) ([436464d](https://github.com/yext/sites-scripts/commit/436464dcf80cf3cab61ffb0b81d1efbb6e878c89))
- **components:** add support for simple image fields ([#180](https://github.com/yext/sites-scripts/issues/180)) ([15cb86b](https://github.com/yext/sites-scripts/commit/15cb86b02800d521d2a23daa09b932c0b4c6dc99)), closes [#156](https://github.com/yext/sites-scripts/issues/156) [#155](https://github.com/yext/sites-scripts/issues/155)
- **dev:** redirect if url ends in final slash (closes [#143](https://github.com/yext/sites-scripts/issues/143)) ([#148](https://github.com/yext/sites-scripts/issues/148)) ([61d38e9](https://github.com/yext/sites-scripts/commit/61d38e943915d55004e55d1ba4cd556ec7fc9947))
- **dev:** support alternate languages via `locale` query param ([#141](https://github.com/yext/sites-scripts/issues/141)) ([3aa60c8](https://github.com/yext/sites-scripts/commit/3aa60c8d96b279eea5674af6ff0e43f852f00657))
- extract features.json generation into its own command ([#170](https://github.com/yext/sites-scripts/issues/170)) ([6a7f2a4](https://github.com/yext/sites-scripts/commit/6a7f2a43d7429790fd08c4b6935b9f254e8eb4d2))
- **plugin:** validate file sizes (closes [#145](https://github.com/yext/sites-scripts/issues/145)) ([#147](https://github.com/yext/sites-scripts/issues/147)) ([6a16d2a](https://github.com/yext/sites-scripts/commit/6a16d2a7efe3a4f91f096e2b88bcbbddbc53b324))
- **util:** add fetch and runtime functions ([#118](https://github.com/yext/sites-scripts/issues/118)) ([207fc63](https://github.com/yext/sites-scripts/commit/207fc63a2aa69e0d04dc72e32ded98a2a9231bee)), closes [#117](https://github.com/yext/sites-scripts/issues/117) [#119](https://github.com/yext/sites-scripts/issues/119) [#120](https://github.com/yext/sites-scripts/issues/120) [#124](https://github.com/yext/sites-scripts/issues/124) [#125](https://github.com/yext/sites-scripts/issues/125) [#126](https://github.com/yext/sites-scripts/issues/126)
- **util:** add isProduction function ([#150](https://github.com/yext/sites-scripts/issues/150)) ([f89f45d](https://github.com/yext/sites-scripts/commit/f89f45da584ec196f519e30c95124fcf2e4ae11c))

# 1.0.0-beta.4 (2022-08-26)

### Bug Fixes

- **components:** add environment compatibility to mktgcdn urls ([#167](https://github.com/yext/sites-scripts/issues/167)) ([5565bc7](https://github.com/yext/sites-scripts/commit/5565bc73e9cd153317da9a7dff47b49d28b99733))
- **components:** fix un-gated window access in analytics component ([#186](https://github.com/yext/sites-scripts/issues/186)) ([47c7589](https://github.com/yext/sites-scripts/commit/47c75894b5a21a5fa8526eca7bdfad2b49c5e169))
- **dev/plugin:** address incompatibilities with windows ([#173](https://github.com/yext/sites-scripts/issues/173)) ([de67065](https://github.com/yext/sites-scripts/commit/de670656d584482f55b18079104dda8d39a53941))
- **dev:** add newline to error messages ([#175](https://github.com/yext/sites-scripts/issues/175)) ([2f88862](https://github.com/yext/sites-scripts/commit/2f888629a77e72a179d73bb057125a6c33df94a1))
- **dev:** fix template path import for windows ([#177](https://github.com/yext/sites-scripts/issues/177)) ([9a8b7f3](https://github.com/yext/sites-scripts/commit/9a8b7f3e885bf61f0bc549cf360e028c6ada6060)), closes [#170](https://github.com/yext/sites-scripts/issues/170) [#173](https://github.com/yext/sites-scripts/issues/173)
- **dev:** honor feature name casing in local dev url (fixes [#121](https://github.com/yext/sites-scripts/issues/121)) ([#146](https://github.com/yext/sites-scripts/issues/146)) ([e6fb9f2](https://github.com/yext/sites-scripts/commit/e6fb9f2f759d9e93101512e2270053a0157beba8))
- **dev:** prevent crashing on empty id ([#169](https://github.com/yext/sites-scripts/issues/169)) ([ffca6de](https://github.com/yext/sites-scripts/commit/ffca6de0d01ffde2cdab1c7bce347cba689fb4f3)), closes [#168](https://github.com/yext/sites-scripts/issues/168)
- improve errors related to undefined getPath (fixes [#130](https://github.com/yext/sites-scripts/issues/130)) ([#138](https://github.com/yext/sites-scripts/issues/138)) ([37b33d0](https://github.com/yext/sites-scripts/commit/37b33d00f75b8acb7e232d2935c173f98347cb21))
- index page incorrectly saying there is no localData (fix [#135](https://github.com/yext/sites-scripts/issues/135)) ([#136](https://github.com/yext/sites-scripts/issues/136)) ([dd272d2](https://github.com/yext/sites-scripts/commit/dd272d2977ac76bf416965382b44fcc199c2c869))
- **plugin:** add features.json generation back to build plugin ([#187](https://github.com/yext/sites-scripts/issues/187)) ([4650f55](https://github.com/yext/sites-scripts/commit/4650f5574fedcc1acbf2b75e18201cda962c98ac))
- update bundler plugin copying ([#111](https://github.com/yext/sites-scripts/issues/111)) ([c602104](https://github.com/yext/sites-scripts/commit/c602104d8f921b47842c2a245fa4c89b571caf80)), closes [#109](https://github.com/yext/sites-scripts/issues/109) [#109](https://github.com/yext/sites-scripts/issues/109)
- update getRuntime to work with the plugins system ([#161](https://github.com/yext/sites-scripts/issues/161)) ([02aee27](https://github.com/yext/sites-scripts/commit/02aee279a95f7a82905e463a346aaa5ff7301164))
- **util:** guard window check when getting deno version ([#188](https://github.com/yext/sites-scripts/issues/188)) ([e9e4cd1](https://github.com/yext/sites-scripts/commit/e9e4cd1a1cbbb80ed1bc6bf3e6932132a9cdde8d))

### Features

- add alternateLanguageFields to the template config ([#112](https://github.com/yext/sites-scripts/issues/112)) ([c53b08d](https://github.com/yext/sites-scripts/commit/c53b08d671ffbd086d5ea19d48855ef297462634))
- **components:** add `Image` component ([#144](https://github.com/yext/sites-scripts/issues/144)) ([f6bad2c](https://github.com/yext/sites-scripts/commit/f6bad2c733a1aff69372babad48b4cc08c17d525))
- **components:** add Address component ([#159](https://github.com/yext/sites-scripts/issues/159)) ([c93b960](https://github.com/yext/sites-scripts/commit/c93b96039163b10123976943d5dd7e89258bc54d))
- **components:** add AnalyticsProvider ([#151](https://github.com/yext/sites-scripts/issues/151)) ([be32c2c](https://github.com/yext/sites-scripts/commit/be32c2cb0577ec904e96be72185eb554cd5d22ab))
- **components:** add Hours component ([#163](https://github.com/yext/sites-scripts/issues/163)) ([b9efd30](https://github.com/yext/sites-scripts/commit/b9efd30e925ad62ca1d37ece7cfae3e6ab70504b))
- **components:** add Link component ([#158](https://github.com/yext/sites-scripts/issues/158)) ([436464d](https://github.com/yext/sites-scripts/commit/436464dcf80cf3cab61ffb0b81d1efbb6e878c89))
- **components:** add support for simple image fields ([#180](https://github.com/yext/sites-scripts/issues/180)) ([15cb86b](https://github.com/yext/sites-scripts/commit/15cb86b02800d521d2a23daa09b932c0b4c6dc99)), closes [#156](https://github.com/yext/sites-scripts/issues/156) [#155](https://github.com/yext/sites-scripts/issues/155)
- **dev:** redirect if url ends in final slash (closes [#143](https://github.com/yext/sites-scripts/issues/143)) ([#148](https://github.com/yext/sites-scripts/issues/148)) ([61d38e9](https://github.com/yext/sites-scripts/commit/61d38e943915d55004e55d1ba4cd556ec7fc9947))
- **dev:** support alternate languages via `locale` query param ([#141](https://github.com/yext/sites-scripts/issues/141)) ([3aa60c8](https://github.com/yext/sites-scripts/commit/3aa60c8d96b279eea5674af6ff0e43f852f00657))
- extract features.json generation into its own command ([#170](https://github.com/yext/sites-scripts/issues/170)) ([6a7f2a4](https://github.com/yext/sites-scripts/commit/6a7f2a43d7429790fd08c4b6935b9f254e8eb4d2))
- **plugin:** validate file sizes (closes [#145](https://github.com/yext/sites-scripts/issues/145)) ([#147](https://github.com/yext/sites-scripts/issues/147)) ([6a16d2a](https://github.com/yext/sites-scripts/commit/6a16d2a7efe3a4f91f096e2b88bcbbddbc53b324))
- **util:** add fetch and runtime functions ([#118](https://github.com/yext/sites-scripts/issues/118)) ([207fc63](https://github.com/yext/sites-scripts/commit/207fc63a2aa69e0d04dc72e32ded98a2a9231bee)), closes [#117](https://github.com/yext/sites-scripts/issues/117) [#119](https://github.com/yext/sites-scripts/issues/119) [#120](https://github.com/yext/sites-scripts/issues/120) [#124](https://github.com/yext/sites-scripts/issues/124) [#125](https://github.com/yext/sites-scripts/issues/125) [#126](https://github.com/yext/sites-scripts/issues/126)
- **util:** add isProduction function ([#150](https://github.com/yext/sites-scripts/issues/150)) ([f89f45d](https://github.com/yext/sites-scripts/commit/f89f45da584ec196f519e30c95124fcf2e4ae11c))

# 1.0.0-beta.2 (2022-08-23)

### Bug Fixes

- **components:** add environment compatibility to mktgcdn urls ([#167](https://github.com/yext/sites-scripts/issues/167)) ([5565bc7](https://github.com/yext/sites-scripts/commit/5565bc73e9cd153317da9a7dff47b49d28b99733))
- **dev/plugin:** address incompatibilities with windows ([#173](https://github.com/yext/sites-scripts/issues/173)) ([de67065](https://github.com/yext/sites-scripts/commit/de670656d584482f55b18079104dda8d39a53941))
- **dev:** add newline to error messages ([#175](https://github.com/yext/sites-scripts/issues/175)) ([2f88862](https://github.com/yext/sites-scripts/commit/2f888629a77e72a179d73bb057125a6c33df94a1))
- **dev:** honor feature name casing in local dev url (fixes [#121](https://github.com/yext/sites-scripts/issues/121)) ([#146](https://github.com/yext/sites-scripts/issues/146)) ([e6fb9f2](https://github.com/yext/sites-scripts/commit/e6fb9f2f759d9e93101512e2270053a0157beba8))
- **dev:** prevent crashing on empty id ([#169](https://github.com/yext/sites-scripts/issues/169)) ([ffca6de](https://github.com/yext/sites-scripts/commit/ffca6de0d01ffde2cdab1c7bce347cba689fb4f3)), closes [#168](https://github.com/yext/sites-scripts/issues/168)
- improve errors related to undefined getPath (fixes [#130](https://github.com/yext/sites-scripts/issues/130)) ([#138](https://github.com/yext/sites-scripts/issues/138)) ([37b33d0](https://github.com/yext/sites-scripts/commit/37b33d00f75b8acb7e232d2935c173f98347cb21))
- index page incorrectly saying there is no localData (fix [#135](https://github.com/yext/sites-scripts/issues/135)) ([#136](https://github.com/yext/sites-scripts/issues/136)) ([dd272d2](https://github.com/yext/sites-scripts/commit/dd272d2977ac76bf416965382b44fcc199c2c869))
- update bundler plugin copying ([#111](https://github.com/yext/sites-scripts/issues/111)) ([c602104](https://github.com/yext/sites-scripts/commit/c602104d8f921b47842c2a245fa4c89b571caf80)), closes [#109](https://github.com/yext/sites-scripts/issues/109) [#109](https://github.com/yext/sites-scripts/issues/109)
- update getRuntime to work with the plugins system ([#161](https://github.com/yext/sites-scripts/issues/161)) ([02aee27](https://github.com/yext/sites-scripts/commit/02aee279a95f7a82905e463a346aaa5ff7301164))

### Features

- add alternateLanguageFields to the template config ([#112](https://github.com/yext/sites-scripts/issues/112)) ([c53b08d](https://github.com/yext/sites-scripts/commit/c53b08d671ffbd086d5ea19d48855ef297462634))
- **components:** add `Image` component ([#144](https://github.com/yext/sites-scripts/issues/144)) ([f6bad2c](https://github.com/yext/sites-scripts/commit/f6bad2c733a1aff69372babad48b4cc08c17d525))
- **components:** add Address component ([#159](https://github.com/yext/sites-scripts/issues/159)) ([c93b960](https://github.com/yext/sites-scripts/commit/c93b96039163b10123976943d5dd7e89258bc54d))
- **components:** add AnalyticsProvider ([#151](https://github.com/yext/sites-scripts/issues/151)) ([be32c2c](https://github.com/yext/sites-scripts/commit/be32c2cb0577ec904e96be72185eb554cd5d22ab))
- **components:** add Hours component ([#163](https://github.com/yext/sites-scripts/issues/163)) ([b9efd30](https://github.com/yext/sites-scripts/commit/b9efd30e925ad62ca1d37ece7cfae3e6ab70504b))
- **dev:** redirect if url ends in final slash (closes [#143](https://github.com/yext/sites-scripts/issues/143)) ([#148](https://github.com/yext/sites-scripts/issues/148)) ([61d38e9](https://github.com/yext/sites-scripts/commit/61d38e943915d55004e55d1ba4cd556ec7fc9947))
- **dev:** support alternate languages via `locale` query param ([#141](https://github.com/yext/sites-scripts/issues/141)) ([3aa60c8](https://github.com/yext/sites-scripts/commit/3aa60c8d96b279eea5674af6ff0e43f852f00657))
- extract features.json generation into its own command ([#170](https://github.com/yext/sites-scripts/issues/170)) ([6a7f2a4](https://github.com/yext/sites-scripts/commit/6a7f2a43d7429790fd08c4b6935b9f254e8eb4d2))
- **plugin:** validate file sizes (closes [#145](https://github.com/yext/sites-scripts/issues/145)) ([#147](https://github.com/yext/sites-scripts/issues/147)) ([6a16d2a](https://github.com/yext/sites-scripts/commit/6a16d2a7efe3a4f91f096e2b88bcbbddbc53b324))
- **util:** add fetch and runtime functions ([#118](https://github.com/yext/sites-scripts/issues/118)) ([207fc63](https://github.com/yext/sites-scripts/commit/207fc63a2aa69e0d04dc72e32ded98a2a9231bee)), closes [#117](https://github.com/yext/sites-scripts/issues/117) [#119](https://github.com/yext/sites-scripts/issues/119) [#120](https://github.com/yext/sites-scripts/issues/120) [#124](https://github.com/yext/sites-scripts/issues/124) [#125](https://github.com/yext/sites-scripts/issues/125) [#126](https://github.com/yext/sites-scripts/issues/126)
- **util:** add isProduction function ([#150](https://github.com/yext/sites-scripts/issues/150)) ([f89f45d](https://github.com/yext/sites-scripts/commit/f89f45da584ec196f519e30c95124fcf2e4ae11c))

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
