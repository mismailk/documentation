---
title: API client
order: 18
---

# API client

The dashboard's pages call Backray's record routes under `<path>/api`, and your own endpoints through the same client. Three settings tune the client's raw calls:

```js
app.use(backray({
  adapter: mongooseAdapter({ mongoose }),
  client: {
    baseUrl: "https://api.example.com", // default: the dashboard's own origin
    credentials: "include",             // default: "same-origin"
    timeout: 30_000,                    // default: 30 000 ms
  },
}));
```

| Setting | What it does | Default |
| --- | --- | --- |
| `baseUrl` | Where the client's raw calls resolve a path: an absolute `http(s)` URL, or a path such as `/reports`. A full URL in a call is used as written. | the page's origin |
| `credentials` | Which cookies the browser sends: `"same-origin"`, `"include"` or `"omit"`. | `"same-origin"` |
| `timeout` | How long one request may take, in milliseconds. On expiry the call rejects with a timeout error. | `30000` |

Record calls (`records(key).list`, `.get`, `.create`, and the rest) always go to `<path>/api` and never follow `baseUrl`. `credentials: "include"` to another origin only works when that service's CORS answer allows credentials (see [CORS](cors.md)).

The options are checked when `backray()` starts: a malformed value stops it with an error. They are then injected into the dashboard's page.
