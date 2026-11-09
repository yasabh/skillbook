---
name: commit-git
description: Commit changes in the team's Conventional Commits format, one commit per piece of work, each with a one-line why (the problem it solves), or none when the subject says it all. Use ONLY when the user explicitly asks to commit ("commit", "commit simple", "bikin commit"). NEVER commit on your own initiative, NEVER push unless asked.
---
# Commit

Only run when the user explicitly asked to commit in the conversation. Finishing a task,
passing tests or a clean lint is **not** a reason to commit on your own.

> **Gate:** check and recommend first; change nothing until the user approves. Here: the
> proposed commit list (step 4).

Load `references/special-cases.md` for a version bump, a revert, a commit that closes an
issue, a breaking change, or a repo that works with pull requests.

## Message format (Conventional Commits 1.0.0)

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
- **Blank line**, then **why** in **one line** by default, wrapped at 72 chars: the
  problem this solves, or the reason for doing it this way. A second line only when the
  reason isn't obvious from the subject and the first line.
  - No backstory or narrative ("the team already…", "was split across…"); state the
    reason directly.
  - Never restate the diff; the diff already shows *what* changed.
  - No body when the subject says it all: a routine version bump, a typo, a pure rename.
- **Never** add `Co-Authored-By` or any other trailer the user didn't ask for.

Right:

```
fix: caddy cert lifetime 12h -> 7d

12h certs expired before renewal on srv01's drifting clock ("Not secure").
```

```
refactor(baseline-project): rename project-baseline to baseline-project

Match the verb-noun naming every other skill already uses.
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
refactor: rename x to y
                                      <- backstory instead of the reason:
The old name was the only one not in     one line is enough
the form the others use, and the team
already calls the job that.
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
