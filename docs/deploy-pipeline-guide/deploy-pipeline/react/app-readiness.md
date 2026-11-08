---
title: Is Your App Ready?
order: 2
---
# Is Your App Ready?

Go through this checklist before touching the server. Each item is something
the static container setup depends on. Run the checks from the root of your
app repo.

## Checklist {#checklist}

| # | Requirement | Why | How to check |
|---|---|---|---|
| 1 | The app is a **static single-page app** built by Vite or Create React App. No server-side rendering and no Node server at runtime | the runtime image is nginx serving the build output; there is nothing to render on the server | `npm run build` writes a folder of HTML, JS and CSS; there is no `start` server entry point |
| 2 | The build runs on Linux with `npm ci` and a committed `package-lock.json` | CI runs the build in a Linux container and installs exactly what the lockfile lists | `ls package-lock.json pnpm-lock.yaml yarn.lock bun.lockb`; a clean `npm ci && npm run build` |
| 3 | You have a list of every public value for staging and for production, with the app's prefix (`VITE_` or `REACT_APP_`), and **none of them is a secret** | they are baked into the browser JavaScript at build time and come from the `PUBLIC_ENV_STAGING` / `PUBLIC_ENV_PRODUCTION` repository variables ([public values](./prepare-your-app#public-build-values)); anyone can read them | `grep -rhoE '(VITE|REACT_APP)_[A-Z0-9_]+' --exclude-dir=node_modules --exclude-dir=build --exclude-dir=dist . \| sort -u` |
| 4 | The build script does not use `env-cmd` and does not use Windows `%NAME%` syntax | those fail or read the wrong files on Linux CI; the pipeline passes the environment's values through `.env.production.local` instead | `npm pkg get scripts.build`; search it for `env-cmd` and `%` |
| 5 | `package.json` has `engines.node` with an exact version | the build stage uses that Node version (`node:<version>-alpine`) | `npm pkg get engines` |
| 6 | The app calls its backend through a URL that works on the chosen domain setup | with setup A or B it is usually a relative `/api`; a path-mounted app (setup C) needs its own prefix. A wrong host either hits the wrong server or fails CORS | `grep -rn 'fetch(\|axios\|baseURL' src`; list the URLs for each environment |
| 7 | No value the app needs is kept in a committed `.env*` file | `.dockerignore` keeps every `.env*` file out of the image; public values go in the repository variables, and the only server value is `PORT` | `git ls-files '.env*'` |
| 8 | Client routing uses `BrowserRouter` or `HashRouter` | `BrowserRouter` deep links need the nginx SPA fallback; `HashRouter` never reaches the server past `/` | `grep -rn 'Router' src` |
| 9 | The app does not need the server to rewrite its HTML | one `index.html` is served to every visitor, so nothing can be rendered per request. In the CRA app, `slug` and `theme` must come from the API instead | search the build/runtime for server-rendered values in the HTML |
| 10 | Service worker caching is reviewed | a cached old `index.html` or `sw.js` keeps users on an old build | read the Workbox config; the template serves `sw.js`, `service-worker.js` and `index.html` as `no-cache` |
| 11 | For setup C (a sub-path of a domain), the base path is set in the build and the router | assets and routes must be generated under the sub-path | Vite `base`, or CRA `homepage` / `PUBLIC_URL`; router `basename` ([hosting setups](./prepare-your-app#hosting-setups)) |
| 12 | The app doesn't need to keep files on local disk between deploys | the container is replaced on every deploy, so its disk is thrown away | uploads should go to object storage or the API |
| 13 | A build never logs a secret | a failed deploy prints the last 50 container log lines into the GitHub Actions log, and CI logs are public to repo readers | read the build output |
| 14 | Every package the code imports is declared in `package.json` | the image installs exactly what the lockfile lists (`npm ci`) | a clean install and build from a fresh clone |

::: warning Undeclared dependencies
Item 14 has a known trap: an app can import a package that is only installed
because another dependency pulls it in. It works on your laptop until that
dependency drops it. Declare everything you import.
:::

::: tip The CRA app's `slug` and `theme`
The CRA reference app reads `slug` and `theme` from HTML the backend renders
today. A static container cannot do that. Ship the change that moves both
values into the API **before** the cutover; the walkthrough gates the switch
on it for that reason.
:::

## ✅ Checkpoint {#checkpoint}

- Every item in the checklist above holds for your app, or you've changed the
  app so it does.
- A clean install and build passes from a fresh clone: `npm ci && npm run build`.
- You've written down: the Node version, the build command, the output folder
  (`build` or `dist`), the public value names and their staging and production
  values, and which hosting setup (A, B or C) the app will use.

Next: [Prepare Your App](./prepare-your-app).
