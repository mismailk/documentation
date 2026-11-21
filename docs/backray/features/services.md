---
title: Services from your code
order: 12
---

# Services from your code

`admin.services` is the safe way into the records: one service per resource, with every rule and hook the dashboard gets. Await `admin.ready` first; a refresh swaps in a new set.

```js
import { backray, isFieldErrors } from "@backray/express";

app.post("/customers/import", async (req, res) => {
  await admin.ready;
  try {
    const customer = await admin.services.customers.create(req.body, { user: req.user });
    res.status(201).json(customer);
  } catch (error) {
    if (!isFieldErrors(error)) throw error;
    const language = req.acceptsLanguages()[0] ?? "en";
    const errors = Object.fromEntries(
      Object.entries(error.errors).map(([field, fieldError]) => [field, admin.translate(language, "customers", fieldError)]),
    );
    res.status(422).json({ errors });
  }
});
```

`create` checks and trims the record, enforces uniqueness, stamps the timestamps and runs the hooks. The other methods are `list`, `get`, `facets`, `create`, `update` (merge, where `null` clears a field), `replace`, `delete` and `deleteMany`. Each takes an optional context, which every hook receives untouched. Validation and uniqueness throw `FieldErrors`, an unknown id throws `NotFound`, and a hook can throw `ActionRefused` or `Forbidden`; `isFieldErrors`, `isNotFound`, `isActionRefused` and `isForbidden` recognise them across module copies.
