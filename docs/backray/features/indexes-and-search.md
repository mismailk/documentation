---
title: Indexes and search
order: 19
---

# Indexes and search

## Indexes Backray creates: `query.ensureIndexes`

With `query.ensureIndexes` on (the default), Backray makes sure two kinds of index exist when the resources load:

- a case-insensitive unique index named `backray_unique_<field>` for every unique field, from your schema or an override;
- a text index named `backray_text` for every resource with `search: "text"`.

It only creates missing indexes with those `backray_` names; it never drops or changes an index you made. The builds run in the background, so a large collection doesn't delay startup. Until a unique index is built, its field is reported by `uniqueUnenforced()`. If the collection already holds duplicates, the index cannot be built: the resource is still served, with a warning naming the field and up to five duplicate values.

Turn it off when your database's indexes are managed elsewhere. Nothing is created, a missing index shows up as a warning, and its field stays in `uniqueUnenforced()`:

```js
app.use(backray({
  adapter: mongooseAdapter({ mongoose }),
  query: { ensureIndexes: false },
}));
```

## Search whole words: `search: "text"`

The search box matches parts of words by default: `acme` finds `Acme Corp`, case-insensitively. That suits most lists, since a user typing the first letters still finds the record.

A resource can search by whole words and stems instead, through a MongoDB text index. Set `search: "text"` on the resource in an override:

```js
app.use(backray({
  adapter: mongooseAdapter({ mongoose }),
  overrides: { products: { search: "text" } },
}));
```

Then `q` runs as a text search over the resource's searchable text fields. It matches whole words and their stems: `running` finds `run`, but `acme` does not find `Acme Corp` unless the text index splits it that way. MongoDB allows one text index per collection; if the collection already has a different one, the resource gets a warning and keeps the parts-of-words search.
