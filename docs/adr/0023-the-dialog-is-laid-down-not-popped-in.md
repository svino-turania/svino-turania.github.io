# The dialog is laid down, not popped in

- **Status:** accepted
- **Date:** 2026-11-26
- **Supersedes in part:** ADR-0022 (the sentence that the Cantina's dialog adds
  no motion; the plan, the dots, the dialogs, the fallbacks and the script
  contract stand)
- **Related:** ADR-0003, ADR-0015, ADR-0022, README (*Motion*, *Mappa del
  Borgo*, *Tests*), `index.html`, `assets/css/style.css`,
  `tests/site.test.mjs`

## Context

ADR-0022 made the Cantina's panel cream paper on a bordeaux scrim and said, in
so many words, that it adds no motion. The panel therefore appeared and
disappeared in a single frame while the page behind it was already the quiet,
printed thing the rest of the page is: the one place where the page cut, and it
read as a cut rather than as the page stepping forward.

The owner asked for an animation on the dialog's opening and closing. The
page's motion laws are narrow and settled: motion is CSS only, every duration
and delay is a motion token, every effect is an addition under
`prefers-reduced-motion: no-preference`, the page under `reduce` is complete and
still, and the only script allowed to run is the Mappa's inline binding and the
counter (ADR-0003, ADR-0014, ADR-0022). A native `<dialog>` used to need script
to animate its close, so any answer had to either stay inside CSS or widen the
script's job.

## Decision

**The panel is laid on the page: it rises a few pixels and inks in as the scrim
darkens, and it settles back as it fades. The motion is CSS only and exists on
screen alone.**

- **The panel is not a card.** It does not scale, bounce or round; it comes up
  from `0.5rem` below its resting place in `var(--motion-ink)` with
  `var(--ease-press)`, while the bordeaux backdrop inks in over
  `var(--motion-quick)` with `var(--ease-set)`. Closing runs the same transition
  backwards, so the way out is the way in.
- **A native dialog closes with CSS now.** `transition-behavior: allow-discrete`
  on `display` and `overlay` keeps the panel drawn in the top layer until its
  fade is done, which is what lets `dialog.close()` — the button, Esc and the
  click outside — animate without a script. `@starting-style` supplies the
  opening frame. Both are in the stylesheet; the inline script is unchanged.
- **The motion is scoped to the screen.** It lives inside
  `@media screen and (prefers-reduced-motion: no-preference)` within the
  `motion` layer, so the print view and the no-script render never see the
  closed state: on paper and without JavaScript the six entries are simply
  there. The no-script stylesheet and the print rule also reset opacity and
  transform, so the two fallbacks and the motion cannot drift apart.
- **Reduced motion is the finished page.** Under `reduce` there is no
  transition, no starting style and no closed state; the dialog opens and closes
  at once, as it did before ADR-0022's panel was asked to move.
- **Older browsers snap.** Where `allow-discrete` or `@starting-style` is
  missing the shorthand is dropped, the panel appears and disappears at once,
  and nothing else about the page changes. The motion is an addition, never a
  requirement.

## Consequences

The dialog is the one element that enters and leaves the page, so the README's
motion rule that nothing starts invisible is stated with that exception rather
than contradicted silently. The static suite gains a guard for the transition,
its tokens, the discrete `display`/`overlay` pair, the starting style and the
fallback resets; the open, close, reduced-motion, no-script and print renders
are checked with the capture harness and a scripted browser. The panel's box,
its copy, its focus handling and the script stay as ADR-0022 records them.

## Considered options

- **Animate the close in the inline script.** Rejected: it would add a class,
  a transition-end listener and a timer to a binding that ADR-0022 keeps to
  opening and closing, and the effect would then depend on JavaScript.
- **A keyframe entrance instead of a transition.** Rejected: the close would
  still need `allow-discrete`, and a keyframe cannot run in reverse for the way
  out without a second animation and a script-visible class.
- **Scale, blur or a shadow.** Rejected: the panel is the page, not a floating
  card; the page has one shadow and it belongs to the cartoline (ADR-0020).
- **Animate on paper too.** Rejected: the print view is a still document. Its
  six entries are already in the flow and must never fade.
