---
title: Override a route
order: 14
---

# Override a route

A route handler can be replaced for one resource. Register the route's name under the resource key, with the handler in `routes`:

```js
app.use(backray({
  adapter: mongooseAdapter({ mongoose }),
  routes: {
    orders: {
      "records.list": {
        handler: async ({ query, services, context }) => {
          const { rows, total } = await services.orders.list(
            {
              ...query,
              where: { ...query.where, filters: { ...query.where?.filters, status: { kind: "set", values: ["open"] } } },
            },
            context,
          );
          return { rows, total };
        },
      },
    },
  },
}));
```

The same registration from code, before the first request:

```js
admin.routes.override("orders", "records.list", async ({ query, services, context }) => {
  return services.orders.list(query, context);
});
```

- **Per resource.** `records.list`, `records.get`, `records.create`, `records.replace`, `records.update`, `records.delete`, `records.deleteMany`, `records.facets` and `resource.get` can be overridden; `resources.list` cannot.
- **Return data only.** Backray wraps the result in the response envelope with the route's own status, so `records.list` returns `{ rows, total }` and a delete returns the deleted ids (`undefined` keeps the requested ids).
- **Input is checked first.** The query and body are parsed, checked and limited before the handler runs, so an override keeps the API's strictness and its 400s.
- **The last override wins.** Registering the same resource and route twice replaces the first and logs a warning.
- The handler gets the parsed `query` and `body`, the localized `resource`, the `services`, the request's `context` and the framework's `raw` request. Each route's method and path are in [The JSON API](json-api.md#routes).
