---
title: Record ids
order: 22
---

# Record ids

Most models let MongoDB make each record's `_id`, and the dashboard never asks for it: Create saves the record and opens it.

A model whose `_id` is a `String` or a `Number` with no default gets its id from the person instead. Backray shows an **ID** box at the top of the Create form, before every field. The id is required, and the server refuses one that is already in use ("This value is already in use"). Edit does not show the box, because a record's id never changes; Show and the list show it as before.

```js
mongoose.model("Country", new Schema({
  _id: String,              // typed in on Create: "EG"
  name: { type: String, required: true },
}));
```

A text id is trimmed, must be 1 to 200 characters long, cannot contain `/`, and cannot be `create`, `.` or `..`, because it becomes part of the record's URL. A number id must be a number; `"007"` is stored as `7`. The list, Show, Edit and the API use the id's text form (`EG`, `1042`).

If you don't want to type ids, give `_id` a default and the box disappears. A function that makes a UUID is a common choice:

```js
mongoose.model("Invoice", new Schema({
  _id: { type: String, default: () => crypto.randomUUID() },
  total: Number,
}));
```

A `ref` to a model keyed by a String or Number works when the two types match: a `String` path to a `String` `_id`, a `Number` path to a `Number` `_id`. Backray then serves an ordinary reference, with a picker on Edit, a label on Show, and filters and facet counts on the list, and target ids such as `EG` and `1042`.

A mismatch is served as plain text instead, with this warning when the resources load:

> ref points at Country, whose _id is String, but this path is ObjectId; served without a reference

Change the path's type or the target's `_id` so they match. A `refPath` candidate whose `_id` type differs from the path's is left out the same way, with a warning that names it.

An `_id` of another type, such as a `Date`, is served as it is. Create cannot make one, so that model gets this warning and needs a default on `_id`:

> _id of type Date is not supported for creating records; Create needs an id the dashboard cannot make
