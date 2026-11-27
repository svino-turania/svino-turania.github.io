# The Programma is an illustrated chapter

- **Status:** accepted
- **Date:** 2026-11-19
- **Superseded in part by:** ADR-0019 (the Programma leaves `.cantina` and
  becomes the strong interlude; the plate, the paragraph and the label stand)
- **Related:** ADR-0009, ADR-0012, ADR-0015, issue #70, `index.html`,
  `assets/css/style.css`, `tests/site.test.mjs`, `README.md`
- **Prototype:** `prototype/programma-plate` (five variants; winner D · Largo)

## Context

The page is one scroll story. The Cantina prose runs on a 48 rem measure and,
from 64 rem, in two 22 rem columns. The Programma was its tail: the same serif,
a printed label, one paragraph on the Menestrelli del Cicolano, inside the
prose columns.

The approved paragraph names four instruments — organetto, fisarmonica,
chitarra, tamburo — and the reader asked that the paragraph be associated with
music visually, not with a generic note. The page has no illustration at all:
its vocabulary is photography, set type, gold rules and one bordeaux band. The
constraints do not move: no build step, one script (the counter), no third-party
host, the fixed cream/bordeaux/gold palette and the SV Serif/SV Sans, no new
image request, and reduced motion serving the finished page.

A prototype tested five layouts. Its winning variant, D · Largo, is the one
this ADR records: a large plate with the thin stroke, beside the paragraph and
partly under it.

## Decision

**The Programma leaves the columns and opens as a full-width illustrated
chapter.** On the desktop it is `column-span: all` inside `.cantina`: the two
prose columns close, then the section opens with the label on clean cream, the
paragraph `34rem` on the left and the plate `34rem` on the right. The plate is
flush with the section's right edge and wider than its 24 rem grid track, so it
overflows left under the paragraph — the last lines of prose cross its inner
rim. On a phone the paragraph keeps the prose measure and the plate is `14rem`,
right-aligned and dropped one spacing step (`--space-7`) so the opening lines sit
on clean paper. Every glyph on the page carries a one-pixel warm letterpress
shadow (`--text-shadow`, bronze at 30%); the phone's Programma paragraph keeps it
and adds two cream passes so a line crossing a glyph does not blur its edge, and
the desktop keeps the single shadow, where the plate is beside the paragraph's
ends.

**The page gains its first illustration, and it is decorative.** One inline
SVG, `aria-hidden="true"` and `focusable="false"`, with no `<title>`, no
caption, no `<text>`, no `<image>`, no `<use>` and no external reference. It
draws the four instruments the approved paragraph names, clustered in a
pyramid: the tamburo standing on the ground rule, the chitarra leaning against
it, the fisarmonica behind and above, the organetto at the apex. The lozenge is
implied by the cluster; there is no enclosing line, no frame, no card. One
stroke of 1.6 px at every size, no fill, no shading, detail only where identity
needs it. No notes and no staff: the four instruments are the music. A single
ground rule is the only line drawn around them.

**The plate is one tinted ink.** `--ornament` is `color-mix(in srgb, var(--gold)
40%, var(--cream))`: bordeaux on the tint measures 7.00:1, so the paragraph keeps
AA where a glyph crosses a stroke; the tint on cream measures 1.42:1, so the
plate is furniture, not content. The tint is mixed into the token rather than
layered as opacity, so the measurement holds on the paper and does not move with
the ground's gradient. No full-strength gold enters the drawing.

**The paragraph is untouched.** It stays verbatim, the section's only `<p>`,
and a direct child of `.programma`; the label stays above it on clean cream and
is never overlaid. The four instrument groups carry `data-instrument`, and the
suite compares that set with the names in `PROGRAMMA_PARAGRAPH`, so the drawing
and the approved copy cannot drift apart.

**The drawing promises presence, not order.** It names the four instruments;
it does not reproduce the sentence's sequence. The cluster is the composition,
not a reading.

**Motion reuses the vocabulary.** The plate is a `view()` subject with
`ink-in`, its range `entry 10% cover 40%` between the label's `entry 0% cover
30%` and the paragraph's `entry 20% entry 55%`, so the section prints label,
drawing, prose. No keyframe is added, the animation lives under
`prefers-reduced-motion: no-preference` and `@supports (animation-timeline:
view())`, and reduced motion serves the finished page.

**The plate is the page's device, not the Locandina's.** It is not printed on
the poster and does not migrate there without a decision of its own. If the
Programma gains a second act, the plate belongs to the Menestrelli entry; it
never becomes a generic music mark for the section.

## Consequences

- **The desktop composition changes once, deliberately.** The prose columns
  close before the Programma instead of flowing into it; the section reads as
  the chapter the walk was moving toward. The one 64 rem threshold, the single
  column rhythm above it, the gallery and the closing band are unchanged. Any
  further composition move belongs in a new ADR.
- **The paragraph's measure is wider than the prose's columns.** `34rem`
  against the two `22rem` columns; that is what lets the plate live beside it
  without squeezing the prose into a 16 rem strip. The label and the first line
  keep the page's flush left.
- **The plate adds no request.** It is inline in `index.html`, so the page still
  ships one HTML file and `assets/`; there is no new binary, no new font and no
  new script. The four instrument groups are a few hundred bytes of path.
- **The text-over-drawing contrast is measured, not assumed.** `--ornament` is
  a mix, not a primitive; the suite computes the mix and asserts both the AA
  crossing and the tint's visibility on the paper. The tint is deliberately
  faint: the plate's presence comes from scale and spacing, not contrast.
- **The lift is page-wide.** One pixel of warm shadow under every glyph
  (`--text-shadow`, bronze at 30%) is visible on the paper and keeps the light
  type on the bordeaux band and the cover from sitting flat. The phone's
  Programma paragraph keeps it and adds two cream passes, because there the prose
  crosses the plate; the desktop keeps the single shadow. It is inherited from
  the body, so no component repeats it, and the suite asserts the body rule and
  that the desktop paragraph does not reset it.
- **The suite grows with the change.** It asserts the plate is decorative and
  free of text and external references, that it names exactly the paragraph's
  four instruments, that it sits between label and paragraph, that the section
  spans the columns, that the plate is `14rem` on a phone and `34rem` on the
  desktop, that the phone's plate drops one spacing step, that the phone's prose
  adds two cream passes to the page's warm lift and the desktop keeps the single
  shadow, that the plate is right-aligned
  with the released max width, and that it inks between the label and the
  prose. The existing guards — one `<p>`, verbatim prose, one 64 rem block, no
  max-width viewport query, the finished-page rule, the single script — stand.
- **The README changes with the shipped page** (ADR-0005): *Composition*, *The
  Programma*, *Motion*, *Tests* and the manual review list describe the chapter,
  the plate and its geometry.
- **The Comitato sees the rendered page before the merge.** The plate is a new
  interpretation of their act on their page; the facts are already approved, the
  drawing is not a new fact, but the review is one round and it is theirs.
- **`GLOSSARY.md` is unchanged.** "Plate", "cluster" and "emblem" are
  implementation words, not terms of the event.

## Considered options

- **A procession of four instruments in a row.** Rejected: at the desktop
  measure it would have been a frieze rather than a device, and the reader chose
  a single emblem.
- **A roundel enclosing the cluster.** Rejected: it adds the page's first
  circular geometry and turns the drawing into a logo with a frame.
- **A drawn lozenge.** Rejected: the frame makes the emblem a border; the
  implied lozenge keeps the shape and the openness.
- **A photograph of the Menestrelli.** Rejected: no photograph or likeness
  exists, and inventing one would assert appearance the Comitato has not given.
- **An audio recording with a play control.** Rejected: no recording, no rights,
  and a new interaction model on a page whose only script is the counter.
- **Notes and staff lines.** Rejected: the generic music cliché, and a second
  graphic system beside the page's rules.
- **Full-strength gold.** Rejected: bordeaux on gold is 3.78:1 where a glyph
  crosses a stroke, under AA.
- **The plate above the paragraph** (the prototype's control). Rejected: it is
  calmer and the drawing is clearer, but the text no longer crosses it, which is
  the association the reader asked for.
- **A card, panel or frame around the plate.** Rejected: the page has no sheet,
  panel or floating card; the drawing sits on the paper.
- **A separate `.svg` file.** Rejected: an extra request and a second file to
  keep in step; inline keeps `currentColor`, the one ink and the single-file
  ship.
- **The plate below the paragraph on phones.** Rejected: it is the cleanest
  reading and it was prototyped, but it gives up the overlay on the smallest
  screen; the reader kept the drawing behind the text, smaller and dropped a
  step, with a cream halo on the prose.
