---
title: Extensions
order: 19
---

# Extensions

An extension adds UI to the dashboard without rebuilding it. You write it as a small React project, build it with the `host-extensions` command, serve the output from your backend, and the prebuilt dashboard loads it at runtime.

Extensions can fill three kinds of place:

- a dashboard widget, the `dashboard.widgets` slot;
- a page or one of its sections, such as `resource.products.list.table`;
- a field view: a whole field type (`fieldType.acme.rating.display`) or one field of one resource (`resource.products.field.rating.display`).

An extension compiles against `@backray/sdk`, which holds the types, the hooks and the contract data below.

## Where an extension can go

| Slot | What it fills |
| --- | --- |
| `dashboard.widgets` | A grid on the start page (server mode) or after the dashboard's cards (local mode) |
| `resource.<key>.<page>` | A whole page of one resource; `<page>` is `list`, `create`, `show` or `edit` |
| `resource.<key>.list.header`, `.list.filters`, `.list.table` | A section of the list page |
| `resource.<key>.show.header`, `.show.details`, `.show.descendants`, `.show.actions` | A section of the Show page |
| `resource.<key>.create.header`, `.create.form`, `.create.actions` | A section of the Create page |
| `resource.<key>.edit.header`, `.edit.form`, `.edit.descendants`, `.edit.actions` | A section of the Edit page |
| `resource.<key>.field.<name>.<view>` | One field of one resource; `<view>` is `display` (table), `show`, `edit` or `filter` |
| `fieldType.<type>.<view>` | Every field of one type, built-in (`fieldType.date.filter`) or an extension's (`fieldType.acme.rating.display`) |
| `app.comingSoon`, `app.loadError`, `app.problemsBanner`, `app.health`, `app.navMarker`, `app.navGroup` | The server-mode start page, the load-error page, the problems banner, the Health page, the sidebar's warning marker and a sidebar group |

`<key>` is a resource key (`products`) and `<name>` a field name, both lowercase. A target outside this table fails the build.

## What `@backray/sdk` gives an extension

| Export | What it does |
| --- | --- |
| `register(name, Component)` | Registers the extension's component for the targets in its config; `name` is the config's `name` |
| `registerFieldType(def)` | Adds a field type with its views; the name must contain a dot |
| `registerOverride(slot, Component)` | Replaces one field view (a `fieldType.*` or `resource.*.field.*` slot) |
| `useLocale()` | The current language, direction, offered languages and number, currency and date formatters |
| `useTranslation(messages)` | A `t(key, params)` for the extension's own dictionary, with English as the fallback |
| `useSetLocale()` | Switches the dashboard's language; needs the `locale:write` capability |
| `useApiClient()` | The dashboard's own API client, for reading and writing records |
| `@backray/sdk/field-config` | `defineFieldConfig`, for a field type's config parser that runs in the browser and on the server |
| `@backray/sdk/testing` | A test host that renders an extension with these hooks, without the dashboard |

The host's shared API is version `1.0.0`.

## Installing the SDK

Install `backray-sdk` and `backray-ui` as dev dependencies, with React, its types and TypeScript:

```bash
npm install -D ~/backray-packs/backray-sdk-0.1.0.tgz ~/backray-packs/backray-ui-0.1.0.tgz react @types/react typescript
```

The SDK holds the types, the hooks and `defineFieldConfig`; the kit's source gives your components their types. At runtime the bundle reads both from the dashboard's own copy; only `@backray/sdk/field-config`, a small parser helper, is bundled into a field-type extension.

Their types are read from the packages' source, so `tsconfig.json` uses these settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["extensions", "extensions.config.ts"]
}
```

## The config file

One `extensions.config.ts` lists the project's extensions:

```ts
// extensions.config.ts
import { defineExtensions } from "@backray/app/bundler";

export default defineExtensions([
  {
    name: "language-switcher",
    version: "1.0.0",
    entry: "./extensions/language-switcher/index.tsx",
    targets: ["dashboard.widgets"],
    order: 0,
    capabilities: ["locale:write"],
    sharedApi: "^1.0.0",
  },
]);
```

| Field | Required | Rule |
| --- | --- | --- |
| `name` | yes | Lowercase letters, digits and dashes; unique; equal to the name the bundle passes to `register` |
| `version` | yes | Non-empty |
| `entry` | yes | Relative to the config file; its folder is the only source Tailwind scans for that extension |
| `targets` | yes | Concrete slot names; every one must match a contract slot pattern |
| `order` | no | Where several extensions fill one slot, lower renders first |
| `capabilities` | no | Each must be a capability in the contract (`locale:write` today) |
| `sharedApi` | no | Semver range on the host's shared-API version (`SHARED_API_VERSION`, `1.0.0` today); the bundler fails and the host refuses to load an entry outside it. This is not the `@backray/sdk` package version, which is `0.1.0`. |
| `enabled` | no | `false` keeps the entry and reserves its name but builds nothing |

Every field is validated at build time, not only by the TypeScript types. A bad entry fails the whole build and leaves the previous output untouched.

## Building

From the project's folder:

```bash
npx host-extensions build \
  --config ./extensions.config.ts \
  --out ./public/extensions \
  --public-path /extensions
```

`host-extensions` comes with `backray-app`, the dashboard package you installed in [step 2](../getting-started/2-install.md). In the Backray repository, the example project wraps the same command as `npm run extensions -w @backray/example-mongoose`.

The output holds a minified ES2020 bundle and, when the extension has Tailwind classes, a stylesheet, both named with a content hash. `manifest.json` lists the built entries; it is written last, through a temporary file, so the server never sees a half-written manifest. Two builds of the same sources produce byte-identical files.

An extension imports only `react`, `@backray/ui` and `@backray/sdk` from the shared API. Everything else it imports is bundled privately into that extension.

## Serving the extensions

Point `backray()` at the bundler's output:

```ts
app.use(backray({
  adapter: mongooseAdapter({ mongoose }),
  extensions: { dir: resolve("public/extensions") },
}));
```

The server answers `GET /api/manifest` (never cached) and serves the files under `/extensions/` (cached for a year, because their names carry the content hash). It reads the manifest at startup and again when the file changes, so you can rebuild while the server is running; the next page load uses the new bundles. A missing or malformed manifest answers `{ extensions: [] }` and logs one warning.

Without the `extensions` option the manifest is empty and nothing is loaded.

## A widget

A widget is a React component that calls `register` once, at module top level:

```tsx
import type { DashboardWidgetProps, Messages } from "@backray/sdk";
import { register, useLocale, useSetLocale, useTranslation } from "@backray/sdk";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@backray/ui";

const messages: Messages = {
  en: { "language.title": "Language", "language.arabic": "العربية" },
  ar: { "language.title": "اللغة", "language.arabic": "العربية" },
};

function LanguageSwitcher(_props: DashboardWidgetProps) {
  const t = useTranslation(messages);
  const { locale } = useLocale();
  const setLocale = useSetLocale(); // allowed because the config declares locale:write

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("language.title")}</CardTitle>
      </CardHeader>
      <CardContent dir="auto" className="flex gap-2">
        <Button type="button" aria-pressed={locale === "ar"} onClick={() => setLocale("ar")}>
          {t("language.arabic")}
        </Button>
      </CardContent>
    </Card>
  );
}

register("language-switcher", LanguageSwitcher);
```

The Backray repository's example has the full widget in `examples/mongoose/extensions/language-switcher/index.tsx`. It also offers English, and its config declares the `locale:write` capability.

In server mode the start page is the "Coming soon" card, and the widgets render in a grid after it. In local (demo) mode they render after the dashboard's own cards.

`useTranslation` reads the extension's own dictionary; `useLocale` gives the current language, direction and formatters. All user-facing text comes from the dictionary, and numbers, currencies and dates go through the formatters.

## A field type

A field type decides how one kind of value is displayed, edited and validated. Put its config parser in one React-free module so the browser and the server run the same code:

```ts
// extensions/rating/config.ts
import { defineFieldConfig } from "@backray/sdk/field-config";

export const ratingConfig = defineFieldConfig(
  "acme.rating",
  (raw) => {
    const max = (raw as { max?: unknown } | undefined)?.max ?? 5;
    if (typeof max !== "number" || !Number.isInteger(max) || max < 3 || max > 10) {
      throw new Error("rating max must be a whole number from 3 to 10");
    }
    return { max };
  },
  { keys: ["max"] },
);
```

The bundle registers the type with its views:

```tsx
import { registerFieldType } from "@backray/sdk";
import { ratingConfig } from "./config";

registerFieldType({
  ...ratingConfig,
  emptyValue: () => undefined,
  validate: (value) => (typeof value === "number" ? { ok: true, value } : { ok: false, error: "validation.invalid" }),
  views: { Display, Edit },
});
```

The field type's name must contain a dot; undotted names belong to the built-in types. A resource uses it like any other type, through an override:

```ts
overrides: {
  products: {
    fields: {
      rating: { type: "acme.rating", config: { max: 5 } },
    },
  },
}
```

The Mongoose path must already exist (`rating: { type: Number, min: 1, max: 5 }`); the override changes the type, not the schema. Retyping to an extension type gives one warning that stored values are not checked: the server checks the field's config, but not the records the type stores.

The full example is `examples/mongoose/extensions/rating/index.tsx` in the Backray repository: it renders stars and lets the form pick one to five. The bundle registers no component with `register`, so the host loads its script and wires the type into the field resolvers without waiting for a registration.

A field-type extension loads as soon as the manifest arrives, so `acme.rating` resolves on the first page that uses it. Until the bundle has run, fields of that type are pending; a type that never arrives becomes unavailable after ten seconds, and its field shows the host's "unavailable" view instead of breaking the page.

## Checking a field type's config on the server

Pass the same `defineFieldConfig` result to `backray()`:

```ts
import { ratingConfig } from "./extensions/rating/config";

app.use(backray({
  adapter: mongooseAdapter({ mongoose }),
  fieldTypes: [ratingConfig],
}));
```

The server now checks every `acme.rating` field like a built-in one: a bad `config` marks its resource invalid at startup with the parser's message, an override retype is checked with the same parser, and the keys listed in `{ keys: [...] }` feed the unknown-key warnings. A field whose dotted type has no parser is checked only in the browser, and the server prints one note per type:

```
no server check for field type "acme.rating"; add it to backray({ fieldTypes })
```

Each entry must be a `defineFieldConfig(...)` result with a dotted name. Names must be unique, and an undotted name cannot replace a built-in type.

## Capabilities

The only write capability today is `locale:write`. Declare it in the config and the `useSetLocale` hook switches the language for the whole dashboard and every extension. Without the declaration the hook throws inside the extension's own error boundary; the rest of the page keeps running. A language the host does not offer is ignored and logged with the extension's name.

Read-only hooks, such as `useLocale`, `useTranslation` and `useApiClient`, need no capability.

## When an extension fails

Every extension renders inside its own error boundary, and every bundle loads on its own:

- A component that throws shows a dashed fallback card with the localized "This part could not load." message. Its siblings in the same slot and the dashboard's own content keep rendering.
- A bundle that fails to load, never registers, or declares a `sharedApi` range the host does not satisfy shows the same fallback and logs why.
- A failed load is forgotten, so a later page load retries it.
- A field type that does not load leaves only its fields unavailable; the resource's other fields, the list and the other pages still work.

The Backray repository's browser suite runs the example extensions against the example server, including a deliberately broken widget, to keep that isolation working.

## The example

The Backray repository's example project (`examples/mongoose`) builds two extensions:

- `extensions/language-switcher/index.tsx`: a dashboard widget that needs `locale:write`;
- `extensions/rating/index.tsx`: an `acme.rating` field type, with its parser in `extensions/rating/config.ts`.

Its `extensions.config.ts` builds them into `public/extensions`, and the example server serves that folder and checks the rating config with `fieldTypes`.
