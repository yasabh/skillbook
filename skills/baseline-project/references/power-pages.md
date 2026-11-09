# Power Pages dev standard

Shared conventions for every Power Pages project. Each rule exists because
breaking it cost real time on an earlier site.

Before applying anything here, **verify this project's own values**. Do not copy
IDs or assume settings carry over.

Related references: `dataverse.md` (modelling, SharePoint virtual tables, Web
API queries), `power-automate.md` (flows and classic workflows behind the site).

## Baselining a site

When `baseline-project` runs on a Power Pages site: fill §1 by checking, not
copying (`pac pages list -v`, `pac org who`, the websites API call); the data
model decides `-mv Enhanced`; set up git and the standard files from §3, and
generate `deploy.ps1` with this site's Power Platform site ID; in a shared
environment add the §9 filter rule; copy into CLAUDE.md only the rules that
apply. If a sibling repo in the same environment differs from §3, report the
difference; do not copy its content.

## 1. Project values to fill in (verify, don't assume)

| | Value | How to check |
|---|---|---|
| Environment ID | `<env-guid>` | Power Platform admin center, or `pac org who` |
| Dataverse URL | `https://<org>.crm4.dynamics.com` | same |
| Website record ID | `<record-guid>` | `pac pages list -v` "Website Id"; API `websiteRecordId` |
| Power Platform site ID | `<site-guid>` | `pac pages list -v` "Portal Id"; API `id` |
| Data model | Enhanced or Standard | `pac pages list -v`; YAML in `.portalconfig` |
| Publisher prefix | `<prefix>_` | solution publisher in make.powerapps.com |
| Site type, visibility | Trial / Developer / Production; private / public | API `type`, `siteVisibility` (below) |
| Git remote | Forgejo `ssh://git@git.example.com/team/<repo>.git` | `git remote -v` |
| Git SSH key | `~/.ssh/<your-key>` | the default key is refused by Forgejo; set `core.sshCommand` (§3) |

**Two site IDs, not interchangeable.** The website record ID is the Dataverse
row: `pac pages download --webSiteId`, Dataverse queries
(`_mspp_websiteid_value`). The Power Platform site ID is for the admin center
and the Power Platform API, including the restart in `deploy.ps1`. Using the
record ID there makes the restart fail after a successful upload. Read both,
plus type and visibility, in one call:

```powershell
$t = & $az account get-access-token --resource 'https://api.powerplatform.com' --query accessToken -o tsv
(Invoke-RestMethod -Headers @{ Authorization = "Bearer $t" } -Uri `
  "https://api.powerplatform.com/powerpages/environments/$envId/websites?api-version=2022-03-01-preview").value |
  Select-Object id, websiteRecordId, name, type, siteVisibility, dataModel
```

A **developer site can never be made public**: anonymous visitors are impossible
there, whatever the table permissions say. A **Trial** site expires; record that
in the README Deployment and operations section and ask who converts it to
production.

## 2. Tooling

None of these are on PATH on the dev machine:

- `pac`: `%APPDATA%\Code\User\globalStorage\microsoft-isvexptools.powerplatform-vscode\pac\tools\pac.exe`
- `az`: `C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd`
- `gh` is not installed. The remote is Forgejo, not GitHub.

Tokens:
- Dataverse Web API: `az account get-access-token --resource https://<org>.crm4.dynamics.com`
- Site restart: `az account get-access-token --resource https://api.powerplatform.com`

Windows PowerShell 5.1 `Get-Content` reads UTF-8 without a BOM as ANSI, so a
correct `©` or `§` shows as `Â©` / `Â§`. Before reporting mojibake, read the
file with `[IO.File]::ReadAllText($p, [Text.Encoding]::UTF8)` or check its
bytes (`C2 A9` is a valid `©`).

On the Enhanced Data Model:
- every `pac pages` command needs `-mv Enhanced`, or it fails outright
- config tables are `mspp_*` via the Web API, even though the YAML says `adx_*`

## 3. Repo layout and deploy

The repo is a `pac pages download` export plus `deploy.ps1`, `README.md`,
`CLAUDE.md` and the files below. Custom work lives in `web-templates/` (Liquid)
and `web-files/` (JS/CSS). Never hand-edit `.portalconfig/`.

Git setup (Forgejo refuses the default key):

```powershell
git init -b main
git config core.sshCommand 'ssh -i ~/.ssh/<your-key> -o IdentitiesOnly=yes'
git remote add origin ssh://git@git.example.com/team/<repo>.git
```

Standard files, the same in every Power Pages repo:

`.gitattributes`: LF in the repo for everyone, not only for machines with
`autocrlf`. `pac pages upload` works with LF files.

```
* text=auto eol=lf
*.png binary
```

`.editorconfig`: line endings only. No charset, trimming or indent rules:
files come from `pac pages download` (some carry a BOM), and an editor that
reformats them changes records on the next upload.

```ini
root = true

[*]
end_of_line = lf
```

`.gitignore`:

```gitignore
# pac CLI / auth
.pac/
*.pac
auth*.json
deployment-profiles/*.local.yml
# Secrets
.env
.env.*
# OS / editor
Thumbs.db
desktop.ini
.DS_Store
.vs/
.vscode/
*.swp
# Local scratch
/scratch/
*.log
# Personal Claude Code settings (settings.json is shared)
.claude/settings.local.json
```

`.claude/settings.json`: teammates get the team skills in this repo.

```json
{
  "extraKnownMarketplaces": {
    "skillbook": {
      "source": { "source": "git", "url": "https://github.com/yasabh/skillbook.git" }
    }
  },
  "enabledPlugins": { "skillbook@skillbook": true }
}
```

When running `git add --renormalize .` after adding `.gitattributes`, run it
before other edits are made, or stage those edits in their own commit
afterwards: it stages every modified tracked file.

`deploy.ps1` = check Liquid, upload, then restart. Power Pages caches pages and
site settings for up to 15 minutes, so an upload alone keeps serving the old
version. "Purge Cache" does not always cover Web API settings; a restart does.

```powershell
$ErrorActionPreference = 'Stop'
$pac    = "$env:APPDATA\Code\User\globalStorage\microsoft-isvexptools.powerplatform-vscode\pac\tools\pac.exe"
$az     = 'C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd'
$envId  = '<env-guid>'
# Power Platform site ID (pac "Portal Id", API `id`), NOT the website record ID:
# the restart endpoint only accepts this one.
$siteId = '<site-guid>'

# Liquid blocks must balance: there is no local runtime, so a typo costs a deploy.
$bad = foreach ($f in Get-ChildItem $PSScriptRoot -Recurse -File -Include *.html) {
    $t = Get-Content $f.FullName -Raw
    if (-not $t) { continue }
    foreach ($p in 'if', 'for', 'unless', 'case', 'capture', 'comment') {
        $open  = [regex]::Matches($t, "\{%-?\s*$p\b").Count
        $close = [regex]::Matches($t, "\{%-?\s*end$p\b").Count
        if ($open -ne $close) { "$($f.FullName): $p=$open end$p=$close" }
    }
}
if ($bad) { $bad | Write-Host; throw 'Liquid unbalanced, upload cancelled.' }

& $pac pages upload --path $PSScriptRoot -mv Enhanced   # drop -mv on Standard model
if ($LASTEXITCODE -ne 0) { throw 'Upload failed.' }

$token = & $az account get-access-token --resource 'https://api.powerplatform.com' --query accessToken -o tsv
if (-not $token) { throw 'No Power Platform token. Run: az login' }
$uri = "https://api.powerplatform.com/powerpages/environments/$envId/websites/$siteId/restart?api-version=2022-03-01-preview"
Invoke-WebRequest -Method Post -Uri $uri -Headers @{ Authorization = "Bearer $token" } `
                  -ContentType 'application/json' -Body '{}' -UseBasicParsing | Out-Null
```

## 4. Upload traps

- **Upload never deletes.** A record removed from YAML stays on the server.
  Delete it in the UI.
- **A record deleted on the server is not recreated**, because `.portalconfig`
  still lists it. Give the YAML a new id instead.
- **Upload can silently fail to write.** A changed site setting has failed to
  write at least once. After changing anything that can lock people out (site
  setting, web role, page rule), read the value back from Dataverse.
- Upload succeeds with non-record files in the repo root (`README.md`,
  `CLAUDE.md`, `docs/`, `deploy.ps1`, `.editorconfig`).
- Upload reports "N records to process" even when no site file changed; why is
  unknown. Rely on the read-back below, not on that count.

**After a deploy**, read back what can lock people out (filter by the site's
website record, §9):

```powershell
$h = @{ Authorization = "Bearer $(& $az account get-access-token --resource https://<org>.crm4.dynamics.com --query accessToken -o tsv)" }
$b = 'https://<org>.crm4.dynamics.com/api/data/v9.2'; $w = '<website-record-guid>'
(Invoke-RestMethod -Headers $h -Uri "$b/mspp_sitesettings?`$select=mspp_name,mspp_value&`$filter=_mspp_websiteid_value eq $w and startswith(mspp_name,'Authentication/Registration/')").value
(Invoke-RestMethod -Headers $h -Uri "$b/mspp_webroles?`$select=mspp_name,statecode&`$filter=_mspp_websiteid_value eq $w").value
(Invoke-RestMethod -Headers $h -Uri "$b/mspp_webpageaccesscontrolrules?`$select=mspp_name,statecode&`$filter=_mspp_websiteid_value eq $w").value
```

Table permission → web role, Enhanced model: the link lives only in the
component's `content` JSON. The N:N relationships
(`mspp_entitypermission_webrole`, `powerpagecomponent_powerpagecomponent`)
come back empty without an error, so never read "no role attached" from them.

```powershell
$c = "$b/powerpagecomponents?`$select=name,powerpagecomponentid,content&`$filter=_powerpagesiteid_value eq $w and powerpagecomponenttype eq"
$roles = @{}; (Invoke-RestMethod -Headers $h -Uri "$c 11").value | ForEach-Object { $roles[$_.powerpagecomponentid] = $_.name }
(Invoke-RestMethod -Headers $h -Uri "$c 18").value | ForEach-Object {
  "{0} -> {1}" -f $_.name, ((($_.content | ConvertFrom-Json).adx_entitypermission_webrole | ForEach-Object { $roles[$_] }) -join ', ') }
```

Then check the site is up: `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://<site>/`.
A private site answers `302` to `login.windows.net/...`; that is up. Windows
PowerShell 5.1 `Invoke-WebRequest` can fail with no response where curl works;
don't report the site down on that alone.

## 5. Editing safely

There is no local Power Pages runtime and no node to syntax-check, so every
mistake costs a full deploy cycle.

- Edit by pattern, never by line number. `sed -i 'N,Md'` corrupted files three
  times. Use awk start/end markers. Use `@` as the sed delimiter, because `|`
  collides with Liquid pipes.
- Before deploying, check Liquid balance: `if/endif`, `for/endfor`,
  `unless/endunless`, `comment/endcomment`, including `{%- -%}` variants. For
  JS, check braces and re-read the edited region.
- Liquid traps:
  - a Liquid tag inside `{% comment %}` can confuse the parser
  - `2` and `"2"` are not equal; force strings with `| append: ''`
  - on option sets use `.label` / `.value`, never string filters (type error)
- A page is two records: a root page and a language content page. With a
  language enabled, `page.adx_copy` resolves to the **content page**. Content
  put on the root page is never rendered.

## 6. Web API

- `Webapi/<table>/fields = *` is deprecated and now returns 403. List columns
  explicitly.
- A GET without `$select` counts as `*`: same 403. Always send `$select`.
- Site settings use the **logical name** (`Webapi/<prefix>_foo/enabled`); URLs
  use the **entity set name** (`/_api/<prefix>_foos`).
- Choice/lookup columns from a SharePoint virtual table: separators differ
  between ids and labels (`dataverse.md`).
- `Webapi/error/innererror = true` is for dev only. Turn it off before go-live.

## 7. Access control

- Gate pages with **web role + page rule**, never with code in the page. A
  Liquid whitelist only hides the page; `/_api` stays open.
- **Table permissions** guard the Web API, Liquid, lists, and forms alike. A
  permission with no web role grants nothing.
- Scopes filter by relationship (`Global`, `Contact`, `Account`, `Self`), not by
  column value. Anonymous users can only meaningfully get `Global`, which
  means every visitor sees every row.

When a gated page refuses everyone, admins included, check in this order before
touching anything:
1. Is the web role active? (`statecode: 1` = deactivated, satisfies nobody)
2. Does the page rule point at a role that still exists?
3. Is the contact still a member of the role?

**Never:**
- turn off `Authentication/Registration/Enabled` or
  `Authentication/Registration/InvitationEnabled`. This broke every Entra
  sign-in, admin included. Hide Register/Redeem tabs with CSS instead.
- delete a contact that has `adx_identity_username`. That person can no longer
  sign in. It happened to the site owner.

Onboarding (private site, invitation only): grant site access → create contact
→ invitation with that contact + assign web roles → Send Invitation.

- The "Assign To Web Roles" subgrid on an invitation appears only after the
  record is saved.
- Single invitation = one redemption; Group = several (Maximum Redemptions
  Allowed). Redeeming always creates an account.
- The stock Send Invitation workflow may link to `localhost`; fix the URL to the
  site. Emails stuck in "Pending Send": `power-automate.md`, classic workflows.
- A contact recreated after deletion gets a new id. Restoring sign-in needs a
  new `adx_externalidentity` row (provider
  `https://sts.windows.net/<tenant-id>/`, username = Entra object id).

**Anonymous visitors** can only be given `Global` scope, which means every
visitor reads every row. Patterns that avoid that:
- Render forms for anonymous users server side in Liquid, so the browser gets no
  queryable endpoint; the id in the URL routes, it never filters.
- Show the same neutral "not valid" message for a wrong and a retired code, so
  codes cannot be probed.
- Keep drafts in `localStorage` and write to Dataverse once, at submit.

## 8. Data and flows

Dataverse modelling and SharePoint virtual tables: `dataverse.md`. Flows behind
the site (PDF, moving data to Lists, emails): `power-automate.md`.

Two things specific to reading data from a page:
- In Liquid, an option set is a list of `OptionSetValueDrop`: iterate it and
  read `.value` / `.label` (`.first.label` for a single value).
- A query on a virtual table that throws takes the whole page section with it;
  render a neutral message instead of a raw error.

## 9. Several sites in one environment

Site settings, web roles, snippets and page rules of every site in an
environment sit in the same Dataverse tables. A query or change without a site
filter reads or edits the other sites too. Every repo in a shared environment
gets this rule in CLAUDE.md, with its own website record ID:

```markdown
- The environment holds other sites (<names>). Filter Dataverse queries on
  settings, roles and snippets by `_mspp_websiteid_value` = `<record-guid>`.
```

List the sites with `pac pages list -v`; name the sibling sites and their repos
in the README Deployment and operations section so a reader knows what else
lives there.

## 10. Ask before

Changing site settings, web roles, table permissions, or page rules; editing
workflow XAML; deleting any Dataverse record. These can lock people out of a
live site, and the damage is not visible in the repo.

## 11. README and CLAUDE.md on a Power Pages site

README, beyond the standard set in `write-docs` → `references/readme.md`: both
site IDs, site type and sibling sites under Deployment and operations; tables
(logical name, entity set, verified columns) and pages under Architecture;
access control as built (web roles, page rules, table permissions) and the Web
API site settings under Security; known errors under Troubleshooting.

CLAUDE.md, beyond the `write-docs` template: a "Need → Where" table pointing
into README sections, and a "Repo shape" paragraph (directories mirror record
types; where custom work goes; never hand-edit `.portalconfig/`).
