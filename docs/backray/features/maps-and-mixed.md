---
title: Maps and Mixed
order: 7
---

# Maps and Mixed

Backray maps `Map` and `Mixed` paths without any setup. This is what each one becomes.

| In your schema | In the dashboard | On the Health page |
| --- | --- | --- |
| A `Map` of strings, numbers, dates or booleans (`{ type: Map, of: String }`) | An editable list of keys and values | Nothing |
| A `Map` of subdocuments, of arrays or of Mixed values | The JSON editor | "A map of subdocuments cannot be edited as a map; served as json" (or "of arrays", "of Mixed values") |
| A `Map` of references (`of: { type: Schema.Types.ObjectId, ref: "User" }`) | The ids as read-only text, not linked | "The ref of a map's values is not followed; served as a map of read-only text" |
| `Mixed` (`{}` or `Schema.Types.Mixed`) | The JSON editor | Nothing |
