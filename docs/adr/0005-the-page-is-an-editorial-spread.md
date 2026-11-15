# The page is an editorial spread

- **Status:** accepted, superseded in part by ADR-0006
- **Date:** 2026-11-15
- **Supersedes:** ADR-0004 for the composition
- **Related:** ADR-0002 (the interpret-not-transcribe principle still holds),
  ADR-0003, README (*Composition*, *Motion*), `assets/css/style.css`,
  `tests/site.test.mjs`

## Context

ADR-0004 made the page one label: a cream-light panel on the cream ground, a
single reading measure, the print's stacking flattened into one bordered sheet.
It is faithful to the Locandina, and it reads as a print facsimile rather than a
website — one narrow column, everything centred, the same composition at every
width.

The brief is to keep the traditional essence and make the page feel modern. The
essence is the print identity — palette, SV Serif and SV Sans, the outlined
signature with the `II EDIZIONE` lockup, the cellar photograph, the torn edge,
the Locandina's facts and wording — and the event's character: a small December
festa in the cellars of a village. The label panel is neither. It is the
composition that made the page look printed, and it is the part a website can
change without touching the identity.

## Decision

The page is an editorial spread.

- The page is the paper, not a sheet floating on a ground.
- A wide grid, about 84 rem, with generous margins and asymmetric placement;
  type is left-aligned throughout. (The prototype in #34 fixed the measure at
  84 rem, so the record and the code agree.)
- The date keeps its vertical numeral — weekday above, the day at display
  scale, the month beneath, the time under `DALLE ORE`.
- The photograph spans the grid, keeps the print crop and keeps its single torn
  lower edge. The tear is the boundary between the photographic section and the
  paper prose.
- The prose sits in a measured column inset from the grid.
- One bordeaux band closes the page: the facts, the map and the Locandina
  download, cream on bordeaux. It is the page's only dark surface.
- Phone-first: the phone is one left-aligned column with the photograph at full
  width; the desktop is a deliberate large-format spread, not a wider phone.

The constraints do not move: no JavaScript, no build step, no third-party hosts,
self-hosted OFL fonts, the signature as outlines, no new copy the Comitato has
not approved, and the comment map the Comitato edits by.

## Consequences

- The stylesheet is rewritten around a token layer, a fluid type scale and
  `@layer`, not reskinned. The label's class names and structural assumptions
  leave with the composition.
- The test suite is re-pointed. The tests that do not depend on the composition
  — facts verbatim, date drift, metadata, no JavaScript, no third-party hosts,
  the content policy, focus and reduced motion — survive. The label's contracts
  — the tear polygon's coordinates, `container-type`, `.facts` and
  `.info-grid` — are replaced by contracts for the spread.
- Text returns to a bordeaux surface for the first time, so the contrast of
  cream and `--gold-light` on bordeaux is measured again, not assumed.
- The README's *Composition* and *Motion* sections change with the
  implementation, not before it: the README describes the shipped page.
- `GLOSSARY.md` is unchanged. The composition's name is an implementation term,
  not a term of the event; it lives here and in the README.

## Considered options

- **The Label, modernised in place.** Rejected: the single narrow panel and the
  flat stacking are what read as print; a reskin would leave them underneath.
- **An immersive, photograph-led scroll story.** Rejected: it spends a
  weak-signal phone's data budget on one large image, makes the bordeaux and
  cream identity hardest to read, and dates fastest.
- **A quiet gallery.** Rejected: too close to the label to justify the rewrite.
- **Warm craft as the whole direction.** Rejected as a direction: it reads
  rustic rather than modern. Kept as a texture layer — grain, softened rules,
  the tear as a real edge.
