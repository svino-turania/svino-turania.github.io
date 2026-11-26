# The Mappa takes the Comitato’s plan, marks and all

- **Status:** accepted
- **Date:** 2026-11-26
- **Amends:** ADR-0022 (the confirmed rows become the plan’s ten Cantine under
  their house titles, the dots take the plan’s positions, two Casse join them as
  gold marks, the labels over the plan reduce to the piazza, the church and the
  street `Corso Trieste`, and the `Posizione indicativa` caveat and its element
  are removed);
  ADR-0025 (the 3× ceiling now rests on *the plan is a plan, not a survey*, not
  on the positions being placeholders)
- **Related:** ADR-0003, ADR-0014, ADR-0022, ADR-0023, ADR-0024, ADR-0025,
  `GLOSSARY.md` (*Mappa del Borgo*, *Cantina*, *Cassa*), README (*Composition*,
  *Content table*, *Content policy*, *Editor workflow*, *Tests*), `index.html`,
  `assets/css/style.css`, `assets/img/mappa-del-borgo.svg`, `tests/site.test.mjs`

## Context

ADR-0022 gave the chapter a real plan but a provisional register: six rows were
confirmed, the dots were random placeholders and every panel said `Posizione
indicativa`. The Comitato has since published its own plan of the walk, drawn on
the same cadastral frame the asset already serves. It carries ten Cantine with
their house titles and what visitors find inside, two Casse, and the real
positions of both. Against that plan the chapter prints four Cantine too few, one
that has left the walk, and the host families’ names where the Cantine’s own
titles belong.

The plan’s frame is the asset’s frame: the same 273 × 396 m extent, north up, with
no detectable scale or shear. Its positions are therefore percentages of a
drawing already published, not a sketch waiting to be registered. Nothing has to
be re-exported, no palette is touched and no permission is re-checked.

## Decision

**The Mappa carries the Comitato’s plan: its ten Cantine under their house
titles, its two Casse as gold marks, its positions exactly, and no caveat, no
number, no count and no route.**

### The rows

- **Ten Cantine, the plan’s ten.** Each panel’s heading is the Cantina’s house
  title, and its inside line carries what visitors find inside and the provider
  where the Comitato has confirmed one. The host family and the provider are
  different things: the family is never named, the provider is, on the inside
  line.
- **The plan’s spellings stand.** `Casianu`, `Callaru` and `L’ammazzatora` are
  written as the Comitato confirmed them. `7 capocce` is written `Settecapocce`,
  the same name in words, because the chapter carries no digit.
- **One row leaves.** `Li Meroli` — Proloco Turania — is not on the plan and is
  removed; the removal is deliberate, not an omission.
- **The page prints no count and no number.** The chapter’s visible text carries
  no digit: no count of Cantine, no stop number, no scale, no price, no order and
  no route. A reader must not read a sequence into a drawing the Comitato has not
  routed, and the page must commit the Comitato to no figure. The absence of
  numbers is the only honest way to print places without implying an order.

### The Casse

- **Two, as marks and not entries.** Each is a `span`, not a button or a link,
  with an `aria-hidden` mark and a visible `Cassa` label beside it. It opens no
  panel, is not focusable, carries no `data-dialog`, no number and no price, and
  never blooms.
- **Gold and hollow, where the Cantine are bordeaux and filled.** Bordeaux is
  reserved for the Cantine’s dots (ADR-0022), and a Cassa is not a tasting room.
  The gold ring is hollow where a dot is filled, so colour and fill both say *not
  a tasting room*; the label carries the meaning for a colour-blind eye, a grey
  print and a small screen, without a legend.
- **They travel with the drawing.** They live in the drawing layer, so the
  expanded map shows the same plan and they scale with it; they add nothing to
  the script and no ring to the bloom.

### The positions and the leaders

- **The plan’s frame is the asset’s frame.** The positions are percentages of the
  drawing box, north up: the extent is the same 273 × 396 m, measured within
  0.1%, so they are exact, not approximate. No re-export, no palette change and
  no new permission were needed.
- **A dot that must step aside keeps its point by a hairline.** The target is a
  fixed 44 px while the plan scales, so at the narrowest layout two cellars a few
  metres apart share one reachable spot. A displaced ring is joined to its true
  position by a one-pixel `--gold` `span.mappa__leader`, `aria-hidden`, with no
  arrow and no end cap; it is not a route line.
- **The displacement is authored per mark and never computed.** A percentage
  nudge would vanish on a desktop, so the offset is a fixed pixel value on each
  dot, no more than 18 px. A mark that does not step aside has no leader; a mark
  that does keeps one, in the markup, so the no-script render, the print view and
  the expanded map all show the same drawing.

### The labels

- **Three names over the plan: the piazza, the church and `Corso Trieste`.** The
  labels orient a visitor the drawing alone cannot; `Via Turano` leaves them
  because it crowded the top of the plan without adding an orientation the
  Corso does not already give.
- **The piazza’s name sits on the piazza**, in the labels’ own step, told apart
  by the serif register and the ink rather than by a larger body; the street’s
  name sits on its street’s band, to the left along the diagonal it names.
- **The labels stay level and are still HTML text.** No label is rotated, and
  neither the asset nor the script gains a name.

### What the chapter drops

- **No caveat.** `Posizione indicativa` and its element leave every panel, its
  stylesheet rule goes with it, and no other caveat replaces it.
- **The description says what the drawing contains, without a digit and
  without a number of Cantine.** It names the buildings, the streets and the
  piazza, the Cantine in bordeaux and the two Casse in gold — the spec's exact
  sentence — and no other fact.

### The 3× ceiling

- **The range still stops at 3×, for a new reason.** ADR-0025 justified it by the
  dots being placeholders. They no longer are. It stays because the plan is a
  plan, not a survey: 3× reads as *look closer* at the Comitato’s drawing, while a
  deeper range would claim a precision of survey the plan was never made to
  carry. The positions are real; the drawing’s accuracy is still a plan’s.

### The asset and the script

- **Neither changes.** The positions are percentages of the committed SVG, so the
  asset is untouched; the script still binds each `.mappa__dot` to its dialog and
  knows nothing about the Casse. Two executable scripts, the map’s first and the
  counter last, under the 2000-character cap, remain the contract.

## Consequences

- **The chapter is truthful on foot.** A visitor who knows the Borgo can now find
  each Cantina where it stands, and the piazza pair is reachable on a phone
  because the rings step apart and the hairlines say where they really are.
- **The register is the plan’s.** Adding or moving a Cantina follows the plan, not
  a sketch: one dot and one panel of the same id, or two percentages. A change to
  the plan that moves, adds or removes a Cantina is a content change in the
  page’s markup, not a re-export.
- **The host families’ names leave the page and the suite.** They no longer
  appear in a heading, an inside line or a test.
- **The no-digit rule is unchanged and now does real work.** It is why
  `Settecapocce` is written out and why the plan’s own numbers stay in the plan.
- **ADR-0022 and ADR-0025 are amended, not superseded.** The plan, the palette,
  the dialogs, the fallbacks and the script contract stand; the rows, the Casse
  and the caveat are replaced, and the 3× reason moves from placeholders to the
  nature of a plan.
- **The static guards pin the new register.** The ten rows are asserted verbatim,
  the old host names absent, the ten dots at their percentages, the two Casse as
  non-interactive marks with their labels and no panel, the three labels over the
  plan in order with the piazza in the labels’ step, `Posizione indicativa`
  absent, the description exact, and every leader paired with a displaced dot
  within the 18 px limit. The no-digit, no-route, no-list and two-script guards
  pass unchanged.

## Considered options

- **Keep the six rows until the Comitato’s tracker reconciles.** Rejected: the
  page would print names and places the plan has replaced, and the host families
  it already names wrongly.
- **Keep `Posizione indicativa` as a hedge.** Rejected: the positions are the
  plan’s, measured on the same frame; a caveat would now be false.
- **Bake the marks and the numbers into the SVG.** Rejected: the asset is an
  image with a baked palette and no text, the dots are HTML buttons and the
  chapter carries no digit; a re-export would put both beyond the page’s tests.
- **Draw the Casse in bordeaux too.** Rejected: bordeaux is the Cantine’s alone,
  and a gold ring at the till must never be mistakable for a dot that opens a
  tasting room.
- **Distinguish the Casse by colour alone.** Rejected: colour fails a colour-blind
  eye and a grey print; the hollow ring and the word `Cassa` carry the meaning
  without a legend.
- **Compute the displacement in script or as a percentage.** Rejected: the target
  is fixed in pixels while the plan scales, so a percentage nudge vanishes on a
  desktop; the script contract stays small and the positions stay markup.
- **Keep the 3× ceiling because the dots are placeholders.** Rejected: they are no
  longer placeholders. The ceiling is kept, but for the plan’s nature, not the
  register’s state.
