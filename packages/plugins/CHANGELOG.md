#### 1.0.0-beta.10 (2025-05-06)

##### Bug Fixes

* **pages-plugins:**  slugmanager unbounded entity request bug (#581) (02d6fd98)

#### 1.0.0-beta.9 (2025-04-24)

##### Bug Fixes

* **pages-plugins:**  typo in slug manager undefined check (#578) (b1f96469)
*  additional workflow change (#577) (599690e1)

#### 1.0.0-beta.8 (2024-10-31)

#### 1.0.0-beta.7 (2024-10-31)

##### Bug Fixes

* **pages-plugins:**  prevent making api request with unbounded entities (#547) (573888ea)

#### 1.0.0-beta.6 (2023-10-25)

##### New Features

* **plugin:**
  *  add ts-morph for client templates (#414) (cb9f5980)
  *  generate templates/artifacts during build (#418) (17971e70)
* **util:**
  *  pass optional list of domains into isProduction (#417) (dd0820b6)
  *  added jstest workflow (#405) (9d125fae)
* **dev:**  better error message for CLI not installed (#413) (b73cb1c6)
* **pages-plugins:**  add entity type to slug manager default field (#407) (2d1da1cb)

##### Bug Fixes

* **dev/plugin:**  custom _client not working with React 17 (#419) (c0f2c7be)
* **dev:**
  *  use Vite instead of esbuild, also Vitest (#416) (67f29ebe)
  *  prevent duplicate stream definitions (#408) (72302ae2)
* **plugin:**  templateModule cache incorrect type (#411) (2f60f4d0)

#### 1.0.0-beta.5 (2023-09-14)

##### Bug Fixes

* **pages-plugins:**  add rendered = true to include all fields in the lang profiles (#388) (92637531)

#### 1.0.0-beta.4 (2023-05-10)

##### New Features

*  add Function input for Slug Manager (#296) (d5987406)
*  catch Analytics failures in the Analytics Component. (#297) (5b1b1fec)
*  add ability to map different CF's for each feature on urlWriteback (#307) (de55ed24)

##### Tests

* **playground:**
  *  upload Windows/Linux screenshots via CI (#302) (24262841)
  *  add multibrand playwright tests (#304) (ca2bd181)
  *  add entity page playwright test (#301) (6c99f764)
* **dev:**  playwright tests for static-site (#300) (f2859eb5)

#### 1.0.0-beta.3 (2022-10-04)

##### Bug Fixes

* **pages-plugins:**  handle json object input (#234) (abb00a68)

#### 1.0.0-beta.2 (2022-09-30)

##### Chores

*  update READMEs for Pages Plugins (#216) (43bc00e6)

##### Bug Fixes

* **plugin:**  fix slug connector pagination (#233) (e6e1da97)

#### 1.0.0-beta.1 (2022-09-12)

##### New Features

* **pages-plugins:**  add slug manager plugin (#210) (c0b53987)

##### Bug Fixes

* **pages-plugins:**  rename index.ts to mod.ts (#215) (8d9d4d2f)
*  add https protocol to urlWriteback url (#208) (f65c5633)

#### 1.0.0-beta.0 (2022-09-09)

##### New Features

* **plugins:**  add urlWriteback plugin (#201) (f9d2357)
