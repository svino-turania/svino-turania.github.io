# The cover is the grapes and the page has a gallery

- **Status:** accepted
- **Date:** 2026-11-16
- **Revised:** 2026-11-16 — the 4× upscale arrived; the cover ships a
  three-width ladder from it instead of the single native copy.
- **Revised:** 2026-11-16 — on a phone the three portraits are a pair, and the
  last one closes the row at the gallery's full width.
- **Supersedes in part:** ADR-0008 (the opening photograph as the previous
  edition's image), ADR-0009 (the no-new-image constraint, the two-copy hero
  `srcset` and the 1.39–1.86× upscale cost)
- **Related:** ADR-0002, ADR-0005, ADR-0011, README (*Composition*, *Derived
  assets and the print master*, *Motion*, *Tests*), `assets/css/style.css`,
  `tests/site.test.mjs`, `/Users/angelo/svino/images/page/`

## Context

ADR-0009 made the page a cover: a full-bleed opening photograph, the masthead
at its foot on a bordeaux scrim, a date band on cream, the Cantina photograph
with its single torn edge, the prose and one strong closing band. It also fixed
the assets: the opening photograph was the previous edition's image, and "no
new image asset" was a constraint of the redesign.

The Comitato has since supplied five photographs of the Cantine. One is a
close-up of black grapes, 384 × 512 RGB, 36 KB — the smallest and the most
abstract. The other four are interiors: one landscape (1195 × 896) and three
portraits (896 × 1195). The brief is to make the grapes the opening photograph
and to put the four interiors on the page.

The original grapes file is 384 × 512. During this change the Comitato supplied
a 4× upscale of the same photograph, 1536 × 2048, and asked that it replace the
copy that was too small. The composition of ADR-0009 — the cover, the scrim, the
date, the Cantina band and its tear, the prose, the one strong surface — is not
in question.

## Decision

- **The grapes close-up is the opening photograph**, full-bleed at every width,
  served from the 1536 × 2048 upscale in three JPEG/WebP pairs — 768, 1152 and
  1536 px wide — with `sizes="100vw"`. The browser picks by viewport width: the
  1536 px copy covers a 1440 px cover at 1.07× and a 1920 px one at 1.25×. Above
  1536 px, and on high-density desktops, the browser upscales further; that cost
  is recorded rather than hidden. No copy wider than the source is shipped,
  because an upscale adds bytes, not detail.
- **The scrim and the measured on-photo roles stay.** The brightest pixel in
  the masthead band of the crop is pure white — a specular highlight on the
  acini, relative luminance 1 — and stays white in all three shipped copies, so
  the scrim keeps its 0.84 weakest stop. Over white at 0.86, cream reads 6.70:1
  and cream-light 7.15:1; at 0.84, 6.29:1 and 6.72:1. Gold-light would need a
  0.92 scrim (4.65:1) and is not used. The note beside the palette records the
  measurements.
- **The four interiors are a gallery after the prose**, before the closing
  band, with no heading and no caption: the one landscape at the shell's width,
  the three portraits in a row. The row uses `auto-fit` — three-up on the
  desktop shell, two-up on a tablet. On a phone, where the gallery's content
  box holds no two 18 rem photographs, a container query makes the row a pair
  and lets the last portrait span it: a wide lead, two supporting frames, one
  full-height finish, instead of four full-width photographs stacked on top of
  each other. The condition is the gallery's own width, not the viewport's, so
  the page keeps its single 64 rem threshold; a browser without container
  queries keeps the full-width column. Each frame keeps its native aspect ratio
  and carries no frame, shadow, radius or second torn edge; the tear remains on
  the Cantina band alone. The images are `loading="lazy"`, `decoding="async"`,
  with explicit intrinsic sizes, and are not preloaded.
- **The gallery keeps the page's motion vocabulary.** Each frame recedes with
  `photograph-recede` on a `view()` timeline, inside its own clip, and is static
  under `prefers-reduced-motion: reduce`. No new motion is introduced.
- **Sources live in the print workspace; the site ships derivatives only.**
  The six source files — the four interiors, the native grapes and the upscale —
  are recorded at `/Users/angelo/svino/images/page/`, and `assets/img/` carries
  stripped, RGB JPEG/WebP pairs. The old
  `svino-borgo-hero-*` derivatives are removed; `images/svino.jpg` remains the
  previous edition's photograph in the print workspace but is no longer
  shipped.
- **The image inventory, README and tests change with the implementation**
  (ADR-0005). The exact image allowlist, the hero `srcset` assertions, the alt
  literals and the motion allowlist are updated, and a gallery test is added.

## Consequences

- **The cover is sharp at 1× up to 1536 px and softens beyond it.** A 1440 px
  desktop gets a copy within 7% of its display width; a 1920 px screen, or a
  desktop at 2×, upscales. The grapes are a dark, near-abstract texture and the
  scrim covers the foot, so the remaining softness is mild. If the cover reads
  soft at very large widths, the next step is a larger original, not a treatment.
- **The cover costs more to load than the native copy did.** The three WebP
  candidates weigh about 61 KB, 99 KB and 152 KB; the JPEG fallbacks about
  189 KB, 346 KB and 353 KB. A phone on a 2× screen takes the 1152 px copy; a
  phone on a 3× screen and a 1× desktop take the 1536 px one. The 768 px copy is
  the no-`srcset` fallback. The page still requests one candidate per
  photograph, and the cover keeps `fetchpriority="high"`.
- **The page grows by a photo essay.** The landscape is a full-width band and
  the three portraits share a row; on a tablet the row is two-up and the third
  photograph wraps. On a phone the pair and the full-width closing portrait
  keep the page about 730 px shorter than the stack of four did, with the same
  four photographs and one more level of scale. The images total about 1.0 MB
  as JPEG and about 600 KB as WebP; a browser downloads one candidate per
  photograph, all below the fold.
  On a 2× screen the landscape is upscaled about 2×, since the shell is wider
  than its 1195 px source; the portraits remain downscaled.
- **The on-photo tokens do not move**, but their recorded measurements do: the
  masthead note and the test now cite pure white, not the old crop's
  (252, 234, 217).
- **ADR-0008's exception is superseded in part**: the opening photograph is no
  longer the previous edition's image. **ADR-0009's asset constraint and its
  upscale arithmetic are superseded in part**; its composition decisions stand.
- **`GLOSSARY.md` is unchanged.** "Cover", "gallery", "frame" and "scrim" are
  implementation terms; the event's vocabulary does not move.

## Considered options

- **A contained opening at native width.** Rejected: it abandons the full-bleed
  cover ADR-0009 established and makes the signature compete with a framed
  picture on paper.
- **Art direction by width: grapes on phones, a larger cellar photograph on
  desktops.** Rejected: the page's opening identity would change with the
  device, and the two photographs would have to agree on the scrim's
  measurements.
- **A larger cellar photograph as the hero.** Rejected: the brief names the
  grapes as the opening.
- **Two-up pairs by orientation.** Rejected: the assets are one landscape and
  three portraits, not two and two; a forced pair would crop a photograph or
  leave a hole.
- **A stack of four full-width photographs on a phone.** Rejected after the
  first review: on a phone it was four large frames of nearly the same shape,
  one under the other, and the scale variation of the desktop composition was
  gone. The closing full-width portrait costs one large frame, not four.
- **A horizontal filmstrip for the portraits on a phone.** Rejected: it hides
  two of the four photographs behind a swipe, adds a scroll container to a page
  that otherwise never asks the reader to drag, and cannot show the row's
  composition at a glance.
- **A gallery heading or captions.** Rejected: visible copy belongs to the
  Comitato, and only the `alt` descriptions are approved. The photographs sit
  under prose that already describes the Cantine.
- **A single 384 px copy, as first decided.** Rejected once the upscale
  arrived: at 1440 px it is a 3.75× browser upscale of the smallest file in the
  set, when a sharper copy costs about 152 KB of WebP.
- **One 1536 px copy only.** Rejected: a phone on a 2× screen would download
  152 KB where the 1152 px copy spends 99 KB, and a desktop with no `srcset`
  would never see the small fallback.
- **A copy wider than 1536 px.** Rejected: it spends bytes reproducing detail
  the upscale does not have; the browser's own upscale costs nothing to ship.
- **Keeping the originals in `assets/img/`.** Rejected: assets are derivatives,
  and the exact inventory would ship megabyte files, the upscale included, that
  the page never requests directly.
