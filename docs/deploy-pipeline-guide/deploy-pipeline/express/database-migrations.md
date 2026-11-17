---
title: Database Migrations
order: 5
---
# Database Migrations

A release sometimes changes the shape of the data: a new collection, a
backfill, an index. The pipeline can run one script from the **new** image
before the container swap, and any number of scripts right after it.

Migrations are **off by default**. With the setting off, a push behaves
exactly as it does today.

## When you need it {#when}

Turn migrations on for a release when it changes the data model:

- the new version reads data the old version does not write yet;
- records the old version writes while both versions are reachable need
  converting after the swap;
- a one-off backfill or index build has to happen with the release.

The **before** script runs from the new image, before traffic moves to it.
If it fails, the deploy stops and the old container keeps serving.

The **after** scripts run in order, right after a successful swap, and stop
at the first failure. The new version is already live at that point; see
[If the after step fails](#after-step-failed).

## What your scripts must do {#script-rules}

- **Be in the image.** Each script is compiled to `dist/scripts/<name>.js`
  in the runtime image. The Dockerfile already copies `dist`, so a
  TypeScript file under `src/scripts/` compiled by `npm run build` is
  enough.
- **Be safe to run twice.** Every script must be idempotent: a retried
  deploy, a manual rerun, or `RUN_MIGRATION` left on runs it again. Use
  "create if missing", upserts, or a marker record.
- **Read config from `/app/.env`,** the way the app does. A migration gets
  the app's `.env` file mount, network and memory limit, so it reaches the
  same database.
- **Never print connection strings or secrets.** Script output goes to the
  CI log and `docker logs`.
- **Exit non-zero on failure, and finish on their own.** Do not leave open
  handles, timers or sockets that keep `node` alive.
- **Mind the name and argument limits.** A script name uses only letters,
  digits, `-` and `_` (no dots or slashes). Arguments use only letters,
  digits and `. _ , : = + @ -`, and there are at most 20 of them.

## Update the server first {#update-server}

The `migrate` command is new in `deploy.sh`, so update the server once
before you switch migrations on:

1. Put the new kit's `server/deploy.sh` (in the shared Deploy Pipeline kit)
   into `~/docker-deploy-server/` on the server.
2. Put **every** app that server deploys back on the app allowlist, then
   reinstall the script as
   [3.2 Register the app on the server](../add-an-app#register-app) does.
   Skip its first step, which fetches the installed copy: that copy is the
   old script, and fetching it would undo step 1. Reinstalling from the
   kit's stock copy otherwise drops the other apps that server deploys.

Check the installed script:

::: step level=ask where=server verify="prints deploy: invalid script name and exit 2"
```bash
sudo -u deployer /opt/deploy/deploy.sh migrate <app> staging-0000000 bad.name; echo "exit $?"
```
:::

It must print `invalid script name` and `exit 2`.

## The variables {#variables}

Set these as variables on each GitHub environment (`staging`,
`production`), next to `DEPLOY_ENABLED`:

| Variable | Meaning | Default |
|---|---|---|
| `RUN_MIGRATION` | `true` runs the migration steps; anything else, or unset, skips them | off |
| `MIGRATION_SCRIPT` | "before" script, without `.js` | none; required when `RUN_MIGRATION` is `true` |
| `MIGRATION_ARGS` | arguments passed to every script | empty |
| `POST_MIGRATION_STEPS` | space-separated "after" scripts, run in order | empty (none) |

Worked example, in the `staging` environment, for `dist/scripts/seed.js`:

| Variable | Value |
|---|---|
| `RUN_MIGRATION` | `true` |
| `MIGRATION_SCRIPT` | `seed` |
| `MIGRATION_ARGS` | `--yes --expect-db=backend_staging` |
| `POST_MIGRATION_STEPS` | (empty) |

With those, the release runs `migrate backend staging-<sha7> seed --yes
--expect-db=backend_staging` before the swap, and no script after it.

If `RUN_MIGRATION` is `true` and `MIGRATION_SCRIPT` is empty, the deploy
job fails before it reaches the server, with `RUN_MIGRATION is true but
MIGRATION_SCRIPT is empty` in the log.

## A release, step by step {#release-order}

1. Set the variables for the release on **staging**, as in
   [The variables](#variables), then push to the staging branch.
2. In the job's log, check the steps in order: `Migrate (before)`,
   `Deploy`, then `Migrate (after)` if you set after steps. Each migration
   shows its script's output inside a `migrate <name>` group.
3. When staging is fine, set the same variables on **production** and
   merge to the production branch.
4. Set `RUN_MIGRATION` back to off in both environments. Leaving it on runs
   the scripts again on the next release.

## Rerun one script {#rerun}

The manual workflow runs one script for an existing tag, without a new
deploy. It is gated on `DEPLOY_ENABLED`, not on `RUN_MIGRATION`: a manual
run is its own decision.

1. In GitHub, open **Actions** → **migrate** → **Run workflow**.
2. Choose the branch the environment deploys from, the environment, an
   existing tag such as `staging-ab12cd3`, the script name (without `.js`)
   and the arguments.
3. Run it and watch the log; the job prints the script's output.

The workflow is `migrate.yml` from the kit; copy it to
`<app repo>/.github/workflows/migrate.yml` with the other templates
([Fill the templates](./prepare-your-app#fill-templates)). Its concurrency
group is the deploy job's, so a rerun and a deploy of the same app and
environment never overlap.

## If the after step fails {#after-step-failed}

The new version is already live, so the site keeps serving. The job is red
because an after script exited non-zero; the scripts after it did not run.

1. Read the failing script's output in the job log, inside its
   `migrate <name>` group, and fix the cause. It is usually data the script
   did not expect.
2. Rerun that script with [the manual workflow](#rerun), then run any later
   after scripts the same way, in order.

## If a run is cancelled {#cancelled-run}

Cancelling the CI job does not stop a migration that has already started:
the server lets it finish, holding the app and environment lock. A deploy
or migration that arrives meanwhile waits for the lock and can exit 4 after
600 s.

Check what is running and what happened:

::: step level=ask where=server
```bash
docker logs <container>-migrate
tail /opt/deploy/logs/deploy.log
```
:::

The container is named `<CONTAINER>-migrate` from the conf, for example
`backend-staging-migrate`. The log line ends in `result=migrate:<script>:ok`
or `result=migrate:<script>:fail:<step>`.

If the server was rebooted or the command was killed, the container can be
left behind. The next run then fails with `migration container <container>-migrate already exists: check docker logs <container>-migrate, then docker rm <container>-migrate`. Read the logs first, then remove it:

::: step level=ask where=server
```bash
docker rm <container>-migrate
```
:::

Then rerun the script with [the manual workflow](#rerun).
