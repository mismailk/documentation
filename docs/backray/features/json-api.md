---
title: The JSON API
order: 13
---

# The JSON API

The dashboard talks to your server through a JSON API under `<path>/api` (`/admin/api` by default). You can call it too, from a script, a test or another app (see [CORS](cors.md) for another origin).

## Routes

Each route has a name. [Route overrides](routes.md) and [middleware](middleware.md) use the names.

| Name | Method and path | Answers |
| --- | --- | --- |
| `resources.list` | `GET /api/resources` | Every resource, its fields and labels, the sidebar `groups` (`{ key, label, order }`, see [Sidebar groups](sidebar-groups.md)), and the problems found |
| `resource.get` | `GET /api/resources/:key` | One resource |
| `records.list` | `GET /api/resources/:key/records` | A page of records |
| `records.get` | `GET /api/resources/:key/records/:id` | One record |
| `records.create` | `POST /api/resources/:key/records` | 201 and the saved record. Body: `{ "data": record }` |
| `records.replace` | `PUT /api/resources/:key/records/:id` | The saved record. Body: `{ "data": record }` |
| `records.update` | `PATCH /api/resources/:key/records/:id` | The saved record. Body: `{ "data": changes }`; `null` clears a field |
| `records.delete` | `DELETE /api/resources/:key/records/:id` | The deleted id, as `{ "ids": [id] }` |
| `records.deleteMany` | `DELETE /api/resources/:key/records` | The deleted ids. Body: `{ "data": { "ids": [...] } }`; all or none |
| `records.facets` | `GET /api/resources/:key/facets` | Counts per value for filterable fields |

Two more paths serve [extensions](extensions.md) and are not named routes: `GET /api/manifest` answers the list of built extensions (never cached), and `GET /extensions/<file>` serves their bundles and stylesheets (cached for a year). Backray's [`middleware`](middleware.md) does not wrap them; Express middleware you mount before `backray()`, such as a login check, still does.

## Answers

Every answer is JSON. `meta` holds the status and a message in the caller's language (from `Accept-Language`), `data` the result, and a list adds `pageInfo`:

```json
{ "meta": { "status": 200, "message": "OK" },
  "data": [{ "id": "a1", "name": "Lamp" }],
  "pageInfo": { "page": 2, "perPage": 20, "total": 57, "totalPages": 3, "next": 3, "previous": 1 } }
```

An error has `errors` instead of `data`, with a `code`:

```json
{ "meta": { "status": 422, "message": "Some fields are invalid" },
  "errors": { "code": "validation", "fieldErrors": { "email": "This email is already taken" } } }
```

| Status | `errors.code` | When |
| --- | --- | --- |
| 400 | `bad_request` | A bad parameter or body; `params` names each one |
| 403 | `forbidden` | A hook or middleware refused the caller |
| 404 | `not_found` | An unknown resource, record or path; `ids` lists the missing ids |
| 409 | `refused` | A hook refused the action, for example deleting a shipped order |
| 422 | `validation` | The record failed its checks; `fieldErrors` has one message per field |
| 503 | `unavailable` | The resources couldn't be loaded |
| 500 | `internal` | Anything else; the detail goes to the server's log |

Records come with `id` as a string (also for a Number `_id`), dates as ISO strings in UTC (`date` fields as `YYYY-MM-DD`), and references as an id, or as the record when extended. By default a list extends the references in its table columns, and a single record every fixed reference, including those inside objects, object-list rows, trees and maps.

## Listing records

| Parameter | Meaning |
| --- | --- |
| `q` | Search text, up to 200 characters |
| `page` | The page, from 1 |
| `perPage` | Records per page, 1 to 100 (default 10) |
| `sortBy` | Comma list of sortable fields (or `id`), at most 5 |
| `sortOrder` | Comma list of `asc` or `desc`, paired with `sortBy` |
| `f.<field>…` | Filters on filterable fields (below) |
| `f.id` | Comma list of record ids |
| `select` | Comma list of the fields to return, with dotted paths for references (`customer.name`) |
| `extend` | Comma list of references to return as records instead of ids |

`GET /records/:id` takes only `select` and `extend`. `GET /facets` takes `fields` (the filterable fields to count), plus `q` and `f.` filters so the counts match the filtered list.

A parameter the route doesn't know, a value that doesn't convert, or a parameter given twice answers 400, naming every bad parameter.

## Filters

| Field types | Parameters |
| --- | --- |
| `number`, `currency`, `decimal` | `f.<field>.min`, `f.<field>.max` |
| `date`, `datetime` | `f.<field>.from`, `f.<field>.to`, as `YYYY-MM-DD` |
| `boolean` | `f.<field>=true` or `false` |
| `select`, `radio`, `multiselect` | `f.<field>=a,b`, each one of the field's options |
| `reference`, `multireference` | `f.<field>=id1,id2` |
| `tags` | `f.<field>=x,y` |

Only fields marked `filterable` take filters, and only fields marked `sortable` can be sorted (see [Model options](model-options.md)). Your own field types supply their format through [`filters`](middleware.md#filter-your-own-field-types-filters).

Fields inside an object or an object list can be `filterable` too. Their filters use the dotted path: `f.address.city=Cairo`, `f.contacts.role=owner`. Set the flag with the same dotted path in an override:

```js
fields: {
  "address.city": { filterable: true },   // one object's child
  "contacts.role": { filterable: true },  // a child of every object-list row
}
```

Filters on the same object list must match one row: `f.contacts.role=owner&f.contacts.city=Cairo` returns a record only when a single contact is both an owner and in Cairo. Filters on different containers are independent. Nested filters cannot be facets: `GET /facets` takes top-level filterable fields only.

For example:

```bash
curl "http://localhost:3000/admin/api/resources/products/records?q=lamp&sortBy=price&sortOrder=desc&f.price.max=100&perPage=20"
```
