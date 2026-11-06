---
title: 3. Add the dashboard
order: 3
---

# Step 3: Add the dashboard

## The one line

Add the dashboard where you set up your Express app, **after your models are registered**:

```js
// server.js (ES modules)
import express from "express";
import mongoose from "mongoose";
import { backray } from "@backray/express";
import { mongooseAdapter } from "@backray/adapters-mongoose";
import "./models/index.js"; // registers your models on mongoose

const app = express();

// … your own routes …

app.use(backray({ adapter: mongooseAdapter({ mongoose }) }));

app.listen(3000);
```

The same in CommonJS:

```js
// server.js (CommonJS)
const express = require("express");
const mongoose = require("mongoose");
const { backray } = require("@backray/express");
const { mongooseAdapter } = require("@backray/adapters-mongoose");
require("./models");

const app = express();
app.use(backray({ adapter: mongooseAdapter({ mongoose }) }));
app.listen(3000);
```

`backray()` serves the dashboard at `/admin`, and its API under `/admin/api`. To use another path, pass `path`: `backray({ path: "/panel", adapter })`. Mount it at the root of your app with `app.use(...)`, not under a path: a mount path is added in front of `path` (`app.use("/x", backray(...))` serves at `/x/admin`). With `path: "/"` the dashboard answers every page path, so mount it after your own routes.

There's no `await` and no build step. `backray(...)` returns the middleware at once and reads your models in the background.

## With inversify-express-utils

If your app builds its Express instance with `InversifyExpressServer`, add Backray in `setConfig`, after the body parser:

```ts
// server.ts
import "reflect-metadata";
import express from "express";
import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";
import mongoose from "mongoose";
import { backray } from "@backray/express";
import { mongooseAdapter } from "@backray/adapters-mongoose";
import "./models"; // registers your models on mongoose

const server = new InversifyExpressServer(new Container());
server.setConfig((app) => {
  app.use(express.json());
  app.use(backray({ adapter: mongooseAdapter({ mongoose }) }));
});

const app = server.build();
app.listen(3000);
```

`setConfig` runs before the controllers' routes are registered, so the dashboard at `/admin` answers first and a controller on `/admin/x` doesn't shadow it. The packages ship CommonJS entry points and their declaration files, so a project on `module: commonjs` in `tsconfig.json` type-checks with the default `moduleResolution` (`node10`) and with `node16`. The repository's smoke run checks both on TypeScript 5.9.

## Three rules

1. **Register your models first.** Backray reads them the moment `backray(...)` runs. If no model is registered yet, the dashboard shows the error "no models are registered".
2. **Give it the Mongoose your models live on.** That's usually the default `mongoose` import. If you create your models on a separate connection (`mongoose.createConnection(...)`), pass that connection instead: `mongooseAdapter({ mongoose: connection })`.
3. **Mount it at the root of your app, after your own routes.** `backray()` serves the dashboard at `/admin` by default; pass `path` to use another path. With `path: "/"`, it answers every `GET` request that reaches it.

Backray doesn't need a database connection to build the dashboard: it reads the model definitions, not your data.

## Try it

Start your server and open `http://localhost:3000/admin`.

- **Sidebar:** lists one resource per model, named after its collection (`Product` → "Products").
- **Pages:** clicking a resource opens its list, and you can show, create, edit and delete records there. Search, filters, sorting and paging run on your server. The start page still shows "Coming soon".
- **Health:** the **Health** link at the bottom of the sidebar shows anything Backray couldn't map (see [step 4](4-read-the-problems.md)).
- **Theme and language:** the buttons in the header switch between light and dark, and between English and Arabic.

Your server's console shows a summary when the dashboard loads:

```
backray: 3 resources from mongoose (0 invalid, 0 warnings)
```

To see the raw data the dashboard uses, open `http://localhost:3000/admin/api/resources`.

## A complete example

The Backray repository has a working app in `examples/mongoose` that you can copy from. `src/server.ts` builds the Express app and `src/serve.ts` starts it with a clean shutdown. In the repository, run `npm run serve -w @backray/example-mongoose` and open `http://localhost:3000/admin`.

Next: [Change what the dashboard shows](../features/index.md).
