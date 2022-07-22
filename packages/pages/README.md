# Pages

Pages is a package which exports a CLI with a built-in toolchain ready-made for Yext
Pages JS template development.

## Commands

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

## Development

Pages has a number of scripts to assist with development. Since the tool is meant to be
used alongside a repository set up for Yext Pages it is recommended that any changes are tested
against a starter repository. One such starter repo is (yext/pages-starter-react-locations)[https://github.com/yext/pages-starter-react-locations].

By default, the starter repository references a non-local version of `@yext/pages`. To point
the starter at this local repository, first run `pnpm pack` in `./packages/pages`, then update the starter's `package.json`'s `@yext/pages`
dependency to `file:../path/to/the/pack.tgz`.

#

```
pnpm build
```

This command uses esbuild to transpile assets and puts them into `dist`. Since this package's `bin`
specifies an entry-point in the `dist` directory you'll need to run this command whenever you make
changes in source so that they're picked up in any test repositories you're working on.

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
pnpm build:release
```

Similar to `pnpm build` but also runs types.

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
