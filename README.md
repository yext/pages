# Yext Sites Scripts

An out-of-the-box toolchain integrated with Yext Sites.

There is 1 npm package which lives in this repository.

It is `@yext/sites-scripts`, a CLI which provides a default development and production toolchain bundling assets and templates for Yext Sites.
Backed by vite, it provides a custom devserver for template development and a production build which leverages the vite plugin.
<br><br>

# How to get started

Clone this repository

`git clone git@github.com:yext/sites-scripts.git`

`cd sites-scripts`

Log into the yext npm account.

1. You must have access to the org.
1. You can check for access if you can see this package: https://www.npmjs.com/package/@yext/sites-scripts
1. If you don't have access, ask in #discuss-react-on-sites

`npm login`

This repository uses pnpm. Build all packages.

`pnpm i && pnpm release`
