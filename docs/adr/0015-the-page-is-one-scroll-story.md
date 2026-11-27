# The page is one scroll story

- **Status:** accepted
- **Date:** 2026-11-19
- **Supersedes in part:** ADR-0012 (the one gallery reveal range and the "No new
  motion is introduced" clause) and ADR-0009's motion note (the motion
  previously had no ADR)
- **Related:** ADR-0009, ADR-0011, ADR-0012, ADR-0014, README (*Motion*,
  *Tests*), `assets/css/style.css`, `tests/site.test.mjs`

## Context

The page is a cover: a full-bleed grapes photograph with the masthead set on it
in cream over a bordeaux scrim, a date band, the Cantina photograph with its
single torn edge, the prose and Programma, a gallery of four cellar photographs
and one bordeaux closing band. ADR-0009 fixed the composition; ADR-0012 fixed
the cover and the gallery. The motion was a first pass: an entrance on the cover
and one scroll reveal per block below the fold. The gallery's ADR said in so
many words that "No new motion is introduced."

The brief is to redesign the page **for motion**. The cover composition and the
print vocabulary are wanted; the page should move as it is read, not acquire a
second visual language. The user permitted layout changes where motion needs
them, but the storyboard below needs none.

The constraints do not move: no JavaScript effect (the only script is the
counter), no build step, no third-party animation library or host, the fixed
cream/bordeaux/gold palette and SV Serif/SV Sans, the same copy and DOM order,
no new image, and reduced motion serves the finished still page.

## Decision

The page is one scroll story: **the press sets the page, then the reader walks
through the cellars**. The vocabulary is the print's, extended by one word:
*press*, *ink*, *set*, *recede*, *drift*, *rule*.

- **The cover prints, then drifts.** The entrance is unchanged: the grapes
  recede from a hair, the signature is pressed from the left, the date is set
  with it, the lockup is inked and the subtitle settles. The date's day numeral
  settles from `translateY(0.06em)` with `--motion-numeral` on the paper's
  delay. As the cover leaves, the grapes drift up and slightly in behind the
  fixed masthead. The drift rides `.hero-photo picture`, not the image, so the
  image keeps its own entrance and the two transforms cannot replace each
  other. It is transform-only, timed by the view timeline's `exit` range
  (`exit 0% exit 100%`), so the first screen is the neutral state, and its scale
  grows from `1` to `1.08` with a `translateY(-2%)` rise, so the frame's edges
  never come loose and the cover keeps its own crop at rest.
- **The hero is never hidden by scroll.** The only hero scroll effect is the
  drift; the signature, lockup, subtitle and date stay complete on the first
  screen. The cover's type is never faded, clipped or moved by scroll.
- **The prose prints in reading order.** Each paragraph is its own `view()`
  subject: first paragraph, second paragraph, the Programma label inked, then
  the Programma paragraph, with increasing range starts. The label uses
  `entry 0% cover 30%` so a short heading is not left hidden while it is on
  screen.
- **The gallery recedes in sequence.** The lead landscape first, then the three
  portraits left to right, each with its own `cover` window. The recede is the
  existing `photograph-recede`; no new photograph effect is added.
- **The facts rise without dissolving.** `DOVE` then `A CURA DI` use
  `fact-rise`, which moves the fact 8 px and never changes opacity, so the
  closing band is legible the moment it is on screen. The two action rules draw
  in sequence; the actions themselves never fade. The band, its inner grid and
  its action container carry no animation.
- **Motion remains CSS only.** Every animation lives under
  `prefers-reduced-motion: no-preference`; under `reduce` the page is the
  finished spread. Every `view()` timeline is behind
  `@supports (animation-timeline: view())`; a browser without it, including iOS
  before 26, serves the static page. Every duration and delay is a
  `--motion-*` token; the scroll-linked animations keep the placeholder
  duration their token gives them while the timeline times the move. There is
  no ambient motion and no new UI.
- **The only new token is `--motion-numeral`.** The rest of the motion scale,
  the palette, the type, the copy, the image inventory and the DOM are
  unchanged.

## Consequences

- **The suite changes with the implementation, not before it.** The motion test
  gains one named hero exception: `.hero-photo picture` may carry
  `cover-drift`, with no opacity and no clip, and the keyframe must keep a
  growing scale margin. It also gains range-order guards for the prose, the
  gallery, the facts and the action rules, and a numeral assertion. The other
  contracts — the one `clip-path: polygon` tear, the 303:191 band,
  `overflow: clip`, the `photograph-*` "zoom, never fade" rule, the
  finished-page rule, the single reduce block and the focus rules — are
  untouched.
- **The cover pushes in to `1.08` as it leaves.** The growing scale is the price
  of a drift that never exposes an edge; at rest the cover keeps its own crop.
  If the push reads too strong in review, the end scale comes down before the
  motion goes.
- **The prose's per-child `view()` progress inside `columns` is the main
  cross-engine risk.** Chrome and WebKit are checked in review; Firefox shares
  the standards-based `view()` path, and a browser without it serves the static
  page. If a fragmented multicol box reports progress that reads as separate
  columns arriving, the fallback is a named `view-timeline` on `.cantina` with
  `timeline-scope`, not a wrapper or a script.
- **The facts and action windows are short because the elements are short.**
  The sequence is driven by position and the range-start offsets; if it reads
  simultaneous in review, the offsets grow rather than the effects change.
- **No layout change was needed.** ADR-0009's composition, the single 64 rem
  threshold, the date band, the tear and the gallery geometry stand. Any later
  spacing adjustment belongs in a new ADR.
- **The README changes with the shipped page** (ADR-0005): *Motion* describes
  the storyboard and the token, *Tests* describes the re-pointed guards.
- **`GLOSSARY.md` is unchanged.** "Drift", "range" and "story" are
  implementation terms, not terms of the event.

## Considered options

- **Two animations on `.hero-photo img`.** Rejected: the entrance already
  animates `transform`, so a second animation there would replace it unless it
  used `animation-composition` or individual transform properties, both a
  needless support risk. The picture wrapper already has the image's box.
- **A wrapper element inside `.hero-photo`.** Rejected: the picture is the
  wrapper, and adding an element for the same effect would churn the DOM the
  tests and editors navigate.
- **A viewport-fixed masthead.** Rejected: a `position: fixed` masthead at the
  cover's foot cannot stick without a taller containing block, and it would
  overlay the date and prose and need a scrim and height restructure. "Fixed"
  here means the cover composition does not move the masthead; the drift moves
  the photograph behind it.
- **A drift without a scale margin.** Rejected: a translate inside a clipped
  frame exposes the frame's edge at the foot.
- **Sticky or pinned scenes.** Rejected for this page: they change the
  composition, add mobile risk and work against the one-screen hero.
- **GSAP, ScrollTrigger or an IntersectionObserver.** Rejected: the no-JS
  guard, no third-party hosts and no build step.
- **Kinetic typography and text parallax.** Rejected: the print sets its type;
  moving body text hurts reading and can trigger motion sickness.
- **Opacity-only staggers for the facts.** Rejected: the band is content; a
  fade would hide it until the scroll reaches it. The facts rise, they do not
  dissolve.
- **A `scroll(root)` timeline for the cover.** Rejected: the drift is about the
  cover's own exit, and the `view()` timeline expresses that directly.
