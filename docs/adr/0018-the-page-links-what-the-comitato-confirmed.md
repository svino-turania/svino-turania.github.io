# The page links the channels the Comitato confirmed

- **Status:** accepted
- **Date:** 2026-11-20
- **Supersedes in part:** ADR-0014 — its "the two actions are events" clause,
  its "exactly two `data-goatcounter-click` attributes" test, and its
  two-click counts in the Decision and Consequences. The counter itself, its
  script, pixel, privacy and retention stand.
- **Related:** ADR-0010, ADR-0014, `README.md` (*Content policy*,
  *Composition*, *Motion*, *Tests*), `index.html`, `assets/css/style.css`,
  `tests/site.test.mjs`, `GLOSSARY.md`, and the issues
  `svino-turania/comitato` #3, #4 and #5

## Context

The content policy said the page states nothing the Comitato has not decided,
and listed any social account among the things absent by choice. The closing
band had two actions: the map link and the Locandina download.

In November 2026 the Comitato confirmed two things the page did not yet carry.
The Mercatino is part of sVino and existed in the first edition; the page had
never covered it. The Comitato promotes the event through an Instagram profile
and a Facebook profile; the page linked neither. The same triage kept the
Cantine count and the route absent, because the Comitato had not settled them
(#3).

The widening is one decision about what the page may name, taken in two
pieces: the profiles land in #5, the Mercatino chapter in #4. Writing the
policy decision twice would let the two halves drift.

## Decision

**The policy widens to exactly what the Comitato confirmed, and no further.**
The absent-by-choice list no longer names "social account"; it still names any
contact detail the Comitato has not confirmed, and email and phone remain
absent. Entry, price, unconfirmed Programma items, the Cantine count and the
route stay out.

**The two profiles are icon-only actions in the closing band.** They follow
the Locandina download, in a third group of `.band__actions`:

- Instagram → `https://www.instagram.com/comitato_feste_turania`, named
  `Instagram`, counted as `apri-instagram` / `Apri Instagram`.
- Facebook → `https://www.facebook.com/comitato.feste.turania`, named
  `Facebook`, counted as `apri-facebook` / `Apri Facebook`.

Each anchor has no visible text and an `aria-label`; its glyph is one inline
monochrome SVG in `currentColor`, `aria-hidden="true"` and `focusable="false"`,
with no external reference, `<image>` or `<use>`. The page loads no icon font,
sprite, third-party script, Meta pixel or remote image for them. Each opens in
a new context with `target="_blank"` and `rel="noopener noreferrer"`, carries a
target of at least 44 × 44 px, and takes the band's existing rule and ink shift
on hover and focus-visible. The group inherits the actions' scroll reveal: its
two rules draw with the Locandina's, after the map's.

**The anchors are links, not resources.** ADR-0010 removed the blanket
same-origin ban and replaced it with narrow guards; the profiles add no load,
so the same-origin resource rule stands unchanged. The tracking attributes
count a click, as the map and the download do.

**The Mercatino half lands in #4 of #3.** The page gains a `MERCATINO` chapter
after the Programma: one paragraph the Comitato approved and a decorative
stall plate. The glossary already defines `Mercatino` and the `produttori
locali` that describe its producers; the wine rule is untouched. That chapter
references this ADR instead of writing the policy decision again.

## Consequences

- **The suite counts four clicks.** The tracked-link test names all four
  values and covers the profiles' URLs, accessible names, `rel`, `target` and
  inline icons. The typographic-action test is scoped to the map and the
  Locandina, because the icons carry no arrow and are not typographic actions.
  ADR-0014's two-click event set is superseded in part.
- **The band gains a third group, not a new visual language.** The profiles
  sit in a flex row inside the actions, keep the band's rule and ink shift, and
  add no panel, border, radius, shadow or button. Their rules join the scroll
  reveal that draws the two typographic rules.
- **The README records the confirmed channels.** The content policy names the
  two URLs and says the page loads nothing from either host; the composition
  and tests sections count the profile icons beside the two typographic
  actions.
- **Email and phone remain absent, and the suite still enforces that.** The
  policy change is a list edit, not a loosening of the email, phone or
  placeholder checks.
- **`GLOSSARY.md` is unchanged.** "Instagram" and "Facebook" are names of
  confirmed channels, not terms of the event. The Comitato entry already makes
  any contact details conditional on its decision, and it has now decided
  these two.

## Considered options

- **A visible "Seguici" line or labelled links.** Rejected: the band is
  typographic and the reader asked for icons; labels would compete with the
  Locandina's rule and repeat the profiles' names on the page.
- **An icon file, sprite, icon font or library.** Rejected: each is a new
  request or a new dependency, and the page already draws its ornaments inline.
- **Linking one platform only.** Rejected: the Comitato confirmed both, and a
  reader should reach either without a missing channel.
- **Treating the profile URLs as resources under the same-origin rule.**
  Rejected: an anchor navigates when clicked; it does not load. ADR-0010's
  guards look for loads.
- **Writing a separate ADR for the Mercatino.** Rejected: the policy widening
  is one decision, and two records would let the profiles and the market be
  widened independently by accident.
- **Publishing the Cantine count or route with the profiles.** Rejected: the
  Comitato has not fixed them, and the glossary forbids inferring either.
