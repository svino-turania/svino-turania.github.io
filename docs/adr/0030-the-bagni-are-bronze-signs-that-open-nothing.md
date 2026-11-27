# The Bagni are bronze signs that open nothing

- **Status:** accepted
- **Date:** 2026-11-27
- **Amends:** ADR-0026 (the register gains a third class, facility marks; the
  dots, the Casse, the labels, the dialogs, the positions and the script
  contract stand)
- **Related:** ADR-0022, ADR-0023, ADR-0024, ADR-0025, ADR-0026, ADR-0027,
  `GLOSSARY.md` (*Bagno*, *Mappa del Borgo*), README (*Composition*, *Content
  table*, *Editor workflow*, *Tests*), `index.html`, `assets/css/style.css`,
  `tests/site.test.mjs`, `docs/licenses/Apache-2.0.txt`

## Context

The Comitato's plan now carries two Bagni beside the ten Cantine, the piazzale
and the two Casse. The Mappa publishes the walk: it sends a visitor to the
plan, and then leaves its two most practical stops unmarked. A visitor needs a
toilet without leaving the walk or asking at a Cantina; a visitor who uses a
wheelchair needs one they can enter.

The two points were measured from the Comitato's plan against the same
drawing frame the twelve existing marks calibrate: dot 13, `Bagno`, at
`50.78%` / `47.44%`; dot 14, `Bagno accessibile`, at `72.33%` / `82.53%`,
north up, percentages of the drawing box, within `0.02%` of the plan. The plan
asset is neither re-exported nor edited.

## Decision

**The Mappa gains a third class of mark: facility signs. Two Bagni stand on the
plan as small bronze pictograms. They open nothing, take no focus, carry no
dialog, no number and no visible word, and add no count.**

### A third class of mark

- **A facility mark is a sign, not an entry.** It is a `span`, not a button or
  a link: no `data-dialog`, no `aria-controls`, no `tabindex` and no
  focusable child. It opens no panel and enters neither the entries nor the
  Casse.
- **Colour stays spoken for.** Bordeaux is the entries' alone and gold the
  Casse's alone; a facility mark is `--ink-muted` — bronze — ring and filled
  pictogram both. Shape and weight, not colour, separate it from the bordeaux
  dots and the gold rings, so a colour-blind visitor reads it too.
- **It carries a name and no word.** The span is `role="img"` with
  `aria-label="Bagno"` or `"Bagno accessibile"`; the inner SVG is decorative
  (`aria-hidden="true"`, `focusable="false"`) and drawn in `currentColor`. No
  visible text joins it, no caption and no legend.
- **It never moves.** No bloom, no transition, no focus ring: the page's one
  ambient loop stays the entries' bloom.

### The two marks

- **`Bagno` at the church, `Bagno accessibile` at the south.** The names are in
  sentence case. The Comitato's legend writes `Bagno Disabili`; the page names
  the facility's accessibility, not the person, and the wheelchair symbol
  carries it. `WC` is not the term.
- **The pictograms are the signs the world already uses.** The two-figure WC
  and the ISO wheelchair are Material Icons' `wc` and `accessible` (Google,
  Apache License 2.0 — `docs/licenses/Apache-2.0.txt`), inlined so the page
  requests nothing and changed in colour alone: a 24-unit drawing filled with
  `currentColor`.
- **The mark is a circle with the pictogram inside it.** A 22 px bronze ring,
  2 px of air and the 16 px glyph, so the sign reads as the sign a visitor
  knows and not as a glyph floating on the plan; the hairline then has a
  border to stop on. The circle is a ring, not a disc: the filled marks stay
  the entries' alone, and the plan shows through both sign and ground. Circle
  and pictogram scale together with the drawing — 66 px at 3×.
- **Bronze with a cream halo.** `--ink-muted` reads 6.30:1 on cream and 3.46:1
  on the building fill, above the 3:1 non-text floor; a drop shadow of
  `--surface` lifts its edges on both the tan buildings and the cream streets.
  The halo is the labels' `text-shadow` idiom applied to the mark: a glow of
  the page's own paper, casting nothing. The page's one cast shadow remains the
  cartoline's (ADR-0020).

### The church sign and its hairline

- **The sign steps aside; its point stays recorded.** The `Bagno`'s plan point
  falls inside the `la chiesa` text box, so the sign takes a fixed `+17` /
  `−17` px offset — right and up — and a short bronze hairline joins it back
  to the point and stops on the circle's border, as the gold hairline joins a
  stepped-aside dot. The three extra pixels are the circle's greater reach: a
  radius of 11 px where the bare sign's half-width was 8, so the circle's left
  and lower edges stand where the bare mark's stood. `--x` and `--y` still
  carry the plan's true point.
- **The hairline is the facility mark's, and it is bronze.** It takes its
  length and direction from the same `--sign-x` / `--sign-y` the sign already
  carries and its colour from the mark's `currentColor`, so it is the sign's
  own ink, not a gold thread borrowed from the Casse. The sign and its
  hairline paint above the labels: the point sits inside `la chiesa`'s box,
  and the label's halo would otherwise swallow the line.
- **The rule this records.** An entry's dot and a Cassa stand at the plan's
  positions; a facility mark stands on the building it serves, clear of the
  labels, and any displacement is joined back to the true point by its own
  hairline. The `Bagno accessibile` sits at its point with no offset and no
  hairline. The three place labels are unchanged.
- **The clearance is measured.** At the narrowest chapter — a 280 px plan — the
  17 px offset clears the label by about 2.4 px and the nearest entry ring,
  Casianu, by 2.83 px of bounding box; the gap grows with the drawing. The
  extra three pixels ride on the offset, so the circle stands no closer than
  the bare sign did and both figures hold. The suite pins 2.83 px and the
  growth.

### The layer and the drawing

- **Both marks live in the drawing layer**, after the place labels and before
  the entries, so the entries paint above them and the signs travel and scale
  with the plan at 1.5×, 2× and 3×.
- **They add nothing to the script.** The marks carry no behaviour; the script
  still binds only `.mappa__dot`, and the two-script contract is unchanged.

### The fallbacks

- **Without JavaScript the marks stay.** The fallback hides the dead dot
  controls, `Chiudi` and the Cassa ring, not the Bagni.
- **On paper the marks print with the plan** and keep their colour
  (`print-color-adjust: exact`); no print rule hides them.
- **The description names them.** The plan's `alt` gains `e i due bagni in
  bronzo`, with `due` in words; it still carries no digit, no piazza name, no
  count and no route.

### The page's invariants stand

No digit anywhere in the chapter, no count, no route, no list, no new request
and no new analytics event; the two-script contract is unchanged. The page
commits the Comitato to no provider, price, time or opening hours for a Bagno.

## Consequences

- **The plan now answers the practical question.** A visitor finds both toilets
  without asking, and a visitor who uses a wheelchair sees which one is theirs,
  on screen, on paper and without JavaScript.
- **The register gains a rule of placement.** An entry stands at its measured
  point; a facility sign stands on the building it serves, and where it must
  step aside so a label stays readable, a bronze hairline joins it back to the
  point. Adding or moving a Bagno is one span: its two percentages and, where
  needed, its two pixel offsets.
- **The suite pins the marks.** It asserts the two spans as non-controls at
  their percentages and offsets, their accessible names, the decorative
  pictograms filled with `currentColor`, the bronze circles and the halo, the
  church sign's bronze hairline back to its point and stopping on the circle's
  border, and no hairline on the accessible one, their presence without
  JavaScript and in print, and the church sign's clearance from the nearest
  ring at 280 px. The no-digit, no-route, no-list, no-count and two-script
  guards pass unchanged.
- **The glyphs carry their licence.** Material Icons is Apache 2.0: the source
  is named in a comment above the marks, and the licence text ships at
  `docs/licenses/Apache-2.0.txt`.
- **The glossary and README follow.** `Bagno` is a term; the `Mappa del Borgo`
  entry names the third class; the Composition, Content table, Editor workflow
  and Tests sections describe the signs.

## Considered options

- **Make the Bagni entries with panels.** Rejected: the Comitato confirmed
  places, not a provider, a price or opening hours; a panel would invent what
  the page's no-count rule refuses.
- **Give the marks a visible word or a legend.** Rejected: the plan stays quiet,
  and the pictograms carry the meaning by shape for a colour-blind reader.
- **Leave the pictograms bare.** Tried first and set aside: a glyph alone
  reads as a symbol floating on the plan, and the hairline had no edge to stop
  on and ran under it. The circle makes the mark a sign and gives the hairline
  its end.
- **Leave the church sign with no hairline.** Tried first and set aside: without
  the hairline the displaced sign reads as a mark on the building rather than
  as the toilet at a measured point, and the two Bagni no longer use the same
  idiom as the stepped-aside dots. The hairline is bronze and paints above the
  label, so the label's halo does not swallow it.
- **Move or drop the `la chiesa` label.** Rejected for this change: the label
  identifies the church. Dropping it remains the documented fallback if the
  churchyard looks too busy in review, and would be a separate change.
- **Draw the pictograms by hand.** Tried and rejected: the first hand-drawn
  pair read as this page's drawing rather than as the signs a visitor already
  knows. The canonical glyphs are recognised before they are read, and using
  them is less code than redrawing them.
- **Draw the Bagni into the SVG asset.** Rejected: the asset is generated
  outside the repository and must not be hand-edited; the marks are page
  content and belong to the markup the suite reads.
- **Use bordeaux or gold for the marks.** Rejected: those colours already say
  *entry* and *Cassa*. Bronze, plus a shape unlike both, says *facility*.
