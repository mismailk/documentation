---
title: Choose models
order: 1
---

# Choose which models appear

```js
mongooseAdapter({
  mongoose,
  include: ["Product", "Order", "Customer"], // only these
  exclude: ["AuditLog"],                      // then remove these
});
```

A name that isn't a registered model shows up as a warning on the Health page.
