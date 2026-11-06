---
title: Reference (Next.js)
order: 7
---
<script setup>
import { withBase } from 'vitepress'
</script>

# Reference (Next.js)

Server files, the conf file, the exact `docker run`, the deploy steps and
`deploy.sh` exit codes are the same for every app: see the shared
[Reference](../reference). This page adds the Next.js parts.

## Files {#files}

| Where | What |
|---|---|
| kit `templates/nextjs/` | `Dockerfile`, `dockerignore`, `deploy.yml` templates |
| app repo `Dockerfile`, `.dockerignore`, `.github/workflows/deploy.yml` | the app's pipeline files |
| app repo `next.config.*` | `output: "standalone"`, plus `outputFileTracingIncludes` if needed |
| GitHub repository variables | `PUBLIC_ENV_STAGING`, `PUBLIC_ENV_PRODUCTION` (optional) |

## The image {#image}

- **Build stage** (`node:<version>-alpine`): `npm ci`, then writes
  `PUBLIC_ENV_B64` (if not empty) to `.env.production.local`, then runs the
  build command.
- **Runtime stage** (same base): `.next/standalone`, `.next/static` and
  `public/`, owned by `node`. `NODE_ENV=production`, `HOSTNAME=0.0.0.0`.
  Runs as `node` (uid 1000).
- **Start command:** `node --env-file=/app/.env server.js`. Node loads the
  `.env` before `server.js` reads `PORT` and `HOSTNAME`. Values set by the
  image (`NODE_ENV`, `HOSTNAME`) win over the same keys in the `.env`.

## Public build values {#public-build-values}

How a `NEXT_PUBLIC_*` value gets into the app:

1. It is a line in the repository variable `PUBLIC_ENV_STAGING` or
   `PUBLIC_ENV_PRODUCTION`. The build job picks the one for the environment
   it builds. Neither is required; unset means no public values.
2. The "Public build values" step turns Windows line endings into plain ones
   and checks every line. A line must be blank, a `#` comment, or match
   `NEXT_PUBLIC_` + `A`–`Z`, `0`–`9`, `_` + `=` from the first character.
   Each bad line fails the build with
   `<variable> line <n> must be blank, a # comment or NEXT_PUBLIC_<NAME>=<value>`,
   counting lines from 1. The message never repeats the line, but the
   step's `env:` block, shown unmasked in the run log, holds the full
   content of both variables.
3. The block is base64-encoded into one line and passed to the image build
   as the build argument `PUBLIC_ENV_B64`.
4. The build stage decodes it to `.env.production.local`, and `next build`
   inlines the values into the JavaScript. The file isn't part of
   `.next/standalone`, so it never reaches the runtime image's files. The
   build argument is not in the runtime image's layer history, but build
   provenance or attestations attached to the image may record it. That is
   fine only because the values are public anyway.

Rules that follow:

- **Public means public.** Every value ships to every browser, and both
  variables appear in full in every build run's log. No keys, tokens or
  passwords.
- **Fixed at build time.** Changing a value needs a new build: edit the
  variable, then push a commit to that branch. The server's `.env` can't
  change it.
- **A rollback restores the values that image was built with.**
- **Never a stale cache.** The build argument is part of Docker's build
  cache key, so new values always give a fresh build.
- **Literal values, except `$` and `#`.** Next.js expands `$NAME` and
  `${NAME}` inside values; write `\$` for a literal dollar sign. An unquoted
  `#` anywhere in the value starts a comment; quote the value.
- **Only from the variables.** `.dockerignore` excludes every `.env*` file, so
  no local `.env.production` or similar reaches a CI image.

## Known limitations {#known-limitations}

Besides the shared [known limitations](../reference#known-limitations):

- Public values need a rebuild to change, and a rollback brings old ones back.
- Next's cache (`.next/cache`: optimised images, regenerated pages) lives in the container and is lost on every deploy.

## Download {#download}

<a :href="withBase('/downloads/nextjs-deploy-kit.zip')" download>nextjs-deploy-kit.zip</a>. See
[Download the kit](./#download-the-kit) for its contents.
