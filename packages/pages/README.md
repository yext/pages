# pages

`pages` is the main package that exports different subpackages, all designed to make it easy to develop on the Yext Pages platform using JavaScript.

## Subpackages

All folders below live at `packages/pages/src`.

### bin

The main binary exported as `pages`. The two important commands are:

- `pages init`
  - Clones the [starter repo](https://github.com/yext/pages-starter-react-locations), runs `npm install`, and performs the first build, all in one simple command. The actual init functionality lives in [`/init`](#init).
- `pages dev`
  - Runs a custom local development server that is backed by [Vite](https://vitejs.dev/). The actual dev server functionality lives in [`/dev`](#dev).

### common

Contains any code shared between the other subpackages. It also contains public types and internal domain types.

### components

Specialized React components that make development against data from the Yext Knowledge Graph easy. Many of these base components are the types of things many of our customers use on their Pages, such as an Hours component.

### dev

All of the code related to the custom local dev server lives here. The server itself is an Express server that's backed by [Vite](https://vitejs.dev/), giving us ultra fast HMR (hot module replacement) out of the box.

In general, local dev was set up to be similar to how NextJS works. Every unique page is a separate file in your own repository's `src/templates` folder. The default export in each file represents the template entrypoint.

### init

The actual code relating to the `pages init` function.

### util

Contains helper utility functions that could be useful to someone using PagesJS. For instance, we have a custom `fetch` function that allows it to work across different runtime environments (Node vs. Deno vs. Browser).

### vite-plugin

This is a plugin to be used with Vite specifically. It provides an opinioned but easy-to-use way to bundle your code for production. Where [`/dev`](#dev) builds for local development, `/vite-plugin` builds for production.

## Development

`pages` has a number of scripts to assist with development. Since the tool is meant to be
used alongside a repository set up for Yext Pages, it is recommended that any changes are tested
against a starter repository. One such starter repo is [yext/pages-starter-react-locations](https://github.com/yext/pages-starter-react-locations).

By default, the starter repository references a non-local version of `@yext/pages`. To point
the starter at this local repository, first run `pnpm pack` in `./packages/pages`, then update the starter's `package.json`'s `@yext/pages`
dependency to `file:../path/to/the/pack.tgz`.

Also see the [Contributing Guide](https://github.com/yext/pages/blob/main/CONTRIBUTING.md#repo-setup).

#

```
pnpm build
```

This command uses esbuild to transpile assets and puts them into `dist`. Since this package's `bin`
specifies an entry-point in the `dist` directory you'll need to run this command whenever you make
changes in source so that they're picked up in any test repositories you're working on.

```
pnpm build:release
```

Similar to `pnpm build` but also runs types.

```
pnpm watch
```

This command does the same this as `build` except it does it in watchmode anytime a source file is
updated the build will be automatically re-run.

```
pnpm types
```

This command runs `tsc` to generate type declaration files and outputs them in `dist/types`.

```
pnpm fmt
```

This command runs prettier for standardized formatting across all files.

```
pnpm docs:dev
```

This command will start the Vitepress devserver with hot module reloading to quickly test changes to documentation. It will generate a webpage for each markdown file in the `docs` directory according to the config specified in `docs/.vitepress/config.ts`

```
pnpm docs:build
```

This command will use Vitepress to fully build the html pages for the documentation site and puts them into `docs/.vitepress/dist`. Similar to the `docs:dev` command, it will generate an html page for each markdown file in the `docs` directory according to the configuration specified in `docs/.vitepress/config.ts`.

```
pnpm docs:serve
```

This command will run the same build as the `docs:build` command and it will then serve the fully generated html files on a local server. This allows inspection of the documentation webpages in a way that's fully consistent with what will be served on the real website.

```
pnpm test
```

This command will run all the tests in the package using Jest as the test runner.

## Commands to Use in a Starter

```
pages dev
```

This command starts a devserver with hot module reloading to be used to quickly test changes to
JS templates.

```
vite build
```

This command runs a production build on your repo. It minifies and fingerprints assets so they are
prepared to be statically served by a webserver. Additionally provides a default Yext Plugin to
generate html pages from JS templates and prepares the template modules for generation.
