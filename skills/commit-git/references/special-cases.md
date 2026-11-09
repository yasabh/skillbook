# Special commits

Load for a version bump, a revert, a commit that closes an issue, or a repo that works
with pull requests.

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
