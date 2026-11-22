---
title: Sidebar groups
order: 23
---

# Sidebar groups

The sidebar lists every resource in one flat column by default. A **group** puts related resources under one collapsible button, so a project with many resources keeps its sidebar short. Groups are one level: a group holds resources, never other groups.

## Put a resource in a group

Set `group` on the resource: through the adapter's model options, through Backray's overrides, or in a resource file for local mode.

```js
mongooseAdapter({
  mongoose,
  models: {
    Product: { group: "catalogue" },
    Category: { group: "catalogue" },
  },
})
```

```js
backray({
  overrides: { products: { group: "catalogue" } },
})
```

The value is a group key: lowercase letters, digits and hyphens, like a resource key (`^[a-z][a-z0-9-]*$`).

## Name and order the groups

`backray({ groups })` names the groups, translates their labels and optionally orders them. A label is a string, or one string per language, the same shape as `backray({ name })`; a missing language gets the first value.

```js
backray({
  adapter: mongooseAdapter({ mongoose }),
  groups: [
    { key: "catalogue", label: { en: "Catalogue", ar: "الكتالوج" }, order: 0 },
    { key: "sales", label: "Sales", order: 1 },
  ],
})
```

`order` sorts the groups that set it among themselves; the others stay where their first resource appears in the served list. A group with no `groups` entry is labelled with the title of the resource that shares its key, else with the key in words (`sales-team` → "Sales team").

A resource may name a group that `groups` does not list — unless a resource has that key, the server refuses to start with `group "<key>" is not in backray({ groups })`.

## Discriminators group themselves

A Mongoose base model with discriminators needs no group setting. The base and each discriminator get `group: "<base key>"`; the group is titled with the base's title, and its items are `All <plural>` for the base (every kind) followed by one item per kind. A discriminator's title is `<Base title> – <Kind in words>` (`Events – Sign up`), and inside the group it shows the kind alone (`Sign up`).

To list one discriminator on its own instead, set `group: null` on it:

```js
mongooseAdapter({
  mongoose,
  models: { SignUp: { group: null } },
})
```

It then sits outside the group with its full title and no short sidebar name.

## How the sidebar behaves

- Each group is a button that shows or hides its links; it starts open.
- The open or closed state is remembered **per browser**, in `localStorage` (`backray:nav-groups`), so a reload keeps it. A browser that blocks storage simply keeps every group open.
- The group holding the page you are on opens on its own. Closing it by hand while you are on that page works and is remembered.
- Problem markers stay on each resource; a closed group shows the sum of its resources' warnings on its button.
- The phone menu shows the same groups.

Extensions can replace how a group is rendered through the `app.navGroup` slot; see the slot catalogue for its props.
