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
