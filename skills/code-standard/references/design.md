# Design

Read for a new page, a redesign, or "bikin cantik". Priority order holds: maintenance,
performance, security.

## Before drawing

- Ask first when the request only says "desain": mockup only, or implement?
- Name the page's one job and its user in one line. A tool people work in all day is
  dense and calm; a page people visit once may breathe more.
- Design every state, not just the full table: loading, empty, nothing found, error,
  pending changes, waiting for a background effect, no permission.

## Direction

Copied in (not loaded from outside) so the guidance can't change under us:

- Ground the look in the subject and its users: a router-monitoring tool for admins
  reads differently from a page for guests. Pick colors and wording from that world.
- Avoid the tells of a generated page: one accented word in a headline, all-caps labels
  everywhere, labels above content that say nothing, numbered markers (01/02/03) on
  things that are not a sequence, a big-number-plus-gradient "hero" by default, the
  cream-and-terracotta or black-and-acid-green palettes.
- Structure carries information: borders, dividers, numbering and labels exist only
  when they tell the reader something.
- One deliberate type scale; one or two families at most, clearly different if two.
  Line length under ~80 characters for prose.
- Motion: none on its own; only to answer an action (open, expand, confirm) and show
  what changed.
- **This standard wins where design advice clashes**: system or self-hosted fonts, never
  a font CDN; a working tool opens on its data, not on a hero.

## Rules

- A control MUST do what its label says in plain words ("Ends with" = ends with). A
  domain-specific behaviour (what the matcher hits) gets its own label or is folded in,
  never hidden behind a common word.
- One accent color for primary actions and the selected state; one warning color for
  pending; one error color. Everything else neutral.
- Hierarchy by weight and size, not by many colors. Uppercase only for small table
  headers.
- Dense defaults for tools: 13px body, ~28px rows, 30px controls, one toolbar line,
  details in tooltips.
- Destructive or shared changes: stage them visibly (highlight), then one confirm
  dialog that lists them and asks for a reason when the change is audited.
- Labels say the outcome in plain words ("Waiting for the router to fetch the new
  list"), not the mechanism.
- Check both themes and phone width before calling it done.

## Mockup vs implementation

- Mockup: a single static HTML (or an artifact) with realistic data and every state;
  no backend.
- Implementation: follows `html.md`, `css.md`, `js.md`; reuse the existing tokens and
  components before adding new ones.

## Based on (copied, not linked; don't fetch these while using the skill)

- WCAG 2.2 (contrast, focus), WAI-ARIA Authoring Practices
- Anthropic `frontend-design` skill (direction and "generated look" tells), read 2026-11-05
