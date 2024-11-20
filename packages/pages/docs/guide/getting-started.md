# Getting Started

## Overview

This doc teaches you the most basic flow for starting a Pages project. All of the recommendations are best practices, which can be adapted to your own specific needs. For a more guided walk through, check out the [Create Your Site unit](https://hitchhikers.yext.com/modules/pgs601-build/03-create-site/).

::: info
This doc assumes you are on the latest version of Pages. See (ADD LINK HERE)Upgrading to PagesJS 1.0.0(ADD LINK HERE) to upgrade before you get started to take advantage of our latest features.
:::

Read on for more details about each of these commands:

- `yext pages new` - clone a starter repo and configure local dev setup
- `npm run dev` - connect to your Content and spin up a dev server
- `npm run prod` - make a production build to check your work before triggering a new deploy

Note: These commands are built into our starter and are aliased in the `package.json`. If you are building a project from a source other than a Yext starter, there are no guarantees the above commands will work.

PREREQ
Before you get started, make sure you set up the (ADD LINK HERE)local development environment dependencies(ADD LINK HERE).

## Starting a New Project

### yext pages new

Once you have an account and have downloaded the CLI, you can run the following command to get started:

```bash
yext pages new
```

This command will initiate an onboarding flow in the command line, through which you can name your project, clone starter repos, and configure GitHub repositories.

Once you have cloned a starter and set up up your own GitHub repository through this command, you can begin local development.

## Local Development

The starter repository configures two commands, which you should use in local development:

1. `npm run dev`
2. `npm run prod`

### npm run dev

The `npm run dev` command will set up a connection with your Yext account’s Content and spin up a dev server at `localhost:5173`. The dev server supports hot reloading so any changes made to your code will be reflected right away.

This command also runs in `dynamic` mode by default, which means that any updates to your Content will also be reflected in your build. Dynamic mode is useful, so you can preview how changes to fields in your Content are displayed in your Pages front-end.

If you wish to only use local data for development and not pull data directly in real-time from your Content, you can use the `--local` flag with `npm run dev`.

If you ever change your stream configuration, it is necessary to kill and restart the dev server so that any new fields can be pulled down from the Content.

### npm run prod

Once you have finished local development and are ready to make a deploy, we recommend you run `npm run prod`. This command makes a full production build of your site mimicking the build environment used in the Yext deployment system, and will serve your project at `localhost:8000`.

This command makes a full production build, so hot-reloading is _not_ supported.

While it is not strictly necessary to run this command before deploying, we recommend checking that your project builds correctly and renders properly before pushing a deployment to staging or production.

## Deploying

If you set up a remote GitHub repository for your project following the `yext pages new` command, your project should be living under your GitHub account. If you have not done this step, you should set up a remote repo on your GitHub account before deploying.

Once your Pages code is in a GitHub repository, you can connect your repo to your Yext account by following the directions (ADD LINK HERE)here(ADD LINK HERE).

By default, any new pushes to your GitHub repo will trigger a re-deploy of your Yext account.

## (Legacy) Projects Using < PagesJS 1.0.0

If your project leverages a PagesJS version less than v1.0.0, you are likely using a version of a starter that was configured using our legacy `package.json` commands (refer to (ADD LINK HERE)this commit(ADD LINK HERE) as an example). You should check the commands to confirm, but the old dev commands will likely be as follows:

- `yext pages new`
- `npm run dev`
- `npm run build:serve`
