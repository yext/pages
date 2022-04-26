# Yext Sites Scripts

Yext Sites Scripts is a package which exports a CLI with a built-in toolchain ready-made for Yext
Sites JS template development.

## Commands

```
yss dev
```

This command starts a devserver with hot module reloading to be used to quickly test changes to
JS templates.

```
yss build
```

This command runs a production build on your repo. It minifies and fingerprint assets so they are
prepared to be statically served by a webserver. Additionally provides a default Yext Plugin to
generate html pages from JS templates and prepares the template modules for generation.

## Development

Yext Sites Scripts has a number of scripts to assist with development. Since the tool is meant to be
used alongside a repository set up for Yext Sites it is recommended that any changes are tested
against a starter repository. One such starter repo is (mkilpatrick/yext-sites-starter)[https://github.com/mkilpatrick/yext-sites-starter].

By default, this repository references a non-local version of `@yext/yext-sites-scripts`. To point
the starter this local repository update the starter's `package.json`'s `@yext/yext-sites-scripts`
dependency to `file:path/to/this/package/`.

```
npm run build
```

This command uses esbuild to transpile assets and puts them into `dist`. Since this package's `bin`
specifies an entry-point in the `dist` directory you'll need to run this command whenever you make
changes in source so that they're picked up in any test repositories you're working on.

```
npm run watch
```

This command does the same this as `build` except it does it in watchmode anytime a source file is
updated the build will be automatically re-run.

```
npm run types
```

This command runs `tsc` to generate type declaration files and outputs them in `dist/types`.

```
npm run fmt
```

This command runs prettier for standardized formatting across all files.

```
npm run docs:dev
```

This command will start the vitepress devserver with hot module reloading to quickly test changes to documentation. It will generate a webpage for each markdown file in the `docs` directory according to the config specified in `docs/.vitepress/config.ts`

```
npm run docs:build
```

This command will use vitepress to fully build the html pages for the documentation site and puts them into `docs/.vitepress/dist`. Similar to the `docs:dev` command, it will generate an html page for each markdown file in the `docs` directory according to the configuration specified in `docs/.vitepress/config.ts`.

```
npm run docs:serve
```

This command will run the same build as the `docs:build` command and it will then serve the fully generated html files on a local server. This allows inspection of the documentation webpages in a way that's fully consistent with what will be served on the real website.

```
npm run test
```

This command will run all the tests in the package using Jest as the test runner.
