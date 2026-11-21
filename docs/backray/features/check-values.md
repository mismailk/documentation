---
title: Check values
order: 9
---

# Check values

The server checks a record with the same rules the dashboard's form uses: each field type's own check (required, length, pattern, min and max, options, nested fields) runs on the server. A project can add its own rules where a schema cannot express one, for example a reserved SKU prefix.

Register named check functions in `backray()` and attach them to fields by name in an override:

```js
app.use(backray({
  adapter: mongooseAdapter({ mongoose }),
  checks: {
    notTestSku: (value) => !String(value).startsWith("TST-") || "Test SKUs cannot be saved",
    skuNotReserved: async (value) => !(await Reserved.exists({ sku: value })),
  },
  overrides: { products: { fields: { sku: { checks: ["notTestSku", "skuNotReserved"] } } } },
}));
```

A check receives the field's cleaned value, the whole incoming record and `{ resource, field, mode }`. Return `true` for valid, `false` for the general `validation.invalid` message, or a message: a key in your translations, or free text that is shown as it is. A check may return a promise. Checks run on the server only, in the order you list them, after the built-in check, and skip empty values (`undefined`, `null`, `""`, `[]`), so you never handle an absent optional field. A check that throws makes the whole check fail with that error. Only top-level fields take `checks`; an unregistered name is an override error and stops the load.

Use `admin.validate` in your own routes to check a record before saving it:

```js
app.use("/products/check", express.json());
app.post("/products/check", async (req, res) => {
  const result = await admin.validate("products", req.body);
  if (result.ok) return res.json(result);
  const language = req.acceptsLanguages()[0] ?? "en";
  const errors = Object.fromEntries(
    Object.entries(result.errors).map(([field, error]) => [field, admin.translate(language, "products", error)]),
  );
  res.status(400).json({ errors });
});
```

`validate` waits for the resources to load. It answers `{ ok: true, value }` with the cleaned record, or `{ ok: false, errors }` with one message key per failing field; a property the form would not save is dropped. Pass `{ mode: "update" }` as the third argument to check a record as an update. `admin.translate(language, resource, error)` turns a key or a rule's error into text with `{value}` filled in: your translations first, then the resource's inline messages, then the built-in texts (English and Arabic), then the key itself.
