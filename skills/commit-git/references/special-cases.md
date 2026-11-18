# Special commits

Load for a version bump, a revert, a commit that closes an issue, a repo that works with
pull requests, or to check a message against the wrong examples at the end.

- **Version or dependency bump:** name it `from -> to` and the reason (CVE, end of life,
  needed feature). The lockfile goes in the same commit.

  ```
  build: bump forgejo 15.0.9 -> 15.0.10

  Fixes CVE-2026-XXXX in the SSH server; same LTS line, no migration.
  ```
- **Closes an issue:** a footer after a blank line, `Closes #12` (Forgejo closes the issue
  when this reaches the default branch).
- **Revert:** `git revert <sha>`, then edit the message: `revert: <subject of the reverted
  commit>`, `This reverts commit <sha>.` and why it is being undone.
- **Default branch in a PR repo** (protected `main`, PR history): ask first, or commit on
  a new branch.
- **Breaking change:** `!` after the type (`feat!: ...`) and a `BREAKING CHANGE: ...` footer.

## Wrong messages

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
