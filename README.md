# Yext Sites Scripts

An out-of-the-box toolchain integrated with Yext Sites.

There are 2 npm packages which live in this repository.

The first is `@yext/vite-plugin-yext-sites-ssg`, a vite plugin which provides default site generation configuration for statically generating pages from Javascript in Yext Sites.

The second is `@yext/yext-sites-scripts`, a CLI which provides a default development and production toolchain bundling assets and templates for Yext Sites.
Backed by vite, it provides a custom devserver for template development and a production build which leverages the vite plugin.
