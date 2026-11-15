# The cream ground is paper

- **Status:** accepted
- **Date:** 2026-11-15
- **Amended:** 2026-11-16 — the ground is visible, not sensed; the grain, the
  field and the bronze primitive move together.
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
better and less static. The original constraints included no palette change, no
new image asset, no JavaScript, no build step and no new motion. The date band
had to remain a band on cream, not become a panel, and the prose had to stay as
readable as before.

The first treatment met those constraints and was invisible. Its grain was
capped at 0.03 opacity and its field covered 5.75 points of relative
luminance; measured against the plain cream, the grain moves ΔE 1.2, below the
threshold at which a person can see a difference. A flat fill is a colour, not
a material, and a texture nobody can see does not answer the brief. The
Comitato then decided the paper must be visible. Making it visible costs one
palette primitive: the bronze muted ink moves from `#7a5c2e` to `#664a23`.

What still binds is what the first treatment protected: no new image asset, no
JavaScript, no build step and no new motion; the date band stays a band on
cream; the prose stays as readable as before; and every point of the field
clears AA for the ink laid on it. The field is still built from the palette and
CSS alone, and it stays still for a reduced-motion visitor and adds no
horizontal scroll at 200% text zoom.

## Decision

The cream ground is paper: the body's own background gains two image layers.

- **The base declaration does not move.** `body` keeps
  `background: var(--surface)`; the ground is added after it as
  `background-image: var(--grain-image), var(--ground-field)`, because the
  shorthand resets the image list. The cream surface is still the page's base
  colour.
- **The grain is inline, neutral and tiled.** It is an SVG `feTurbulence`
  `fractalNoise` tile at `baseFrequency` 0.5 and three octaves, stitched at the
  seam and drawn at a 480 px square. The coarser fibre and the larger tile are
  what make the paper visible: a finer, smaller tile repeats inside a viewport
  and reads as a screen rather than paper. An `feColorMatrix` reduces the noise
  to black, so the tile carries no palette colour, and it is laid down at 0.10
  opacity. It is a `data:` URI: no file and no request. The tile repeats every
  480 px; the seam is stitched, so no join is visible at any captured width.
- **The grain's opacity is two statements of one number.** An SVG loaded
  through `url()` is its own document and cannot read this page's custom
  properties, so `--grain-opacity` cannot parametrise the data URI. The token
  and the tile's `opacity` literal therefore state the same number twice, held
  equal by a test.
- **The light is one continuous field, not a wash per section.** A single
  vertical gradient runs over the whole document: near the date it holds close
  to the print's light paper, settles to the cream surface through the prose,
  and deepens toward the foot before the bordeaux band closes the page. Both
  tones are `color-mix`es of existing roles — `--cream-light` and `--surface`
  at the head, `--surface` and `--bronze` at the foot — so no new primitive and
  no raw colour enter the palette. The head is an 85/15 blend of light paper
  and surface; the foot is a 90/10 blend of surface and bronze, so the warm
  neutral reaches the field without turning it brown.
- **The 6% ceiling is abandoned.** It was chosen to keep the field
  imperceptible, which was the old goal and is no longer the goal. The field
  may now be seen. What remains binding is AA at every point of the field, and
  the cap that replaces the old one is 16%: a guard against the ground becoming
  a decorative gradient, not a limit on its visibility.
- **The caps are measured.** On the served palette, with the grain composited
  over each end of the field (the tile's alpha averages about 0.55, so the 0.10
  rect darkens each channel by about 5.5%):

  | ground | colour | luminance |
  | --- | --- | --- |
  | lightest | `#e4dac7` | 0.7089 |
  | cream surface | `#e0d5bb` | 0.6683 |
  | darkest | `#d3c6ac` | 0.5740 |

  The total tonal delta is 15.38 percentage points, under the 16% cap. Bordeaux
  reads 9.32:1 on the lightest ground, 8.82:1 on the cream surface and 7.66:1
  on the darkest; all clear AA for normal text. The measurement is recorded
  beside the rule and asserted in the suite.
- **The muted-ink trade is explicit.** Bronze is the date's tracked weekday and
  `DALLE ORE` label. Under the old palette, `#7a5c2e` sat only 0.26 above the
  AA floor on flat cream, so at 0.06 grain it fell to 4.45:1: 0.06 was the
  ceiling the old palette could carry. To show the paper at 0.10, the bronze
  primitive moves to `#664a23`. With the 10% bronze foot, the worst point of
  the field reads 4.86:1 for muted ink (5.91:1 at the lightest), so the whole
  field clears AA for it. On the strong surface `#5c1a24`, the new bronze is
  1.58:1: it is still never used for text there.
- **The date band does not change.** It keeps its rules and positions and adds
  no background, shadow or radius; the field flows behind it. The photographs
  and the closing band are untouched.
- **The ground is still and costs nothing at runtime.** It adds no animation,
  transition or transform, adds no request, and adds no element. It is absent
  from the accessibility tree because it is the body's own background.

The combination was confirmed against captures at 390 × 844, 768 × 1024 and
1440 × 900, plus reduced motion and 200% text zoom. Measured against the
previous capture at desktop width, the new grain shifts the cream by about
ΔE 4 with a per-pixel standard deviation of about 2.4 (the old 0.03 tile
measured 0.8): the paper is seen, not sensed, and the light direction is
visible from the date to the foot. The grain still reads as fibre with no
visible repetition or moiré; the reduced-motion ground is completely still in
the capture; and 200% text zoom changes no layout and produces no horizontal
scroll.

## Consequences

- **Reverting the ground is one CSS commit.** No image file, build artefact or
  test fixture stores it: the grain lives in a token as a `data:` URI, the
  field in two `color-mix` tokens and one gradient, and the suite reads the
  served page and stylesheet from the repository root. The page's assets,
  composition, copy, fonts and motion layers are unchanged.
- **One palette primitive moved.** The muted ink is darker so the page can
  carry a visible grain over a bronze foot. `--bronze` is `#664a23`; bronze on
  cream reads 6.30:1 and on the strong surface 1.58:1. The measured values are
  recorded beside both rules.
- **The suite holds the contract.** It asserts the background layer order, the
  grain's inline, neutral, stitched 480 px tile at 0.5 and its opacity token
  under the 0.10 cap, the single continuous field with the ticket's stops, the
  derived tones mixed from existing roles, the 16% delta, and bordeaux and
  muted ink at AA over both ends. A later change that flattens, darkens or
  animates the ground fails the suite rather than passing silently.
- **The grain's tile repeats but is not meant to be seen repeating.** At
  480 px the tile is larger than the repetition a viewport reveals, and the
  stitched seam keeps it from reading as a halftone or a screen.
- **Muted ink is safe over the whole field.** The whole field now clears AA for
  bronze, so a future composition that puts muted text at the foot stays above
  the floor: 4.86:1 at the darkest point.
- **README changes with the implementation**, as ADR-0005 established:
  *Composition* states the visible ground and names this ADR.
- **`GLOSSARY.md` is unchanged.** "Ground", "grain" and "field" are
  implementation terms, not terms of the event.

## Considered options

- **Keep the flat cream fill.** Rejected: it is the problem the brief names —
  the ground reads as empty paper between two photographs.
- **Keep the imperceptible 0.03 grain and the 6% field.** Rejected: measured
  against plain cream it moves ΔE 1.2, below what a person can see, so the
  ground stays empty. A treatment that cannot be seen does not answer the
  brief.
- **A visible grain without moving the bronze.** Rejected: at 0.06 the old
  bronze already reads 4.45:1 at the foot, under AA. Visibility and the palette
  had to move together.
- **A raster paper texture.** Rejected: it adds an image file, a request and a
  fixed resolution, and the brief fixes the assets.
- **Animated grain.** Rejected: it adds motion for no gain, and the
  reduced-motion visitor would lose it anyway.
- **A wash per section.** Rejected: the tonal steps would read as bands and
  break the date's continuity with the prose; the field is one gradient over
  the document.
- **A new raw ground colour.** Rejected: the palette is fixed, tokens is the
  only place a raw colour lives, and both tones derive from existing roles.
