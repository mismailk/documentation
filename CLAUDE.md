# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

AGENTS.md (imported above) is the authoritative guide: commands, contribution workflow (separate branch + PR, never commit to `main`), the agent workflow (Claude Code plans and verifies, opencode implements), and the sidebar/frontmatter rules.

## Architecture in brief

- `docs/` is the only source of truth for navigation. [scripts/generate-sidebar.mjs](scripts/generate-sidebar.mjs) scans it and writes the gitignored `docs/.vitepress/sidebar.gen.json`, which [docs/.vitepress/config.mjs](docs/.vitepress/config.mjs) loads as `themeConfig.sidebar` (empty sidebar + warning if the JSON is missing — hence always use the npm scripts).
- Tests ([test/generate-sidebar.test.mjs](test/generate-sidebar.test.mjs)) cover both the generator and the `normalizeBase`/`loadSidebar` exports of config.mjs.

## Running a single test

```
node --test --test-name-pattern="<name substring>" test/generate-sidebar.test.mjs
```

There is no linter configured.

## Claude Code notes

- **At session start, read [.superpowers/PROGRESS.md](.superpowers/PROGRESS.md).** It says where the work stands and what's next. Update it after every verified plan or new decision, and commit it with that work.
- **You own specs, plans, verification and validation. You never implement a plan yourself.** opencode implements every plan (see "Agent workflow" in AGENTS.md).
- Use `superpowers:writing-plans` for plans and keep the 4-task limit. Specs and plans go in `.superpowers/`, never under `docs/`.

## Handing implementation to OpenCode

"Start implementation" means: hand the reviewed plan to opencode at once, without asking how to execute it. Claude Code starts the session and then verifies the result; opencode does the implementing.

**Start the session**

1. The plan and its spec must be committed first, on the plan's branch. opencode reads them from the repo.
2. Check the background server is up: `opencode service status` prints its URL (start it with `opencode service start` if not). Use this shared server, not `--standalone`, so the user can open the session.
3. Write a short prompt to the scratchpad (`opencode-prompt.md`). It names the plan and its spec and says: "Implement the plan at .superpowers/plans/<file>.md exactly, task by task, using the superpowers:executing-plans skill. Follow the plan's steps, content and commit messages verbatim. Run every verification command in the plan. If a check fails and you cannot fix it within the plan's intent, STOP and report; never weaken tests or skip checks. Skip only browser visual checks and say so. Never push. Never hand-edit or commit docs/.vitepress/sidebar.gen.json. Follow AGENTS.md. End with a report of each task, the commands and results, the commits, and any deviation from the plan." Add task-specific notes if there are any. Then run the launcher below as a background command, from the repo root, so you are notified when it ends:

   ```bash
   bash <scratchpad>/opencode-launch.sh "<unique short title>" <scratchpad>/opencode-prompt.md <scratchpad>/opencode-run.log
   ```

   **A run can fail to start.** `opencode run` sometimes logs "cli starting" and then never reaches the server (no session, an empty log, the process idle or gone), and the identical command a minute later works. It looks like a flaky connection to the shared service. Never assume a launch worked: confirm the session exists within about 30 s. The launcher does this and retries. Write it to the scratchpad first:

   ```bash
   #!/usr/bin/env bash
   # usage: opencode-launch.sh "<title>" <prompt-file> <log-file>
   title="$1"; prompt="$2"; log="$3"
   count() { opencode session list 2>/dev/null | grep -c -F "$title"; }
   for attempt in 1 2 3; do
     before=$(count)
     opencode run --title "$title" --auto "$(cat "$prompt")" > "$log" 2>&1 &
     pid=$!
     started=0
     for i in $(seq 15); do
       sleep 2
       if [ "$(count)" -gt "$before" ]; then started=1; break; fi
       kill -0 $pid 2>/dev/null || break
     done
     if [ $started -eq 1 ]; then echo "session started on attempt $attempt"; wait $pid; exit $?; fi
     echo "attempt $attempt: no session after 30 s, restarting" >&2
     kill $pid 2>/dev/null; wait $pid 2>/dev/null
     sleep 30
   done
   echo "OpenCode never started a session" >&2; exit 1
   ```

   - Use a title no earlier session has (the launcher counts sessions with that title).
   - Failures come in clusters, so the launcher waits 30 s between attempts. If it still gives up, wait a minute and start the run once directly before reporting a failure to the user. If a run stalls later (an empty log and an idle process), kill only that `opencode run` process (other projects' runs share the server) and start it again.
   - Do not pass `--server <url>`: the background server requires a password, and only the default connection (no `--server`) authenticates automatically.
   - The model comes from opencode's own configuration; do not pass `--model` unless the user asks.
   - `--auto` approves opencode's tool calls, including shell commands and commits. Say so to the user when you start it. The AGENTS.md rules are the only limit, which is why the result is verified below.
4. Find the session id with `opencode session list` (match the title) and give the user `opencode -s <session id>`, run from the repo directory, to follow along or step in.

**Verify when it finishes**

Do not take opencode's summary on trust. Read the end of `opencode-run.log`, then check:

1. `git log` and `git show --stat <first>^..<last>`: one commit per task, on the plan's branch, each touching only the files its task lists; nothing pushed, `main` untouched, no `sidebar.gen.json` or `docs/.vitepress/cache/` committed.
2. `git diff <first>^..<last>` matches the plan's content; explain any deviation opencode reported.
3. Removed test lines (`git diff <first>^..<last> -- 'test/*.test.mjs' | grep '^-[^-]'`): each is one the plan replaces. No weakened or deleted assertions.
4. From the repo root, rerun `npm test` and `npm run docs:build` (the build must not print the empty-sidebar warning).
5. For page changes, run `npm run generate` and check the new entries in `sidebar.gen.json` (labels, `order`, nesting), then preview with `npm run docs:dev` in the browser if it's connected: the page appears where the plan says, links and downloads resolve, and it reads well in light and dark mode.
6. For a behaviour change under `scripts/` or `docs/.vitepress/`, temporarily revert it, confirm the new test fails, then restore the file with `git checkout <file>` (only for a file with no uncommitted changes of the user's).

Report the commits, the checks and their results, anywhere opencode's report was wrong, and anything the user must act on. The session stays on the server for follow-ups.
