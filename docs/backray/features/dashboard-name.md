---
title: Dashboard name
order: 17
---

# Dashboard name

The dashboard is called "Backray" until you name it. The name shows in the sidebar, in the header and at the top of the menu on a phone, and in the browser tab:

```js
app.use(backray({
  adapter: mongooseAdapter({ mongoose }),
  name: "Dira",
}));
```

Give one name per language when it should change with the dashboard's language:

```js
name: { en: "Dira", ar: "ديرا" },
```

In a language you leave out, the dashboard uses the first name you give. The server writes the English name (or the first one) into the page's title, so the browser tab is right before the dashboard loads.

`backray()` stops with an error when `name` is an empty string, or an object that is empty, has a key that is not a language tag, or has an empty value.
