# Yext Sites Scripts

An out-of-the-box toolchain integrated with Yext Sites.

There are 2 npm packages which live in this repository.

The first is `@yext/vite-plugin-yext-sites-ssg`, a vite plugin which provides default site generation configuration for statically generating pages from Javascript in Yext Sites.

The second is `@yext/yext-sites-scripts`, a CLI which provides a default development and production toolchain bundling assets and templates for Yext Sites.
Backed by vite, it provides a custom devserver for template development and a production build which leverages the vite plugin.
<br><br>

# How to get started

Clone this repository

`git clone git@github.com:yext/sites-scripts.git`

`cd sites-scripts`

Log into the yext npm account.

1. You must have access to the org.
1. You can check for access if you can see this package: https://www.npmjs.com/package/@yext/vite-plugin-yext-sites-ssg
1. If you don't have access, ask in #discuss-react-on-sites

`npm login`

Build sites-scripts

`npm i && npm run release`

## How to use sites-scripts now that it's pulled and built locally

Update your package.json like the following (assuming your repo is in the same root directory as sites-scripts):

```json
"@yext/yext-sites-scripts": "file:../sites-scripts/packages/yext-sites-scripts",
```
