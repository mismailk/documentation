---
title: 4. Read the problems
order: 4
---

# Step 4: Read the problems it reports

Backray never stops your server because of a model it can't map. An override mistake stops the dashboard instead, until you fix it. Either way, it shows what's wrong in two places: your server's console and the dashboard.

## In the console

Each time the dashboard loads its resources, the console shows a summary, then one line per problem:

```
backray: 5 resources from mongoose (1 invalid, 2 warnings)
backray: invoices: titleField: no field named "nope"
backray: products.photo: Buffer fields are not served; the field was skipped
backray: Ghost: model "Ghost" is not registered
```

## In the dashboard

| Where | What it shows |
| --- | --- |
| Banner | "Problems found in your resources: 3 · View" on every page while there is any problem. **View** opens the Health page |
| Sidebar | ⚠ with a count on a resource that has warnings, and ✕ on a resource that couldn't be shown |
| Health page | Every invalid resource with its problems, and every warning grouped by resource |

Notes, such as a resource with fields hidden as secret, are listed apart on the Health page and are not counted: they raise no banner and no ⚠ badge. When there are notes, the console summary adds `, <n> notes`, and each note is logged on its own info line.

## The four kinds of problem

| Kind | What it means | What still works |
| --- | --- | --- |
| **Warning** | Something in a model couldn't be mapped exactly. For example, a `Buffer` field isn't served, or a `ref` points to a model you didn't include | Everything else in that resource |
| **Invalid resource** | The resource as a whole fails Backray's checks, such as a `titleField` the adapter named that doesn't exist | Every other resource. The sidebar still lists this one with ✕, and opening it shows its problems |
| **Override error** | An override that changes meaning in a way backray can't apply: a field that doesn't exist, an unknown type, setting or check name (`unknown check "<name>"`), a type change that can't hold the stored values (`number` to `email`), or a loosened rule (`required: false` on a required field) | Nothing is served until it's fixed; `admin.ready` rejects |
| **Data source failure** | Backray couldn't read your models at all, for example because no model was registered when `backray(...)` ran | Your app keeps running. The dashboard shows an error page that names the data source and its message, and `/admin/api/resources` answers `503` |

When two models naturally end up with the same key, the first one is served. The second one is listed on the Health page under its model name with "key already taken". Rename one with `models.<Name>.key` (see [Model options](../features/model-options.md)). If an override renames a model to a key already taken, that is an override error instead.

## After you fix something

Restart your server. Backray reads your models once, when the server starts.

Next: [Run it in production](5-run-in-production.md).
