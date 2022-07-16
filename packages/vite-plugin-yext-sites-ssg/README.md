# Yext Sites SSG Vite Plugin

This package is a vite plugin which can be added to any vite build configuration. It adds template
paths as entrypoints to the rollup configuration, generates a features.json file used by Sites based
on template modules, and provides a Yext plugin used to generate html pages from a stream document
for a particular feature.

## Development

Yext Sites Scripts has a number of scripts to assist with development. Since this package is
typically used as a dependency

used alongside a repository set up for Yext Sites it is recommended that any changes are tested
against a starter repository. One such starter repo is (mkilpatrick/yext-sites-starter)[https://github.com/mkilpatrick/yext-sites-starter].

By default, this repository references a non-local version of `@yext/sites-scripts`. To point
the starter this local repository update the starter's `package.json`'s `@yext/sites-scripts`
dependency to `file:path/to/this/package/`.

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
pnpm fmt
```

This command runs prettier for standardized formatting across all files.
