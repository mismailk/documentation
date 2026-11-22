---
title: CORS
order: 16
---

# CORS: call the API from another origin

Backray sends no CORS headers. The dashboard is served from the same origin as its API, so it never needs them. A page on another origin that calls the API needs the [`cors`](https://www.npmjs.com/package/cors) package in front of the mount:

```js
import cors from "cors";

app.use("/admin/api", cors({ origin: "https://app.example.com" }));
app.use(admin);                      // the dashboard and its API at /admin
```

Place it before `app.use(admin)`, and under `<path>/api` when the `path` option is not `/admin`. Backray leaves `OPTIONS` to `next()`, so that middleware answers the preflight.
