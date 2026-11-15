# The cream ground is paper

- **Status:** accepted
- **Date:** 2026-11-15
- **Related:** ADR-0003, ADR-0005, ADR-0006, ADR-0009, ADR-0010, README
  (*Composition*), `assets/css/style.css`, `tests/site.test.mjs`, issue #52

## Context

The page is a cover (ADR-0009): a full-bleed opening photograph, a date band on
cream between two gold hairlines, a full-bleed Cantina photograph and one
bordeaux closing band. The cream ground between those surfaces was a single
flat fill. Between the opening photograph and the closing band it read as empty
paper, so the page felt inert even though its composition and its entrance were
considered.

The Comitato Feste Turania asked for the monochromatic background to look
better and less static. The constraints were fixed: no palette change, no new
image asset, no JavaScript, no build step and no new motion. The date band had
to remain a band on cream, not become a panel, and the prose had to stay as
readable as before.

A flat fill is a colour, not a material. The treatment that answers the brief
has to be built from the palette and CSS alone, has to read as paper when
looked at, and has to stay quiet behind the type. It also has to stay still for
a reduced-motion visitor and add no horizontal scroll at 200% text zoom.

## Decision

The cream ground is paper: the body's own background gains two image layers.

- **The base declaration does not move.** `body` keeps
  `background: var(--surface)`; the ground is added after it as
  `background-image: var(--grain-image), var(--ground-field)`, because the
  shorthand resets the image list. The cream surface is still the page's base
  colour.
- **The grain is inline, neutral and tiled.** It is an SVG `feTurbulence`
  `fractalNoise` tile at `baseFrequency` 0.8 and three octaves, stitched at the
  seam and drawn at a 240 px square. An `feColorMatrix` reduces it to black, so
  it carries no palette colour, and it is laid down at 0.03 opacity. It is a
  `data:` URI: no file and no request. The tile repeats every 240 px; the seam
  is stitched, so no join is visible at any captured width.
- **The grain's opacity is two statements of one number.** An SVG loaded
  through `url()` is its own document and cannot read this page's custom
  properties, so `--grain-opacity` cannot parametrise the data URI. The token
  and the tile's `opacity` literal therefore state the same number twice, held
  equal by a test.
- **The light is one continuous field, not a wash per section.** A single
  vertical gradient runs over the whole document: near the date it holds close
  to the print's light paper, settles to the cream surface through the prose,
  and deepens slightly at the foot before the bordeaux band closes the page.
  Both tones are `color-mix`es of existing roles — `--cream-light` and
  `--surface` at the head, `--surface` and `--bronze` at the foot — so no new
  primitive and no raw colour enter the palette. The light end is a 60/40
  blend rather than `--cream-light` itself because the same spec's 6%
  total-delta cap governs: the unblended light paper would put the span from
  the head to the deep foot well past the cap.
- **The caps are measured.** On the served palette, with the grain composited
  at its declared opacity over each end of the field:

  | ground | colour | luminance |
  | --- | --- | --- |
  | lightest | `#e9dec9` | 0.7391 |
  | darkest | `#e3d6bc` | 0.6816 |

  The total tonal delta is 5.75 percentage points, under the 6% cap. Bordeaux
  reads 9.69:1 on the lightest ground and 8.99:1 on the darkest; both clear AA
  for normal text. The measurement is recorded beside the rule and asserted in
  the suite.
- **Muted ink stays in the light, as reviewed.** Bronze (`--ink-muted`) reads
  4.64:1 on the lightest ground and 4.76:1 on the cream surface, but only
  4.31:1 on the darkest ground, which is under AA. The only muted ink painted
  on the ground is the date's tracked weekday and `DALLE ORE` label. That it
  stays clear of the deep tone rests on the review captures at 390 × 844,
  768 × 1024 and 1440 × 900, where the date band falls inside the field's
  light hold (about 31–50% of the document). No test checks element positions —
  the static seam cannot — so this is a property of the composition, not a
  guarantee the suite enforces. Muted ink moved onto the deep tone would read
  4.31:1: a latent hazard if a future composition ever put muted text at the
  foot.
- **The date band does not change.** It keeps its rules and positions and adds
  no background, shadow or radius; the field flows behind it. The photographs
  and the closing band are untouched.
- **The ground is still and costs nothing at runtime.** It adds no animation,
  transition or transform, adds no request, and adds no element. It is absent
  from the accessibility tree because it is the body's own background.

The caps were confirmed against captures at 390 × 844, 768 × 1024 and
1440 × 900, plus reduced motion and 200% text zoom. No cap was adjusted. In the
stills the ground is present when looked at and never competes with the date or
the prose; the grain reads as fibre with no visible repetition or moiré; the
reduced-motion ground is completely still; and 200% text zoom changes no layout
and produces no horizontal scroll.

## Consequences

- **Reverting the ground is one CSS commit.** No image file, build artefact or
  test fixture stores it: the grain lives in a token as a `data:` URI, the
  field in two `color-mix` tokens and one gradient, and the suite reads the
  served page and stylesheet from the repository root. The page's assets,
  composition, copy, fonts and motion layers are unchanged.
- **The suite holds the contract.** It asserts the background layer order, the
  grain's inline, neutral, stitched, square tile and its opacity token under the
  cap, the single continuous field with the ticket's stops, the derived tones
  mixed from existing roles, the 6% delta and the worst-case bordeaux contrast.
  A later change that flattens, darkens or animates the ground fails the suite
  rather than passing silently.
- **The grain's tile repeats but is not meant to be seen.** Its repetition is
  part of a tiled texture, not a defect; the stitched seam and the low,
  neutral opacity keep it from reading as a halftone or a screen.
- **Muted ink on the ground is limited to the light hold.** The date's bronze
  labels must stay in the upper half of the document. This is held by the
  composition and the review captures, not by a test: the static seam cannot
  assert element positions. A future composition that moved muted-ink text
  into the foot would put it at 4.31:1, below AA on the deep tone.
- **README changes with the implementation**, as ADR-0005 established:
  *Composition* states the ground and names this ADR.
- **`GLOSSARY.md` is unchanged.** "Ground", "grain" and "field" are
  implementation terms, not terms of the event.

## Considered options

- **Keep the flat cream fill.** Rejected: it is the problem the brief names —
  the ground reads as empty paper between two photographs.
- **A raster paper texture.** Rejected: it adds an image file, a request and a
  fixed resolution, and the brief fixes the assets.
- **Animated grain.** Rejected: it adds motion for no gain, and the
  reduced-motion visitor would lose it anyway.
- **A wash per section.** Rejected: the tonal steps would read as bands and
  break the date's continuity with the prose; the field is one gradient over
  the document.
- **A stronger grain or a wider tonal delta.** Rejected by the captures: at a
  higher opacity the grain stops reading as fibre and starts competing with the
  date; past 6% the field becomes a decorative gradient. The caps are the
  point.
- **A new raw ground colour.** Rejected: the palette is fixed and tokens is the
  only place a raw colour lives; both tones derive from existing roles.
