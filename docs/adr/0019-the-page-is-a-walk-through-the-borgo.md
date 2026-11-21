# The page is a walk through the borgo

- **Status:** accepted
- **Date:** 2026-11-21
- **Supersedes in part:** ADR-0009 (the single strong surface; the cover, the
  scrim, the date, the tear and the chapter measure stand), ADR-0012
  (the gallery composition), ADR-0016 (the Programma's place inside `.cantina`),
  ADR-0017 (the chapter heading) and ADR-0018 (the Mercatino's place inside
  `.cantina`)
- **Superseded in part by:** ADR-0020 (the gallery is no longer the last
  photographs before the closing band; the cartoline chapter sits between the
  Mercatino and the gallery)
- **Related:** ADR-0002, ADR-0005, ADR-0011, README (*Composition*, *Motion*,
  *Tests*), `index.html`, `assets/css/style.css`, `tests/site.test.mjs`

## Context

The page is a cover: the grapes, the signature on its scrim, the date band, the
Cantina photograph with its tear, three illustrated chapters, the gallery and
the closing bordeaux band. The composition is settled and the palette, type,
signature and drawn ornaments are the event's identity.

The owner asked for the page to **feel more dynamic and modern**. The page's
motion is already a press entrance and one scroll story, but it is almost
invisible in reading: short ink wipes and a slow photograph recede. On a desktop
the prose leaves large areas of paper unused, and the chapters look alike. The
four links are the only elements that respond to the pointer.

The brief is a confident evolution, not a rebrand: keep the print identity and
the approved copy, and give the page a bolder tonal rhythm and a stronger sense
of movement.

## Decision

**The page is a walk with a bordeaux interlude.**

- **Each movement opens on its own content.** The prose opens on its glass,
  the Programma and the Mercatino on their printed labels, the gallery on its
  landscape photograph. The movements are not numbered and carry no chapter
  marks: the alternation of cream and bordeaux sets the rhythm. The page keeps
  one `h1` and its two `h2`s, `PROGRAMMA` and `MERCATINO`.
- **The Programma becomes the second strong surface.** It leaves `.cantina`,
  becomes a direct child of `.page`, and reads the existing strong-surface
  roles: bordeaux ground with the grain, cream prose, gold-light rule, and the
  instruments plate in `--ornament`. On this surface the ornament is the same
  40% gold mixed into `--strong` instead of `--cream`: a light gold line would
  merge with the cream prose, while the darker gold leaves cream above AA where
  the paragraph crosses a stroke. It keeps its approved paragraph and its
  overlap idiom; the two cream passes behind the prose become two bordeaux
  passes, so the glyph edge stays clean where the paragraph crosses the plate.
  The date stays on cream and the closing band stays strong: the page now has
  two strong surfaces, one mid-walk and one at its end.
- **The Mercatino is the Programma's sibling, not its child.** It leaves
  `.cantina`, stays on cream and keeps its stall, its paragraph and its 34 rem /
  22 rem geometry.
- **The illustrated chapters keep the print measure.** `.cantina`, `.programma`
  and `.mercatino` inset with `--chapter-pad`, a 48 rem column on the phone and
  a 64 rem box including the gutters from the desktop composition, centred on
  the page; their content is 58 rem on a wide screen, as before. The
  Programma's bordeaux ground and the Mercatino's cream ground run full-bleed,
  while the prose keeps its 34 rem text column and the glass and plate keep
  their height. The stages stay 24 rem, so the glass and the plate still
  overflow them and the paragraphs' last lines cross their inner rims. The
  bands and the gallery use `--shell-pad`.
- **The gallery gains a stagger, not a device.** On the desktop shell the middle
  portrait drops one spacing step; the phone container query resets it. The
  existing photograph recede stays. The photographs are not links, so they gain
  no hover zoom, no gold hover frame and no lightbox: a pointer affordance would
  advertise an interaction the page does not have.
- **The motion vocabulary does not widen.** The existing storyboard is
  re-pointed to the new structure: the chapter labels, plates and paragraphs
  keep their `ink-in` and `section-rise` ranges in reading order. No keyframe is
  added. The hero is unchanged: the grapes still drift behind a static
  masthead, and no type on the cover moves. Everything is inside
  `prefers-reduced-motion: no-preference`; under `reduce` the page is the
  finished spread.

## Consequences

- **The suite counts two strong surfaces.** The strong-surface test accepts
  `.programma` and `.band`, both reading `--strong`, `--strong-ink`,
  `--strong-ink-muted` and `--strong-rule`; the date remains a cream band. The
  Programma's local `--ornament` remix is measured there too: cream on the
  strong ornament stays above AA, and the ornament still shows against the
  bordeaux ground.
- **Programma and Mercatino are siblings of `.cantina`.** The direct-child
  selectors and the source-order assertions move with them. The paragraphs stay
  verbatim and the section `aria-labelledby` values stay wired to their `h2`s.
- **The reveal subjects are explicit.** The motion test's allowlist becomes an
  array of selectors, including the chapter headings and the plates; the ranges
  still increase in reading order.
- **The gallery's "no visible copy" rule survives.** The gallery still has no
  heading, no caption and no new photograph.
- **README and ADRs move with the code.** The composition, motion and test
  inventories describe the bordeaux interlude and the stagger. ADR-0009, 0012,
  0016, 0017 and 0018 record that this ADR supersedes them in part.
- **`GLOSSARY.md` is unchanged.** "Walk", "chapter" and "interlude" are
  implementation words; the event's vocabulary does not move.

## Considered options

- **A sticky running head with four in-page anchors.** Rejected by the owner
  after rendering: a banded menu under the date reads as website chrome bolted
  onto a print page, and this short walk needs no table of contents. The
  alternation of grounds and the illustrations already give the reader their
  place.
- **Folio numerals (`01`–`04`) at the head of each movement.** Rejected after
  rendering: they read as a running order or an agenda, and this walk has
  neither — the page's order is the Comitato's page order, not a numbered
  programme. The alternation of cream and bordeaux already sets the rhythm.
- **Sticky chapter numerals in a left rail.** Rejected: at 1024 px the rail
  steals width from the 34 rem prose and the plate overlap, and it adds a
  stacking context for a mark the page does not carry.
- **Masthead parallax.** Rejected: the grapes already drift behind a stationary
  masthead, which is the cover's one optical move; moving the signature would
  contradict ADR-0015 and compete with the photograph.
- **Hover zoom and a gold hover frame on the gallery.** Rejected: the photographs
  are not links. A hover state would promise an action and then do nothing.
- **A horizontal-scroll gallery.** Rejected: it hides photographs behind a
  drag, adds a scroll container, and is fragile against `view()` timelines.
- **A darker date band to balance the Programma.** Rejected: it would restore
  the date as a third strong surface and flatten the walk's rhythm.
- **An 80 rem shell.** Rejected: the shell is 76 rem and the date's one-line
  lockup and the closing band depend on it; the extra width is not needed.
- **Putting the chapter content on the 76 rem shell.** Rejected after rendering:
  the 34 rem glass and the 34 rem plate then sit inside a wider stage instead of
  overflowing it, and the paragraphs' last lines no longer cross their inner
  rims. The full-bleed backgrounds stay; the content keeps the 64 rem chapter
  measure.
- **A gallery heading or caption, or a visible chapter label for the prose.**
  Rejected: visible copy belongs to the Comitato.
- **Kinetic or typing text.** Rejected: it is a template gesture and it fights
  the print identity. The page moves by being set and walked, not by performing.
