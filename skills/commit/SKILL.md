---
name: commit
description: Commit changes in the team's Conventional Commits format, one commit per piece of work, each with a short body stating the problem and why this change solves it. Use ONLY when the user explicitly asks to commit ("commit", "commit simple", "bikin commit"). NEVER commit on your own initiative, NEVER push unless asked.
---
# Commit

Only run when the user explicitly asked to commit in the conversation. Finishing a task,
passing tests or a clean lint is **not** a reason to commit on your own.

## Message format ([Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/))

```
<type>[optional scope]: <what>

<why>
```

- **One type per commit.** Several pieces of work = several commits (the spec's own advice:
  "go back and make multiple commits whenever possible").
- **type**: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore`,
  `style`, `revert` (the `@commitlint/config-conventional` set; nothing else, e.g. no
  `security:`, use `fix:`).
- **scope** (optional): the service or area in parentheses, e.g. `fix(caddy):`,
  `feat(runner):`. Use it when the repo has several services; skip it in small repos.
  Follow what the repo's history already does.
- **what**: imperative, lowercase, no trailing period, aim for ≤ 50 chars.
- **Blank line**, then **why** in 1–3 short lines, wrapped at 72 chars. It must answer:
  1. **Problem**: what was wrong or missing, and its symptom (what broke, for whom).
  2. **Reason**: why this change solves it, and why this way (the trade-off, if any).
     Never restate the diff; the diff already shows *what* changed.
- Breaking change: `!` after the type (`feat!: ...`) and a `BREAKING CHANGE: ...` footer.
- **Never** add `Co-Authored-By` or any other trailer the user didn't ask for.

Right:

```
fix: caddy cert lifetime 12h -> 7d

srv01's clock drifted, so 12h certs expired before Caddy renewed them
and browsers showed "Not secure". 7d tolerates drift and downtime; a
shorter life adds little since the CA key sits on the same host.
```

Wrong:

```
Updated files                         <- no type
fix: changed lifetime                 <- no why
fix: caddy cert lifetime 12h -> 7d
                                      <- why names no problem, only the
tolerate clock drift                     effect: what broke? why 7d?
feat: Add runner.                     <- capitalised, trailing period
fix: lifetime 7d
   tolerate clock drift               <- why must follow a blank line
refactor: move script                 <- two types in one commit: split it
fix: lifetime 7d
```

## Splitting changes into commits

Ask of every change: **"why did I change this?"** Same answer, same commit; different
answer, different commit. A change and what depends on it (its tests, docs, the config
that uses it) stay together. Order commits so each one works on its own: `refactor` first,
then the `feat`/`fix` that builds on it, `docs` last.

When one change can't be split:

- **It solves several problems at once** (the same lines): one commit, and list every
  problem in the body.

  ```
  fix: bind ports to LAN IP only

  - forgejo SSH was reachable from docker bridge networks
  - caddy answered on every interface, including VPN
  Binding to the LAN IP closes both.
  ```
- **It is both a refactor and a fix/feature:** split it if you can (behaviour-neutral
  refactor first, then the fix). If you can't, the subject takes the type with the biggest
  effect for users, `feat` > `fix` > `perf` > `refactor` > `docs`/`chore`, and the body
  mentions the refactor.

## Special cases

- **Changes that aren't part of the requested work** (e.g. the user's half-finished edit in
  another file): leave them out and ask ("README.md also changed, include it?").
- **Hook or lint fails:** no commit was made. Fix the cause and commit again; never
  `--amend` it into the previous commit.
- **Merge/rebase in progress, conflicts, or detached HEAD** (`git status` says so): stop and
  report; don't commit on top of it.
- **Version or dependency bump:** name it `from -> to` and the reason (CVE, end of life,
  needed feature). The lockfile goes in the same commit.

  ```
  build: bump forgejo 15.0.9 -> 15.0.10

  15.0.9 has a CVE in the SSH server (CVE-2026-XXXX). 15.0.10 is the
  fixed patch release on the same LTS line, no migration needed.
  ```
- **Closes an issue:** add a footer after a blank line, `Closes #12` (Forgejo closes the
  issue when this reaches the default branch).
- **Revert:** `revert: <subject of the reverted commit>`, then `This reverts commit <sha>.`
  and why it's being undone. Use `git revert <sha>` and edit its message.
- **Committing directly to the default branch** in a repo that works with pull requests
  (protected `main`, PR history): ask first or commit on a new branch.

## Checks before committing

**Security (blocking: stop and tell the user):**

- **Secrets** in any staged file or diff: `.env*`, `*.key`, `*.pem`, `id_*`, keystores,
  tokens, passwords, API keys, connection strings with credentials, private-key blocks
  (`-----BEGIN ... PRIVATE KEY-----`). A secret that reached git history must be rotated,
  not just deleted, so it must never get there.
- Files the `.gitignore` is meant to exclude but that are tracked or force-added.
- Weakened security in the diff without a stated reason (auth or TLS checks disabled,
  `privileged: true`, permissions opened up, hardening removed): point it out and ask.
- Never bypass checks: no `--no-verify`, no `-c core.hooksPath=`, no disabling signing.
- Never rewrite published history: no `--amend`, rebase or force-push of pushed commits.

**Maintenance (fix or ask before committing):**

- The repo's lint/tests pass (`tools/lint.sh`, `make lint`, `npm test`, …).
- Only intended changes: no stray debug code, temp files, build output, editor/OS files,
  large binaries, or unrelated edits.
- LF line endings in text files (CRLF has broken scripts on servers).
- Each commit builds on its own and holds one piece of work, so it can be reverted alone.

## Steps

1. `git status`, `git diff` and `git diff --cached` to see every change.
2. Run the checks above.
3. Split the changes into pieces of work, one type each. If one file mixes two pieces of
   work, stage only the relevant hunks for each commit (e.g. `git apply --cached` with a
   partial patch); don't lump them together.
4. Show the proposed commit list (messages + files) and wait for the user's OK, unless they
   already said to go ahead ("langsung", "just do it").
5. Stage exactly those files (never `git add -A` blindly) and commit in order, using a
   heredoc so the blank line and body are kept.
6. Show `git log --oneline -<n>`. Don't push unless the user asks.

If `git config user.name` / `user.email` isn't set, ask the user; never invent an identity.
