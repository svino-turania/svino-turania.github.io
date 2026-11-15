# The masthead is set on an opening photograph

- **Status:** accepted, superseded in part by ADR-0009
- **Date:** 2026-11-15
- **Related:** ADR-0002, ADR-0004, ADR-0005, ADR-0007, README (*Composition*,
  *Derived assets and the print master*), `assets/css/style.css`,
  `tests/site.test.mjs`

## Context

The page had one photograph: the v15 Cantina crop, the print's photograph, with
its single torn lower edge. The brief adds an opening image under the sign —
the previous edition's photograph of a borgo street with a bottle, a glass and
grapes — and asks that the masthead be set on it, with the signature filling
the width.

Two facts constrain that composition.

**The signature is almost the height of the print crop.** The signature's
`viewBox` makes it 0.613 × its width tall. The print crop is 303:191, so a
303:191 band is 0.630 × its width tall. A full-width signature on a full-width
303:191 hero would consume 97% of the hero's height: there would be no room for
the subtitle and effectively no photograph visible. At a 48 rem column (720 px)
the signature is 441 px and a print-crop hero is 454 px.

**Ink cannot be measured on a photograph.** This project measures contrast
rather than assuming it, and a photograph's background varies pixel to pixel.
Measured on the 4:5 crop, the darkest pixels under the `II EDIZIONE` lockup and
the subtitle are near-black (relative luminance 0.0002 and 0.0046). Bronze,
which measures 4.76:1 on cream, needs a cream alpha of 0.94 there to clear AA;
at 0.85 it measures 4.09:1 and at 0.90, 4.32:1. A 0.94 wash is a cream field
with a ghost of the photograph — the panel ADR-0004 rejected, under another
name. Bordeaux needs only 0.42 on the same pixels and measures 6.2:1 at 0.62.

## Decision

The page gains an opening photograph, and the masthead is set on it.

- **It is added, not substituted.** The Cantina photograph keeps its place,
  its print crop and its torn edge.
- **It shares the page's first row with the masthead.** The signature, the
  `II EDIZIONE` lockup and the subtitle are set on the photograph, start-aligned
  at the top, so the sign sits over the street and rooftops and the still life
  shows below the wordmark.
- **It is cropped 4:5 and sits inside the column.** The taller crop is what
  gives the signature and the subtitle room; it does not bleed, so the column is
  the same geometry at every width.
- **A graded cream wash sits between the photograph and the masthead.** It is
  the page's cream at 0.62, holding to 68% of the hero — enough to cover the
  subtitle at 320 px, where the masthead is a larger share of the 4:5 hero — and
  clearing to the photograph at 88%, above the barrel. The measured ratio is
  written beside the rule, as the strong surface's ratios sit beside the palette.
- **The masthead takes the ink role inside that block only.** The lockup and
  the subtitle are bordeaux on the photograph and bronze nowhere else. The block
  remaps `--ink-muted` to `--ink`, the same scoped-role pattern the date and the
  closing band already use.
- **The edge is plain.** The tear stays unique to the Cantina band, where it is
  the boundary into the prose.
- **The image appears at every width.** There is one layout, and a hero that
  disappears on a phone would make that claim false where most visitors see it.
  It is served at 720 px and 1033 px through `srcset`; the 720 px WebP adds
  about 30 KB on a phone.
- **It is a page-only asset.** It derives from the previous edition's
  photograph, `/Users/angelo/svino/images/svino.jpg` (2048 × 1359), not from the
  print master, and it has no counterpart on the current Locandina. This is the
  one named exception to the README's rule that every shipped image derives from
  the print master. The 4:5 crop, 1033 × 1291, excludes the generator's mark in
  the source's lower-right corner.
- **The alt is Italian and approved in review.** The maintainer drafts it in the
  style of the Cantina description; the Comitato approves it in the pull
  request, which is already the review point.

The constraints do not move: no JavaScript, no build step, no third-party hosts,
no new colour, no shadow and no radius. The wash is a photograph treatment, not
a panel.

## Consequences

- **The page has two photographs.** The opening one is the first screen's
  image; `fetchpriority="high"` moves to it and the Cantina photograph takes
  `fetchpriority="low"`, so the phone spends its priority on the image the
  visitor sees first.
- **The hero grows a role scope.** The masthead's bronze leaves on the
  photograph; the rest of the page keeps it. No primitive changes and no second
  palette enters.
- **The page is taller by the hero.** The signature and the date still finish
  on the first screen at 1440×900; the Cantina photograph begins below it.
- **The suite gains the hero's contracts**: the shared first row, the 4:5 crop,
  the wash's colour and stops, the masthead's scoped ink, the two srcset
  candidates and the alt. The two-picture HTML means the tests that selected
  `picture` must name `.photo-band picture` or `.hero-photo picture`.
- **README gains one derived-asset exception and its regeneration commands.**
  The derived-assets rule is otherwise unchanged.
- **GLOSSARY.md is unchanged.** "Opening photograph" is an implementation term,
  not a term of the event; it lives here, in the README and in the code.

## Considered options

- **A full-bleed hero at the print crop, with the signature at the column's
  width.** Keeps the print crop and the phone's bleed, but the signature is then
  not full-width — the brief's word — and the two compositions drift apart.
- **A full-bleed, taller hero with a full-width signature.** At 1920 px the
  signature would be about 1180 px tall, a poster masthead taller than most
  laptop screens.
- **No wash, the signature in cream over the photograph.** Fails AA wherever
  the photograph is bright, which is most of the frame.
- **Bronze with a 0.95 cream wash.** Identity untouched, but the hero becomes a
  near-solid cream field and the overlay stops meaning anything.
- **The opening photograph on tablets and desktops only.** Saves the phone's
  bytes and hides the hero from most visitors.
- **A new photograph.** The previous edition's is already the right subject,
  already exists, and its "not for the site" line in the README was a
  consequence of the v15 migration, not a decision about the image.
