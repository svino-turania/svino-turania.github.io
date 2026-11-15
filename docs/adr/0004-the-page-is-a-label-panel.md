# The page is a label panel

- **Status:** superseded by ADR-0005
- **Date:** 2026-11-14
- **Related:** ADR-0002, README (*Composition*), `assets/css/style.css`,
  `tests/site.test.mjs`

The page is one label: a cream-light panel on the cream ground, bounded by the
print's gold and an inset hairline, at most 46 rem wide. The identity — palette,
SV Serif and SV Sans, the signature and the photograph — stays. The composition
no longer follows the poster's stacking: the date strip, the bordeaux bands, the
full-bleed photograph and the facts rail are gone. This supersedes ADR-0002's
"scale, never composition" clause; its principle that the page interprets the
print rather than transcribing it still holds.

Three consequences are not obvious from the stylesheet.

**The tear moved from the viewport to the panel.** The print's amplitude is
4 mm of 303 mm, a fraction of the band's *width*. The photograph is now narrower
than the viewport, so the polygon's vertical coordinates are lengths against the
band's own inline size — `cqw`, with `container-type: inline-size` on the
wrapper. Left in `vw`, the teeth would compress inside the panel. A browser
without container queries loses the tear, not the photograph.

**The second tear retired.** The date strip's torn lower edge existed only to
carry the cream strip into the bordeaux band beneath it. The label has no such
transition, and one torn edge reads as a signature where two read as a motif.

**The lockup is bronze.** The `II EDIZIONE` text inside the signature was drawn
gold-light for a bordeaux ground. On the cream paper that measures about 1.9:1;
bronze measures 5.04:1. The path keeps the bordeaux ink.

## Considered options

- **The Poster** — the date at poster scale, the photograph full-bleed, the
  facts as a thin strip. Rejected: it keeps the composition that reads as a
  print facsimile.
- **The Notice** — one tight column, a contained photograph, the facts in a
  ruled margin, no bands. Kept as the fallback: plainer, strongest on a phone,
  less anticipation.
