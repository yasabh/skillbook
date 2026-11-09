# Dataverse

Load when a project stores data in Dataverse (Power Pages, model-driven apps,
flows). Power Pages specifics: `power-pages.md`; flows: `power-automate.md`.

## Modelling

- **Text columns default to 100 characters.** A column that holds a list of ids
  fills up after two or three; size it for the worst case (up to 4000 for a
  single line).
- **Form answers: one row per answer**, with the question text copied in at
  submit (plus order and section). Adding a question never changes a schema,
  and a submission stays readable after the source question is reworded or
  removed. Add a header row per submission for status fields, so downstream
  flows have one row to pick up (`power-automate.md`).
- **Store ids, not labels**, for choices that come from elsewhere: a rename at
  the source does not break saved records.
- **Prefer exclusions over selections** when a set grows over time (a template
  that stores "everything in these categories except X" picks up new items
  automatically).
- A primary-name column that holds a client-generated id (e.g.
  `crypto.randomUUID()`) groups rows of one submission without a lookup.

## SharePoint virtual tables

- The schema is **frozen at creation**. New list columns, changed types and new
  Choice values are not picked up. One row holding a Choice value outside the
  frozen set fails the **entire** query.
- **Not every column is readable** through the SharePoint provider. Before
  building on a new column, read it once through the virtual table.
- **Choice columns cannot be sorted on**: the query throws. Sort on a numeric
  column (e.g. display order) and group by the choice column in code.
- Choice and lookup columns arrive as multi-select option sets: via the Web API
  ids are comma separated (`"7,18"`) and the formatted value is semicolon
  separated (`"A; B"`); split on both.
- Writing through a virtual table into a list has never been proven to work.
  Write to native Dataverse and move data to the list with a flow.

## Querying the Web API directly

- Token: `az account get-access-token --resource https://<org>.crm4.dynamics.com`.
- Always `$select`; filter server side; check whether the table is shared by
  several apps or sites before reading a count as "ours" (Power Pages sites:
  `power-pages.md` §9).
- Ids of records that are recreated (contacts in particular) change; query
  them each time, never copy one into docs or memory.
