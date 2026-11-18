---
name: code-standard
description: The team's code standard for small web apps, the page (HTML, CSS, vanilla JS) and its light Python backend. Use when the user asks to "build/add a page or endpoint", "bikin halaman", "bikin UI", "bikin endpoint/API", "tambah fitur", "ubah tampilan", "rapikan kode", "fix the page", "code standar", or when a feature needs a browser UI. Not for a bug whose cause is unknown (debug-safely), a security audit (check-security), version bumps (update-deps), claude.ai artifacts (artifact-design) or one-word text edits.
---
# Code standard

Goal: code a teammate reads and changes in one sitting, that costs the host almost
nothing, and that cannot be turned against its users. On conflict, **maintenance wins,
then performance, then security**, but a known security hole is NEVER traded away.

Words: **MUST / NEVER** = hard rule, no exceptions. **SHOULD** = default; break it only
with a reason you state.

> **Gate:** check and recommend first; change nothing until the user approves. Here:
> after §1, list what will be built (screens, endpoints, files touched) and wait. A
> request that only says "desain" gets one question first: mockup only, or implement?
> A question or idea ("why not X?", "knp ga …") is NOT approval: answer, re-plan, wait.

## 1. Read, then load only what applies

- MUST read the files you will touch and their neighbours. **The repo's way wins over
  this skill** (structure, naming, tokens, server framework).
- Read only the references that match:

  | You will touch                                   | Read                       |
  | ------------------------------------------------ | -------------------------- |
  | `*.py`                                           | `references/python.md`     |
  | `*.html`                                         | `references/html.md`       |
  | `*.css`                                          | `references/css.md`        |
  | `*.js`                                           | `references/js.md`         |
  | a new page or project, new files, a shared helper | `references/structure.md`  |
  | a new page, a redesign, "bikin cantik"           | `references/design.md`     |

- A stack with no reference: apply §2 and say its reference does not exist yet.
- Something broken and the cause unknown: `debug-safely` first, then fix here.
- Ask in one line what it is for, who uses it, how much data. Data size decides paging
  and sorting before anything is written.
- Plan every state the user sees: loading, empty, error, not-searched vs nothing-found,
  pending changes, waiting for a background effect.

## 2. Rules for every stack

**Maintenance (1)**
- **Prefer not writing code.** Stop at the first step that covers the need: drop it if
  nobody needs it (say in one line what you left out) → reuse what this repo has → use the
  language or platform → use a dependency already installed → a single clear line → only
  then the smallest version. NEVER pull in a dependency, framework, bundler or CDN to save
  a few lines.
- Small solution, complete job: MUST update every caller, test and fixture the change
  affects. Bug fix: grep the callers, repair the cause in one place.
- Code you move or merge MUST keep its error handling and validation.
- NEVER add options, wrappers, config or speculative code the request does not call for.
  Removing code beats adding it.
- Merge a repeated pattern into one helper only if it has one job, a clear name, ≤4
  parameters and **no switch parameter** (`mode`, `step < 0` branches inside). Needs a
  switch → two concepts, keep both. Count concepts a reader holds, not lines.
- A feature that needs a new `if` or flag in an unrelated flow is a design problem: SHOULD
  move the logic to the code that owns it, or propose a reshape so the special case
  disappears.
- NEVER add a default that hides a value which must exist; let it fail loudly. Defaults
  are only for values that are truly optional.
- A refactor SHOULD leave a reader fewer concepts to hold at once (a split by job counts);
  if it only adds names or files, drop it.
- SHOULD: small named functions; one statement per line; lines under ~100 characters;
  no nested ternaries. A dense one-liner is not a saving.
- Comments: the **why** in one line. Known limit:
  `shortcut: <what it cannot handle>, <when to revisit>`.
- Delete what you replace: no commented-out code, no unused names.

**Performance (2)**
- MUST bound every list on the server (page size with a hard max, validated on both sides).
- SHOULD: keyset paging for large sorted data, offset only for small sets; sort on the
  server only by an indexed column; cache slow upstream answers briefly; poll only while
  something is pending.
- MUST measure on the real host before calling it fast (a Pi is ~10× slower than a laptop).
  A speed number counts only with zero errors in the run and a gap larger than the spread
  between repeated runs.

**Security (3)**
- MUST validate on the server as if the page did not exist.
- MUST check authorization in the app on every request; trust an identity header only
  from the known proxy.
- Every state change MUST be POST + JSON + matching `Origin`. GET NEVER changes anything.
- Errors: short to the user, detail in the server log. Audit who changed what and why.

**NEVER trim these to shorten code:** input checks at trust boundaries, error handling
that protects data, security, accessibility, or anything the user requested.

## 3. Verify

1. Reread your own diff before testing: SHOULD delete any branch, helper or state it turns
   out not to need. Bigger restructuring of existing code: propose it in the report, don't
   do it.
2. Run the backend tests (`write-tests`), including refusals: outside the ACL, wrong
   origin, out-of-range input.
3. Syntax-check JS with `node --check` when node exists; say so when it does not.
4. See the page in a browser or ask for a screenshot. Say plainly what was not seen running.
5. Deploying is a separate, approved step.
6. After a deploy, MUST confirm the running container holds the new code (a new symbol or
   file inside it, its start time) before asking anyone to test.

## 4. Report

A few lines: what it now does, files changed, test counts, what was not verified, the
deploy command. Commit only when asked, with `commit-git`.
