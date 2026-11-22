---
title: Backray
order: 10
---

# Backray: add the admin dashboard to your Express app

Backray gives an Express app an admin dashboard. You add one line to your server. Backray reads your Mongoose models and the dashboard shows them as resources.

```js
app.use(backray({ adapter: mongooseAdapter({ mongoose }) }));
```

This guide walks you through it, from getting the packages to a running dashboard.

## What works today

| Works now | Not yet |
| --- | --- |
| The dashboard at the path you choose (for example `/admin`), in English and Arabic, light and dark | Login. The dashboard is open to anyone who can reach it |
| List, Show, Create and Edit pages for every resource Backray found in your models, with search, sorting, filters and paging | File uploads. A file field keeps the file inside the record for now |
| Nested objects and lists up to 6 levels (or your own `maxNesting`), lists of lists, maps of references, trees (a subdocument array that holds itself) up to 10 levels, and models that reference themselves | Publishing to npm. You install the packages from files you build (step 1) |
| String and number ids typed in on Create, and references to them | |
| Filters on fields inside objects and object lists, and on references whose model comes from another field | A dashboard page in server mode: the start page says "Coming soon" and holds the extensions' widgets |
| Sidebar groups, with discriminators grouped under their base model | |
| [Extensions](features/extensions.md): widgets, page and section replacements and field types, built with `host-extensions` and loaded at runtime | |
| A Health page, sidebar markers and a banner when a model can't be mapped | |
| [The JSON API](features/json-api.md) the dashboard calls, under `/admin/api` | Data sources other than Mongoose |

## Where to start

- [Getting started](getting-started/index.md): five steps from getting the packages to running the dashboard in production.
- [Features](features/index.md): change what the dashboard shows, add your own rules, and use the API.
- [UI kit](ui-kit/index.md): the components the dashboard is built from.
- [Troubleshooting](troubleshooting.md): if something goes wrong.

## Requirements

- **Your project:** Node.js 20.19 or newer, npm 7 or newer, Express 4 or 5, Mongoose 6 to 9.
- **To build the packages (step 1):** a clone of the Backray repository and Node.js 22.18 or newer.
- **Package manager:** npm only for now. Yarn, pnpm and Bun haven't been tested with these files.
