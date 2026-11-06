---
title: Model options
order: 2
---

# Model options

The Mongoose adapter's `models` option changes one model, keyed by its **model name** (`Product`).

```js
mongooseAdapter({
  mongoose,
  models: {
    Product: {
      key: "catalogue",                                  // the URL: /admin/resources/catalogue
      titleField: "name",                                // the field that names a record
      defaultSort: { field: "createdAt", direction: "desc" },
      hidden: ["internalNotes", "supplier.contact"],     // never shown; dotted paths for nested fields
      shown: ["tokenCount", "auth"],                     // served although the name looks secret; a container covers what is under it
      fields: {
        price: { type: "currency", config: { min: 0 } },
        sku: { readOnly: true, searchable: true },
        status: { showInTable: false },
      },
    },
  },
});
```

| Option | What it changes |
| --- | --- |
| `key` | The resource's key and URL. Default: the collection name in kebab case (`order_items` → `order-items`) |
| `titleField` | The field that names a record. Default: the first of `title`, `name`, `label`, `key`, `fullName`, `username`, `email`, else `id` |
| `defaultSort` | The list's starting sort. Default: newest first (`createdAt` with timestamps, else `id`) |
| `hidden` | Fields never sent to the dashboard (see [Secret and hidden fields](secret-fields.md)) |
| `shown` | Fields a secret-looking name would hide, served anyway. A path also serves every secret field under it (`auth` serves `auth.token`) |
| `fields` | Per field, by dotted path: `type`, `config`, `label` (a message key), `required`, `unique`, `immutable`, `readOnly`, `showInTable`, `showInForm`, `filterable`, `sortable`, `searchable`. A nested field (`supplier.name`) takes only `type`, `config`, `label`, `required` and `readOnly`; it cannot take `unique` or `immutable` either |

## How an override merges

An override names only what it changes. `config` merges into the adapter's: `{ config: { maxLength: 50 } }` keeps every other setting, options merge by `value` (`{ options: { archived: { tone: "secondary" } } }`), and `null` removes a setting, an option or a flag. When you change a field's `type`, the adapter's settings the new type doesn't have are dropped, each with a warning on the Health page. A mistake that changes what you meant stops the dashboard instead: a field that doesn't exist, an unknown type or setting, a type change that can't hold the stored values (`number` to `email`), or loosening a rule your model enforces (`required: false` on a required field). The server logs every such error at once, the dashboard shows them, and `await admin.ready` rejects, so the server doesn't start until they're fixed.
