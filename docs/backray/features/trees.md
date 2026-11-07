---
title: Trees
order: 5
---

# Trees

A tree is a subdocument array that holds itself, such as a menu whose items hold more items. Backray finds it in your schema without any setup.

```js
const item = new Schema({ label: String, url: String });
item.add({ items: [item] });
mongoose.model("Menu", new Schema({ title: String, menu: [item] }));
```

`menu` becomes a `tree` field. Each node has the item's own fields (`label`, `url`), and `items` holds its child nodes. A model whose own schema holds an array of itself works the same way.

- **List page:** the number of nodes at every level, for example "Nodes: 14".
- **Show page:** the tree, folded. Open a node to see its values.
- **Edit page:** open a node to edit its fields in place. Each row's menu adds a child, moves the node up, down or under another node ("Move to…"), duplicates it with its children, or removes it, asking first when it has children. You can also drag a row by its handle, and every action works from the keyboard. Nothing is saved until you press Save.

A moved or reordered node keeps its `_id`, and its hidden fields are kept too (`hidden: ["menu.secret"]`).

Each row shows the node's first text field. Set `titleField` to pick another. A tree allows 10 levels, counting the top level as 1; at the limit, a row's Add child stays in its menu with the reason next to it ("At most 10 levels"). Set `maxDepth` to change that:

```js
models: {
  Menu: { fields: { menu: { config: { titleField: "label", maxDepth: 5 } } } },
}
```

Two nodes with the same `_id` in one save are refused ("Two nodes share the same id"). The array that holds the child nodes can't be named `id`, `_id`, `__proto__`, `constructor` or `prototype`, and a tree takes no `summary`.

Recursion of any other shape, such as a single subdocument that holds itself, is served as `json` with a warning on the Health page. Ordinary nesting (objects and arrays of subdocuments that aren't trees) goes six levels deep by default, and `backray({ maxNesting })` changes that; a tree's own levels don't count toward it.
