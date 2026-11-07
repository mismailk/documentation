---
title: Troubleshooting
order: 90
---

# Troubleshooting

| What you see | Why | What to do |
| --- | --- | --- |
| `npm error 404 Not Found … @backray/server` while installing | You installed one Backray file on its own, so npm looked for the other packages on the public registry | Install all five files in one command ([step 2](getting-started/2-install.md)) |
| `Cannot find module '@backray/sdk'` or `'@backray/ui'` in an extension | The SDK and the UI kit are dev dependencies for extension authors, and aren't installed | Install the two dev tarballs ([step 2](getting-started/2-install.md)) |
| `npm warn EBADENGINE` or `Unsupported engine` | Your project runs a Node.js older than 20.19 | Upgrade Node.js to 20.19 or newer |
| The page says "backray: the dashboard client is not built" | The `backray-app` file doesn't contain the built dashboard, usually because it was packed by hand or by an older Backray | Build the files again with `npm run pack:local` and reinstall them |
| The dashboard says "no models are registered" | `backray(...)` ran before your models were registered | Import or require your models before the `app.use(backray(…))` line ([step 3](getting-started/3-add-the-dashboard.md)) |
| The sidebar is empty or misses models | The models live on another Mongoose instance or connection, or `include`/`exclude` filters them out | Pass the instance or connection your models are on, and check `include`/`exclude` ([Choose models](features/choose-models.md)) |
| Your own routes stopped answering `GET` requests | The dashboard answers every page path (with `path: "/"`) before them | Mount it after your own routes, or keep the default `/admin` |
| A blank page behind a proxy | The proxy serves the dashboard under a different path than Express sees | Serve it at the same path in both ([step 5](getting-started/5-run-in-production.md)) |
| A resource shows ⚠ or ✕, or a banner appears | Something in your models couldn't be mapped | Open the Health page ([step 4](getting-started/4-read-the-problems.md)) |
| A warning says `unknown <type> config key "<key>"` | The field's config has a key that type does not read, usually a typo | Correct the key; the hint names the key it probably meant. The field works without it |
| A warning says `nested deeper than <n> levels; served as json` | A nested object or list goes deeper than the limit (6 by default) | Raise `backray({ maxNesting })` (up to 10), or flatten the model ([Field types](features/field-types.md)) |
| A warning says `ref points at <Model>, whose _id is <type>, but this path is <type>` | The path's type and the referenced model's `_id` type differ, so the path is served as a plain value | Give the path the `_id`'s type ([Record ids](features/record-ids.md)) |
| A warning says `_id of type <type> is not supported for creating records` | The model's `_id` is neither an ObjectId nor a String or Number, and has no default | Give `_id` a default ([Record ids](features/record-ids.md)) |
| The server stops with `group "<key>" is not in backray({ groups })` | A resource names a sidebar group that isn't listed and isn't a resource key | Add the group to `backray({ groups })` or fix the key ([Sidebar groups](features/sidebar-groups.md)) |
| A note says `no server check for field type "<type>"` | A field uses an extension type whose config parser the server doesn't have | Pass its `defineFieldConfig(...)` result in `backray({ fieldTypes })` ([Extensions](features/extensions.md)) |
| A warning says `retyped to the extension type "<type>": stored values are not checked` | An override gives a field an extension type; the server checks its config, not the stored values | Nothing to fix: it reminds you that the extension's field type owns those values |
| A dashed card says "This part could not load." | An extension threw, its bundle failed to load, or it asks for a shared-API version the dashboard doesn't have | Read the browser console: it names the extension and the reason ([Extensions](features/extensions.md)) |
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

A field inside an object or an object-list row can be filterable too, by its dotted path: `"address.city": { filterable: true }`. Its filter shows as "Address › City", and filters on one object list match only records where a single row matches them all.

See [Model options](features/model-options.md) for the other override options.
