# The prose opens on a drawing

- **Status:** accepted
- **Date:** 2026-11-20
- **Superseded in part by:** ADR-0019 (the two illustrated chapters sit in one
  walk; the glass, its height, the 64 rem measure and the overlap stand)
- **Related:** ADR-0009, ADR-0015, ADR-0016, `index.html`,
  `assets/css/style.css`, `tests/site.test.mjs`, `README.md`
- **Supersedes in part:** ADR-0009 (the prose in two columns of `22rem`),
  ADR-0016 (the "page's first drawing" clause, the Programma's
  `column-span: all` and the Programma paragraph's motion range)

## Context

The page's drawing vocabulary began with the Programma plate (ADR-0016): one
inline SVG, one tinted ink (`--ornament`), one 1.6 px stroke, no fill, no frame,
decorative and text-free, tied to the paragraph it sits beside. The reader asked
for a second drawing in the same idiom, on the right of the page and at the
height of the Programma plate, so that the page opens and closes its prose on
two drawings of equal height: the tasting glass behind the first paragraph, the
instruments beside the Programma paragraph.

The prototype fixed the constraint. The plate is 34 rem wide and 35.7 rem tall
on the desktop; the first paragraph is about 15 rem tall. A drawing of the
plate's height cannot sit inside a paragraph that short: inside the paragraph it
stretches the paragraph's box, collapses the two-column prose into one narrow
column and runs down into the Programma. The drawing needs a stage of its own,
and the page already has one: the Programma's chapter.

The constraints do not move: no build step, one script, no third-party host, the
fixed cream/bordeaux/gold palette and the SV Serif/SV Sans, no new image
request, one viewport threshold at 64 rem, the approved prose verbatim, and
reduced motion serving the finished page.

## Decision

**The prose opens as a chapter built like the Programma's.** At 64 rem it is a
grid: `34rem` of prose on the left and the plate's stage on the right. The
glass is justified to the end of the stage and overflows its track to the left,
as the Programma plate does.

**The glass is as tall as the Programma plate, not as wide.** Its width is the
plate's height expressed in the glass's own ratio —
`calc(34rem * 376 / 358 * 120 / 149)` on the desktop, `calc(14rem * 376 / 358 *
120 / 149)` on a phone: `28.75rem` and `11.84rem`. The two drawings therefore
share a height and a side, and keep their own proportions. The suite pins the
two expressions, so the drawings cannot drift apart in scale.

**The prose's two columns are withdrawn.** The prose runs in one `34rem`
column beside its drawing on the desktop, and the second approved paragraph
follows the first in that column. The Programma loses `column-span: all` and
`break-inside: avoid`: there are no columns to leave or to keep whole. This is
the composition change the move costs, and it supersedes ADR-0009's two-column
prose in part.

**On a phone the chapter keeps the prose measure.** The glass is
`11.84rem` wide — the 14 rem plate's height in its ratio — right-aligned behind
the paragraph's last words and dropped one spacing step, exactly as the phone's
Programma plate is. The prose crosses the drawing behind two cream passes.

**The drawing shares the plate's idiom and nothing else.** One tinted ink, one
stroke of 1.6 px, no fill, no frame, the foot on one short ground rule. It is
inline, `aria-hidden="true"` and `focusable="false"`, with no `<title>`, no
`<text>`, no `<image>`, no `<use>` and no external reference; the group carries
`data-figure="calice"` and the suite holds it against the paragraph's word
"vino". It is the page's device, not the Locandina's, and it does not become a
mark for wine, a logo or a series.

**Motion reuses the vocabulary.** The glass is a `view()` subject with
`ink-in`, `entry 0% cover 25%`, before the first paragraph's `section-rise`
(`entry 10% entry 45%`); the second paragraph follows at `entry 20% entry 50%`,
and the Programma paragraph moves to `entry 30% entry 65%`, so the four prose
subjects keep unique, increasing starts. No keyframe is added, the animation
lives under `prefers-reduced-motion: no-preference` and `@supports
(animation-timeline: view())`, and reduced motion serves the finished page.

## Consequences

- **The page is two illustrated chapters.** The prose opens as a chapter with
  the glass on the right; the Programma follows as the second chapter with its
  plate on the same side and at the same height. ADR-0009's two-column prose is
  superseded in part.
- **The prose is one column on the desktop.** It is `34rem` wide — wider than
  the old `22rem` columns, narrower than the phone's `48rem` measure — and the
  second paragraph sits under the first, in the chapter's left column.
- **The glass sits beside the prose without crossing it at 100% on the
  desktop.** Same height but a narrower bowl than the plate's 34 rem means the
  drawing does not reach the prose's last lines; the overlap the Programma has
  is not reproduced. At text zoom the tracks narrow and the bowl crosses the
  prose, and on a phone it crosses the paragraph's last words.
- **The drawings' sizes are tied.** Changing the Programma plate's width
  changes the glass's width, because the glass is sized from the plate's
  height; the suite pins both expressions.
- **The suite grows.** It asserts the drawing is decorative and text-free, that
  it opens the chapter, that the chapter is a `34rem` prose column beside the
  stage, that the glass is right-aligned at the plate's height on both widths,
  that the prose is lifted above it and carries two cream passes, that it inks
  before the first paragraph rises, and that both drawings carry the same six
  shared declarations.
- **The Comitato sees the rendered page before the merge.** The drawing is a
  new interpretation of their act on their page; the copy is already approved,
  the drawing is not a new fact, but the review is one round and it is theirs.
- **`GLOSSARY.md` is unchanged.** "Glass", "plate" and "chapter" are
  implementation words, not terms of the event.

## Considered options

- **The glass behind the paragraph's left edge, scaled to the paragraph.** The
  first implementation. Rejected by the reader: it should sit on the right and
  match the plate's height.
- **The glass right-aligned at the plate's height, inside the paragraph.**
  Rejected: the paragraph's column grew to the drawing's height, the prose
  collapsed to one narrow column with the right half of the page empty, and the
  drawing ran into the Programma.
- **The glass right-aligned but paragraph-scaled.** Rejected: it moves to the
  right without the plate's height, and the two drawings still disagree.
- **Keeping the two-column prose and placing the glass at the top of the right
  column.** Rejected: the drawing would sit behind the second paragraph rather
  than beside the prose, and at the plate's height it would run past the columns
  into the Programma.
- **A fixed `9rem` desktop glass with the two-column prose.** The previous
  iteration. Rejected: not the plate's height, and it stretched the paragraph's
  box and drifted at text zoom.
- **Making the glass `34rem` wide — the plate's width — rather than its
  height.** Rejected: at its ratio it would be taller than the plate (42 rem);
  the reader asked for the height.
- **The glass on the Locandina.** Rejected: the plate's rule — page device, not
  print, without a decision of its own.
