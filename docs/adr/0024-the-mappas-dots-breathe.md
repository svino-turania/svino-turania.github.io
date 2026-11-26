# The Mappa's dots breathe

- **Status:** accepted
- **Date:** 2026-11-26
- **Supersedes in part:** ADR-0015 (the sentence "There is no ambient motion and
  no new UI")
- **Amended by:** ADR-0025 (the dots are also the expanded map's hotspots; the
  chapter's expand control and the view's zoom controls join the page's
  controls)
- **Related:** ADR-0003, ADR-0010, ADR-0014, ADR-0015, ADR-0022, ADR-0023,
  README (*Motion*, *Mappa del Borgo*, *Tests*), `assets/css/style.css`,
  `tests/site.test.mjs`

## Context

The owner asked for a hotspot animation on the Mappa del Borgo's dots. The dots
are the plan's controls, and each one opens a Cantina's dialog, but they say so
only on hover and focus: they re-ink their ring. On a phone there is no hover,
so the plan gives a reader no sign that its marks can be opened — the one signal
the chapter has is a colour change that never happens on touch. The page's other
controls are the links; ADR-0025 later adds the chapter's `Ingrandisci la Mappa`
control and the expanded view's three zoom squares.

ADR-0015 settled the motion law after the page was redesigned for motion: CSS
only, every duration, delay and easing a token, every effect an addition under
`prefers-reduced-motion: no-preference`, the page under `reduce` complete and
still, and — in so many words — "There is no ambient motion and no new UI". The
static suite enforced that last sentence with a single assertion: the
stylesheet may not contain the word `infinite`.

A hotspot that only answers a hover or a press cannot answer the problem it
was asked to solve, because the reader on a phone has neither until they have
already found the dot. The owner was shown both readings of "hotspot" — a
finite bloom that replays on interaction, and a slow pulse that keeps saying
the plan is openable — and chose the pulse, accepting that the page's motion law
needed to change for it.

## Decision

**Each dot keeps a hairline ring of its own ink that blooms out of it and thins
away, slowly and forever. It is the page's one repeating motion.**

- **The ring is drawn in the dot's ink.** A `::before` on `.mappa__dot-mark`
  starts as a 13 px circle with a 1.6 px `currentColor` hairline, exactly over
  the mark's ring, and grows to `scale(3.2)` as it fades: it reaches roughly the
  44 px target's edge, never outside it. The dot itself never moves, scales or
  changes colour, and the ring takes no pointer events.
- **It blooms and thins; it does not blink.** The keyframe is invisible at both
  ends — it fades in to 40 % by 18 % of the cycle and out by the end — so the
  loop has no seam, and the ring never rests visible.
- **The six are staggered.** `--motion-bloom-step` delays each dot after the
  first, so the plan reads as a field of places rather than as one flash. The
  delays are `calc()` of the token; no raw duration enters the stylesheet.
- **It is the one loop.** `--motion-bloom` is 3.2 s on `--ease-set`, with
  `infinite`. The motion guard no longer forbids repetition outright: it now
  allows exactly one animation to repeat and requires that animation to be
  `ink-bloom`. Every other animation on the page still runs once.
- **The base page has no ring.** The pseudo, its animation and the stagger live
  in the motion layer's existing `@media screen` block inside
  `prefers-reduced-motion: no-preference`. Under `reduce`, on paper and without
  motion the element is never generated: the dots are the plain marks they
  were, and the page is the finished spread.
- **The plan holds still behind a panel.** An open Cantina panel pauses the
  ring through `body:has(dialog.mappa__dialog[open]) .mappa__dot-mark::before`.
  The pause answers to the page because a panel stacks over whichever surface
  holds the dots — the chapter, or the expanded map whose drawing is the same
  element. Inside the expanded map, with no panel over it, the dots are that
  surface's own hotspots and keep pulsing: the map being open is not a reason
  to stop them. The pause is a property of the animation, not a script.

## Consequences

- **ADR-0015 is superseded in part.** Its "no ambient motion and no new UI"
  sentence no longer holds; the scroll story, the token law, the no-preference
  envelope and the finished-page rule it records all stand. The README's motion
  rules say "Only the map's dots repeat" instead of "Nothing repeats".
- **The suite changes narrowly with the implementation.** One assertion that
  banned `infinite` becomes an assertion that exactly one animation — the
  dots' — may use it; a new Mappa guard pins the ring, its `--motion-bloom`
  tokens, the six staggered delays, the pause behind the panel, and the absence
  of the pseudo from the base stylesheet. The rest of the motion guards are
  untouched.
- **Continuous motion costs a little.** Six composited pseudo-elements animate
  forever while the page is open, even off screen. The ring is a transform and
  opacity on a 13 px element, and the pause behind a panel removes the only
  moment the page is deliberately still elsewhere.
- **Reduced motion is still the finished page.** The ring is the only ambient
  effect, and the reader who asked the platform for less motion never sees it.
- **WCAG's pause rule is met through the platform, not the page.** Success
  criterion 2.2.2 asks for a way to pause motion that starts by itself and
  lasts more than five seconds. The page has no pause control: it relies on
  `prefers-reduced-motion`, on the ring being a small, low-contrast decoration
  that carries no information, and on the panel pausing it. If the site is ever
  audited strictly, the change is a pause affordance or a finite run of the
  bloom, not a silent exception.
- **The ring is clipped by the drawing near its edges.** `.mappa__drawing`
  clips its overflow, so at the plan's edge a ring may be cut. The dots sit well
  inside the frame; at 200 % zoom the cut is possible and is accepted rather
  than growing the clipping box.
- **An older browser without `:has()` keeps the ring running behind the panel.**
  The pause is an enhancement; the dots, the panel and its motion are unchanged
  where the selector is not understood.

## Considered options

- **A finite bloom when the map arrives, replayed on hover, focus and press.**
  Rejected by the owner: it needs a `view()` timeline to wait for the chapter,
  and on a phone it still fires only once, at a moment the reader may not be
  looking at the dot. It also reverses on scrolling back, which reads as a
  beacon being unlit rather than as a place staying open.
- **A bloom on hover and focus only.** Rejected: it is invisible on every touch
  screen, which is where the dots most need to announce themselves.
- **Scale or colour the dot itself.** Rejected: the dot is the plan's mark, not
  a button face; the page's motion vocabulary moves a ring around the mark, not
  the mark.
- **Amend the guard without an ADR.** Rejected: the no-ambient-motion sentence
  was a deliberate decision, and changing a decision by editing its test leaves
  the record lying.
- **Drive the pulse from the inline script.** Rejected: the script allowance is
  two executable scripts (ADR-0003, ADR-0014, ADR-0022), and the effect would
  then depend on JavaScript for a purely decorative signal.
- **A pause button near the map.** Rejected: it is new UI for one slow ring, and
  the platform's reduced-motion setting already turns it off entirely.
