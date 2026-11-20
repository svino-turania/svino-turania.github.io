# The page links the channels the Comitato confirmed

- **Status:** accepted
- **Date:** 2026-11-20
- **Supersedes in part:** ADR-0014 — its "the two actions are events" clause,
  its "exactly two `data-goatcounter-click` attributes" test, and its
  two-click counts in the Decision and Consequences. The counter itself, its
  script, pixel, privacy and retention stand. ADR-0017 — its "**The page is
  two illustrated chapters**" consequence: the Mercatino adds the third
  chapter, and the drawing idiom, the heights and the side are unchanged.
- **Related:** ADR-0010, ADR-0014, ADR-0017, `README.md` (*Content policy*,
  *Composition*, *Motion*, *The Mercatino*, *Tests*), `index.html`,
  `assets/css/style.css`, `tests/site.test.mjs`, `GLOSSARY.md`, and the issues
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

**The chapter is the page's third illustrated chapter.** It is a `<section>`
inside `.cantina`, after `.programma` and before the gallery, with
`aria-labelledby="mercatino"`. Its heading is the page's second `h2`, set in
the Programma's printed-label register; the suite asserts the two label
declarations are identical so they cannot drift. Its one paragraph is the
approved text verbatim, pinned by the suite as `MERCATINO_PARAGRAPH`, and it
adds no exhibitor, count, place or time, and no specific goods: the paragraph
says only that the producers show `i loro prodotti`.

**The plate is a market stall, and it is decorative.** One inline SVG,
`aria-hidden="true"` and `focusable="false"`, with no `<title>`, no caption, no
`<text>`, no `<image>`, no `<use>` and no external reference: a canopy on two
posts over a table, three crates and one basket beneath, on a single ground
rule. It follows the other drawings' idiom — one tinted ink (`--ornament`), one
stroke of 1.6 px at every size, no fill, no frame — and its group carries
`data-figure="mercatino"`; the suite compares that with the word `mercatino` in
the approved paragraph, as it compares `calice` with `vino` and the four
instruments with the Programma. It adds no image request.

**The chapter reuses the Programma's composition at a smaller scale.** On a
phone it is the same single column with the plate dropped one spacing step and
right-aligned at 12 rem, and the paragraph keeps the page's warm lift plus two
cream passes; from 64 rem the label spans the chapter, the paragraph takes the
`34rem` column and the plate 22 rem on the right. The page keeps its one 64 rem
threshold and its single composition.

**The motion is the existing vocabulary.** Label, stall and paragraph reuse
`ink-in` and `section-rise` as `view()` subjects with increasing starts, under
the existing `@supports` and `prefers-reduced-motion` guards; the chapter adds
no keyframe. Reduced motion serves the finished chapter.

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
- **The page gains a second `h2`.** The heading hierarchy stays valid — the
  signature is the only `h1`, and PROGRAMMA and MERCATINO are siblings — and
  the suite now asserts exactly those two labels in order.
- **The suite grows with the chapter.** It asserts the section's place after
  the Programma and before the gallery, the paragraph verbatim with no time,
  the plate decorative and free of text and external references, the
  `data-figure` against the paragraph, 12 rem on a phone and 22 rem on the
  desktop beside the `34rem` paragraph, the label register shared with the
  Programma, and the label → stall → prose order with no new keyframe. The
  one-64-rem-threshold rule, the one-script guard, the no-third-party guard
  and the image inventory are unchanged.
- **The chapter adds no request and no dependency.** Its drawing is inline,
  so the page still ships one HTML file and `assets/`; no photograph, font,
  sprite, icon font or script joins the page for the market.
- **`README.md` describes the chapter** (ADR-0005): *Composition*, *Motion*,
  *The Mercatino*, *Tests* and the approved-prose constants.
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
- **A photograph of the Mercatino.** Rejected: no approved photograph exists,
  and a stock one would assert exhibitors and goods the Comitato has not
  confirmed. The stall is a line drawing in the page's existing idiom.
- **A plate as wide as the Programma's `34rem`.** Rejected: the stall is a
  device beside the paragraph, not a frieze; 22 rem on the desktop keeps the
  drawing smaller than the chapter's prose and leaves the paragraph's ends
  clean.
- **The Mercatino as a fourth action in the closing band.** Rejected: the
  market is a chapter of the walk, not a fact or a link; the band carries only
  the printed facts and the confirmed destinations.
- **A time or a place for the market.** Rejected: the Comitato has fixed
  neither, and both belong to the Programma when it does.
