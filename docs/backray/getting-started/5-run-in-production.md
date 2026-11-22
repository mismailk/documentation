---
title: 5. Run in production
order: 5
---

# Step 5: Run it in production

## Protect it

**The dashboard has no login yet.** Everything under its path is open to anyone who can reach your server, including the list of your models and fields.

Put your own authentication middleware in front of it:

```js
app.use("/admin", requireAdmin);
app.use(backray({ adapter: mongooseAdapter({ mongoose }) }));
```

`requireAdmin` runs for every request under `/admin` before Backray does. `requireAdmin` is any Express middleware you already use. It calls `next()` for allowed users and answers `401` or `403` for others. You can also keep the path off the public internet, behind your VPN or internal network.

## Keep a handle when you need one

`backray(...)` returns the middleware, which also has three controls. Keep it in a variable if you use them:

```js
const admin = backray({ adapter: mongooseAdapter({ mongoose }) });
app.use(admin);
```

| Control | What it does |
| --- | --- |
| `admin.ready` | A promise that resolves when the resources are loaded, and rejects if the data source failed. You never have to await it. Await it if you'd rather your server refuse to start than show the error page |
| `admin.refresh()` | Reads the resources again. If it fails, the dashboard keeps serving the last good result |
| `admin.close()` | Releases what the data source opened. Call it when your server shuts down |

For example, to refuse to start:

```js
await admin.ready; // throws if Backray couldn't read your models
app.listen(3000);
```

And to shut down cleanly:

```js
process.on("SIGTERM", async () => {
  server.close();
  await admin.close();
  await mongoose.disconnect();
});
```

## Indexes for speed

Backray runs the queries; your database needs the indexes. At 50,000 request logs, list, sort and search calls take under 100 ms. A filter with its counts takes about 60 ms without an index and about 27 ms with one.

Add an index for each field a screen sorts, filters or searches on:

```js
const logs = mongoose.connection.collection("requestlogs");
await logs.createIndex({ createdAt: -1 }); // the default sort
await logs.createIndex({ durationMs: 1 }); // a sortable field
await logs.createIndex({ status: 1 }); // a filterable field
```

Run it once, in your migration or when your server starts. Backray creates the indexes your uniqueness rules need; it does not create these.

Search on a large collection uses a regular expression by default, which reads every document. Turn text search on in the resource file, or in the adapter's models override:

```js
models: { RequestLog: { search: "text" } }
```

Backray creates a text index on the searchable text fields, named `backray_text`; until the build finishes, search keeps using the regular expression. MongoDB then searches whole words and their stems. MongoDB allows one text index per collection: if yours already has a different one, Backray warns and keeps the regular expression, so drop the old index first. Filters and facet counts answer select, radio, boolean and reference fields; a number field filters with a range.

The repository's check runs the same calls against 50,000 generated records in an in-memory database:

```bash
npm run perf -w @backray/example-mongoose
```

It prints the median of five runs per call, without and with the indexes above, and exits non-zero if any call stays at 500 ms or more.

## Things to know

- **Caching:** the dashboard's scripts and styles are cached by browsers for a year (their names change with each build). The page itself and the API aren't cached.
- **Reverse proxies:** the dashboard builds its links from the path Express mounted it at. A proxy that serves it under a different path than your app sees (for example `/backoffice/` in front of `/admin/`) isn't supported yet. Mount it at the same path the browser uses.
- **Updating Backray:** rebuild the packages ([step 1](1-get-the-packages.md)), install them again ([step 2](2-install.md)), and restart your server.

If something goes wrong, see [Troubleshooting](../troubleshooting.md).
