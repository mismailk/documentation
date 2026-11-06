---
title: Labels and translations
order: 8
---

# Labels and translations

## Change the English labels: `labels`

Labels come from your names: the model name for a resource's title when the collection is Mongoose's default for the model (`AgentSession` → "Agent sessions"), else the collection, field names for fields (`createdAt` → "Created at"), and enum values for options. To change the text, give any of three functions. Return `undefined` to keep the default.

```js
mongooseAdapter({
  mongoose,
  labels: {
    resource: ({ key }) => (key === "products" ? { title: "Catalogue", singular: "item", plural: "items" } : undefined),
    field: ({ resource, path }) => (resource === "products" && path === "sku" ? "Stock code" : undefined),
    option: ({ path, value }) => (path === "status" && value === "draft" ? "Not published" : undefined),
  },
});
```

## Translate labels: `translations`

Give `backray()` one dictionary per language. Keys are `<resource key>.<label key>`: the label keys are in each resource's `messages` (see the Health page, or `GET /admin/api/resources`). Load them from JSON files or write them in code.

```js
import ar from "./translations/ar.json" with { type: "json" };
app.use(backray({ adapter, translations: { ar, en: { "products.field.sku": "Stock code" } } }));
```

The dashboard asks for its language with the `Accept-Language` header. For each label it uses that language's dictionary, then English, then the label key. A key missing from a language you gave shows up as a warning on the Health page; a malformed dictionary stops `backray()` with an error.

The dashboard's language menu offers English, Arabic and every language you gave a dictionary for. Choosing one reloads the page in that language. The dashboard's own buttons and menus exist in English and Arabic; in any other language they stay in English.
