# svino-turania.github.io

The one-page Italian site for sVino, II Edizione — 6 dicembre 2026, Turania
(RI) — published at <https://svino-turania.github.io> from the public
repository `svino-turania/svino-turania.github.io`.

Status: the page is a cover, recorded in ADR-0009, with the grapes photograph
full-bleed and the masthead set on it in cream over a bordeaux scrim; after the
prose, a gallery of four cellar photographs closes the page (ADR-0012), and the
eight cartoline d'epoca of Turania and Petescia are laid between the Mercatino
and the gallery (ADR-0020). It
carries the Locandina's facts, the Cantina prose, the confirmed Programma and
Mercatino, the map link, one Locandina download and the Comitato's Instagram
and Facebook icons. The identity (palette and type), the
outlined signature with the `II EDIZIONE` lockup, the full-bleed grapes cover,
the Cantina photograph with its single torn lower edge, the gallery, the Open
Graph and Twitter metadata, the square social preview, the print-derived motion
— rebuilt as one scroll story in ADR-0015 — and the accessibility work are all
in place. The rules below describe the system that work preserves.

## The site is the files it is

The site is `index.html` at the repository root, with the `assets/` tree
beside it. A static server delivers exactly those files; nothing is built
locally or in CI for the site. The Mappa's plan is exported outside the
repository from the cadastral base, and only its rendered SVG is committed.
There is one page at one address, and the address printed on
the Locandina stays the address of the site.

Node is required to run the tests and the local preview server (see
[Tests](#tests) and [Preview locally](#preview-locally)). Editing the page
needs a browser and the GitHub web editor, nothing else.

## Preview locally

Serve the site and open the address the server prints. The page must be
requested over HTTP, not opened as a `file:`, so that the stylesheet and fonts
under `/assets/` load.

```sh
npm start                      # http://127.0.0.1:8080/ — Ctrl+C to stop
PORT=3000 npm start            # another port
```

`scripts/serve.mjs` is a dependency-free Node server that serves exactly the
files the deployment publishes — `index.html` and `assets/` — with the right
type for the fonts and WebP files and no caching, so a refresh picks up an
edit. Nothing outside those paths is reachable. `python3 -m http.server 8080`
also works, but it serves the whole repository root.

Check the page before merging, in the browser's responsive mode:

- 320 and 390 px: the cover at its narrowest — the photograph edge to edge,
  the signature and subtitle in cream at its foot, the date a band on cream
  between two gold hairlines, the Cantina photograph edge to edge, the prose
  with the tasting glass on the right, behind the paragraph's last words and
  dropped one step, the Programma with its 14 rem plate on the same side and at
  the same height, the Mercatino with its 12 rem stall on the same side, the
  eight cartoline in one column, each narrower than the measure by its own
  pair of insets, led by its own gap and on its own tilt, the facts paired,
  the two actions stacked and the two
  profile icons in a row; no horizontal scrolling, and the signature and the
  date fit the first screen.
- 768 px: the same composition, with the shell's gutter at its widest; all
  three drawings keep their height and their side, and the cartoline become a
  two-up spread — four rows of two, each card dropped and nudged by its own
  step — so their printed lettering stays legible and the spread is laid out,
  not ruled.
- 1024, 1440×900 and 1920 px: the one desktop composition — the wide cover
  crop, the date on one line, the Cantina photograph full-bleed with its height
  cap, the chapters opening on their 64 rem measure with 34 rem of prose on the
  left and the drawing on the right (28.75 rem of glass, 34 rem of plate, the
  same height, and the Mercatino's 22 rem stall beside its paragraph's ends),
  the cartoline as a scatter of cards laid on the paper in three rows — three,
  three and two — the Turania montage as the anchor, every card with its own
  width and its own drop, neighbours tucking a shallow paper edge under one
  another, and the closing band split facts left, actions right. The
  signature and the date still fit the first screen.

Repeat at 200% text zoom: the date, the place and the organiser must stay
readable, with no horizontal scrolling and no clipped text. At a tight measure
the date's words wrap inside their areas rather than pushing the page sideways,
and the chapters keep their prose readable beside the drawings.

## Composition

The page is a cover and a walk: the cream ground is the page itself, with no
sheet or panel; apart from the cartoline's cards (ADR-0020), no border and no
shadow. The opening photograph — a close-up of black
grapes — runs edge to edge at every width, and the masthead — the signature, the
`II EDIZIONE` lockup and the subtitle — is set at its foot, inside the content
shell, in cream on a bordeaux scrim. The order is the cover, the date, the
Cantina photograph, the Cantina prose with its glass opening
as the first illustrated chapter, the Mappa del Borgo as the walk's picture,
the Programma as the second illustrated chapter and the page's mid-walk bordeaux
interlude, the Mercatino as the third illustrated chapter on cream, the
cartoline d'epoca, the gallery of four cellar photographs and one closing
bordeaux band.

The cartoline are eight archival photographs of Turania and Petescia, laid
between the Mercatino and the gallery: the old village, then today's cellars,
then the band. The chapter has no heading and no caption — the lettering
printed inside the cards is its only caption, and the `alt` sentences carry it
for screen readers. Each card is cream paper with a hairline and a small ink
shadow, its photograph matted uncropped at its native aspect, and the cards
carry a ±1.5° tilt: they are the page's one framed, shadowed object, an
exception ADR-0020 grants this chapter alone; every other photograph keeps
ADR-0012's no-frame rule. On a phone the eight are one column, each card inset
from the measure by its own pair of amounts and spaced by its own lead; on a
tablet the column becomes a two-up spread, asked of the chapter's own width,
each card dropped and nudged by its own step; on the desktop shell they are
cards laid on the paper in three rows — three, three and two — the Turania
montage as the anchor, every card with its own width and its own drop,
neighbours tucking a shallow paper edge under one another so the chapter reads
as a handful of cards on a table rather than a grid. They are not links, so
they gain no hover state and no lightbox; their only movement is the settle as
they enter, a rotation with no fade, static under reduced motion.

The gallery sits after the prose, on the paper, with the page's gutter: the one
landscape photograph at the shell's
width and the three portraits below it — three-up on the desktop shell with the
middle portrait dropped one spacing step, two-up on a tablet, and on a phone a
pair with the last portrait closing the gallery at the row's full width. Each
photograph keeps its native aspect ratio, with no crop, frame, shadow, radius or
second torn edge; the tear belongs to the Cantina band alone. The photographs
are not links, so they gain no hover zoom and no lightbox. The frames are
lazy-loaded, below the fold.

The cream ground is paper (ADR-0011). The body keeps `--surface` as its
background colour and lays two image layers over it: a neutral grain tiled from
an inline 480 px SVG `data:` URI at 0.10 opacity, and one continuous vertical
field that holds near `--cream-light` behind the date, settles to `--surface`
through the prose and deepens toward the closing band. The coarser fibre and
the larger tile make the paper visible rather than sensed: the lightest ground
is `#e4dac7` (luminance 0.7089) and the darkest `#d3c6ac` (0.5740), a
15.38-point delta under the 16% cap. Bordeaux reads 9.32:1 and 7.66:1 on the
two ends, and muted ink 5.91:1 and 4.86:1, so both clear AA across the field.
The grain adds no file, no request and no motion.

Sections run to the viewport's edges and inset their own content with one
computed value, `--shell-pad: max(var(--gutter), calc((100% - var(--shell)) /
2))`. The shell is 76 rem and the gutter is fluid (`clamp(1.25rem, 4vw,
3rem)`), so at 320 px the inset is the gutter and above 76 rem the content
centres. No wrapper element is added and no section uses `100vw`. The
full-bleed bands and the gallery use the shell; the three illustrated chapters
use `--chapter-pad`, a 48 rem column on the phone and a 64 rem box including the
gutters from the desktop composition, centred on the page; their content is
58 rem on a wide screen, so the glass and the Programma plate still overflow
their 24 rem stages.

The scrim rises from the photograph's bottom edge and is anchored to the
masthead, not to the hero, so its hold tracks the type at every width — at
1024 px the hero is shorter than twice the masthead. The photograph stays
visible above it. It is the palette's bordeaux at 0.84–0.94, and its weakest
stop is measured on the shipped crop, not assumed: the brightest pixel in the
masthead band is (252, 234, 217), relative luminance 0.8555, and at 0.84 cream
reads 5.82:1 and cream-light 6.23:1 (6.90:1 and 7.37:1 at 0.86). The signature
and the lockup are cream, the subtitle is cream-light. Gold-light would need a
0.92 scrim to clear AA there, so it is not used on the cover. The measured
ratio sits beside the rule, as the strong surface's ratios sit beside the
palette.

The date is a horizontal band on cream between two gold hairlines. It runs edge
to edge and sets its content on the shell: the tracked weekday above, the day
numeral at display scale beside `DICEMBRE 2026`, and `DALLE ORE` with the time
on one line. It is not a dark surface.

The page has two strong surfaces, and they frame the walk: the Programma
interlude in the middle and the closing band at the end. Both read
`--strong` for the ground, `--strong-ink` for cream, `--strong-ink-muted` for
the gold-light labels and `--strong-rule` for their rule. The date stays on
cream. The Programma's paragraph keeps its two-pass halo where it crosses the
plate, but the passes are `--strong`, not `--surface`: the glyph edge is cleaned
against the bordeaux ground it actually sits on. The cover adds `--on-photo`
(cream) and `--on-photo-soft` (cream-light) for type on the photograph. No raw
colour enters outside the primitive block.

The Cantina photograph keeps the exact 303:191 print crop and exactly one torn
lower edge, the boundary between the photographic section and the prose. It
runs edge to edge at every width and `sizes` says `100vw`. The frame caps its
height at 42 rem, so a 1920 px viewport does not get a 1210 px-tall band. The
tear is a vector polygon expressed against the photograph band's own width
(`cqw`, with `container-type: inline-size` on `.photo-band`), so the bleed
cannot compress its teeth. No raster tear is shipped.

The Cantina prose is set under the torn edge in SV Serif at the reading step, in
a 34 rem text column inside the illustrated chapters' 64 rem print measure, and
it opens the first of the page's three illustrated chapters:
the prose on the left, the tasting glass on the right, behind the paragraph's
last words and dropped one spacing step, exactly as the Programma's plate sits
beside its paragraph. The glass is one tinted gold (`--ornament`, 40% `--gold`
through `--cream`), one stroke of 1.6 px, no fill, no frame, the foot on one
short ground rule, and it is as tall as the Programma plate — not as wide: the
two drawings keep their own ratios. It is decorative (`aria-hidden`); the
paragraph carries the words.

The Mappa del Borgo follows the prose as the walk's picture, before the
Programma: the real plan of the borgo, exported from the cadastral base and
drawn in the page's cream, gold and ink palette. The buildings, streets and
piazza are in the served SVG; `Piazza Umberto I`, `la chiesa` and `Corso
Trieste` are HTML labels over it, all three set level, with a discreet `N` and
no scale bar, grid, frame or caption. The Comitato-confirmed Cantine —
ten of them — and the `Piazzale della chiesa`, the Pro Loco's stand in the little
square at the church's foot, are bordeaux dots, the page's only bordeaux-filled
marks, and each dot is a button that opens its own native dialog: the place's
name is the panel's heading, its house title for a Cantina, and its inside line
says what visitors find inside and who serves it. Two Casse are quiet gold
marks that name themselves with the word `Cassa` and open nothing. The marks stand where the plan draws them; where a
dot must step aside so a thumb can reach it, a short gold hairline joins it to
its true position. Each dot also blooms a slow ring of its ink — the plan's only
repeating motion — so the chapter reads as openable where nothing hovers, while
the Casse carry no ring. There is no list: the dialogs are the entries. The
chapter states no count, no number, no route and no order, and names no Cantina
the Comitato has not confirmed.

The chapter adds one control: `Ingrandisci la Mappa` sits under the plan and
opens the map in a near-full-viewport native dialog of its own. There the
drawing becomes the frame's scroll viewport — one finger, the wheel (two
fingers on a trackpad), the arrow keys and the scrollbar pan it natively — and
one layer wrapping the plan, its labels, its dots and the two Casse scales as
one picture at 1, 1.5, 2 and 3×, with three quiet paper squares at the frame's
bottom right for `+`, `−` and the whole plan; a double-click zooms toward the
pointer, while Ctrl+wheel stays the browser's page zoom. The chapter remains one
screen-high object at every width; the expanded view is a transient surface that
owns nearly the whole screen while it is open, and closing it returns the plan
to the chapter at fit. A dot inside the expanded map still opens its Cantina
panel above it, and returns to the same view when the panel closes. Bordeaux
stays the entries' dots alone; the Casse are gold marks beside them.

Without JavaScript the eleven dialogs flow under the plan and the expand control
is not shown; on paper the plan, the entries and the Cassa marks print in order
and the control is not printed. The plan is a generated asset: the
permission to publish a derived plan, the source data and the export script
stay outside this repository, and only the rendered SVG is committed, never
edited by hand. ADR-0022 records the plan, its
provenance, the dialogs and the two-script contract, and supersedes ADR-0021;
ADR-0025 records the expanded map; ADR-0026 records the plan's rows and real
positions, the two Casse, the piazzale and the removed position caveat.

The Programma follows as the second illustrated chapter and as the page's
mid-walk strong surface: a full-bleed bordeaux interlude with the printed label — sans, the
small step, bold, wide tracking, gold-light — and, beside the paragraph, its
plate. The plate is a line-art cluster of the four instruments
the approved paragraph names — organetto, fisarmonica, chitarra, tamburo — in
the page's tinted gold, one stroke of 1.6 px, no fill, no frame, standing on a
single ground rule. On this surface the tint is the same 40% gold mixed into
`--strong` rather than `--cream`: a darker gold pressed into the bordeaux, so a
light line never merges with the cream prose that crosses it. It is
decorative (`aria-hidden`); the paragraph carries the words, stays the
section's only `<p>`, and keeps its warm lift and its two-pass bordeaux halo
where it crosses the plate. The Mercatino follows on cream as the third chapter,
on the same 34 rem + stage grid: the printed label, the
paragraph on the left and, beside it, the stall — a canopy on two posts over a
table, three crates and one basket beneath, on a single ground rule — in the
same tinted gold, one stroke of 1.6 px, no fill, no frame. It is decorative
(`aria-hidden`); its paragraph carries the words, and it names no exhibitor,
count, place, time or goods. The gallery closes the walk. Every
glyph on the page carries a one-pixel warm letterpress shadow
(`--text-shadow`, bronze at 30%):
visible on the paper, and warm on the bordeaux surfaces and the cover. The facts
pair and the two actions stack at every width, with the two profile icons
closing the actions in a row.

From 64 rem there is one desktop composition, and it gives the width only to
what the phone already has: the cover widens to a 3:2 crop and the signature
caps at 36 rem so the photograph stays visible; the date sets on one line;
the chapters open on their 64 rem print
measure, each `34rem` of prose on the left and its drawing on the right — the
glass `28.75rem` wide to be as tall as the `34rem` plate, the plate overflowing
its track so the paragraph's last lines cross its inner rim, and the Mercatino's
`22rem` stall beside its paragraph's ends; the Programma and the Mercatino are
full-bleed bands, the first bordeaux, the second cream, while their content stays
on the chapter measure; the gallery's three portraits are staggered with the
middle one dropped; the closing band puts the facts left and the actions right,
with the colophon on a full-width tail. The content order does not change.

The closing bordeaux band is the second of the page's two strong surfaces. It
carries `DOVE`, `A CURA DI`, the map link, the Locandina download, the Instagram
and Facebook icons and the colophon, cream on bordeaux with the role labels in
gold-light. The Locandina has one download anchor, in that band. There is no
second copy and no show/hide rule, so there is nothing to keep in step.

Each fact has one home, so the page does not read as duplicated boilerplate:
the time is in the date under `DALLE ORE`; the place is under `DOVE`; the
organiser is under `A CURA DI`. The map link opens Google Maps for the same
place without repeating it, and the colophon states the edition only.

ADR-0019 governs the walk: the Programma interlude and the staggered gallery.
It supersedes ADR-0009 (the single strong surface), ADR-0012 (the gallery
composition), ADR-0016 (the Programma's place inside the prose), ADR-0017 (the
chapter heading) and ADR-0018 (the Mercatino's place) in part. ADR-0020 governs
the cartoline chapter between the Mercatino and the gallery and supersedes
ADR-0012's no-frame, no-shadow rule for that chapter alone. ADR-0009 still
governs the cover, the scrim, the date, the tear and the chapter measure;
ADR-0012 still governs every photograph except the cartoline; ADR-0016, ADR-0017
and ADR-0018 still govern the plates, the paragraphs and the tracked links.
ADR-0004 is superseded for all of them.

## Motion

The page moves as it is read: the press sets the page, then the reader walks
through the cellars. It is one scroll story, in reading order.

The cover prints itself first. The grapes photograph is the paper: it is present
on the first frame, close to the reader, and the view recedes from it — never a
fade. The signature is pressed in from the left, the date is set with it from
its left edge, hairlines and all, and the day numeral settles into the band;
then the `II EDIZIONE` lockup is inked and the subtitle settles. Each step
follows the one before it, overlapping, so nothing waits on anything. As the
cover leaves, the grapes drift up and slightly in behind the fixed masthead:
the only scroll effect on the hero, transform-only, never a fade or a reveal.

Below the fold the story continues in reading order. The view steps back out of
the Cantina arch — a zoom, never a fade, inside the tear the frame cuts, so the
edge never moves. The prose prints itself: the glass, the first
paragraph, the second paragraph; then the Mappa's label, its plan and its
dialogs; then the Programma label, the plate
and its bordeaux paragraph; then the Mercatino label, its stall and
its paragraph; then the cartoline, which settle one by one in reading order;
then the gallery, which recedes photo by photo,
the lead landscape first and the three portraits left to right. The facts rise
in sequence, DOVE then A CURA DI, without dissolving; the band is content, not a
curtain. The action rules draw in order, and the profiles' two rules draw with
the Locandina's; the actions themselves never fade.

The hero — the signature, its lockup and subtitle on the grapes photograph, and
the date — is complete on the first screen and never waits for the scroll.
Scroll-driven reveals are only for the Cantina photograph, the
prose and its glass, the Mappa (its label and plan), the Programma (its
label, plate and paragraph), the Mercatino (its label, stall and paragraph), the
cartoline, the gallery and the facts band; the hero's one scroll effect is the
grapes' drift, which never hides or fades.

The page's four tracked links all respond: they shift their ink and re-ink
their rule from the left edge. The two typographic actions also lead their
arrows by 2 px, as if the label were picked up. Each action settles 1 px while
pressed. The Mappa's dots, the chapter's `Ingrandisci la Mappa` and the expanded
view's three zoom squares are the page's other controls: a dot re-inks its ring
on hover and focus, and opens its Cantina's dialog; the expand control and the
squares re-ink their hairline on hover, and the panel's `Chiudi` is the visible
way back. Each dot also keeps a slow bloom — a hairline ring of its own ink
leaves the dot and thins out at the 44 px target's edge, the dots staggered — so
the plan says it can be opened even where nothing hovers. It is the page's one
repeating motion, it pauses behind an open Cantina panel — in the chapter or
over the expanded Mappa — and it is absent under reduced motion. On a phone the
browser's own blue tap flash is turned off and the panel wears no browser ring,
so a touch answers in the page's ink.
The expanded Mappa and a Cantina's panel are the two surfaces that enter over
the page. The map is simply there when it opens and gone when it closes, and its
zoom jumps; the panel is laid on the page — it comes up a few pixels and inks in
while the bordeaux scrim darkens — and settles back as it fades when it closes.
Under reduced motion both are simply there. The plates and the photographs
remain furniture, not controls.

Motion is CSS only. The no-JavaScript guard allows exactly two executable
scripts — the Mappa's small inline binding and the counter — so no animation may
depend on either; the binding's own work is opening and closing the expanded map
and stepping a zoom that jumps, while panning stays the browser's. Without it
the expand control is not shown and the chapter is as it is today. The rules
are:

- **The base style is the finished page.** Animations are added under
  `prefers-reduced-motion: no-preference`; under `reduce` the page is
  complete and still. Nothing on the page starts invisible and nothing is
  shrunk; the two things that enter are the expanded Mappa and a Cantina's
  panel, both opened over the page, and under reduced motion both are simply
  there.
- **Only the map's dots repeat.** The page has one ambient effect: the Mappa's
  dots bloom a ring of their ink so the plan reads as openable on a phone,
  where nothing hovers. It is staggered by `--motion-bloom-step` times each
  dot's own `--bloom`, runs inside
  the chapter and the expanded Mappa alike, pauses while a Cantina's panel is
  open, exists only on screen with motion allowed, and is gone under `reduce` —
  the base stylesheet draws no ring at all. Everything else runs once; sustained
  movement comes from scroll position, never from a clock.
- **The focus indicator appears at once.** The outline is the indicator and it
  is not animated; the link's colour and rule follow the same transition as
  hover. That is not motion that delays use.
- **A Cantina panel's motion is CSS too, and screen only.** Its opening frame
  is `@starting-style` and its close stays drawn by `transition-behavior:
  allow-discrete` on `display` and `overlay`, so the native panel fades before
  the browser drops it and the script stays as ADR-0022 records it. The
  expanded Mappa adds no entrance and its zoom never animates, at any motion
  setting. On paper the entries are in the flow and never fade; where the
  features are missing, the panel opens and closes at once.
- **Every duration, delay and easing comes from the motion tokens** in `:root`
  (`--motion-recede`, `--motion-press`, `--motion-ink`, `--motion-settle`,
  `--motion-date`, `--motion-numeral`, `--motion-quick`, `--motion-rule`,
  `--motion-bloom`, `--motion-bloom-step`, `--motion-scroll`, the
  `--motion-after-*` entrance delays, and `--ease-press`
  / `--ease-set`), not from magic numbers. The press curve arrives fast and
  settles; the set curve reveals the date evenly.

The entrance finishes in about 0.9 s; the signature is legible at about 640 ms,
the numeral settles by about 560 ms and the date is fully set at about 880 ms.
Scroll-driven motion (`animation-timeline: view()`) is
progressive enhancement behind `@supports`; browsers without it serve the
static page with the same content. The cover drift is timed by the view
timeline's `exit` range, so the
first screen is the neutral state; the prose, gallery, facts and rules
carry their own staggered ranges.

The signature has no stroke, so the press edge is a `clip-path` on the filled
path, not a stroke animation. The actions' rules are pseudo-lines rather than
borders precisely so they can be ruled; the extra 1px of padding keeps their
rendered boxes identical. ADR-0019 records the walk and its two strong surfaces;
ADR-0020 records the cartoline settle, the one keyframe that rotation adds to
the vocabulary; ADR-0015 records the earlier scroll story, the
cover drift and its stagger ranges; ADR-0024 records the dots' bloom, the page's
one loop; ADR-0025 records the expanded map, its native panning and its zoom
that does not animate. The motion itself is cheap to reverse.

## Editor workflow (Comitato)

Editors change `index.html` in the GitHub web editor and install nothing. It is
the only file that carries content; `assets/` holds the stylesheet, fonts and
images and is not edited for a routine change.

A comment at the top of `<body>` maps the editable values. Each value also has
a short comment beside it in the file:

| What                  | Current value                  | Where it appears on the page                                  |
| --------------------- | ------------------------------ | ------------------------------------------------------------- |
| Date                  | `datetime="2026-12-06"`        | the `datetime` attribute of `<time>` is the source of truth    |
| Day number            | `6`                            | the date lockup, under the weekday                             |
| Weekday               | `DOMENICA`                     | the date lockup, above the numeral                             |
| Month and year        | `DICEMBRE 2026`                | the date lockup, under the numeral                             |
| Time                  | `12:00`                        | the date, under `DALLE ORE`                                   |
| Place                 | `Turania (RI)`                 | `DOVE` in the closing band, plus the title/description metadata |
| Organiser             | `Comitato Feste Turania`       | the `A CURA DI` value in the closing band                     |
| Subtitle              | `Per le cantine di Turania`    | under the signature                                           |
| Edition               | `II EDIZIONE`                  | the lockup beside the signature, the colophon and the metadata |
| Opening image description | the approved Italian sentence | the `alt` attribute of the image in `.hero-photo`          |
| Photograph description| the approved Italian sentence  | the `alt` attribute of the Cantina photograph                 |
| Entries on the map    | ten Comitato-confirmed Cantine, the `Piazzale della chiesa` and two Casse | one dot button and one `<dialog>` with the same `id` per entry; two non-interactive gold marks, each with its `Cassa` label; no list |
| Locandina download    | `assets/download/locandina-svino-ii-edizione.jpg` | the single link in the closing band, at every width |

The date is the one value the page states in several forms. Change
`datetime="2026-12-06"` only if the Comitato moves the event, then bring the
day number, the weekday and the month and year into agreement with it. A test
recomputes all four from `datetime` with the Italian locale and fails if they
drift, so a wrong weekday cannot be published. The title, the description, the
Open Graph and Twitter tags and the `og:image:alt` value repeat the edition,
the date and the place: update them in the same change so the page and its
social preview agree.

`<head>` also carries a `WebSite` JSON-LD block naming the site `sVino`, with
`sVino Turania` as the alternate name. That block is what Google reads for the
site name beside a result. Without it, a subdomain on `github.io` falls back to
the domain's name and Google writes "GitHub". The block is data, not code: the
suite allows it alongside the two executable scripts, and its `url` must stay
the canonical home page.

The body text states each fact once. If the place changes, update `DOVE`, the
metadata and the query in the map link's `href` (Google Maps), which must keep
matching the place (`Turania%20(RI)` today); do not repeat the place in the link
text or the colophon. If the time changes, update only the value under `DALLE ORE` in the
date lockup. A test counts `12:00`, `Turania (RI)`, `Comitato Feste Turania`,
`DALLE ORE`, `DOVE` and `A CURA DI` in the visible body text and fails if any
appears more than once. The piazza's name appears once as visible text, as the
Mappa del Borgo's label over the plan; the plan's `alt` says `la piazza` without
the name; the Petescia card's `alt` quotes the lettering printed inside that
photograph, and the structured `Event` location repeats the name in data only.
The Mappa's `alt` and its dialogs carry no digit and no number of entries, no
route and no order; the `alt` names the bordeaux entries and the plan's two gold
marks, and it follows the spec's sentence. No structured data is added for
individual entries.

The Locandina download is one anchor, in the closing bordeaux band. It is
present at every width, with no second copy and no rule that hides it, so
there is one `href`, `download`, `type` and link text to keep correct.

The Cantina prose sits between the `CANTINA — INIZIO REGIONE MODIFICABILE`
and `CANTINA — FINE REGIONE MODIFICABILE` comments. Keep it inside those
markers. It is the page's own prose, not printed on the Locandina: the
Comitato approves it, the maintainer edits it, and a test pins it verbatim.
The second paragraph promises that this page will carry the event's news, so
add no categories to that promise — no entry, price or duration — until the
Comitato decides them.

The Mappa's entries are edited in one place each: one dot button in the plan
and one `<dialog>` with the same `id`, whose heading is the place's name — a
Cantina's house title or the piazzale's — and whose inside line carries what
visitors find inside and who serves it. To add an entry, add one dot and one
panel of the same `id`, and give the dot its own `--bloom` — its place in the
plan's order, from zero — so the stagger needs no stylesheet rule; to move one,
change its two percentages, `--x` and `--y`, taken from the drawing box. A dot
that steps aside for a thumb keeps its true position in `--nudge-x` /
`--nudge-y` and a `span.mappa__leader` hairline, never more than 18 px. The two
Cassa marks and their `Cassa` labels live beside the dots in the same drawing
markup. A test requires one dot and one dialog per Comitato-confirmed Cantina
and the same `id` set; it fails if the chapter carries a list, any digit at all
(no count, no numbered pin), a connecting route line, an unconfirmed Cantina or
an unconfirmed title. Do not edit `assets/img/mappa-del-borgo.svg` by hand: the
plan is exported outside this repository from the cadastral base, and a changed
frame or palette is a new export.

To propose a change:

1. Open `index.html` on GitHub and use the pencil button.
2. Commit to a new branch and open a pull request rather than committing to
   `main`.
3. Treat the pull request as the review point. GitHub shows the HTML diff; to
   see the page, serve the branch locally as described above.
4. Merge after the review. A merge to `main` deploys automatically.

If a change needs a new layout or a new asset, open an issue for the
maintainer instead of editing it alone.

## Search visibility

The page is written for the searches a small local event can actually win:
the brand query `svino turania` and local-intent queries such as `festa del
vino Turania` or `eventi Turania`. It is not written for broad regional
queries (`eventi Lazio dicembre`): a new, one-page site cannot win those in the
event's lifetime, and the national *Cantine Aperte a Natale* campaign falls on
the same Sunday. Local aggregators carry those searches; the page carries the
local ones.

What `<head>` declares, and what the tests pin:

- the title and description name `sVino`, `II EDIZIONE`, `6 dicembre 2026`,
  `Turania (RI)`, and add the category words `festa del vino` and the province;
- the `WebSite` JSON-LD names the site `sVino`, alternate name `sVino Turania`;
- the `Event` JSON-LD announces the event with `name`, `startDate`
  (`2026-12-06T12:00:00+01:00`), `location`, `organizer`, `performer`, `image`,
  `eventStatus`, offline attendance, `url` and `inLanguage`;
- `sitemap.xml` carries a `lastmod`.

The `Event` location is Piazza Umberto I, Turania, RI, 02020, IT: the declared
starting point, because the cantine open across the borgo and schema.org's
Event expects one location. It is structured data, not page prose, with one
deliberate exception: the piazza enters the visible body once, as the Mappa del
Borgo's label over the plan, and is not repeated in prose. The block deliberately has no `endDate` and no
`offers`: the page does not publish the end time and the Comitato has not
decided a price or entry policy. Do not add them to make the rich result
richer.

`docs/seo-submissions.md` holds the off-site packet — blurb, image, URL and
where to send them. Being listed on the local aggregators matters more than
any further change to the page. After a deploy, submit `sitemap.xml` in Search
Console and request indexing of `/`.

Do not add visible SEO copy, a second page or hidden keyword text: the page's
visible content is a designed cover, and the design is the product. Do not
change the canonical URL or add a custom domain for this edition (ADR-0001);
revisit it with the III Edizione.

## The Programma

The Programma is a chapter of `index.html` — not a new page or route — so the
address printed on the Locandina stays the address of the Programma. It is a
direct child of `main.page`, after the prose chapter and before the Mercatino;
it follows the Cantina photograph and the prose and precedes the Mercatino, the
gallery and the closing band. It is the page's mid-walk strong surface.
On a phone it keeps the prose measure; from 64 rem it opens
as a full-bleed chapter.

```html
<section
  class="programma chapter chapter--strong"
  id="programma"
  aria-labelledby="programma-title"
>
  <h2 id="programma-title">PROGRAMMA</h2>
  <svg class="programma__plate" aria-hidden="true" focusable="false">…</svg>
  <p>…</p>
</section>
```

The heading takes the printed-label register. The plate is the Programma's
drawing — the page opens on the glass in the prose: the four instruments
the approved paragraph names — organetto, fisarmonica, chitarra, tamburo —
clustered in a pyramid (the tamburo on the ground rule, the chitarra leaning,
the fisarmonica behind and above, the organetto at the apex), in one tinted ink
(`--ornament`), one stroke of 1.6 px, no fill and no frame. On the bordeaux
interlude that ink is 40% gold mixed into `--strong`, not into the cream: the
drawing recedes under the cream paragraph and keeps its contrast above AA. It
is decorative:
`aria-hidden`, no `<title>`, no caption, no text. Each instrument group carries
`data-instrument`, and the suite compares that set with the names in
`PROGRAMMA_PARAGRAPH`, so the drawing and the prose cannot drift apart. The
drawing promises the four instruments, not the order of the sentence. On a
phone the plate is 14 rem, dropped one spacing step so the opening lines sit on
clean bordeaux, and the paragraph keeps the page's warm lift and adds two
bordeaux passes so a line crossing a glyph does not blur its edge; the desktop
keeps the single lift and puts the plate beside the paragraph's ends. The label
stays on clean bordeaux above the paragraph and is never overlaid; the paragraph
stays the section's only `<p>`.

The plate is the page's device, not the Locandina's: it does not appear on the
print without a decision of its own. If the Programma gains a second act, the
plate belongs to the Menestrelli entry, never to the section as a generic music
mark. The section carries no time of its own: the date band already gives the
start, and the group's end time is deliberately not published.

The paragraphs are approved prose. The two Cantina paragraphs between the
markers, the Programma paragraph and the Mercatino paragraph are the text the
Comitato approved, pinned verbatim by `tests/site.test.mjs` as
`CANTINA_PARAGRAPH`, `PROGRAMMA_PARAGRAPH` and `MERCATINO_PARAGRAPH`; change
them only with Comitato approval, and update those constants in the same
change.

An act joins the Programma only once the Comitato has confirmed it; a proposal
or a possibility does not, and nothing is added to fill the space. Do not move
the Programma into the closing band; the band carries only `DOVE`, `A CURA DI`,
the map link, the Locandina download and the colophon. Keep the heading order
valid: the signature is the page's only `h1`, so the Programma heading is an
`h2`.

## The Mercatino

The Mercatino is the market of local producers, part of sVino and present since
the first edition. It is a chapter of `index.html` — not a new page or route —
and it follows the Programma as its sibling: after the bordeaux interlude,
before the gallery and the closing band. It stays on cream.

```html
<section
  class="mercatino chapter"
  id="mercatino"
  aria-labelledby="mercatino-title"
>
  <h2 id="mercatino-title">MERCATINO</h2>
  <svg class="mercatino__plate" aria-hidden="true" focusable="false">…</svg>
  <p>…</p>
</section>
```

The heading takes the Programma's printed-label register, and the suite asserts
the two label rules are the same declarations. The plate is a market stall — a
canopy on two posts over a table, three crates and one basket beneath, on a
single ground rule — in one tinted ink (`--ornament`), one stroke of 1.6 px, no
fill and no frame. It is decorative: `aria-hidden`, no `<title>`, no caption,
no text. Its group carries `data-figure="mercatino"`, and the suite compares it
with the word `mercatino` in `MERCATINO_PARAGRAPH`, so drawing and prose cannot
drift apart.

On a phone the plate is 12 rem, right-aligned and dropped one spacing step, and
the paragraph keeps the page's warm lift with two cream passes; from 64 rem the
chapter opens with `34rem` of paragraph on the left and the `22rem` plate on
the right. The paragraph is approved prose, the third constant pinned verbatim
by `tests/site.test.mjs` as `MERCATINO_PARAGRAPH`; change it only with Comitato
approval, and update the constant in the same change.

The chapter names no exhibitor, count, place, time or specific goods:
`GLOSSARY.md` forbids inferring the first four, and only the Comitato confirms
them. The approved paragraph says only that the producers show `i loro
prodotti`, as a class. Its
`produttori locali` describe the producers, not the wine: the wine of sVino is
not from Turania, so `vino locale` stays forbidden. The plate is the page's
device, not the Locandina's. ADR-0018 records the widening that admitted the
market, beside the two profiles.

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main` and on manual
dispatch. It has two jobs. The first installs Node, runs `npm ci` and
`npm test`. The second needs the first, checks out the repository, installs
nothing, copies only `index.html` and `assets/` into `_site/`, uploads that
directory as the Pages artefact and deploys it. A failing test stops the
deploy, and no dependency tree, test or repository document can reach the
published site.

GitHub Pages serves from the Actions deployment, not from a branch folder, and
the address is the one recorded in ADR-0001. The workflow does not run on pull
requests, so preview a pull request locally before merging.

## Tests

The test seam is the repository root, as a static server serves it. `npm test`
runs `node --test tests/*.test.mjs`; there is no build to run first. The tests
read `index.html`, its assets and its metadata as a visitor or link checker
would: the printed facts, the Cantina prose, the Programma paragraph, the
Mercatino paragraph and the Mappa's eleven dialog entries verbatim, the date
literals against `datetime`, the map destination, the declared language,
headings and link names, the three narrow guards — two executable scripts, the
Mappa's inline binding before the counter, with the counter pinned to
GoatCounter's CDN and last, and no inline handler or shipped `.js`; no host on
the documented tracker denylist; no font fetched from outside the origin — and
the content policy. The visit counter is GoatCounter's script at the end of
`<body>`, which reads the source domain, the region and the four clicks. The
pixel stays in the colophon inside `<noscript>` for readers without JavaScript,
with no Referer, an empty `alt`, and a cookie-free notice linking the
processor's privacy page. The pixel is the page's only external image request.

The Mappa has its own guards. It pins the Comitato-confirmed dialog entries
and their copy; it requires one button dot and one dialog per entry, with the
same `id` set, and fails if the chapter still has a list or a `<details>`. It
fails on any digit in the chapter (no count, no numbered pin), on text inside a
dot, on a connecting route line, and on the unconfirmed rows and titles. It
requires the plan to be an `<img>` pointing at the shipped SVG, lazy and
asynchronous, with its intrinsic 546 × 792 size and an `alt` that describes the
plan without a digit or the piazza's name; it also requires the four HTML
labels, the north mark and the absent scale, grid, frame and caption. It reads
the SVG as an image: well formed, with no text, script, external reference or
embedded raster, the three layers `strade`, `piazza` and `fabbricati`, the baked
palette, a transparent ground, and the comment that says it is generated from
the cadastral base and must not be edited by hand. It pins the no-script style
that flows the ten
dialogs under the plan and hides the dead dots and close controls, the print
rule that prints the plan, the entries and the two Cassa marks with the
close controls hidden,
the dialog's screen-scoped opening and closing — its motion tokens, the
discrete `display` and `overlay`, the starting style and the fallback resets
that keep the entries visible without JavaScript; the dots' ink bloom — the
page's one allowed loop, its `--motion-bloom` tokens, the staggered delays,
the pause behind an open panel, the Casse with no ring, and the absence of the
ring without motion; the
inline script's dot-to-dialog binding and close handling under a size cap, and
the counter as the last executable script. The expanded
map has its own narrow guards: the chapter's `Ingrandisci la Mappa` and its
no-script hiding; the map dialog's name and close; the drawing as the scrolling
viewport; the single `zoom` layer; and the three zoom squares with their
disabled ends. The old inline schematic is asserted absent.

The suite is not a browser runner: the native dialog's open, Esc,
click-outside and focus-return, the no-script render and the print view are
checked with the external capture harness, while the suite pins the markup,
the CSS guarantees and the script contract (ADR-0022 records this).

The suite also asserts the page's contracts. The date is one `<time>` lockup
with `datetime="2026-12-06"`, its printed parts in DOM order (day, weekday,
month), and a `dl.date-time` directly after it holding `DALLE ORE` and an
`HH:MM` value: the time has one home. The label and the clock are asserted
to share one row by construction — a flex line, not the grid's implicit
column placement — so a browser that ignores the latter cannot drop `12:00`
under `DALLE ORE` while the rest of the page still renders. The grapes
photograph is the cover: it shares the page's first row with the masthead,
which sits at its foot on a bordeaux scrim in cream; the scrim's weakest
stop is measured against the crop's brightest pixel — pure white — and
asserted at 4.5:1. The Cantina photograph keeps the 303:191 band and has
exactly one torn edge measured in
`cqw` against the photograph band (`container-type: inline-size` on
`.photo-band`), with no raster tear shipped. The gallery follows the prose with
four described photographs, each a JPEG/WebP pair at its native width, lazy and
asynchronous, with no caption, no tear and no preload. The cartoline sit between
the Mercatino and the gallery: eight described JPEG/WebP pairs at 800 px, lazy
and asynchronous, with no heading, no caption and no visible text of their own;
the card is asserted to be the page's one shadow, to carry a frame and a tilt,
and never to crop its photograph, and the chapter's settle is asserted to be a
rotation in reading order. The
Programma and the Mercatino are asserted as chapters after the prose, siblings
of the prose chapter and before the gallery: the page's three `h2` labels
(Mappa, Programma, Mercatino) set in the printed-label register, and each
approved paragraph verbatim with no time of its own. The page has two strong
surfaces — the Programma interlude and the closing band — both reading the
same `--strong*` roles; the band carries `DOVE`,
`A CURA DI`, the map link, the single Locandina download, the Instagram and
Facebook icons, the counter notice and the colophon, and the date carries the
lockup and `DALLE ORE` with the time. The
gallery's middle
portrait is staggered only in the desktop block. The stylesheet declares no
dark-mode block. The suite measures cream and gold-light on bordeaux and records
the ratios beside the palette, and pins the favicon's path data to the inline
signature path.

The Locandina is one `a[download]`, inside `footer.band`, with an `href`,
`download`, `type` and a discernible name, pointing at a file that exists and is
a readable RGB JPEG; no rule that styles the band or its actions hides it. The
time, place, organiser and the `DALLE ORE`, `DOVE`, `A CURA DI` labels each occur
exactly once in the visible body text; the map link opens `Turania (RI)` on
Google Maps in a new context with `noopener noreferrer` and its text need not
repeat the place; and the reading order is brand first. The two typographic
actions are rules, not buttons; each carries exactly one `aria-hidden` arrow
that is absent from the name computed from the markup. The two profile links
are icon-only: each carries an `aria-label` and no visible text, an inline
`currentColor` SVG that is `aria-hidden` and `focusable="false"` with no
external reference, a target of at least 44 × 44 px, and the same
`noopener noreferrer` new-context contract as the map. All four actions count
their click.

The stylesheet keeps its own maintainability contracts: the layer order, the
token isolation (no raw hex outside the tokens layer), and the primitives and
semantic roles the composition reads. The ground's caps are named too: the
grain token sits under 0.10, its tile is 480 px at 0.5 frequency, and the
field's tonal span stays under 16% while bordeaux and muted ink clear AA at
both ends. The motion rules are asserted as well: no
looping animation, every animation inside `prefers-reduced-motion:
no-preference`, every animation and transition duration and delay taken from a
`--motion-*` token, the entrance sequenced by the `--motion-after-*` delays,
every `view()` timeline behind `@supports`, the hero
free of scroll reveals except the grapes' transform-only drift, the
Cantina photograph, the prose, the Mappa, the Programma and the Mercatino, the
gallery and the facts revealed in reading order, and the band's actions never
faded.

The Programma's plate is asserted as decorative, free of text and external
references, and naming exactly the four instruments of the approved paragraph;
the section opens at 64 rem with `34rem` of paragraph and its plate, the plate
is 14 rem on a phone and 34 rem on the desktop, the phone's plate drops one
spacing step and the prose adds two bordeaux passes to the page's warm lift, the
desktop keeps the single shadow, and the tinted ink keeps the paragraph above
AA where it crosses a stroke. The Programma is asserted as the second strong
surface, with the same `--strong*` roles as the closing band.

The Mercatino is asserted as the third illustrated chapter, after the Programma
and before the gallery: the page's third `h2`, an approved paragraph pinned
verbatim, and no time of its own. Its stall is asserted as decorative, free of
text and external references, named `data-figure="mercatino"` while the
paragraph still names the market, and placed between the label and the
paragraph; it is 12 rem on a phone and 22 rem on the desktop beside the
`34rem` paragraph, right-aligned and dropped one spacing step on a phone, with
two cream passes on the prose at both widths, sharing the three plates' one
idiom; the label's declarations equal the Programma's; and it
prints label, stall, prose in that order, reusing `ink-in` and `section-rise`
under the guards already named, with no keyframe of its own.

The prose's glass is asserted as decorative, free of text and external
references, the opening chapter's drawing and named `data-figure="calice"`
while the paragraph still names the wine; it is placed on the right, at the
height of the Programma plate (`calc(14rem * 376 / 358 * 120 / 149)` — the
plate's height expressed in the glass's ratio — and the same expression at
34 rem on the desktop), dropped one spacing step on a phone and released from
its track on the desktop; the chapter is a `34rem` prose column beside the
stage, the prose is lifted above the drawing and carries two cream passes, and
the glass inks before the first paragraph rises. The three drawings'
declarations are asserted to share one idiom, so the copy of the six shared
declarations cannot drift apart.

The suite asserts what a visitor observes and the CSS contracts the stylesheet
declares for geometry: the shell and its computed inset, the cover's shared
first row and its scrim, the date's band on cream between two hairlines, the
Cantina photograph's full-bleed with its tear and height cap, the paired facts
and the stacked actions, and the one desktop composition. One assertion states
that there is exactly one 64 rem block, no 48 rem block and no narrow-viewport
override — the page has one viewport threshold — and the gallery's phone rhythm
is asserted on its container query. The layout itself is verified
by rendering at 320, 390, 768, 1024, 1440 and 1920 and at 200% text zoom.

The label's contracts were replaced by these page contracts, and each
replacement is named in the commit that replaced it.

Directory-walking assertions use an allowlist — `index.html` and everything
under `assets/` — so `node_modules/`, the tests, the repository documents and
the git directory are never treated as shipped files. One test asserts that
`index.html` is the only HTML page in that set and that it carries no
unrendered template syntax.

New assertions belong in `tests/site.test.mjs` and must be observable in the
served page, not in its internal structure.

## Signature and the demo font

The signature ships inline in `index.html` as outlined vector paths extracted
from the print master, not as live text and not as a webfont. Its path is
reflowed at the existing subpath separators so the file is navigable for the
Comitato; the line breaks change no rendering.

The lettering comes from Breathing (Din Studio), whose demo is marked
"Personal Use Only": it is not OFL and its licence does not cover promotional
use. The font file must never be committed to this repository and must never be
fetched at runtime — no `@font-face`, no CDN, no font file in the shipped site.
The outline is the only form in which the lettering is distributed. The font
guard fails on any font fetched from outside the origin, so a font CDN cannot
slip in; the tracker denylist is a separate guard. The ban on committing the
font file itself is a review rule.

If the lettering ever changes, re-extract the outline from the updated print
master. Do not add Breathing to the repository, and do not re-typeset the
signature on the site.

The identity type is Lora for dates and numbers and Lato for information, both
SIL Open Font License. They are self-hosted as subsets, renamed SV Serif and
SV Sans under the OFL Reserved Font Name condition and accompanied by the full
licence text; they are never requested from a third-party host. The signature
is the one exception delivered as a path.

## Derived assets and the print master

The print workspace at `/Users/angelo/svino` remains the source of truth for
the identity: `SVINO_v15/sorgenti/Svino_A3_master_v15.svg` and the accompanying
v15 print and social files define the palette, type, signature, photograph,
tear profile and wording. The site derives from them, never the reverse, with
one named exception: the page-only photographs — the grapes cover and the four
gallery photographs — have no counterpart on the current Locandina (ADR-0012).

Site assets under `assets/` are derivatives, regenerated from the master — or,
for the page-only photographs, from their recorded sources in
`/Users/angelo/svino/images/page/` — rather than edited independently. They are:

- the signature outline, inlined in `index.html`;
- the tab icon and the touch icon, under `assets/icons/`, derived from that
  inline outline;
- the Cantina photograph derivative, under `assets/img/`;
- the grapes cover derivatives, under `assets/img/` — page-only, recorded in
  ADR-0012;
- the four gallery photograph derivatives, under `assets/img/` — page-only,
  recorded in ADR-0012;
- the square social preview image, under `assets/img/`;
- the Locandina download, under `assets/download/`, rendered from the print
  master.

### The photograph

The photograph derives from the print master's photograph crop,
`/Users/angelo/svino/images/build/svino_a3.jpg`: 2244 × 1415, RGB, already
cropped to the approved framing. The site's 1200 × 756 copy is that same crop
scaled — the two differ only by resampling, so the framing cannot drift between
them. `images/cantina-marcello.jpeg` (1122 × 1402) is the source photograph;
`prepare_images.py` upscales it 2×, grades it and crops it to the A3 band.
`images/svino.jpg` (2048 × 1359) is the previous edition's photograph before
the print crop; it is no longer shipped — the opening photograph is the grapes
cover — and it must never replace the Cantina photograph, or the edges will
disagree with the poster.

The page offers the crop at 2048 px for high-density screens and the 1200 px
copy for narrow screens and slower connections, through `srcset` and the same
`sizes` value on the WebP source and on the JPEG fallback: `100vw`. The Cantina
band runs edge to edge at every width, so the browser sizes it against the
viewport. The 2048 px candidate serves high-density screens and is downscaled,
never upscaled: it is a downscale of the 2244 px crop, not a larger render of
the 1200 px copy.

Regenerate all four files from the crop with:

```sh
# 1200 px narrow copy: JPEG and WebP
sips -z 756 1200 /Users/angelo/svino/images/build/svino_a3.jpg \
  --out assets/img/svino-cantina-1200.jpg
cwebp -q 78 -resize 1200 756 /Users/angelo/svino/images/build/svino_a3.jpg \
  -o assets/img/svino-cantina-1200.webp

# 2048 px wide candidate: JPEG and WebP
magick /Users/angelo/svino/images/build/svino_a3.jpg \
  -resize 2048x1291! -strip -sampling-factor 2x2,1x1,1x1 -quality 93 \
  assets/img/svino-cantina-2048.jpg
cwebp -q 78 -resize 2048 1291 /Users/angelo/svino/images/build/svino_a3.jpg \
  -o assets/img/svino-cantina-2048.webp
```

The explicit sizes matter: the source is 2244 × 1415, so a bare
`--resampleWidth 1200` would round to 757 px tall and break the `<img>`
intrinsic 1200 × 756. Keep both variants RGB — never CMYK — and keep the two
widths in step: they are the same crop. The 1200 px JPEG stays the `<img>`
fallback for browsers that read no `srcset`.

### The grapes cover

The opening photograph is the close-up of black grapes, a page-only asset
(ADR-0012). Its source is `/Users/angelo/svino/images/page/uva-upscaled.jpeg`,
1536 × 2048 RGB — the Comitato's 4× upscale of the 384 × 512 original, which
stays beside it as `uva.jpeg`. The page ships three copies from that one file,
768 × 1024, 1152 × 1536 and 1536 × 2048, as JPEG/WebP pairs, and names all three
in `srcset` with `sizes="100vw"`; the browser picks by viewport width. The cover
runs edge to edge at every width, so above 1536 px the browser upscales it
again — 1.07× at 1440 px and 1.25× at 1920 px — and a high-density desktop
upscales its chosen copy as well. ADR-0012 records that cost. The scrim covers
the foot of the frame, where the masthead sits; the type is measured against
the crop's pure-white specular highlight — still white in every shipped copy —
not assumed.

Regenerate the six files with:

```sh
for w in 768 1152 1536; do
  h=$((w * 4 / 3))
  magick /Users/angelo/svino/images/page/uva-upscaled.jpeg \
    -resize "${w}x${h}" -strip -sampling-factor 2x2,1x1,1x1 -quality 92 \
    "assets/img/svino-uva-$w.jpg"
  cwebp -q 78 -resize "$w" "$h" \
    /Users/angelo/svino/images/page/uva-upscaled.jpeg \
    -o "assets/img/svino-uva-$w.webp"
done
```

The 768 px pair is the `<img>` fallback and sets the intrinsic size,
768 × 1024, for browsers that read no `srcset`. Keep every copy RGB and at 3:4;
the CSS crops the cover to 4:5 on a phone and 3:2 above 64 rem. Never ship a
width above 1536 px: the source has no more detail, so a larger derivative
would spend bytes without adding any.

### The gallery photographs

The gallery ships four page-only photographs from
`/Users/angelo/svino/images/page/`, each at its native width and in its native
orientation: one landscape (`cantina pietro.jpeg`, 1195 × 896) and three
portraits (`cantina vale.jpeg`, `botte.jpeg` and `torchio.jpeg`, each
896 × 1195). The page does not crop them; the frames keep the source ratio, so
on the desktop shell the three portraits share a row, and below 64 rem they
wrap two-up. On a phone the gallery's own width can no longer hold two 18 rem
columns, so the three portraits become a pair and the last one spans the row: a
wide lead, two supporting frames, one full-height finish, instead of four
full-width photographs of nearly the same shape stacked on top of each other.
That condition is asked of `.gallery`'s content box (a container query), not of
the viewport, so the page keeps its single 64 rem threshold; a browser without
container queries keeps the full-width column. Each photograph is served as a
JPEG/WebP pair, lazy and asynchronous, with explicit `width` and `height` so the
row reserves its space.
On a 2× screen the portraits are still downscaled and the landscape is upscaled
about 2×, because the shell is wider than its 1195 px source; that is recorded
here rather than hidden.

Regenerate the pairs with:

```sh
for pair in "cantina pietro.jpeg:svino-cantina-pietro-1195" \
            "cantina vale.jpeg:svino-cantina-vale-896" \
            "botte.jpeg:svino-botte-896" \
            "torchio.jpeg:svino-torchio-896"; do
  source="${pair%%:*}"
  name="${pair##*:}"
  magick "/Users/angelo/svino/images/page/$source" -strip \
    -sampling-factor 2x2,1x1,1x1 -quality 92 "assets/img/$name.jpg"
  cwebp -q 78 "/Users/angelo/svino/images/page/$source" \
    -o "assets/img/$name.webp"
done
```

Keep each file at its native size and RGB. If a source is replaced with a
differently sized photograph, rename the derivative and update both the `<img>`
intrinsic size and the test inventory.

### The cartoline

The eight cartoline d'epoca are page-only assets without a counterpart on the
Locandina. Their sources live in `/Users/angelo/svino/images/postcards/` as the
copies taken from the Comitato's WhatsApp group on 21 November 2026 — five from
Riccardo and three from Giovanni — and they are the only copies, because
WhatsApp expires media, and the originals are already recompressed by the
messenger (1080–1600 px on the long side). Each ships as one
800 px JPEG/WebP pair, which covers the largest card at 2×; the page never
requests a wider copy. The files are named for the place printed inside the
card — `turania` or `petescia`, the village's earlier name — and never by a
date, because none of the eight is dated with certainty. Do not crop a card: the
printed lettering sits at the photograph's edges, and the cream margin grows
around the native format. Do not add a look filter: they are historical
documents, and the palette does the unifying.

```sh
for name in cartolina-turania-montaggio cartolina-turania-piazza \
            cartolina-turania-piazza-vasca cartolina-turania-cappella \
            cartolina-petescia-montaggio cartolina-petescia-piazza \
            cartolina-petescia-piazza-umberto cartolina-petescia-panorama; do
  source="/Users/angelo/svino/images/postcards/$name.jpg"
  magick "$source" -resize '800x>' -strip \
    -sampling-factor 2x2,1x1,1x1 -quality 92 "assets/img/$name-800.jpg"
  height=$(magick identify -format '%h' "assets/img/$name-800.jpg")
  cwebp -q 82 -resize 800 "$height" "$source" -o "assets/img/$name-800.webp"
done
```

The WebP is resized to the JPEG's exact height so the two candidates declare
one intrinsic size; a one-pixel disagreement would shift the card's frame when
a browser swaps sources.

### The square social preview

`assets/img/svino-quadrato-og.jpg` is a 1080 × 1080 RGB JPEG converted from
`SVINO_v15/Svino_quadrato_1080x1080_v15.png` with `sips -s format jpeg
-s formatOptions 60`. Regenerate it from the current square master, never from
an earlier one, so the preview shows the same photograph as the page.

### The downloadable Locandina

The printable Locandina and the downloadable copy must never disagree. The v15
master carries the QR code, so the download comes from that same master — not
from an earlier one — and the poster on paper and the poster on the page are
the same object.

The downloadable copy is `assets/download/locandina-svino-ii-edizione.jpg`:
a 1240 × 1744 RGB JPEG rendered from
`SVINO_v15/sorgenti/Svino_A3_master_v15.svg` with `rsvg-convert -w 1240`, then
converted with `sips` at JPEG quality 78. Never edit the JPEG independently of
the master it derives from.

### Icons for the tab and home screen

`assets/icons/favicon.svg`, `assets/icons/favicon-256.png` and
`assets/icons/apple-touch-icon.png` are all derived from the signature outline
already inlined in `index.html`. They are not new artwork. The tab icon
inverts the page's pairing: a cream-light `#f2e8d5` disc with the signature in
bordeaux `#5c1a24`, and a bordeaux ring 0.12 units thick drawn inside the disc
so the cream does not dissolve into a white or light tab bar. The inversion is
deliberate and site-only — the print master sets the signature cream on
bordeaux, and the icon is not a copy of that pairing. Do not "correct" it back
to match the signature. The page declares the icons, and keeps `theme-color`
bordeaux, in its `<head>`.

The page declares `favicon-256.png`, not `favicon.svg`. Google Search lists
BMP, GIF, ICO, PNG, JPEG, PPM and TIFF as favicon formats and does not render
SVG, so an SVG-only declaration leaves the result without an icon. The SVG
stays the vector master both rasters are rendered from; the 256 px PNG is the
one Googlebot-Image fetches. Keep exactly one `rel="icon"` link: Google uses
one favicon per hostname, and a second candidate it cannot render is a way to
lose the icon again.

The page SVG's viewBox keeps room below the outline for the `II EDIZIONE`
lockup. The icon crops to the outline's own bounds instead —
`x −0.0243333333 … 2.521`, `y −1.313 … 0.1348571429` — so the tab shows the
mark and not the empty lockup band. Those bounds centre on `x 1.2483`,
`y −0.5891`, the same point the disc is centred on: the square viewBox is 2.82
units wide and the disc fills it. The mark is scaled 0.86 about that centre,
which leaves about 9 % of the radius between the signature's ends and the ring.

The touch icon is not the tab icon at another size. iOS masks it itself and
composites transparent pixels onto black, so it must be a full cream square —
no transparent corners, no ring. It is rendered from `favicon.svg` through
`scripts/render-icons.mjs`, which swaps the disc for a full-square `<rect>`,
drops the ring and hands the result to `rsvg-convert`; never render it from a
copy. The same script renders the declared 256 px favicon from the SVG
unchanged:

```sh
node scripts/render-icons.mjs
```

Regenerate both if the signature outline changes:

1. Replace the `d` of the inline path in `index.html` with the new outline.
2. Recompute its bounds. A browser reports them with
   `document.querySelector('path').getBBox()`; the outline is the only path, so
   the bounding box is the mark. Update the crop numbers and the disc's centre
   if they moved.
3. Rebuild `assets/icons/favicon.svg`: a square `viewBox` centred on those
   bounds, a `<circle>` of radius half the viewBox in `#f2e8d5`, the same path
   in `#5c1a24` scaled 0.86 about the centre, and the ring — a stroked
   `<circle>` in `#5c1a24`, 0.12 units wide, its outer edge meeting the disc's.
   No `<text>` lockup.
4. Render both rasters from that vector, never from a copy:

   ```sh
   node scripts/render-icons.mjs
   ```

Keep `theme-color` equal to the stylesheet's `--bordeaux` token: the icon is the
mark, the browser chrome is the frame, and cream chrome on a cream page would
flatten both. The test suite checks the declarations, the three files, the
disc's shape and centring, the ring, the mark's colour, the declared icon's
256 × 256 PNG frame, and the touch icon's 180 × 180 size, RGB colour model and
cream corner, so a regeneration that misses a step fails before publishing.

The print workspace is separate and must not be modified from this repository.
Do not commit print sources, print build scripts or generated print artefacts
here, and do not run the print pipeline as part of publishing the site. Nothing
in this repository authorises a change to `/Users/angelo/svino`.

## Content policy

The page states nothing the Comitato has not decided. Until it decides, the
following are absent by choice:

- any entry statement or price;
- any contact detail the Comitato has not confirmed — email and phone remain
  absent;
- any Programma item, time or detail the Comitato has not confirmed;
- any Cantina the Comitato has not confirmed, any order of Cantine and any
  route: the Mappa's dots stand where the Comitato's plan draws them, and the
  page prints no count and no number because the plan marks places, not an
  order;
- any placeholder copy — "in via di definizione", "da definire",
  "prossimamente" and the like.

The Comitato confirmed two channels in November 2026, and the page links them
as icon-only actions in the closing band: the Instagram profile at
`https://www.instagram.com/comitato_feste_turania` and the Facebook profile at
`https://www.facebook.com/comitato.feste.turania`. They are anchors, not
resources: the page loads no embed, feed, script, pixel or image from either
host.

Empty is acceptable; a placeholder is not. Do not invent details to fill a
section: the page prints no number of Cantine, no route and no order — the plan
marks places, not an order (ADR-0026) — and no duration or weather, because
those are not decided. The same rule applies to issues, pull requests and
documentation.

`tests/site.test.mjs` enforces the policy over the served page: it fails on
banned placeholder phrases, email addresses, phone numbers and `mailto:` or
`tel:` links.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `svino-turania/svino-turania.github.io`, via
the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles, each label string equal to its name. See
`docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the root. See
`docs/agents/domain.md`.
