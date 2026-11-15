# The spread gains a tonal rhythm and a phone that uses its width

- **Status:** accepted, superseded in part by ADR-0007
- **Date:** 2026-11-15
- **Supersedes in part:** ADR-0005 (the single dark surface; the phone as one
  left-aligned column)
- **Related:** ADR-0003, ADR-0004 (the panel rejection still holds), ADR-0005,
  README (*Composition*, *Motion*), `assets/css/style.css`,
  `tests/site.test.mjs`

## Context

ADR-0005 made the page an editorial spread and recorded two rules that its own
composition then depended on: the closing band is the page's only dark surface,
and the phone is one left-aligned column. The first kept the identity
disciplined; the second kept the phone simple.

Seen on a page, both read as stillness. The cream ground is one tone from the
masthead to the band, so the page has no tonal rhythm, and the phone spends
roughly half its width on empty margin beside a signature capped at 50 vw, a
date whose right side is empty, and facts and actions that wrap into a stack.
The brief is the same one ADR-0005 answered — keep the print's essence, make
the page feel modern — applied to the surface and the small screen.

## Decision

The spread gains a tonal rhythm and a phone that uses its width.

- **The date is the second dark surface.** On the desktop spread it is a
  bordeaux block in the columns it already owns (9–12), filling the masthead
  row, with sharp edges, no radius and no shadow. Below 64 rem it is a
  full-width bordeaux section, because at tablet widths the four columns cannot
  hold `DICEMBRE 2026` on one line inside a padded block. Its interior puts the
  date lockup at the top and `DALLE ORE` with the time at the bottom, using the
  height the row already gives it.
- **The photograph bleeds edge-to-edge on the phone** and keeps the 84 rem
  measure from 48 rem up. The print crop and the single torn edge are unchanged;
  the tear's `cqw` reference is relative to the band's own width, so bleeding
  the band does not change its teeth.
- **The phone stops stacking what can pair.** The signature fills the measure;
  `DOVE` and `A CURA DI` sit side by side; the photograph's top margin tightens.
  The two actions stay full-width and stacked: at 390 px each half is about
  160 px and `Scarica la Locandina (immagine JPEG)` needs about 280 px, so
  pairing them would wrap or shrink copy the Comitato has approved.
- **The closing band stays.** It is still the page's last surface and its only
  closing one. It is no longer the page's only dark surface.

The constraints do not move: no JavaScript, no build step, no third-party
hosts, the self-hosted OFL fonts, the signature as outlines, no new copy, and
the comment map the Comitato edits by.

## Consequences

- **Two dark surfaces need one vocabulary.** The band's roles (`--band`,
  `--band-ink`, `--band-ink-muted`, `--band-rule`) become the semantic roles
  for a strong surface, and both the date block and the band read through them.
  No second raw colour enters the palette. Contrast on bordeaux was measured
  when the band shipped (cream 9.94:1, gold-light 5.75:1) and is reused, not
  assumed for the new surface.
- **One assertion inverts.** `tests/site.test.mjs` asserts that
  `background: var(--band)` appears exactly once and that the footer is the
  only bordeaux surface. That contract is re-pointed to "the strong surface
  appears on the date block and the closing band, and nowhere else".
- **The two-screen budget holds.** On desktop the block fills columns that were
  already occupied by empty space, so it adds no row and no height.
- **The block is a colour field, not a panel.** ADR-0004 rejected a floating
  panel; sharp edges flush to the measure's column edge keep this a printed
  colour block. No shadow, and `box-shadow` stays banned.
- **README changes with the implementation.** *Composition* is rewritten as
  the shipped page, as ADR-0005 established. *Motion* is unchanged apart from
  the record it names.

## Considered options

- **A full-width bordeaux date band.** Clear at every width, but it adds a row
  and height the spread does not have to spend, and it leaves the masthead's
  right half empty.
- **A cream-family tonal step (`color-mix` of cream and bronze) behind the
  prose.** On-palette and cheap, but too subtle to answer "monochromatic".
- **Bleeding the photograph at every width.** At 1440 px the 303:191 crop is
  908 px tall and at 1920 px it is 1210 px; the photograph becomes a screen or
  more and the spread stops closing within two.
- **Pairing the two actions on the phone.** Rejected: it forces a two-line wrap
  inside a half-width column, or a shorter label the Comitato has not approved.
