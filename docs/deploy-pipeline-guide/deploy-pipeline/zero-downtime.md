---
title: 8. Zero-Downtime Deploys
order: 8
---

# 8. Zero-Downtime Deploys

A normal deploy has a gap of a few seconds: the old container stops, the new
one takes a few seconds to answer, and Nginx answers `502` in between.

With zero-downtime deploys, the new version starts on a second port and is
checked there. It takes the traffic while the old container stops, then moves
back to the app's port. Users only reach a version that passed the check, and
between deploys nothing changes.

It is switched on per app and environment, in its conf file. An app without
it deploys exactly as before.

## Before you switch it on {#before}

Do the steps in order: [Nginx](#nginx) first, then the conf. Switching it on
in the conf before the Nginx edit gives no benefit, because Nginx still sends
everything to the main port.

The cost is:

| Cost | What it means |
|---|---|
| `2 × MEMORY` free on the server during a deploy | two containers of the app run at once, from the check on the backup until the end of the drain. Size the server, and `MEMORY`, for that |
| a longer deploy | the new version starts and is checked twice: about one start-and-check longer, roughly 15–20 s |

The image must also:

- take a `PORT` given on `docker run`, which must win over the `PORT` in the
  `.env`;
- stop accepting connections when Docker stops it, and finish open requests
  within the 10 s stop timeout.

What that means for each app type is on its "Updating a Deployed App" page:
[Express](./express/updating#zero-downtime),
[Next.js](./nextjs/updating#zero-downtime),
[React](./react/updating#zero-downtime).

## 8.1 Update the server's deploy.sh {#update-server}

The zero-downtime steps are new in `deploy.sh`, so update the server once
before you switch them on:

1. Put the new kit's `server/deploy.sh` (in the shared Deploy Pipeline kit)
   into `~/docker-deploy-server/` on the server.
2. Put **every** app that server deploys back on the app allowlist, then
   reinstall the script as
   [3.2 Register the app on the server](./add-an-app#register-app) does.
   Skip its first step, which fetches the installed copy: that copy is the
   old script, and fetching it would undo step 1.

::: warning Start from the right copy
Reinstalling from the kit's stock copy drops the other apps that server
deploys. Edit the server's copy, or copy the kit's file and add every app
back.
:::

Check the installed script:

::: step level=ask where=server verify="prints a number above 0"
```bash
grep -c BACKUP_PORT /opt/deploy/deploy.sh
```
:::

It must print a number above `0`.

The whitelist must still list every app this server deploys:

::: step level=ask where=server verify="the case line lists every app this server deploys"
```bash
grep -A1 'case "$2" in' /opt/deploy/deploy.sh
```
:::

Compare that `case` line with the record of the server's apps. A short list
means other apps now fail with `unknown app`.

## 8.2 Pick the backup port {#backup-port}

The backup port is used only during a deploy. It must be:

- different from `PORT` in the same conf;
- in no other conf on the server;
- free: nothing may listen on it.

Check nothing listens on it:

::: step level=ask where=server verify="prints 0"
```bash
ss -ltn | grep -c ':<BACKUP_PORT> '
```
:::

It must print `0`. A `1` means a process holds the port; pick another.

## 8.3 Point Nginx at both ports {#nginx}

Once per app and environment, on the server. Replace the app's
`proxy_pass http://127.0.0.1:<PORT>;` with an `upstream`, defined once:

```nginx
upstream <app>_<env> {
    server 127.0.0.1:<PORT> max_fails=0;
    server 127.0.0.1:<BACKUP_PORT> backup;
}
```

In each `location` that proxies the app, use:

```nginx
proxy_pass http://<app>_<env>;
proxy_next_upstream error timeout;
proxy_connect_timeout 2s;
```

Keep the existing `proxy_set_header` lines. If the old `proxy_pass` had a URI
part, such as a trailing `/`, keep it: `proxy_pass http://<app>_<env>/;`.

Check the config and reload:

::: step level=ask where=server verify="nginx -t reports syntax is ok and test is successful"
```bash
sudo nginx -t && sudo systemctl reload nginx
```
:::

Nginx serves as before: everything goes to the main port, and the backup port
is used only while the main port refuses connections.

## 8.4 Switch it on {#switch-on}

Do staging first. Add the second port to `/opt/deploy/apps/<app>-staging.conf`
(owned by root, mode `644`):

```ini
PORT=4100
BACKUP_PORT=4101
```

`BACKUP_PORT` takes the same range as `PORT`, 1–65535, and a deploy refuses
the conf (`conf: invalid BACKUP_PORT`, or `conf: BACKUP_PORT must differ from
PORT`) if it breaks those rules.

Find the tag that is running, then redeploy it, as in
[Change a server value](./everyday-use#change-server-value):

::: step level=ask where=server
```bash
docker inspect -f '{{index .Config.Labels "deploy.tag"}}' <app>-staging
```
:::

::: step level=ask where=server verify="exit 0"
```bash
sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-<sha7>; echo "exit $?"
```
:::

Watch the deploy from a second terminal. It must print only `200`, or
whatever code the app usually answers, with no `502` and no failed
connection:

::: step level=ask where=laptop verify="only 200 (or the usual code), no 502 and no 000, until the deploy ends"
```bash
while true; do curl -s -o /dev/null -w '%{http_code}\n' https://<domain>/; sleep 0.2; done
```
:::

Stop the loop with `Ctrl-C` when the deploy ends. Then switch production on
the same way: [8.3](#nginx) for its site, then its conf file, then a redeploy
of its running tag.

## What a deploy does now {#order}

For an app with `BACKUP_PORT`, a deploy:

1. pulls the image, as before;
2. starts the new version as `<CONTAINER>-backup` on `BACKUP_PORT` and checks
   it there. If it fails, the backup is removed, the old container keeps
   serving, and the deploy fails at `backup`;
3. stops and removes the old main container. Nginx gets no answer on the main
   port and sends traffic to the backup. If the old main cannot be stopped,
   the backup is removed and the old container keeps serving; if it stops but
   cannot be removed, the backup keeps serving. Either way the deploy fails at
   `stop-old`;
4. starts the new version as `<CONTAINER>` on `PORT` and checks it there. If
   it fails, the failed main is stopped (not removed, so
   `docker logs <CONTAINER>` works) and the backup keeps serving; the deploy
   fails at `main`;
5. waits `DEPLOY_DRAIN` seconds (default `5`) so the backup finishes its open
   requests;
6. stops and removes the backup;
7. prunes old images and logs `result=ok`, as before.

See [With BACKUP_PORT](./reference#docker-run-zero-downtime) for the exact
`docker run` and for what happens when a leftover backup container exists.

## Switch it off {#switch-off}

First check for a leftover backup container:

::: step level=ask where=server verify="prints nothing"
```bash
docker ps -a --format '{{.Names}}' | grep -- '-backup$'
```
:::

If it prints nothing, nothing is left over. If it names
`<CONTAINER>-backup`, deploy once more with `BACKUP_PORT` still on: a
successful deploy removes the backup. Then remove the `BACKUP_PORT` line
from the conf.

The next deploy stops and removes the old container, then starts the new one,
as before. The Nginx `upstream` block can stay: with no backup container the
backup port is never used, and Nginx sends everything to the main port.
`nginx -t` and a reload are not needed.
