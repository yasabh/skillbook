# skillbook

Shared skills for Claude Code: a small team's ways of working, the same in every
project. Packaged as a Claude Code plugin; the skills themselves are plain `SKILL.md`
files (open Agent Skills format), so other tools can read `skills/` directly.

## Skills


| Skill              | Use                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| `baseline-project` | Bring a project (new, existing or drifted) to the team standard: audit, interview, then docs via `write-docs` |
| `check-security`   | Find what is actually risky (CVEs, secrets, config, access) and the smallest safe fix                        |
| `code-standard`    | Small web apps (page + backend): maintainable first, then light on resources, then secure                    |
| `commit-git`       | Conventional Commits, one piece of work per commit, short why; only when asked                               |
| `debug-safely`     | Find a bug's cause without making it worse: reproduce, read-only on prod, one change, lock it with a test    |
| `save-session`     | Save what a session learned in the right place; learns how you want replies                                  |
| `update-deps`      | Bump and pin deps, runtimes and images to LTS/stable, one component at a time                                |
| `write-docs`       | README, CLAUDE.md, ADRs and lessons in the team format                                                       |
| `write-tests`      | Tests named as sentences, fakes instead of real systems, silent failures first                               |

## Install


**In a team repo (recommended):** nothing to do. Every repo carries a
`.claude/settings.json` that registers this marketplace and enables the plugin; Claude Code
offers to install it the first time you open the repo and trust the folder.

```json
{
  "extraKnownMarketplaces": {
    "skillbook": {
      "source": {
        "source": "git",
        "url": "https://github.com/yasabh/skillbook.git"
      }
    }
  },
  "enabledPlugins": {
    "skillbook@skillbook": true
  }
}
```

To add it to a new repo: copy that file to `<repo>/.claude/settings.json`, commit it, and
add `.claude/settings.local.json` to the repo's `.gitignore` (personal settings stay local).

**Everywhere on your laptop:** put the same two keys in `~/.claude/settings.json`.

**If the install offer doesn't appear (e.g. the VS Code extension, which has no
`/plugin` command):** clone this repo and link each skill into your personal skills
folder. `git pull` in the clone updates them; open a new session to load changes.

```bash
git clone https://github.com/yasabh/skillbook.git ~/skillbook
mkdir -p ~/.claude/skills
for s in ~/skillbook/skills/*/; do ln -sfn "$s" ~/.claude/skills/"$(basename "$s")"; done
```

Skills linked this way are called without the plugin prefix (`/commit-git`).

After a skill is renamed or removed, `git pull` leaves its old link broken. List broken
links, check they are skillbook's, remove them, then run the loop above again:

```bash
find ~/.claude/skills -maxdepth 1 -xtype l -ls     # review first
find ~/.claude/skills -maxdepth 1 -xtype l -delete
```

**Manually, in a Claude Code session:**

```
/plugin marketplace add https://github.com/yasabh/skillbook.git
/plugin install skillbook@skillbook
```

## Use

- Ask in plain words ("commit", "commit simple") and Claude uses the matching skill, or
  call it directly: `/commit-git` (short form, works unless another command already uses the
  name) or `/skillbook:commit-git` (always works).
- Skills act only on request. `commit-git`, for example, never commits on its own initiative.
- Get new versions: `/plugin marketplace update skillbook`, then `/reload-plugins`.

## Develop and test locally

Point Claude Code at your working copy instead of the git repo, so edits apply after
`/reload-plugins` without pushing:

```
/plugin marketplace remove skillbook
/plugin marketplace add /path/to/skillbook
/plugin install skillbook@skillbook
```

## Layout

```
.claude-plugin/plugin.json        plugin metadata (bump "version" on changes)
.claude-plugin/marketplace.json   makes this repo installable with /plugin
skills/<name>/SKILL.md            one folder per skill
```

## Adding a skill

1. `skills/<name>/SKILL.md` with frontmatter `name` and a `description` that says **when**
   to use it; keep the body to what Claude wouldn't do by default, with steps and examples.
2. Try it in two or three different repos before relying on it.
3. Add a row to the table above, then commit and bump `version` as `CLAUDE.md` says.
