# PagesJS Contributing Guide

On behalf of Yext, we'd like to thank you for your interest in PagesJS and appreciate any contributions you're willing to make! Please read through the following guide before making any pull requests.

## Repo Setup

The PagesJS repo is a monorepo using pnpm workspaces. The package manager used to install and link dependencies must be [pnpm](https://pnpm.io/).

To develop and test:

1. Run `pnpm i` in the root folder.

2. Make your changes. Then in /packages/pages run `pnpm pack`.

3. Reference the local pack file in another project that uses this one, such as https://github.com/yext/pages-starter-react-locations. You can reference it in the starter's package.json like `"@yext/pages": "file:../pages/packages/pages/yext-pages-[version].tgz"` (assuming both projects live in the same root folder).

4. If you make changes in PagesJS make sure to `rm -rf package-lock.json node_modules/@yext/pages && npm i` in the starter first to ensure you pull in the latest packed changes.

### Unit Tests

In most circumstance all changes should be associate with a unit test that lives in a test file (filename.test.ts) in the same location.

- `pnpm run test` runs unit tests under each package.

## Pull Request Guidelines

- Checkout a topic branch from a base branch (e.g. `main`), and merge back against that branch.

- If adding a new feature:

  - Add accompanying test case.
  - Provide a convincing reason to add this feature.

- If fixing a bug:

  - If you are resolving a special issue, add `(fix #xxxx[,#xxxx])` (#xxxx is the issue id) in your PR title for a better release log (e.g. `fix: update entities encoding/decoding (fix #3899)`).
  - Provide a detailed description of the bug in the PR.
  - Add appropriate test coverage if applicable.

- It's OK to have multiple small commits as you work on the PR. GitHub can automatically squash them before merging.

- Make sure tests pass!

- PR titles must follow the [semantic pull request](https://github.com/marketplace/actions/semantic-pull-request) style so that changelogs can be automatically generated. PR titles are automatically validated by a Github action.

  - ```
      feat(dev): add hydration option.
      ^    ^    ^
      |    |    |__ Subject
      |    |_______ Scope
      |____________ Type

    ```

  - See [conventional commit types](https://github.com/commitizen/conventional-commit-types/blob/master/index.json) for valid feature types.
  - Valid scopes can be found in the [action](https://github.com/yext/pages/blob/main/.github/workflows/semantic-pull-request.yml).

- No need to worry about code style as there's a Github action to automatically run `pnpm fmt` for you, but you may also run it before commit.

## Git Hooks

This repo has the following pre-commit hooks set up:

- pnpm fmt
  - Runs Prettier to automatically format all of your code, keeping a consistent and clean code format

Note: For those that use a git client for committing (such as Sublime Merge), follow [these steps](https://typicode.github.io/husky/#/?id=command-not-found).
