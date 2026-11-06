---
title: Mongoose hooks
order: 11
---

# Mongoose hooks

By default Backray writes straight to the model's collection, so your Mongoose middleware, validators and timestamps never run: Backray has already checked the record against the same rules the dashboard's form uses. Turn `hooks` on when your models do work of their own that has to happen on every write.

```js
app.use(backray({
  adapter: mongooseAdapter({ mongoose, hooks: true }),
}));
```

With `hooks` on, each write goes through the model:

- **Create** uses `Model.create`, so your `save` and `validate` middleware fire.
- **Replace and update** use `findOneAndUpdate`, so your query middleware fires and the schema's validators run (`runValidators`). A validator failure comes back as `RecordInvalid`, one error per field, with Mongoose's message; `admin.translate` shows it.
- **Delete** uses `Model.deleteMany`, so its query middleware fires.

As in Mongoose itself, `pre("save")` does not fire on updates; use `pre("findOneAndUpdate")` for those. Backray's timestamps stay Backray's: Mongoose timestamps are off in both modes, so the `createdAt` and `updatedAt` values in the record are the ones stored.

A model can override the option in the adapter's `models`:

```js
mongooseAdapter({ mongoose, models: { Order: { hooks: true } } });
```
