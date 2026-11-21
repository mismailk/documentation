---
title: Self-references
order: 6
---

# Self-references

A model can reference itself, such as a category with a parent category. Backray finds it in your schema without any setup.

```js
mongoose.model("Category", new Schema({
  name: String,
  parent: { type: Schema.Types.ObjectId, ref: "Category" },
}));
```

When a model has exactly one top-level reference to itself, Backray uses it as the resource's **parent field**:

- A record's Show and Edit pages list its descendants, under a trail of its ancestors (Electronics › Audio). Children load 50 at a time, and a node's children load when you open it. Each name links to that record.
- The parent field can be filtered on the list page.
- The parent picker on the Edit page leaves out the record itself, and the server refuses a parent that would make a loop: "A record cannot be its own ancestor".
- Demo mode refuses the same parents.
- A record whose `parent` is `null` or missing is a top-level record.

Two saves at the same moment can still close a loop between two records; readers stop at a record they have already seen, so such data cannot hang a page.

To name the parent field yourself, for example when a model has two references to itself, set `parentField`. `null` turns the descendants view off:

```js
models: { Category: { parentField: "parent" } } // or parentField: null
```

A `parentField` that isn't a top-level reference to the same model stops the dashboard with an error, like any other override mistake.

Backray only writes `parent`. If your model also keeps a `children` array, an `ancestors` list or a path string, keep it in sync yourself in a [hook](hooks.md).
