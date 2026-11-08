---
title: Troubleshooting (React)
order: 6
---
# Troubleshooting (React)

For `deploy.sh` messages and exit codes (CI login, whitelist, conf, pull,
port clashes, memory), see the shared
[Troubleshooting](../troubleshooting). This page covers problems specific to
a static React app, its nginx runtime and its public build values. To look
inside a failed container, see
[Inspect a failed container](../troubleshooting#inspect).

## Static app problems {#static-problems}

| Symptom | Likely cause | Fix |
|---|---|---|
| exit **1**, the logs show `PORT is missing` or `PORT ... must be`, and the container never answers | the server's `.env` has no `PORT`, or it is not a whole number between 1 and 65535. The entrypoint validates it before nginx starts | put `PORT=<app-port>` (equal to the conf's `PORT`) in the server's `.env` ([the server `.env`](../add-an-app#env-file)) and deploy again |
| a blank page when the browser refreshes a deep link, while clicking through the app works | the server answered the refresh, but nginx returned 404 instead of the shell. The SPA fallback is missing or a location matched first | make sure the request reaches the container (`curl -sI http://127.0.0.1:<app-port>/some/deep/link` returns 200) and that the template's `nginx.conf.template` and `nginx-include.conf` are the unedited copies ([Fill the templates](./prepare-your-app#fill-templates)) |
| a deep link returns the server's 404 page, and the container returns 200 for the same path | Nginx on the host catches the path before it proxies to the container (a leftover `try_files`, a `root`, or a `location` for a file type) | let Nginx proxy every non-backend path to the container; remove the old static `root`/`try_files` rules for the app |
| a page loads, but its JS or CSS 404s after a deploy | the open tab still asks for the previous build's hashed files, which the new image does not have. Or a host-level rule serves `/assets/` or `/static/` from an old folder | reload the tab. Then remove the old file-serving location from the host's Nginx; the container serves its own assets |
| users keep seeing an old build after a deploy | `index.html`, `sw.js`, `service-worker.js` or the manifest was cached. The template sets `no-cache` on those; a CDN or proxy in front may not | check the response headers (`curl -sI .../ | grep -i cache-control`), purge the CDN, and confirm the container's config is unedited. A service worker can keep an old shell until it updates; unregister it in the browser to confirm |
| a blank page or missing styles only under a sub-path (`/app/`) | the base path is wrong: assets are requested from `/` instead of `/app/`, or the router does not know the prefix | set Vite `base`, or CRA `homepage`/`PUBLIC_URL`, and the router `basename` ([setup C](./prepare-your-app#setup-c)) |
| a public value is unchanged after editing the variable | no new build ran: the variable is read only when the build job runs | push a commit to that branch, an empty one if needed ([What follows from baking them in](./prepare-your-app#public-build-values)) |
| still unchanged after a new build | the value was edited in a GitHub **environment** (`staging` / `production`), not in the **repository** variables, or in the other environment's variable | edit `PUBLIC_ENV_STAGING` / `PUBLIC_ENV_PRODUCTION` under Settings → Secrets and variables → Actions → Variables ([Public values on GitHub](./prepare-your-app#public-env-variables)) |
| the "Public build values" step prints `PUBLIC_ENV_<ENV> is empty but the other environment has public values` in its log | that environment's repository variable is unset or blank | set it (Settings → Secrets and variables → Actions → Variables) and push a commit to that branch; the warning does not fail the build |
| the value was set in the server's `.env` and nothing changed | public values are compiled in at build time; the server's `.env` holds only `PORT` and can't change them | put it in the repository variable and push |
| the "Public build values" step fails with `PUBLIC_ENV_STAGING line 3 must be blank, a # comment or VITE_<NAME>=<value>` (or `REACT_APP_`, and `PUBLIC_ENV_PRODUCTION`) | that line is not a public value: `export` in front, a space before the name or before `=`, lowercase letters or `-` in the name, the wrong prefix, or a value split over two lines | fix that line. Line numbers count from 1, blank lines included. Every bad line gets its own error. The message never repeats the line, but the run log shows both variables in full in the step's `env:` block |
| a server value (key, token) is reported as a bad line | someone pasted a server value into the public variable | remove it. It never reached an image (the step stops before the build), but repository variables aren't masked: the value is in the step's `env:` block in the build log of every run since it was added. Delete those run logs (Actions → the run → ⋯ → Delete all logs) and rotate the secret |
| an old public value is back | a rollback, or a re-run of an older deploy job, deployed an image built with the old value | expected: a rollback restores that image's values ([Rollback](../everyday-use#rollback)) |
| API calls fail with a CORS error, or reach the production backend from staging | the app calls an absolute URL instead of the same domain, or the chosen setup needs CORS on the backend | use a relative base such as `/api` ([setup B](./prepare-your-app#setup-b)); if the app is on its own host, allow its origin on the backend and check cookies |
| API calls work in `curl` on the server but fail in the browser with a 404 | the host's Nginx sends a backend prefix to the wrong port, or a `location` for it is missing | check the `location` blocks and ports ([setup B](./prepare-your-app#setup-b)) |
| the container starts but the page is a directory listing | `autoindex` was turned on in a copied nginx config | restore the template's `autoindex off` |
| the container is `OOMKilled` | `64m` is too small for the app's static assets or a large service worker | raise `MEMORY` in the conf and deploy again; measure with `docker stats` and the local test |

## Wrong base path {#wrong-base}

Under setup C the app lives at a sub-path, and every asset URL and route must
include it. A wrong base shows up as a blank page, a page without CSS, or a
404 for `/assets/...` when the file is actually under `/app/assets/...`.

Set the base once, where the build reads it:

- **Vite:** `base: "/app/"` in `vite.config`.
- **Create React App:** `"homepage": "/app/"` in `package.json`, or
  `PUBLIC_URL=/app/` at build time.
- **Router:** `basename="/app"` on `BrowserRouter`.

Rebuild the image after changing it: the base is compiled into the hashed
asset URLs, so an old image keeps the old prefix.

Check the built shell. Its script and stylesheet URLs must start with
`/app/`:

::: step level=ask where=server
```bash
curl -s http://127.0.0.1:<app-port>/ | grep -o 'src="[^"]*"\|href="[^"]*"' | head
```
:::

If they start with `/` instead, the base was not applied. If the container's
own URLs are right but the browser still asks for `/`, the host's Nginx is
dropping or adding the prefix differently from the `location /app/` block
([setup C](./prepare-your-app#setup-c)).

## ✅ Checkpoint {#checkpoint}

- You know which of these was your problem and why the fix addresses it.
- The fix is made in the app repo, the server conf/Nginx, or the GitHub
  variables — not by editing a generated file on the running container.
- After the fix, a fresh deploy answers on `/`, a deep link, and one asset.

For problems with the deploy steps themselves (CI login, conf, pull, verify,
exit codes), use the shared [Troubleshooting](../troubleshooting).
