---
title: 1. Get the packages
order: 1
---

# Step 1: Get the packages

The Backray packages aren't on npm yet. You build them once from the Backray repository. The result is seven `.tgz` files: five you install in your project in step 2, and two more if you build extensions.

## 1. Build and pack

In a clone of the Backray repository, with Node.js 22.18 or newer:

```bash
npm install
npm run pack:local -- ~/backray-packs
```

`pack:local` builds every package, including the dashboard itself, and writes seven files to the folder you give it:

| File | What it is |
| --- | --- |
| `backray-utils-0.1.0.tgz` | Shared code: the resource format and its checks |
| `backray-app-0.1.0.tgz` | The dashboard, already built. You never build it yourself |
| `backray-server-0.1.0.tgz` | The server core, which works with any framework |
| `backray-express-0.1.0.tgz` | The Express middleware you add to your app |
| `backray-adapters-mongoose-0.1.0.tgz` | Reads your Mongoose models |
| `backray-sdk-0.1.0.tgz` | The extension contract: types, hooks, test host and `defineFieldConfig`; only for projects that build extensions |
| `backray-ui-0.1.0.tgz` | The UI kit's source, for extensions' types; only for projects that build extensions |

Without a folder, the files go to `packs/` inside the repository.

At the end it prints ready-to-copy `npm install` lines with the full paths. You use them in step 2.

> **Note:** `pack:local` deletes any old `backray-*.tgz` files in that folder before writing new ones. Use a folder that holds only Backray files.

## 2. Optional: check the files

To check that the files work before you touch your project:

```bash
npm run smoke:pack
```

It installs the five runtime files into a new, empty Express project under Node.js 20.19. It then starts that project twice, once as an ES module and once as CommonJS, and checks that the API, the dashboard page and its scripts answer. Then it builds a small extension with the installed `host-extensions` command and checks the bundle, stylesheet and manifest it writes. In a second project, it installs the SDK and the kit with React and TypeScript, type-checks a widget and a field type with `tsc`, checks that `tsc` refuses a deliberate type error, and builds both extensions with `host-extensions`. It ends with `smoke:pack ok (esm, cjs, host-extensions, extension author)`. It needs internet access to download Express, Mongoose, Node.js 20.19, React, TypeScript and the two new files' dependencies.

To check a project shaped like a CommonJS TypeScript app, run:

```bash
npm run smoke:pack -- --profile=inversify
```

It installs the five files into a new CommonJS TypeScript project under Node.js 22.12 with Express 4.21.1, Mongoose 6.12.0 and `inversify-express-utils`. It compiles the project with TypeScript 5 twice, once with the default `node10` resolution and once with `node16`, then starts it. It checks that the app's own route answers, that the dashboard's API lists a tree model and a self-referencing model, that the dashboard page and its scripts answer, and that a three-level tree keeps every node's id across a `PUT`. It ends with `smoke:pack ok (inversify)`.

## When to build again

Run `pack:local` again whenever you pull new Backray changes, then repeat step 2. The version number stays `0.1.0`, so npm replaces the files' contents in place.

Next: [Install them in your project](2-install.md).
