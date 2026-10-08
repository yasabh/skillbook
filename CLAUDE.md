# skillbook

Claude Code plugin of shared team skills; each skill is a plain `skills/<name>/SKILL.md`.
No build, lint or tests: the deliverable is Markdown and two JSON manifests.

## Public repo

- This repo is a **public** repo; every pushed branch becomes public.
- Never commit internal hostnames, company or team names, work emails, or real hosts in
  examples. Keep skill examples generic (`srv01`, `example.com`).
- Push only to `origin`

## Adding or changing a skill

- One skill per commit: its `SKILL.md` plus its row in the `README.md` skills table.
- Bump `version` in `.claude-plugin/plugin.json` when skills change, in a separate
  `chore` commit, so installed copies see an update.
- Frontmatter `description` says **when** to use the skill, including the user's trigger
  phrases (English and Indonesian).
