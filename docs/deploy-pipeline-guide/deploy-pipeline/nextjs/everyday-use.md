---
title: Everyday Use (Next.js)
order: 5
---
# Everyday Use (Next.js)

Deploys, rollbacks, logs, deploy history and changing a server value work
the same for every app: see the shared
[Everyday Use](../everyday-use). This page adds what is
different for a Next.js app.

| Task | How |
|---|---|
| Change a public (`NEXT_PUBLIC_*`) value | edit `PUBLIC_ENV_STAGING` / `PUBLIC_ENV_PRODUCTION`, then push a commit to that branch ([below](#change-public-value)) |
| Change a server value | edit the server's `.env`, then redeploy the running tag ([shared](../everyday-use#change-server-value)). A `NEXT_PUBLIC_*` line there changes nothing |

## Change a public value {#change-public-value}

`NEXT_PUBLIC_*` values are baked into the JavaScript at build time. Editing
the variable alone changes nothing that is running.

1. On GitHub: Settings → Secrets and variables → Actions → **Variables** tab
   → edit `PUBLIC_ENV_STAGING` (or `PUBLIC_ENV_PRODUCTION`). Keep the rules
   from [Public build values](./prepare-your-app#public-build-values).
2. Push a commit to that environment's branch. If there is no code change,
   an empty commit does it:

   ```bash
   git commit --allow-empty -m "chore: rebuild with new public values" && git push
   ```

3. Check the new value is in the running container:

   ```bash
   docker exec <app>-staging grep -rl 'new-value' /app/.next
   ```

Values are taken literally, with one exception: Next.js expands `$NAME` and
`${NAME}` in them (from the build's environment, or to nothing). For a
literal dollar sign, write `\$`.

A changed value always gives a fresh build: the values are passed as a build
argument, and Docker's build cache keys on it, so a cached build with the old
values can't be reused.

## What a rollback brings back {#rollback}

A [rollback](../everyday-use#rollback) deploys an older
image, and with it **the public values that image was built with**. If you
changed a `NEXT_PUBLIC_*` value since, the rolled-back app shows the old one.

For the same reason, never use "Re-run all jobs" on an older run: it builds
that commit again with **today's** public values and pushes it under the old
tag. Use "Re-run this job" on its **deploy** job.

## Next's cache {#cache}

Next's own cache (`.next/cache`: optimised images, regenerated pages) lives
in the container and starts empty after every deploy. The first requests
after a deploy rebuild it.
