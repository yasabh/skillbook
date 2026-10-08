---
name: save-claude
description: Save what a session learned so later sessions and teammates can use it, to Claude's memory (personal) and/or the repo's CLAUDE.md (shared). Use when the user says "simpan memori", "save memory", "remember this", "update CLAUDE.md", "catat", or at the end of a long working session when asked to wrap up.
---
# Save Claude

Two places, two audiences. Decide per fact, then write only what is relevant.


|          | Memory (auto-memory dir)                                                    | `CLAUDE.md` (repo root)                                          |
| -------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Reader   | Claude, for this user only                                                  | Every teammate's Claude, and people                              |
| Content  | state of ongoing repo work, decisions + why, user preferences, corrections | how to work in this repo: commands, layout, conventions, gotchas |
| Lifetime | point in time; dated                                                        | stays true until the code changes                                |
| Git      | never                                                                       | committed (ask first,`commit` skill)                             |

## What to save

Ask of each fact: **"would a fresh session get this wrong or waste time without it?"**
If no, drop it.

Save:

- Decisions and their reason, especially rejected options ("ET dropped: not outbound").
- State of unfinished work: what's deployed, what's pending, what to check next.
- Gotchas found the hard way (a silent no-op sed, a WSL bind-mount quirk, a start-up race
  that looks like an error).
- User corrections and preferences, with why (feedback).
- Claims that turned out wrong, so they aren't repeated.

Don't save:

- What the code, git log or README already says (structure, past diffs, commit list).
- Conversation-only details, raw command output, long explanations.
- Secrets, tokens, passwords, private hosts' credentials. Ever.
- Guesses. Mark anything unverified as **UNVERIFIED**.

## Memory

- One fact (or one topic's state) per file, frontmatter `name`, `description`, `type`
  (`user` | `feedback` | `project` | `reference`).
- **Update the existing file** for the topic instead of adding a near-duplicate; delete
  memories that proved wrong.
- Absolute dates (`2026-10-05`, not "today"), commit hashes for what's done.
- feedback/project: add **Why:** and **How to apply:**.
- Link related memories with `[[name]]`.
- Add or fix the one-line pointer in `MEMORY.md`; keep the newest work at the top and fix
  stale labels you notice.

## CLAUDE.md

- Short and scannable; aim under ~100 lines. Commands in code blocks, one fact per line.
- Sections that usually earn their place: what the project is (2 lines), how to
  build/run/deploy, layout (only non-obvious dirs), conventions, gotchas.
- Facts about the repo, not about one person or one session. No dated status logs: those
  belong in memory or issues.
- Edit in place; never paste a session summary on top.
- Show the diff and ask before committing.

## Steps

1. List candidate facts from the session, each tagged memory / CLAUDE.md / drop.
2. Read the existing memory index and CLAUDE.md; plan updates vs new entries.
3. Write with the Edit/Write tools (so the diff is visible), not shell redirects.
4. Report in a few lines: which files changed and the one-line gist of each. Don't repeat
   the content.
