---
title: Hooks
order: 10
---

# Hooks

Backray's services run your functions before and after every read and write: a create, an update, a delete, a list. Give them in `backray()`'s `hooks`, keyed by resource, plus `"*"` for every resource. Each moment takes one function or an array.

```js
app.use(backray({
  adapter: mongooseAdapter({ mongoose }),
  hooks: {
    orders: {
      beforeCreate: async (order, { services }) => {
        for (const line of order.lines) {
          const product = await services.products.get(line.product);
          await services.products.update(line.product, { stock: product.stock - line.quantity });
        }
      },
      afterCreate: async (result, { services }) => {
        if (result.ok || !result.input) return;
        for (const line of result.input.lines) {
          const product = await services.products.get(line.product);
          await services.products.update(line.product, { stock: product.stock + line.quantity });
        }
      },
    },
  },
}));
```

Most moments pair a `before...` and an `after...` (list, get, create, update, delete, deleteMany). A before-hook gets the checked input, may return a replacement, and throwing cancels the operation. An after-hook runs on success **and on failure**, with `{ ok: true, value }` or `{ ok: false, error, input }`; `input` is what the operation was attempting, which is how the example puts the stock back when the create fails. An after-hook cannot turn a failure into a success, but it may throw a different error.

Before-hooks run `"*"` first, then the resource's own; after-hooks run the resource's own first, then `"*"`. `services` goes back through every rule and hook, and `context` is whatever the caller passed to the service, untouched. There are no transactions around hooks: clean up in the after-hook. A chain of service calls is limited to 5 nested calls, so a loop fails fast. A rule that must cover both a single delete and a bulk delete belongs in both `beforeDelete`/`afterDelete` and `beforeDeleteMany`/`afterDeleteMany`: the bulk delete runs only its own hooks.

## Every moment

| Moment | First argument | May return |
| --- | --- | --- |
| `beforeList` | the list query | the query to run |
| `afterList` | the result, with `{ rows, total }` | the result to send |
| `beforeGet` | `{ id, shape }` | `{ id, shape }` |
| `afterGet` | the result, with the record | the record to send |
| `beforeCreate` | the checked record | the record to store |
| `afterCreate` | the result, with the saved record | the record to send |
| `beforeUpdate` | `{ id, input, stored, mode }` | the record to store |
| `afterUpdate` | the result, with the saved record | the record to send |
| `beforeDelete` | `{ id, stored }` | nothing |
| `afterDelete` | the result, with `{ id, stored }` | nothing |
| `beforeDeleteMany` | `{ ids, stored }` | nothing |
| `afterDeleteMany` | the result, with `{ ids, stored }` | nothing |

Returning nothing keeps the value unchanged. The second argument is `{ resource, services, context }`, plus `mode` (`"merge"` or `"replace"`) on the update hooks, so a `"*"` hook can skip resources by name. Hooks may be async. A key that names no resource is a warning on the Health page; an unknown moment name stops `backray()` with an error. An after-hook that throws reaches the caller with its error, even though the record was saved.
