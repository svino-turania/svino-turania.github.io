# The page keeps a handful of postcards

- **Status:** accepted
- **Date:** 2026-11-21
- **Supersedes in part:** ADR-0012 (the no-frame, no-shadow, no-radius rule, for
  the cartoline chapter alone), ADR-0019 (the gallery as the last photographs
  before the closing band)
- **Related:** ADR-0005, ADR-0015, ADR-0019, `GLOSSARY.md` (*Petescia*),
  `index.html`, `assets/css/style.css`, `tests/site.test.mjs`,
  `/Users/angelo/svino/images/postcards/`

## Context

The Comitato posted eight archival images in the Festaroli group on 21 November
2026. Five came from Riccardo: two printed postcard montages of Turania and
Petescia, two photographs of their piazzas and a halftone reproduction of the
oldest known panorama of Petescia. Three came from Giovanni: a crowded Turania
piazza, a printed `Petescia - Piazza Umberto I` card, and a country chapel.
Petescia is the village's earlier name, printed inside the cards, not
a frazione and not a separate place. All eight are landscape, between 1.29:1 and
1.66:1, and 1080–1600 px on the long side after WhatsApp's recompression. They
are the only copies.

The owner asked to put the old photographs on the page "with a postcards
effect". The page's laws are settled and narrow: the cream ground carries no
panel, frame, shadow or radius (ADR-0009, ADR-0011, ADR-0012); visible copy
belongs to the Comitato, and the gallery carries no heading and no caption
(ADR-0012, ADR-0019); the page has one `h1` and exactly two `h2`s; motion is CSS
only, scroll-driven through `view()`, and the page under reduced motion is the
finished spread (ADR-0015); there is one desktop composition at 64 rem and no
other viewport threshold (ADR-0019). A postcard is, by definition, a frame, a
shadow and a tilt — precisely what the page law withholds from photographs.

## Decision

**The page keeps a handful of postcards as a silent chapter between the
Mercatino and the gallery.**

- **The chapter is eight cards, in two families.** The Turania montage is the
  anchor, with the two Turania piazza photographs beside it; the Petescia row
  follows — the `Piazza Umberto I` card, the montage and the piazza with the
  beetle — and the chapter closes on the oldest panorama and the country
  chapel. The duplicate piazza copy sent by a second member is dropped. Within
  each family the order runs from the most legible printed identity to the
  oldest, most fragile reproduction.
- **The chapter carries no page copy.** It has no heading, no caption and no
  prose; the lettering printed inside the cards — `TURANIA (Rieti) alt. m. 700`,
  `Saluti da PETESCIA SABINA`, `PIAZZA UMBERTO I` — is the caption, and each
  `alt` sentence describes the photograph and quotes the lettering, so a screen
  reader meets it. The section carries an `aria-label`, as the gallery does,
  and the page still has exactly two `h2`s.
- **The card is the one framed object on the page.** Cream paper
  (`--card-paper`), a hairline mixed from the rule, square corners and one ink
  shadow (`--card-shadow`) — warm bronze at low alpha, near the paper, not a UI
  elevation. Each card sits at its own tilt, between 0.6° and 1.5°, growing
  slightly on the desktop composition. There is no stamp, postmark, tape, torn
  edge or sepia filter: the card is paper and light, not a costume. The
  exception is this chapter's alone; every other photograph keeps ADR-0012's
  no-frame rule, and the suite asserts the page has exactly one `box-shadow`
  declaration, the card's.
- **The photograph is never cropped.** The card's margin grows around the
  native aspect, so the printed captions at the edges survive and the card
  heights vary as real postcards do. No `object-fit`, no common ratio.
- **On a phone the cards stack; a tablet is a two-up spread; the desktop shell
  is an album.** The base composition is one column at the chapter measure,
  each card on its own small tilt. When the chapter's own width can hold two
  cards — a container query at 44 rem, as the gallery asks its own width — the
  stack becomes four rows of two, the right-hand card dropped a step. At 64 rem
  the sheet is a 16-column measure with the cards in three rows — three, three
  and two: the anchor spans six columns, the neighbours five or six, and each
  tucks a spacing step or two under the one before, with vertical offsets that
  make the rows enter at different heights. The tuck is shallow so
  no printed caption is covered. No viewport threshold is added.
- **The cards settle; they do not perform.** One new keyframe, `card-settle`:
  each card arrives turned two degrees past its resting tilt and a hair low,
  then comes to rest, on a `view()` range that starts later for each card in
  reading order. Rotation and translation only — no opacity, so a card is never
  a blank space. The animation lives under `prefers-reduced-motion:
  no-preference`; under `reduce` the album is already laid out.
- **The cards are not controls.** No hover lift, no tilt-follow, no lightbox,
  no link: a pointer affordance would promise an interaction the page does not
  have (ADR-0019).
- **The assets are derivatives of the only copies.** The eight originals are
  recorded in `/Users/angelo/svino/images/postcards/`; the site ships one 800 px
  JPEG/WebP pair per card, lazy, asynchronous, with explicit intrinsic sizes and
  no preload. No look filter; only the resampler's own sharpening.
- **The implementation, README and tests change together** (ADR-0005). The
  exact image inventory grows by sixteen files; a chapter test asserts order,
  alt literals, dimensions, laziness, the card's frame and shadow, the uncropped
  photograph and the absence of pointer states; the motion allowlist gains the
  eight cards and the settle keyframe; the "no shadow" test becomes "one
  shadow, the card's". `GLOSSARY.md` gains *Petescia* and records it as the
  village's earlier name.

## Consequences

- **The page's "no shadow" law becomes "one shadow".** The test that asserted no
  `box-shadow` anywhere now asserts exactly one declaration, the card's, and
  that nothing else casts one. A future panel would still fail.
- **The chapter adds weight below the fold.** Eight WebP copies total about
  576 KB, eight JPEG fallbacks about 1.14 MB; a browser requests one candidate
  per card, all lazy and below the fold. The source is 1600 px at its widest, so
  800 px is the largest copy shipped; a 3× phone upscales slightly, which is
  recorded here and not hidden.
- **The tablet is a two-up spread, not the album.** At 768 px the chapter's own
  width holds two cards, so the stack becomes four rows of two with the
  right-hand card dropped a step. The full 16-column album below 64 rem would
  shrink the printed lettering below legibility; the two-up spread asks the
  chapter's own width instead of adding a viewport threshold.
- **The walk changes shape.** The page now reads: cover, date, cellar
  photograph, prose, Programma (bordeaux), Mercatino, the old village, today's
  cellars, the closing band. The gallery is no longer the last photographs
  before the band; ADR-0019's rhythm stands with one more movement in it.
- **The old name is published, accessibly.** Petescia appears printed inside
  three of the eight cards and, quoted, in their `alt` sentences. It never
  appears in the page's prose or printed values, and the glossary now says why.
- **No new copy means no new approval loop.** The chapter can be published
  without a new string from the Comitato; if it later wants a label or a
  caption, that is its text to approve, not ours to invent.
- **`GLOSSARY.md` moves.** It gains a tenth term, *Petescia*, and the Turania
  entry points to it.

## Considered options

- **A gallery-style chapter: photographs on the paper with no frame.** Rejected:
  it is the page's existing idiom and not a postcards effect; the owner asked
  for the cards.
- **A collage with tape, overlaps and a torn edge.** Rejected: tape and a second
  tear fight the print identity and ADR-0009's single tear; the tuck and the
  shadow carry the handful without props.
- **A drawn francobollo and postmark.** Rejected: it is pastiche, and it would
  add drawing and lettering the page does not own.
- **A warm sepia filter to unify the eight.** Rejected: it restyles historical
  evidence and dates the page fastest.
- **Cropping every card to one common ratio.** Rejected: the printed captions
  sit at the edges, and the crop would eat the chapter's only caption.
- **A heading and per-card captions.** Rejected: visible copy belongs to the
  Comitato; the printed lettering already captions the cards.
- **A fan or a single row of eight.** Rejected: it hides seven cards behind the
  first at this count and loses the album.
- **A horizontal scroll or a lightbox.** Rejected: the page never asks the
  reader to drag, and a lightbox needs a script and a new UI.
- **A hover lift or tilt-follow.** Rejected: the cards are not links; a pointer
  state would promise an action.
- **Replacing the gallery with the postcards.** Rejected: today's cellars are
  the event's subject, and the old village is a prelude to them.
- **A two-width `srcset` ladder.** Rejected: eight cards at one size do not
  justify two copies each, and the source tops out at 1600 px.
- **The full album on a tablet.** Rejected: the printed lettering shrinks below
  legibility; a two-up spread, asked of the chapter's own width, keeps the
  letters readable without a second viewport threshold.
