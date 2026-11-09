# Power Automate

Load when a project has flows, or plans one. Data shape for flows that read
form submissions: `dataverse.md`.

## Triggers

- **"When a row is added" fires once per row.** A submission that writes N
  answer rows fires N runs. Trigger on one row per unit of work (a header), or
  run on a recurrence that picks rows with a status column such as
  `Pending`, then set the status when done.

## Expressions and actions

- `Get item` (SharePoint) returns an **object**; `Apply to each` needs an
  **array**. Loop over a list query or a Dataverse "List rows" instead.
- `xpath(xml(...))` fails on SharePoint items: internal column names such as
  `_x0040_odata.type` are not valid XML element names.
- `filter()` is not an expression function; only the **Filter array** action
  exists.

## HTML → PDF

The OneDrive/SharePoint converter ignores external CSS and JavaScript, and
flexbox or grid layouts often do not survive. Inline styles and plain HTML
tables only. Build the PDF from the **saved** record, never from browser state.

## Ownership and connections

- A flow and its connections owned by a personal account stop when that
  account's token expires or the person leaves; an MFA re-prompt shows up as
  an opaque `AADSTS50076`. Move ownership to a service principal before
  go-live.
- The Dataverse connector is **premium**; check licensing before a design
  depends on a Dataverse trigger.

## Classic workflows (Dataverse processes)

- Email sending: a new sender mailbox must be approved by a tenant admin
  ("Test & Enable"). Until then emails sit in "Pending Send" with no error.
- Links built inside a classic workflow's email body are plain text; the editor
  cannot put a dynamic value inside an `href`. Changing that means editing the
  workflow XAML, which is an ask-first change.
- Two workflows with the same name can both fire; check for duplicates when an
  email is sent twice.
