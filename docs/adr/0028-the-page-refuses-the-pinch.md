# The page refuses the pinch

- **Status:** accepted
- **Date:** 2026-11-27
- **Amends:** ADR-0025 (*Pinch stays the browser's* no longer holds: the
  viewport refuses pinch-zoom on the whole page, the open view included; the
  view's native pan, its three zoom squares, its double-click and the
  Ctrl+wheel staying the page's zoom all stand)
- **Related:** ADR-0003, ADR-0022, ADR-0025, ADR-0026, README (*Composition*,
  *Mappa del Borgo*, *Tests*), `index.html`, `assets/css/style.css`,
  `tests/site.test.mjs`

## Context

The page is one composition, not a document that reflows: full-bleed
photographs measured against the viewport, a cover whose signature and date must
fit the first screen, and the Mappa's plan drawn in scale. A pinch that zooms the
page does not reveal more of it — it crops the composition and slides it under
the finger.

The owner asked that a pinch stop zooming the page on a phone. A first cut
scoped the refusal to the open Mappa (`touch-action: pan-x pan-y` on the dialog,
the map's own view already owning its zoom); tried on the owner's phone, the
page still zoomed, because that cut left the page itself alone. The owner wants
the whole page, and accepted the accessibility cost that follows rather than
leaving the composition magnifiable.

The page's 200% text-zoom pass is not this: that is the reader setting a
browser text size, which the site must keep surviving. A pinch is a different
mechanism, and refusing it does not touch text zoom.

## Decision

**The page refuses pinch-zoom everywhere: the viewport declares
`maximum-scale=1, user-scalable=no`, so a pinch never magnifies the document,
and the open Mappa keeps `touch-action: pan-x pan-y` as a second refusal where a
browser ignores the viewport but honours the property.**

- **One meta tag.** `<meta name="viewport" content="width=device-width,
  initial-scale=1, maximum-scale=1, user-scalable=no">`. It is the supported
  mechanism, it is what mobile browsers read, and it adds no script: the two
  executable scripts and their 2000-character cap stand.
- **The map's declaration stays.** `touch-action: pan-x pan-y` on `.mappa__map`
  is now redundant on browsers that obey the viewport, and still buys the open
  view a refused pinch on the ones that do not but honour `touch-action`
  (Samsung Internet is the known one). Inside the dialog the gesture pans and
  scrolls the plan, as ADR-0025 set it.
- **Nothing else moves.** Panning, scrolling, the wheel, the three zoom squares,
  the double-click and Ctrl+wheel are untouched; the desktop, where the viewport
  meta means nothing, is untouched.
- **Pinned by the suite.** A test asserts the viewport's four directives, so a
  later edit that restores pinch-zoom fails.

## Consequences

- **Android Chrome, Firefox for Android and Edge refuse the pinch** unless the
  reader has switched on their own override — Chrome's *Settings → Accessibility
  → Force enable zoom*, Firefox's *Zoom on all web sites*. Those overrides are
  the reader's, not the page's, and they win; that is the right order.
- **Samsung Internet lets the pinch through** under its own default settings,
  and honours the map's `touch-action` where the page's meta is ignored.
- **iOS Safari has ignored `user-scalable=no` since iOS 10**, so an iPhone can
  still pinch the page; closing that would take a `gesturestart` script, which
  the two-script contract refuses. The limit is recorded, not hidden.
- **The accessibility cost is real and accepted.** Disabling zoom fails the
  Lighthouse *meta-viewport* audit and runs against WCAG 1.4.4 (Resize Text),
  which expects content to scale to 200%. The owner's call is that this page is
  a composition whose photographs and plan are measured in viewport units, and
  that text zoom, which the page does survive, is the resizing it protects.
- **The page stops being free to grow into a document.** Any later chapter that
  needs reflowing at a larger size — an agenda, a list of links, a form — now
  has no reader-side magnification on the phone. If one arrives, this record
  and the meta change together; the refusal does not stay silently.

## Considered options

- **Scoped to the open Mappa only** (the first cut: `touch-action: pan-x pan-y`
  on the dialog). Rejected by the owner after trying it on a phone: the page
  still zoomed, and the page was the complaint.
- **`touch-action` on `html` instead of the meta.** Rejected as the primary
  mechanism: iOS Safari does not honour it for page pinch, and older engines have
  regressed scrolling under a root `touch-action`. The meta is the supported
  way, and the property still guards the one surface where it earns its keep.
- **A `gesturestart` handler for iOS.** Rejected: a third script, against the
  two-script contract, for the one browser that has refused the supported
  mechanism for years.
- **Doing nothing and letting the layout answer it.** Rejected: the owner asked
  for the gesture to stop zooming, and a composition cannot reflow its way out
  of being magnified.
