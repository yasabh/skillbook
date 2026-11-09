---
name: debug-safely
description: Find the cause of a bug or outage without making it worse: reproduce, read-only on production, one change at a time, on copies of data, and lock the fix with a test. Use when something is broken or behaves oddly and the cause is not known yet, e.g. "error", "bad gateway", "kok gak jalan", "kenapa ...", "bug", "rusak", "lemot", "debug", "cek kenapa", a stack trace or a screenshot of a failure. Not for a fix whose cause is already known (go straight to code-standard).
---
# Debug safely

Goal: the real cause, proven, and a fix that cannot quietly come back, without breaking
anything else on the way. On production, looking is free; touching is not.

Words: **MUST / NEVER** = hard rule. **SHOULD** = default; break it only with a stated reason.

> **Gate:** check and recommend first; change nothing until the user approves. Here:
> reading logs, status and data is free; a restart, a config or data change, a deploy or
> a fix waits for OK, with the evidence and the proposed change in a few lines.

## 1. Pin the symptom

- Exact words first: the error text, URL, time, who sees it, since when. "What changed
  just before?" (deploy, config, other stacks on the host, clock, certificate).
- MUST reproduce it, or say it does not reproduce. A fix for a bug you never saw is a guess.
- Look where it is cheap first: the newest logs, `status`, the last deploy, the proxy in
  front. Read the logs of every hop (gateway → proxy → app), not only the app.
- A UI showing something odd (a colour, a blank, a wrong count): MUST first read what it
  is fed (the query result, the fields per row, the panel's mappings) before any theory
  about upstream causes. Answer once, with that evidence.

## 2. Hypothesis and evidence

- Write the suspected cause in one line, and the check that would prove or kill it.
- **One change per try.** Two changes at once and you cannot tell which helped.
- Prefer the check that can only be read one way (a header, a log line with a timestamp,
  a query count) over "it seems to work now".
- Measure on the real host; a laptop is ~10× faster than a Pi and lies about timing.
- Time box: two dead ends → stop, report what was ruled out and the next best check.

## 3. Production is read-only

- NEVER restart, redeploy, edit config, or write data on production to "see what happens".
- Data: work on a copy (SQLite: the backup API or a copied snapshot, never the live file
  with WAL open). Network: a throwaway container or a read-only query.
- NEVER disable auth, TLS or a security check to get past an error; find why it refuses.
- A secret seen while debugging (log, env dump, URL): stop and tell the user; `check-security`.

## 4. Temporary debugging

- Debug output MUST NOT print secrets, tokens, cookies or personal data.
- Mark it (`# DEBUG:`), and remove it before the fix is committed.
- NEVER leave a debug port, verbose mode or permissive flag on after the session.

## 5. Fix and lock it

- Fix the root cause once, in the shared code; grep every caller (`code-standard`).
- Lock it with a test that fails without the fix and passes with it (`write-tests`).
- Startup races and first-seconds errors: recheck before calling them the cause.

## 6. Report

A few lines: symptom, cause (with the evidence), fix, the test that locks it, what was
ruled out, what is still unverified. Proposed restarts or deploys wait for OK; commits go
through `commit-git` (`fix:` naming the symptom).
