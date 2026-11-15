# The page is one column at every width

- **Status:** accepted, superseded in part by ADR-0009
- **Date:** 2026-11-15
- **Supersedes in part:** ADR-0005 (the desktop as a deliberate large-format
  spread, not a wider phone) and ADR-0006 (the date as a block in columns 9–12
  and the two-geometry date)
- **Related:** ADR-0003, ADR-0004, ADR-0005, ADR-0006, ADR-0008, README
  (*Composition*, *Preview locally*, *Tests*), `assets/css/style.css`,
  `tests/site.test.mjs`

## Context

ADR-0005 made the page an editorial spread: a wide measure, a twelve-column
grid and a desktop that was deliberately *not* a wider phone. ADR-0006 kept
that rule and added a phone composition that used the phone's width — the
signature filling the measure, paired facts, stacked actions, a bleeding
photograph — and a date that was a full-width field below 64 rem and a bordeaux
block in columns 9–12 above it.

Two compositions meant two sets of rules, two threshold blocks (48 rem and
64 rem) and a suite that asserted each one. The phone composition is the one
the page was approved for; the desktop spread is a second composition that
shares the identity but not the character. The brief is to use the phone's
composition at every width.

## Decision

The page is one column at every width.

- **One measure.** 48 rem, centred, with 24 px gutters inside it. The column
  never grows past the measure, so nothing changes between 320 px and 768 px
  and the column simply holds above it. There is no breakpoint and no
  twelve-column grid.
- **The phone's treatments are the page's treatments.** The signature fills
  the measure, `DOVE` and `A CURA DI` pair in two columns, the two actions
  stack full width, and the Cantina prose takes at most 36 rem.
- **The date has one geometry.** A bordeaux field giving the page's inline
  padding back at both edges — the viewport on a phone, the measure's edge above
  48 rem — with the content set back on the gutters. The lockup stays at the top
  and `DALLE ORE` with the time at the bottom.
- **The Cantina photograph bleeds to the page's edge at every width.** The
  print crop and the single torn edge are unchanged.
- **The closing band stays.** Its inner content re-aligns to the same 48 rem
  measure, with the facts paired and the actions stacked at every width.

The composition is renamed: it is *the page's column*, not *the editorial
spread*. `main.spread` becomes `main.page`, and the README and this record use
the new name. The name is an implementation term, not a term of the event;
`GLOSSARY.md` is unchanged.

The constraints do not move: no JavaScript, no build step, no third-party
hosts, the self-hosted OFL fonts, the signature as outlines, no new copy the
Comitato has not approved, the single torn edge, and the comment map the
Comitato edits by.

## Consequences

- **The threshold blocks leave the stylesheet**, and with them
  `--signature-size`, `--gutter`, `--column-gap` and `--photo-space`. The tokens
  layer keeps one measure and one page padding.
- **The suite inverts its breakpoint contracts.** The helper that read the
  48 rem override is replaced by one assertion that no 48 rem or 64 rem block
  exists; the tests that asserted the signature's cap, the inline facts and
  actions, the photograph's measure and the date's block are re-pointed to the
  single layout.
- **The page is longer.** It runs to about two phone screens and just under
  three at 1440×900, because the date keeps its vertical field and the photograph
  bleeds. That is the composition's cost, not a regression to hide.
- **The date's interior is the phone's.** On a wide screen the field has space
  at the bottom of the lockup column; the composition is the same at every
  width, so this is accepted rather than re-laid out for desktop.
- **The closing band still spans the viewport** while the date spans the
  measure. The band is the page's closing surface and always has been
  full-width; the date is a field within the column.
- **README changes with the implementation**: *Composition*, *Preview locally*
  and *Tests* describe the shipped page, as ADR-0005 established.

## Considered options

- **Keep the spread and adopt only some phone treatments.** Rejected: two
  compositions remain, and the test suite keeps its two geometries.
- **A reading measure narrower than 48 rem.** Rejected: the desktop would be
  narrower than a 768 px tablet already is today, and the column would jump.
- **A wider measure (84 rem) with the single column inside it.** Rejected: it
  keeps a token that promises width the composition does not use, and leaves a
  large empty margin either side.
- **Keep the name "editorial spread".** Rejected: a spread that is one column
  contradicts the word, and this project does not keep a name that has stopped
  being true.
