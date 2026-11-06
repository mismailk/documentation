---
title: How It Works (Next.js)
order: 1
---
# How It Works (Next.js)

Read the shared [How It Works](../how-it-works) first. This
page adds what is different for a Next.js app.

```text
GitHub Actions build job
  public values: PUBLIC_ENV_STAGING | PUBLIC_ENV_PRODUCTION (repository variables)
  docker build ──► next build with that environment's NEXT_PUBLIC_* values baked in
        │
        ▼
Server container
  node --env-file=/app/.env server.js   (Next.js standalone server)
```

- **The image is built once per environment.** Staging and production
  images differ only in the public values baked into them.
- **Two kinds of values.** Next.js handles them differently, and so does the
  pipeline:
  - **Public values** (`NEXT_PUBLIC_*`) are copied into the browser
    JavaScript by `next build`. A file on the server can't change them later.
    They live in two optional GitHub repository variables,
    `PUBLIC_ENV_STAGING` and `PUBLIC_ENV_PRODUCTION`. The workflow picks the
    one for the environment it is building, refuses any line that isn't a
    `NEXT_PUBLIC_*` setting, and passes it to the build. Changing one needs a
    new build, and a rollback brings back the values that older image was
    built with.
  - **Server values** (API keys, backend URLs, `PORT`, …) live in one `.env`
    file on the server, mounted read-only into the container at `/app/.env`.
    They never pass through GitHub.
- **The container starts with `node --env-file=/app/.env server.js`.** The
  standalone `server.js` reads `PORT` and `HOSTNAME` before Next.js loads
  `.env`, so Node loads the file first. That way the app listens on the
  `PORT` from the server's `.env`, not on Next's default 3000. The image sets
  `HOSTNAME=0.0.0.0` so the server listens on every interface.

## ✅ Checkpoint {#checkpoint}

Besides the shared checkpoint questions, make sure you can answer these:

- Where do `NEXT_PUBLIC_*` values live, and when are they fixed? (In the `PUBLIC_ENV_STAGING` / `PUBLIC_ENV_PRODUCTION` repository variables; at build time, so a change needs a new build.)
- Where does the server `.env` live, and does it ever pass through GitHub? (On the server; no.)
- Which port does the container listen on? (`PORT` from the server's `.env`.)
