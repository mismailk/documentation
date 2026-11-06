---
title: Troubleshooting
order: 90
---

# Troubleshooting

| What you see | Why | What to do |
| --- | --- | --- |
| `npm error 404 Not Found … @backray/server` while installing | You installed one Backray file on its own, so npm looked for the other packages on the public registry | Install all five files in one command ([step 2](getting-started/2-install.md)) |
| `npm warn EBADENGINE` or `Unsupported engine` | Your project runs a Node.js older than 20.19 | Upgrade Node.js to 20.19 or newer |
| The page says "backray: the dashboard client is not built" | The `backray-app` file doesn't contain the built dashboard, usually because it was packed by hand or by an older Backray | Build the files again with `npm run pack:local` and reinstall them |
| The dashboard says "no models are registered" | `backray(...)` ran before your models were registered | Import or require your models before the `app.use(backray(…))` line ([step 3](getting-started/3-add-the-dashboard.md)) |
| The sidebar is empty or misses models | The models live on another Mongoose instance or connection, or `include`/`exclude` filters them out | Pass the instance or connection your models are on, and check `include`/`exclude` ([Choose models](features/choose-models.md)) |
| Your own routes stopped answering `GET` requests | The dashboard answers every page path (with `path: "/"`) before them | Mount it after your own routes, or keep the default `/admin` |
| A blank page behind a proxy | The proxy serves the dashboard under a different path than Express sees | Serve it at the same path in both ([step 5](getting-started/5-run-in-production.md)) |
| A resource shows ⚠ or ✕, or a banner appears | Something in your models couldn't be mapped | Open the Health page ([step 4](getting-started/4-read-the-problems.md)) |
| A change to your models doesn't show | Backray reads your models once, at startup | Restart your server |
| Sorting or filtering a field fails with a `400` | The field is not marked `sortable`/`filterable`; only those flags allow it | Mark the field in an override ([below](#a-400-when-sorting-or-filtering)) |

## A 400 when sorting or filtering

A field is sortable only with `sortable: true`, and filterable only with `filterable: true`. Out of the box a Mongoose resource offers:

- **sorting** by its title field, its default sort field, `createdAt` and `updatedAt`;
- **filtering** by `createdAt`, `updatedAt`, and the title field when its type has a filter (a `select`);
- **searching** its title field when it is text.

`id` is always sortable. Mark more fields in an override:

```js
app.use(backray({
  adapter: mongooseAdapter({ mongoose }),
  overrides: {
    products: { fields: { price: { sortable: true, filterable: true } } },
  },
}));
```

See [Model options](features/model-options.md) for the other override options.
