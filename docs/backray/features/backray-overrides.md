---
title: Overrides on Backray
order: 21
---

# Overrides on Backray

Backray's own `overrides` take the same options as the adapter's [`models`](model-options.md), keyed by **resource key**:

```js
app.use(backray({
  adapter: mongooseAdapter({ mongoose }),
  overrides: { products: { titleField: "sku" } },
}));
```

An override for a key that doesn't exist shows up as a warning.
