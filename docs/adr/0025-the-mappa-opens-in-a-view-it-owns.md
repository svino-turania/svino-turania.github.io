# The Mappa opens in a view it owns, and pans and zooms

- **Status:** accepted
- **Date:** 2026-11-26
- **Amends:** ADR-0022 (the chapter gains one control and the map a second,
  transient surface; "one screen-high object at every width" now describes the
  chapter, not every view of the map); ADR-0024 (the dots are also the expanded
  map's hotspots, and the chapter and the view each gain controls)
- **Amended by:** ADR-0026 (the 3× ceiling now rests on *the plan is a plan, not
  a survey*, not on the positions being placeholders); ADR-0028 (*Pinch stays
  the browser's* no longer holds: the viewport refuses pinch-zoom on the whole
  page, and the open view keeps its own declaration)
- **Related:** ADR-0003, ADR-0014, ADR-0015, ADR-0019, ADR-0022, ADR-0023,
  ADR-0024, `GLOSSARY.md` (*Mappa del Borgo*, *Cantina*), README
  (*Composition*, *Motion*, *Tests*), `index.html`, `assets/css/style.css`,
  `tests/site.test.mjs`

## Context

The Mappa del Borgo is one plan, north-up and in scale, with its streets, the
piazza and the church as HTML labels and the six confirmed Cantine as 44 px dot
buttons over an image. On the phone and tablet it uses the chapter's measure; from
the 64 rem composition it is capped at 40 rem and centred. It is one
screen-high object in a page that is one scroll story (ADR-0015, ADR-0019).

The owner asked to be able to pan and zoom the map. The reason is the job the
plan cannot do at its layout size: on a phone the measure leaves the labels
small and the six dots packed onto a plan a thumb can cover. The plan cannot
simply grow. A taller in-flow drawing pushes the Programma three screens down,
breaks the chapter's one-object rule and the 40 rem cap (ADR-0022), and gives
back no way to see the whole plan at once.

A second surface is therefore unavoidable, and everything the map already
stands for follows it there. The plan stays north-up and in scale: zoom is
uniform on both axes, with no rotation, stretch or skew. The dots are still
placeholders and every panel still says `Posizione indicativa`, so a deep zoom
would magnify a guess; the range stops short of that. Bordeaux stays reserved
for the Cantine's dots. The page has refused chrome before — ADR-0021 rejected a
zoom chrome, ADR-0024 rejected even a pause button — so the new controls need a
record, not a quiet exception. And the page is static: no build step (ADR-0003),
CSS-only motion, two executable scripts, a static test suite that pins the map.

The decisions below were reached by stress-testing each option against those
constraints; the alternatives that lost are in **Considered options**.

## Decision

**The story keeps the plan it has and gains one control that opens it in a
near-full-viewport native dialog, where the plan pans with the browser's own
scrolling and zooms uniformly to at most 3×, with three square controls.**

### The chapter gains one control

- **`Ingrandisci la Mappa`** is a visible-text button below the plan, inside
  the chapter's figure and after the drawing. It is the only control the
  chapter adds. It carries no digit, is not a paragraph, is not a list or
  disclosure, and sits outside the drawing's marks.
- **Without JavaScript it is not shown.** The `<noscript>` stylesheet hides it
  with the dead dots and the close controls. The chapter then renders exactly
  what it renders today, and the six Cantina entries remain in flow under the
  plan.

### The map opens in a view it owns

- **A native `<dialog>` of its own**, class `mappa__map`, not `mappa__dialog`:
  the six Cantina panels stay the only `mappa__dialog` elements, with their
  count and order unchanged. In the served markup the map dialog holds only its
  own chrome — the visible `<h3>La Mappa del Borgo</h3>`, the `Chiudi` control
  and the three zoom squares — and no drawing; it lives after the chapter,
  beside the script.
- **It fills nearly the whole viewport**, sized from the viewport, not from
  media queries: the plan gets almost all of the screen, on the page's paper.
  It adds no breakpoint and no new `@media` block.
- **It is named and closed like the panels.** A visible `<h3>La Mappa del
  Borgo</h3>` names it, `Chiudi` closes it, Esc and a click outside close it,
  and focus returns to `Ingrandisci la Mappa`. Paper, ink and a gold hairline;
  no shadow, no rounded corner, no new motion.
- **A click outside is a pointer click.** The close-on-click guard ignores a
  click whose `detail` is 0 — the shape a keyboard-generated click has — so a
  panel or the map is dismissed only by a real pointer click outside it, never
  by the Enter or Space that opened it.
- **One object, moved rather than copied.** Opening moves the chapter's
  `.mappa__drawing` — the plan image, the four labels, the north mark and the
  six dots — into the dialog; closing returns it to its figure. The served
  markup therefore still holds one plan, one `Piazza Umberto I`, one set of
  labels and one set of dots, and the static guards keep their meaning. The
  expand control stays in the chapter and is not moved.
- **The moved plan is already on its way.** Opening sets the plan image's
  `loading` to `eager`, so a drawing the reader never scrolled into view still
  loads as it is moved into the dialog and never opens blank. It is the same
  URL the chapter already serves: no new request and no GoatCounter event.
- **The view is fresh each time.** Closing the map discards its place and its
  zoom; reopening starts at fit. The view is kept only for the round-trip into
  a Cantina panel.

### Panning is the browser's scrolling

- **The drawing becomes the scroll viewport.** Inside the dialog,
  `.mappa__drawing` scrolls its content instead of clipping it: one finger on
  touch, the wheel — which is how a trackpad reports two fingers — the arrow
  keys when it has focus, and the scrollbar. Panning is never simulated by the
  script, so every input device has a native way to move the plan and no key
  handler is needed. The wheel is not claimed for the zoom: the same gesture
  scrolls the page over the chapter, and claiming it would leave a trackpad
  reader no way to move a zoomed plan. Ctrl+wheel, the shape a trackpad pinch
  takes, stays the browser's page zoom.
- **The scrollbars stay visible and quiet**: thin, in the page's ink, so a
  desktop reader can see that the plan continues past the frame. Hiding them
  was rejected as removing the only cue.
- **The page behind is inert.** The dialog owns the wheel and the finger while
  it is open, which is correct there and is why the view exists: in the story,
  the same capture would have been a three-screen scroll trap.

### Zoom is one picture, uniformly scaled

- **A single layer scales**, wrapping the plan image, the labels and the dots
  together, with the CSS `zoom` property. The plan's labels, dots and hit
  targets grow with the drawing, as they should: it is one picture, not a
  canvas with widgets pinned to it.
- **Stops at 1, 1.5, 2 and 3×**, where 1 is the plan fitting the view. `+` and
  `−` step between them; `+` disables at 3×, while `−` and the reset disable at
  1×. The range stops at 3× because the dots are placeholders: 3× reads as
  *look closer*, deeper starts to read as *surveyed detail*.
- **A double-click zooms toward the pointer**; the buttons zoom toward the
  centre of the frame. Each input keeps steady the thing the visitor is looking
  at. The spec listed the wheel on both sides — among the panning inputs and
  among the pointer-anchored zooms — and the wheel follows the panning list: a
  surface that both scrolls and zooms on the same gesture can do neither
  predictably.
- **Three square controls sit at the frame's bottom right** — `+`, `−`, and a
  reset returning to fit — in paper squares with hairline rules, ink glyphs, no
  shadow and no rounding, each a 44 px target with an Italian accessible name
  (`Ingrandisci`, `Riduci`, `Vista intera`). They belong to the frame, not to
  the drawing: on a phone at 1× the plan fills the frame and they sit over its
  lower right, while on a wide desktop the portrait plan is centred and leaves
  cream at the sides, so the squares sit on the cream beside it. Either way
  they are opaque paper, never mistakable for a mark of the plan.
- **Zoom jumps.** No transition, no easing: the change is a tool's change, not
  a flourish, and it keeps interaction-driven motion out of the page entirely.

### Pinch stays the browser's

- **The map does not claim pinch.** `touch-action` is left alone, so two
  fingers over the map zoom the *page*, which magnifies the plan along with
  everything else. The script has no wheel handler at all, so the pinch a
  trackpad reports as Ctrl+wheel stays the browser's page zoom too. The map's
  own zoom levels are the controls and the double-click. Claiming pinch
  would take page zoom away from every reader over the largest chapter of the
  page, and a hand-written pinch engine is the wrong first gesture code for
  this site.

### The Cantina panel opens above the map

- **A dot inside the map opens its Cantina panel over it**, as a second native
  modal. Esc closes the topmost surface only, closing the panel returns to the
  map with its view intact, and the bloom pauses behind the panel, wherever the
  dots live. Inside the map the dots themselves keep pulsing: there they are
  the surface's own hotspots.
- **The panel is unchanged**: same six dialogs, same heading, same inside line,
  same `Posizione indicativa`, same `Chiudi`.

### The fallbacks and the script

- **Without JavaScript** the chapter is today's chapter: the plan, its labels,
  the dots, the six panels in flow under the plan. The map dialog keeps only its
  own chrome and no drawing, and the expand control is not shown, so the dialog
  is never opened.
- **On paper** the closed chapter prints as it always has: the plan and the six
  entries under it. The print rule describes that normal state and adds no
  second layout. If a reader prints while the expanded view is open, the
  browser prints the open view, with the moved plan in the dialog rather than
  in the chapter; CSS cannot move the drawing back.
- **The map's script remains the page's one inline map script**, bound to the
  same 2000-character cap (1,812 characters at this record), now also opening
  and closing the map dialog, moving the drawing, and stepping the zoom. No
  third script, no shipped `.js` file, no `on*` attribute, and still no key
  handling or focus stealing: Esc, the focus trap and the focus return are the
  browser's. If the binding cannot fit the cap, the cap and this record change
  together; it does not grow silently.
- **No new request and no new analytics.** The expanded map reuses the
  chapter's own SVG; the page's external requests and GoatCounter events are
  unchanged.

## Consequences

- **The map now has two surfaces and the chapter one extra control.** ADR-0022's
  "one screen-high object at every width" describes the chapter; the expanded
  view is a transient object that owns the screen while it is open, and its
  three zoom squares belong to that surface. The README's motion section, which
  said the dots were "the page's only other controls", and its composition
  section move with the page.
- **The static guards change narrowly and deliberately.** The six
  `mappa__dialog` panels, their ids and their order are untouched; the map
  dialog is a different class. New guards pin: the expand control (its text, no
  digit, hidden without JavaScript); the map dialog's presence, name and close
  control; the three zoom controls, their accessible names and their disabled
  ends; the single scaled layer; the drawing's scrolling viewport; and the
  absence of any new `@media` block, shadow, rounding and animation. The
  `<noscript>` rule must hide the expand control, and a test says so.
- **The chapter reflows behind the scrim.** While the map is open its drawing is
  out of the page, so the column shortens by the plan's height and returns on
  close, behind an inert background. Nothing a visitor can see or reach.
- **The bloom pauses only behind a panel.** Inside the expanded map the dots
  keep pulsing; because a panel opened from a dot stacks over that dialog
  rather than nesting inside it, the pause answers to the page and covers
  either surface. It remains a property of the animation, not a script.
- **Pinch magnifies the page, not the plan.** On a phone, a reader who pinches
  over the map enlarges the whole surface through the browser, not the plan in
  place. The map's own levels are the buttons and the double-click.
- **The plan remains indicative under magnification.** The dots stay
  placeholders, every panel keeps `Posizione indicativa`, and the 3× ceiling is
  deliberately below the range that would suggest surveyed detail.
- **The map still claims no route, no count and no order.** Zooming changes the
  view, never the drawing: there is no route line, no stop number and no
  figure anywhere on the plan.
- **Zoom level is not addressable.** The view is not in the URL and not in
  storage: it exists to survive the Cantina round-trip, not to become a second
  way to address the Mappa.
- **`zoom` is a modern property.** Browsers without it leave the plan at fit;
  the controls simply do nothing to the scale, and panning still works.

## Considered options

- **Zoom in place in the chapter.** Rejected: the plan is already one
  screen-high, so a zoomed plan must scroll, and a scroll box inside a
  one-scroll story takes the wheel and the finger for up to three screens
  before the page resumes.
- **Full gesture capture in place.** Rejected: it buys in-place pinch at the
  price of page zoom over the chapter, and it puts the page's only gesture
  engine on the surface a reader must scroll past.
- **A transform with pointer capture instead of scrolling.** Rejected: panning
  would stop being native, keyboard panning would need the key handlers the
  script contract forbids, and every edge case would be hand-built.
- **The wheel claimed for the zoom.** Rejected: a trackpad reports two-finger
  scrolling as the wheel, so claiming it would leave a zoomed plan with no
  native pan on the desktop the view mainly serves; the double-click keeps the
  pointer-anchored zoom and the wheel moves the plan as it moves the page.
- **Clone the drawing into the dialog.** Rejected: the labels and dots would
  exist twice, the handlers would have to be rebound, and the served markup
  would carry two plans for assistive technology to reconcile.
- **An embedded slippy map.** Still rejected for ADR-0022's reasons: a
  library, a second runtime host, runtime data, consent questions and a
  cartographic chrome.
- **A bigger, taller plan in the chapter.** Rejected: it breaks the 40 rem cap,
  the one-screen chapter and the page's single scroll story, and still cannot
  show both the whole plan and its detail.
- **A deeper stop beyond 3× (4× and beyond).** Rejected: the positions are not
  the Comitato's sketch, and deeper magnification would claim precision the
  plan does not have.
- **Hidden scrollbars.** Rejected: they are the only desktop sign that the
  plan continues past the frame.
- **A pause control for the bloom, added with the new chrome.** Still rejected:
  the platform's reduced-motion setting already answers it, and the new
  controls exist for the plan, not for the ring.
