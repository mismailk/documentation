---
title: Middleware and filters
order: 15
---

# Middleware and filters

## Add middleware: `middleware`

Middleware wraps the API routes. The `middleware` option is API-wide; `routes.<key>.<route>.middleware` runs for one resource and route.

```js
app.use(backray({
  adapter: mongooseAdapter({ mongoose }),
  middleware: [
    async (request, next) => {
      const started = Date.now();
      const result = await next();
      console.log(`${request.route} ${Date.now() - started}ms`);
      return result;
    },
  ],
}));
```

```js
admin.routes.use("orders", "records.create", async (request, next) => {
  const user = request.context.user;
  if ((recent.get(user) ?? 0) > Date.now() - 1000) throw new Forbidden("orders.tooFast");
  recent.set(user, Date.now());
  return next();
});
```

- **Order:** API-wide middleware, then the route's own, then the handler (built-in or overridden), onion style. Each middleware's `next()` runs the rest and returns its result, so a middleware may work before `next()`, change the result after it, or answer without calling it.
- **Context:** `request.context` starts empty and is passed to every service call the handler makes. A middleware that sets `request.context.user` before `next()` gives it to the hooks in `hooks`, and a middleware can read what an earlier one set.
- **Errors:** throwing a typed error answers with its envelope. `throw new Forbidden()` answers 403 `forbidden` and the handler never runs.
- **After parsing.** A bad parameter or body answers 400 without reaching middleware; so do a 404 and a 503. The dashboard's pages and files never pass through it.
- **The first request locks it.** After the first request is answered, `admin.routes.use` and `admin.routes.override` throw.
- **Express middleware still works.** Anything Express-specific stays in front of the mount, where it always was:

  ```js
  app.use(express.json());       // a parser in front: Backray uses its result
  app.use(session({ secret }));
  app.use(admin);
  ```

  Backray middleware is the framework-neutral seam a later auth or permission layer builds on.

`request.context` reaches the hooks, not the services' own rules; to refuse a caller, throw `Forbidden` (or `ActionRefused` for a rule about the record's state).

## Filter your own field types: `filters`

A filterable field's type supplies the parser that turns its `f.<field>` parameters into a filter value. The built-in types have theirs; a project's own type supplies its own through `filters`, by type name. Naming a built-in type replaces its parser.

```js
app.use(backray({
  adapter: mongooseAdapter({ mongoose }),
  filters: {
    stars: {
      keys: [""],                       // f.rating; use ["min", "max"] for a range
      parse(params, field) {
        const raw = params.get(field.name);
        if (raw === undefined || raw === "") return {};
        const value = Number(raw);
        if (!Number.isInteger(value) || value < 1 || value > 5) {
          return { errors: { [field.name]: { key: "query.badValue" } } };
        }
        return { value: { kind: "set", values: [String(value)] } };
      },
    },
  },
}));
```

The `value` is what the field type's query builder reads. A reported `errors` entry becomes a 400 naming the parameter, and a filterable field whose type has no parser refuses every `f.<field>` parameter with a 400. The built-in types' formats are in [The JSON API](json-api.md#filters).
