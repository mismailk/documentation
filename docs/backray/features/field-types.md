---
title: Field types
order: 4
---

# Field types

Every field in the dashboard has a field type. The type decides how the field is shown in the table, on the Show page and in the form, and how it is checked, searched, sorted and filtered.

The dashboard has 23 field types: `text`, `textarea`, `email`, `url`, `number`, `currency`, `decimal`, `boolean`, `date`, `datetime`, `select`, `radio`, `multiselect`, `tags`, `reference`, `multireference`, `json`, `object`, `objectlist`, `list`, `map`, `tree` and `file`.

## What your schema becomes

Backray picks a type from each schema path. It never guesses `textarea`, `email`, `url`, `currency`, `radio`, `date` or `file`; choose those yourself in the model's [`fields`](model-options.md), for example a `Date` as `date` when the time isn't used.

| In your schema | Field type | Notes |
| --- | --- | --- |
| `_id` | none | The record's id: an ObjectId as a 24-character hex string, a String or Number `_id` as its text (see [Record ids](record-ids.md)) |
| ObjectId with `ref` | `reference` | Links to the referenced model's records |
| String or Number with `ref` | `reference` | When the referenced model's `_id` has the same type; otherwise the path stays a value, with a warning (see [Record ids](record-ids.md)) |
| ObjectId with `refPath` | `reference` | The model comes from the field `refPath` names |
| ObjectId without `ref` | `text` | Read-only, with a warning |
| String | `text` |  |
| String with `enum` | `select` | The options come from the enum |
| Number, Double | `number` |  |
| Int32 | `number` | Whole numbers only |
| Number with `enum` | `select` | Numeric options |
| Decimal128 | `decimal` | Exact, no precision lost; can be switched to `currency` |
| BigInt | `decimal` | Whole numbers, sent as strings |
| Boolean | `boolean` |  |
| Date | `datetime` | Shown in the viewer's time zone; `createdAt` and `updatedAt` too |
| UUID | `text` | Read-only |
| Array of String | `tags` |  |
| Array of String with `enum` | `multiselect` | The options come from the enum |
| Array of Number, Date, Boolean or Decimal128 | `list` |  |
| Array of arrays of a simple type (`[[Number]]`, `[[String]]`) | `list` of `list` | The table shows how many lists; Show and Edit show each one |
| Array of arrays of Mixed | `json` | With a warning |
| Array of ObjectId with `ref` | `multireference` |  |
| A nested object or subdocument | `object` | Up to 6 levels deep by default |
| Array of subdocuments | `objectlist` |  |
| Array of subdocuments that holds itself | `tree` | See [Trees](trees.md) |
| Any other recursion | `json` | With a warning |
| Map of strings, numbers, dates or booleans | `map` | See [Maps and Mixed](maps-and-mixed.md) |
| Map of subdocuments, arrays or Mixed | `json` | With a warning |
| Map of references | `map` of `reference` | Each value is picked and shown like any reference |
| Mixed | `json` |  |
| Buffer | not shown | With a warning |

A reference inside an `object`, an `objectlist` row, a `tree` node or a `map` shows its record's name like a top-level one.

A nested `object` or `objectlist` may nest six levels deep by default. A deeper path becomes `json`, with a warning. Set `backray({ maxNesting })` (an integer from 1 to 10) to change the limit for the server, the adapter and the dashboard together.

From your schema's options, `required`, `min`, `max`, `minLength`, `maxLength`, `match` (as a pattern), `unique`, `immutable` and fixed `default` values carry over. `select: false` hides a field. A custom `validate` function, a conditional `required`, a function `default` and `min`/`max` on dates are skipped, each with a warning on the Health page. To add your own rules, see [Check values](check-values.md).

## Settings per type

A field's `config` takes the settings of its type. Every setting is optional unless marked.

| Field type | Settings in `config` |
| --- | --- |
| `text` | `minLength`, `maxLength`, `pattern` (a regular expression without flags, like Mongoose `match`), `patternMessage` (a message key) |
| `textarea` | `rows` (1–20, default 4), `maxLength` |
| `email`, `url`, `boolean`, `date`, `datetime` | none |
| `number`, `currency` | `min`, `max`, `integer` |
| `decimal` | `scale` (exact decimal places; `0` for whole numbers), `maxDigits` (at most 34), `min` and `max` as strings, `currency` (an ISO code, to show the value as money) |
| `select`, `radio`, `multiselect` | `options` (required): `[{ value, label, tone }]`; `tone` is `primary`, `secondary`, `outline` or `destructive` |
| `tags` | `maxItems`, `maxLength`, `colors` (a tag → a tone), `suggestions`, `restrictToSuggestions` |
| `json` | `schema` (a JSON Schema the value must match), `hint` (a message key shown under the editor) |
| `reference` | `resource` (the target resource's key) or `resourceFrom` and `models` (see below), `display` (the target field to show; default its title field) |
| `multireference` | as `reference`, plus `maxItems` |
| `object` | `fields` (the nested fields), `summary` (the nested fields shown in the table) |
| `objectlist` | as `object`, plus `minItems`, `maxItems`, `itemLabel` (a message key for a row's title; `{n}` is its position) |
| `list` | `of` (required): the item's `{ type, config }`, a simple type or another `list` of one, plus `minItems`, `maxItems`, `itemLabel` |
| `map` | `of` (required): the value's `{ type, config }`, a simple type or a `reference`, plus `keys` (a fixed list of keys), `keyPattern`, `minEntries`, `maxEntries` |
| `tree` | `titleField`, `maxDepth` (see [Trees](trees.md)) |
| `file` | `multiple`, `accept` (as `<input accept>`, e.g. `image/*,.pdf`), `maxSize` (bytes per file), `maxFiles` |

## Dynamic references

A Mongoose `refPath` reference points at a different model per record. Give its field `resourceFrom` (the sibling field that names the model) and `models` (the model name → resource key map):

```js
fields: {
  subject: { config: { resourceFrom: "subjectType", models: { Product: "products", Customer: "customers" } } },
}
```

A dynamic reference can be `filterable: true` like any other field. Its filter first asks for the target resource, then optionally for records of it; choosing only the resource matches every record whose sibling names that resource. The URL keeps both parts: `?f.subject.resource=products&f.subject=<id>`.

## Change one field

Set a field's type and settings in the model's `fields`:

```js
mongooseAdapter({
  mongoose,
  models: { Product: { fields: { price: { type: "currency", config: { min: 0 } } } } },
});
```


## Change a type everywhere: `types`

To map one Mongoose type differently in every model, key it by the type's name:

```js
mongooseAdapter({
  mongoose,
  types: { Decimal128: { type: "currency", config: { min: 0 } } },
});
```
