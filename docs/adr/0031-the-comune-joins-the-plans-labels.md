# The comune joins the plan's labels

- **Status:** accepted
- **Date:** 2026-11-27
- **Amends:** ADR-0022 (the comune is labelled; the plan, the labels'
  registers, the dots, the dialogs, the positions and the script contract
  stand); ADR-0030 (the plan carries four place labels, not three; the Bagni's
  register, circles, offsets and hairline stand)
- **Related:** ADR-0021, `GLOSSARY.md` (*Mappa del Borgo*, *Bagno*), README
  (*Composition*, *Editor workflow*, *Tests*), `index.html`,
  `assets/css/style.css`, `tests/site.test.mjs`

## Context

ADR-0022 labels the plan's piazza, church and verified street, and leaves the
comune unlabelled. ADR-0030 then places the `Bagno accessibile` on the
comune's building at the plan's south. A visitor who needs the accessible
toilet now finds the wheelchair symbol, but not the building it serves: the
mark names the facility to a screen reader and says nothing about where it
stands, and the chapter's prose names no building at all.

The building is on the Comitato's plan, drawn in the cadastral extract like
every other; nothing about the label is a guess. The page already carries
place labels as HTML text over the drawing, so the comune needs a span, not a
new idiom.

## Decision

**`il comune` joins the plan's place labels.** It is an HTML
`span.mappa__label` like `la chiesa`, set at `87%` / `82.4%` of the drawing
box — on the building's east half, immediately right of the accessible Bagno's
circle.

- **The register is the church's.** Sans, `--step--1`, `--ink-muted`, set
  level with a cream halo. The comune is a place name like the church, not the
  piazza's serif anchor and not a street's spaced capitals.
- **The label is content, not a mark.** It opens nothing, takes no focus,
  carries no number and no count, and is neither an entry nor a Cassa. The
  chapter's no-digit, no-route, no-list and no-count guards stand unchanged.
- **The position keeps the circle clear.** At the narrowest 280 px plan the
  label's box starts 3.66 px right of the 22 px bronze circle, and the gap
  grows with the drawing. The text sits on the building's east half and runs
  25 px past its east edge at 280 px, 10 px inside the drawing's right edge;
  at 200% text zoom it still fits inside the drawing.
- **The word appears once.** The drawing carries it; the prose does not use it,
  as the prose does not use `la chiesa`.

## Consequences

- **The plan answers which building that is.** A visitor who needs the
  accessible toilet sees the wheelchair symbol on a named building, without
  leaving the walk or asking at a Cantina.
- **The suite pins the label.** It asserts `il comune` once among the place
  labels and in the plain register; the label counts become four place labels
  and six labels in all. The no-digit, no-route, no-list, no-count and
  two-script guards pass unchanged.
- **The glossary and README follow.** *Mappa del Borgo* names the comune among
  the labels, *Bagno* names the building the accessible sign stands on, and
  the Composition and Editor workflow sections describe the fourth label.

## Considered options

- **Centre the label on the building or set it on its west end.** Rejected:
  the 22 px bronze circle of the accessible Bagno takes the building's west
  end, and a 53 px label has no room there at the 280 px plan; the text would
  touch the circle or lose its foot on the building.
- **Put the label below the building.** Tried and set aside: it lands on the
  smaller buildings to the south and reads as their label, not the rectangle's.
- **Keep the label above the building.** Tried and set aside: at the desktop
  width the rectangle's top edge slopes away, and the text floats in the
  street north of the building it names.
- **Capitalise it `Comune` or set it in the piazza's register.** Rejected: it
  is a common noun like `la chiesa`, lower-case and in the sans register; the
  piazza keeps the page's one serif place name.
- **Leave the comune unlabelled,** as ADR-0022 records. Rejected: the
  accessible toilet is the one facility whose building a visitor must
  identify, and the plain name costs one span.
