---
title: Features
order: 2
---

# Features

By default Backray makes one resource per model, maps every field it can, and names everything from your schema. You can change that in two places:

- **The Mongoose adapter's options,** keyed by **model name** (`Product`). Use these for anything about your models.
- **Backray's `overrides`,** keyed by **resource key** (`products`). They're applied after the adapter, work with any data source, and win over the adapter's.

Most projects only need the adapter's options.

## Your models

- [Choose models](choose-models.md): which models appear.
- [Model options](model-options.md): a resource's key, title field, default sort and per-field settings.
- [Secret and hidden fields](secret-fields.md): what never reaches the dashboard.
- [Field types](field-types.md): what each schema path becomes, and how to change it.
- [Trees](trees.md): subdocument arrays that hold themselves, such as menus.
- [Self-references](self-references.md): models with a parent of their own kind, such as categories.
- [Maps and Mixed](maps-and-mixed.md): what `Map` and `Mixed` paths become.
- [Labels and translations](labels-and-translations.md): the names shown, in every language.

## Rules and your own code

- [Check values](check-values.md): your own rules for a field.
- [Hooks](hooks.md): your functions before and after every read and write.
- [Mongoose hooks](mongoose-hooks.md): run your models' own middleware and validators.
- [Services from your code](services.md): read and write records with every rule applied.

## The API

- [The JSON API](json-api.md): the routes the dashboard calls, and how to call them.
- [Override a route](routes.md): replace a route's handler for one resource.
- [Middleware and filters](middleware.md): wrap the API routes, and filter your own field types.
- [CORS](cors.md): call the API from another origin.

## The dashboard and the server

- [Dashboard name](dashboard-name.md): the name in the sidebar and the browser tab.
- [API client](api-client.md): where the dashboard's own calls go.
- [Indexes and search](indexes-and-search.md): the indexes Backray creates, and whole-word search.
- [Logging](logging.md): where the server's messages go.
- [Overrides on Backray](backray-overrides.md): the same options keyed by resource, for any data source.
