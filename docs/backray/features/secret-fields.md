---
title: Secret and hidden fields
order: 3
---

# Secret and hidden fields

Some fields should never reach the dashboard: passwords, tokens, internal notes. Backray hides secret-looking fields on its own, and you can hide others.

## Secret fields are hidden for you

Fields whose names contain the word `password`, `passwd`, `token`, `secret`, `salt` or `hash`, or the words `api key` or `private key` (`resetPasswordToken`, `auth.token`, `apiKey`), are never served, at any depth. Their stored values are kept when a record is saved from the dashboard.

The Health page lists them under Notes, one note per resource. Notes are not counted as problems. An object, object list or tree whose every field is hidden this way is hidden whole, and the note names it.

## Hide more fields: `hidden`

```js
mongooseAdapter({
  mongoose,
  models: { Product: { hidden: ["internalNotes", "supplier.contact"] } },
});
```

Use dotted paths for nested fields. A hidden field is never sent to the dashboard, and its stored value is kept when a record is saved. A field with `select: false` in your schema is hidden too.

## Show a secret-looking field: `shown`

A field can look secret without being one, such as `tokenCount`. Name it in `shown` to serve it:

```js
mongooseAdapter({
  mongoose,
  models: { User: { shown: ["tokenCount", "auth"] } },
});
```

A path also serves every secret field under it: `shown: ["auth"]` serves `auth.token` and `auth.salt`. A `shown` path that names no secret field, and holds none, gets a warning on the Health page.

## Lists whose rows have no `_id`: `itemKey`

When a record is saved, each row of an object list keeps its hidden values by matching the stored row with the same `_id`. A list declared with `_id: false` has no `_id` to match, so name a visible field that identifies a row with `itemKey`:

```js
mongooseAdapter({
  mongoose,
  models: { Order: { fields: { lines: { config: { itemKey: "sku" } } } } },
});
```

- The key field must be a visible field of the row.
- Two rows with the same key in one save are refused.
- A new row gets no hidden values.
- The same applies to lists nested deeper, and to trees inside the rows.

A list that holds hidden values (secret fields, or hidden tree node fields) but has neither `_id` nor `itemKey` gets a warning on the Health page at startup: "rows have no _id and no itemKey, so hidden values inside them cannot be kept: set itemKey". A save that sets that list is refused, so no hidden value is lost.
