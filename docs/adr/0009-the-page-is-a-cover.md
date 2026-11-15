# The page is a cover

- **Status:** accepted
- **Date:** 2026-11-15
- **Supersedes in part:** ADR-0007 (the one column at every width, the 48 rem
  measure and the no-threshold rule; the date's single geometry as a dark
  field), ADR-0008 (the column-bound 4:5 hero, the cream wash and the
  top-aligned masthead in bordeaux), and ADR-0006's second dark surface
  (already superseded in part by ADR-0007)
- **Related:** ADR-0002, ADR-0003, ADR-0004, ADR-0005, README (*Composition*,
  *Motion*, *Preview locally*, *Tests*, *Derived assets*),
  `assets/css/style.css`, `tests/site.test.mjs`

## Context

ADR-0007 made the page one 48 rem column at every width. It answered a real
problem — two compositions and two sets of tests — but on a desktop it spends
most of the viewport on empty cream, and the page reads as a phone column
centred in a wide window.

ADR-0008 put the masthead on the opening photograph behind a 0.62 cream wash.
The wash was chosen because bordeaux type needed a light ground to clear AA;
the effect is a pale veil over the event's defining image, which becomes the
least visible thing on the page. ADR-0006 had given the date a second bordeaux
surface, so the page also had two dark fields and a flat tonal rhythm.

The brief is to redesign the page while keeping the palette exactly as it is.
The design database's own Brewery/Winery profile points the same way: burgundy
and gold, a craft aesthetic, storytelling-driven and hero-centric.

## Decision

The page is a cover.

- **The opening photograph is full-bleed at every width.** It is the page's
  first surface, not a backdrop inside a column.
- **The masthead is set on the photograph, at its foot, inside the shell.** The
  signature, the `II EDIZIONE` lockup and the subtitle are cream on a bordeaux
  scrim that rises from the bottom edge. The scrim is anchored to the
  masthead, not to the hero: at 1024 px the hero is shorter than twice the
  masthead, and a hero-relative fade would leave the top of the signature on
  bare photograph. The photograph is fully visible above the scrim.
- **The scrim is measured, not assumed.** On the shipped 1033 × 1291 crop, the
  brightest pixel in the band the masthead occupies is (252, 234, 217),
  relative luminance 0.8555. Composited on a pure-white pixel at the scrim's
  weakest stop (0.84), cream reads 5.82:1 and cream-light 6.23:1; at 0.86 they
  read 6.90:1 and 7.37:1. The subtitle therefore reads `--cream-light`, not the
  strong surface's `--gold-light`: gold-light needs a 0.92 scrim to clear AA
  (4.64:1) and would make the cover near opaque. The measured values sit beside
  the rule, as the strong surface's ratios sit beside the palette.
- **The date is a horizontal band on cream.** It runs edge to edge between two
  gold hairlines, with the tracked weekday, the day numeral, the month and
  `DALLE ORE` with the time. It is no longer a dark surface. The closing band is
  the page's only strong surface.
- **The Cantina photograph is full-bleed at every width**, keeps the 303:191
  print crop and its single torn lower edge, and caps its height at 42 rem so a
  1920 px viewport does not get a 1210 px-tall band.
- **One desktop composition, from 64 rem.** The shell is 76 rem; the hero
  widens to 3:2 and the signature caps at 36 rem so the scrim leaves a third of
  the photograph visible; the date is one line; the prose sets in two
  columns of `22rem`; the closing band puts the facts left and the actions
  right, with the colophon on a full-width tail.
- **The shell inset is one computed value**, `--shell-pad: max(var(--gutter),
  calc((100% - var(--shell)) / 2))`, applied by each full-bleed section as its
  inline padding. No wrapper element is added and no `100vw` is used, so 320 px
  cannot scroll.
- **The palette and the semantic roles do not move.** Two roles are added for
  the cover, `--on-photo` (cream) and `--on-photo-soft` (cream-light); both are
  aliases of existing primitives. `--strong` remains the bordeaux vocabulary,
  read by the footer and by the scrim.

The constraints do not move: no JavaScript, no build step, no third-party
hosts, the self-hosted OFL fonts, the signature as outlines, no new copy the
Comitato has not approved, no new image asset, and exactly one torn edge.

## Consequences

- **The suite inverts where the composition inverted.** The single-layout
  helper becomes "exactly one 64 rem block"; the strong surface appears once,
  on `.band`; the date reads the page's ink and muted ink rather than the
  strong surface's; the cream wash becomes the bordeaux scrim; the hero and
  Cantina `sizes` become `100vw`; a measured scrim-contrast assertion joins the
  contrast suite.
- **The date's old "no border" assertion changes meaning.** It enforced the
  panel rule (ADR-0004): a colour field must not draw an edge. The date is now
  a band ruled like a printed row, so it carries two hairlines; the panel rule
  survives as "no shadow, no radius, rules only".
- **The hero is upscaled above 1033 px.** At 1440 px the full-bleed cover is a
  1.39× upscale, at 1920 px 1.86×. This is the accepted cost of a full-bleed
  cover with no new asset; the 720/1033 `srcset` is unchanged, the height cap
  limits how much of the frame is spent, and the scrim covers the softest part
  of the crop. If it reads soft in review, an 8–12% bordeaux multiply is the
  next step, not a new photograph.
- **The page is shorter than the column.** The date's horizontal band and the
  full-bleed sections remove the tall vertical date field; the signature and the
  date still finish on the first screen at 320 × 568, 390 × 844 and 1440 × 900.
- **README changes with the implementation**, as ADR-0005 established.
- **`GLOSSARY.md` is unchanged.** "Cover", "shell" and "scrim" are
  implementation terms, not terms of the event.

## Considered options

- **Keep the single column and bleed only the photographs.** Rejected: the
  width stays unused by the date and the closing band, and the desktop remains
  a wider phone.
- **A cream scrim with bordeaux type.** Rejected: it is ADR-0008's wash, and at
  the opacity bordeaux would need to clear AA over a photograph it is a cream
  field with a ghost of an image — the panel ADR-0004 rejected under another
  name.
- **A gold-light subtitle on the scrim.** Rejected by measurement: 4.64:1 only
  at a 0.92 scrim, which leaves the photograph barely visible.
- **Keeping the date as a second bordeaux field.** Rejected: the page returns
  to one strong surface and a clear tonal rhythm.
- **A full-width signature at 1440 px.** Rejected: 0.613 × the viewport makes a
  poster taller than most laptop viewports; the 36 rem cap keeps it large
  without swallowing the photograph.
- **`column-count: 2` for the prose.** Rejected: at 200% text zoom it keeps two
  narrow columns; `column-width: 22rem` folds back to one.
- **A larger hero asset.** Not available without a new image, and the brief
  fixes the assets; the upscale is recorded rather than hidden.
