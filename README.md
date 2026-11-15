# svino-turania.github.io

The one-page Italian site for sVino, II Edizione — 6 dicembre 2026, Turania
(RI) — published at <https://svino-turania.github.io> from the public
repository `svino-turania/svino-turania.github.io`.

Status: the page is a cover, recorded in ADR-0009, with the opening photograph
full-bleed and the masthead set on it in cream over a bordeaux scrim. It
carries the Locandina's facts, the Cantina prose, the map link and one
Locandina download. The identity (palette and type), the outlined signature
with the `II EDIZIONE` lockup, the full-bleed opening photograph, the Cantina
photograph with its single torn lower edge, the Open Graph and Twitter
metadata, the square social preview, the print-derived motion and the
accessibility work are all in place. The rules below describe the system that
work preserves.

## The site is the files it is

The site is `index.html` at the repository root, with the `assets/` tree
beside it. A static server delivers exactly those files; nothing is generated
locally or in CI. There is one page at one address, and the address printed on
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
  between two gold hairlines, the Cantina photograph edge to edge, the facts
  paired and the two actions stacked; no horizontal scrolling, and the
  signature and the date fit the first screen.
- 768 px: the same composition, with the shell's gutter at its widest.
- 1024, 1440×900 and 1920 px: the one desktop composition — the wide cover
  crop, the date on one line, the Cantina photograph full-bleed with its height
  cap, the prose in two columns and the closing band split facts left, actions
  right. The signature and the date still fit the first screen.

Repeat at 200% text zoom: the date, the place and the organiser must stay
readable, with no horizontal scrolling and no clipped text. At a tight measure
the date's words wrap inside their areas rather than pushing the page sideways,
and the prose falls back to one column.

## Composition

The page is a cover: the cream ground is the page itself, with no sheet, panel,
border or shadow. The opening photograph runs edge to edge at every width, and
the masthead — the signature, the `II EDIZIONE` lockup and the subtitle — is set
at its foot, inside the content shell, in cream on a bordeaux scrim. The order
is the cover, the date, the Cantina photograph, the Cantina prose and one
closing bordeaux band.

The cream ground is paper (ADR-0011). The body keeps `--surface` as its
background colour and lays two image layers over it: a fine, neutral grain
tiled from an inline 240 px SVG `data:` URI at 0.03 opacity, and one continuous
vertical field that holds near `--cream-light` behind the date, settles to
`--surface` through the prose and deepens slightly toward the closing band. The
field's lightest ground is `#e9dec9` (luminance 0.7391) and its darkest
`#e3d6bc` (0.6816), a 5.75-point delta under the 6% cap; bordeaux reads 9.69:1
and 8.99:1 on the two ends. The grain adds no file, no request and no motion.

Sections run to the viewport's edges and inset their own content with one
computed value, `--shell-pad: max(var(--gutter), calc((100% - var(--shell)) /
2))`. The shell is 76 rem and the gutter is fluid (`clamp(1.25rem, 4vw,
3rem)`), so at 320 px the inset is the gutter and above 76 rem the content
centres. No wrapper element is added and no section uses `100vw`.

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

The closing bordeaux band is the page's only strong surface. It reads
`--strong` for the ground, `--strong-ink` for cream, `--strong-ink-muted` for
the gold-light labels and `--strong-rule` for its rule. The cover adds
`--on-photo` (cream) and `--on-photo-soft` (cream-light) for type on the
photograph. No raw colour enters outside the primitive block.

The Cantina photograph keeps the exact 303:191 print crop and exactly one torn
lower edge, the boundary between the photographic section and the prose. It
runs edge to edge at every width and `sizes` says `100vw`. The frame caps its
height at 42 rem, so a 1920 px viewport does not get a 1210 px-tall band. The
tear is a vector polygon expressed against the photograph band's own width
(`cqw`, with `container-type: inline-size` on `.photo-band`), so the bleed
cannot compress its teeth. No raster tear is shipped.

The Cantina prose is set under the torn edge in SV Serif at the reading step,
on a 48 rem measure centred in the shell. The facts pair and the
two actions stack at every width.

From 64 rem there is one desktop composition, and it gives the width only to
what the phone already has: the cover widens to a 3:2 crop and the signature
caps at 36 rem so the photograph stays visible; the date sets on one line; the
prose runs in two columns of `22rem` (a `column-width`, so it folds back to one
under zoom); the closing band puts the facts left and the actions right, with
the colophon on a full-width tail. The content order does not change.

One bordeaux band closes the page: `DOVE`, `A CURA DI`, the map link, the
Locandina download and the colophon, cream on bordeaux with the role labels in
gold-light. The Locandina has one download anchor, in that band. There is no
second copy and no show/hide rule, so there is nothing to keep in step.

Each fact has one home, so the page does not read as duplicated boilerplate:
the time is in the date under `DALLE ORE`; the place is under `DOVE`; the
organiser is under `A CURA DI`. The map link opens Google Maps for the same
place without repeating it, and the colophon states the edition only.

ADR-0009 governs the composition and supersedes ADR-0007 and ADR-0008 in part.
ADR-0004 is superseded for both.

## Motion

The page opens by stepping out from under the arch, then prints itself, and it
prints in order. The opening photograph is the paper: it is present on the first
frame, close to the reader, and the view recedes from it — never a fade; the
signature is pressed in from the left like a press impression and the date is
set with it, from its left edge, hairlines and all; then the `II EDIZIONE`
lockup is inked and the subtitle settles. Each step follows the one before it —
overlapping, so nothing waits on anything — and the eye has an order to follow.

Below the fold, the view steps back out of the Cantina arch as it is reached —
a zoom, never a fade, inside the tear the frame cuts, so the edge never moves —
and the prose and the facts rise as they enter the viewport. The band's two
actions never fade; only their rules are ruled.

The hero — the signature, its lockup and subtitle on the opening photograph,
and the date — is complete on the first screen and never waits for the scroll.
Scroll-driven reveals are only for the Cantina photograph, the prose and the
facts band.

The page has two links and both respond: the ink shifts, a second rule re-inks
over the printed one from its left edge, and the arrow leads by 2 px, as if the
label were picked up. The link settles 1 px while pressed. Nothing else
responds to the pointer, because nothing else on the page is interactive.

Motion is CSS only. The no-JavaScript test fails on any script, so no effect
may depend on one. The rules are:

- **The base style is the finished page.** Animations are added under
  `prefers-reduced-motion: no-preference`; under `reduce` the page is
  complete and still. Nothing starts invisible and nothing is shrunk.
- **Nothing repeats.** There are no ambient effects, so no pause control is
  needed and no new UI appears. Sustained movement comes from scroll position,
  never from a clock.
- **The focus indicator appears at once.** The outline is the indicator and it
  is not animated; the link's colour and rule follow the same transition as
  hover. That is not motion that delays use.
- **Every duration and delay comes from the motion tokens** in `:root`
  (`--motion-recede`, `--motion-press`, `--motion-ink`, `--motion-settle`,
  `--motion-date`, `--motion-quick`, `--motion-rule`, `--motion-scroll`, and
  the `--motion-after-*` entrance delays), not from magic numbers.

The entrance finishes in about 0.9 s; the signature is legible at about
640 ms. Scroll-driven reveals (`animation-timeline: view()`) are progressive
enhancement behind `@supports`; browsers without it, including iOS before 26,
serve the static page with the same content.

The signature has no stroke, so the press edge is a `clip-path` on the filled
path, not a stroke animation. The actions' rules are pseudo-lines rather than
borders precisely so they can be ruled; the extra 1px of padding keeps their
rendered boxes identical. ADR-0009 records the composition the motion sits on;
the motion itself is cheap to reverse and has no ADR.

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
| Locandina download    | `assets/download/locandina-svino-ii-edizione.jpg` | the single link in the closing band, at every width |

The date is the one value the page states in several forms. Change
`datetime="2026-12-06"` only if the Comitato moves the event, then bring the
day number, the weekday and the month and year into agreement with it. A test
recomputes all four from `datetime` with the Italian locale and fails if they
drift, so a wrong weekday cannot be published. The title, the description, the
Open Graph and Twitter tags and the `og:image:alt` value repeat the edition,
the date and the place: update them in the same change so the page and its
social preview agree.

The body text states each fact once. If the place changes, update `DOVE`, the
metadata and the query in the map link's `href` (Google Maps), which must keep
matching the place (`Turania%20(RI)` today); do not repeat the place in the link
text or the colophon. If the time changes, update only the value under `DALLE ORE` in the
date lockup. A test counts `12:00`, `Turania (RI)`, `Comitato Feste Turania`,
`DALLE ORE`, `DOVE` and `A CURA DI` in the visible body text and fails if any
appears more than once.

The Locandina download is one anchor, in the closing bordeaux band. It is
present at every width, with no second copy and no rule that hides it, so
there is one `href`, `download`, `type` and link text to keep correct.

The Cantina prose sits between the `CANTINA — INIZIO REGIONE MODIFICABILE`
and `CANTINA — FINE REGIONE MODIFICABILE` comments. Keep it inside those
markers. It is the page's own prose, not printed on the Locandina: the
Comitato approves it, the maintainer edits it, and a test pins it verbatim.
The second paragraph promises that this page will carry the programme and the
event's news, so add no categories to that promise — no entry, price or
duration — until the Comitato decides them.

To propose a change:

1. Open `index.html` on GitHub and use the pencil button.
2. Commit to a new branch and open a pull request rather than committing to
   `main`.
3. Treat the pull request as the review point. GitHub shows the HTML diff; to
   see the page, serve the branch locally as described above.
4. Merge after the review. A merge to `main` deploys automatically.

If a change needs a new layout or a new asset, open an issue for the
maintainer instead of editing it alone.

## Adding the programme

When the Comitato supplies the programme, add it as a new section of
`index.html` — not as a new page or route — so the address printed on the
Locandina stays the address of the programme. Put it inside the prose container
(`<div class="cantina">`), after the `CANTINA — FINE REGIONE MODIFICABILE`
marker and before the closing `</div>`; it then follows the Cantina photograph
and the prose, sits on the prose measure (48 rem on a phone; two 22 rem
columns inside a 64 rem block from 64 rem) and precedes the closing band:

```html
<section aria-labelledby="programma">
  <h2 id="programma">Programma</h2>
  <p>…</p>
</section>
```

Leave the two approved Cantina paragraphs untouched between the two markers:
the tests expect exactly those two paragraphs inside the region. Do not add the
programme to the bordeaux band; the band carries only `DOVE`, `A CURA DI`, the
map link, the Locandina download and the colophon. Keep the heading order
valid: the signature is the page's only `h1`, so the programme heading is an
`h2`. The programme is absent until that content exists; nothing is added to
fill the space.

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
would: the printed facts and the Cantina prose verbatim, the date literals
against `datetime`, the map destination, the declared language, headings and
link names, the three narrow guards — no `<script>`, inline handler or shipped
`.js`; no host on the documented tracker denylist; no font fetched from outside
the origin — and the content policy.

The suite also asserts the page's contracts. The date is one `<time>` lockup
with `datetime="2026-12-06"`, its printed parts in DOM order (day, weekday,
month), and a `dl.date-time` directly after it holding `DALLE ORE` and an
`HH:MM` value: the time has one home. The opening photograph is the cover: it
shares the page's first row with the masthead, which sits at its foot on a
bordeaux scrim in cream; the scrim's weakest stop is measured against the
crop's brightest pixel and asserted at 4.5:1. The Cantina photograph keeps the
303:191 band and has exactly one torn edge measured in `cqw` against the
photograph band (`container-type: inline-size` on `.photo-band`), with no
raster tear shipped. The strong surface appears on the closing band and
nowhere else; the band carries `DOVE`, `A CURA DI`, the map link, the single
Locandina download and the colophon, and the date carries the lockup and
`DALLE ORE` with the time. The stylesheet declares no dark-mode block. The
suite measures cream and gold-light on bordeaux and records the ratios beside
the palette, and pins the favicon's path data to the inline signature path.

The Locandina is one `a[download]`, inside `footer.band`, with an `href`,
`download`, `type` and a discernible name, pointing at a file that exists and is
a readable RGB JPEG; no rule that styles the band or its actions hides it. The
time, place, organiser and the `DALLE ORE`, `DOVE`, `A CURA DI` labels each occur
exactly once in the visible body text; the map link opens `Turania (RI)` on
Google Maps in a new context with `noopener noreferrer` and its text need not
repeat the place; and the reading order is brand first. The two actions are
typographic rules, not buttons; each carries exactly one `aria-hidden` arrow
that is absent from the name computed from the markup.

The stylesheet keeps its own maintainability contracts: the layer order, the
token isolation (no raw hex outside the tokens layer), and the primitives and
semantic roles the composition reads. The motion rules are asserted as well: no
looping animation, every animation inside `prefers-reduced-motion:
no-preference`, every animation and transition duration and delay taken from a
`--motion-*` token, the entrance sequenced by the `--motion-after-*` delays,
every `view()` timeline behind `@supports`, the hero free of scroll reveals, the
Cantina photograph, the prose and the facts revealed, and the band's actions
never faded.

The suite asserts what a visitor observes and the CSS contracts the stylesheet
declares for geometry: the shell and its computed inset, the cover's shared
first row and its scrim, the date's band on cream between two hairlines, the
Cantina photograph's full-bleed with its tear and height cap, the paired facts
and the stacked actions, and the one desktop composition. One assertion states
that there is exactly one 64 rem block and no 48 rem block; the base contracts
are read from the layout and components layers. The layout itself is verified
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
one named exception: the opening photograph is the previous edition's image and
has no counterpart on the current Locandina (ADR-0008).

Site assets under `assets/` are derivatives, regenerated from the master — or,
for the opening photograph, from its recorded source — rather than edited
independently. They are:

- the signature outline, inlined in `index.html`;
- the tab icon and the touch icon, under `assets/icons/`, derived from that
  inline outline;
- the photograph derivative, under `assets/img/`;
- the opening photograph derivative, under `assets/img/` — the one page-only
  asset, recorded in ADR-0008;
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
the print crop; it must never replace the Cantina photograph, or the edges will
disagree with the poster. It is the source of the opening photograph only.

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

### The opening photograph

The opening photograph — the borgo street with the bottle, the glass and the
grapes — is the previous edition's photograph. It is a page-only asset: it has
no counterpart on the current Locandina, and ADR-0008 records that exception to
the rule that every shipped image derives from the print master.

It derives from `/Users/angelo/svino/images/svino.jpg` (2048 × 1359), the
previous edition's photograph before the print crop. The 4:5 crop is taken
centred, 1033 × 1291, which excludes the generator's mark in the source's
lower-right corner; do not widen the crop, or the mark ships. It must never
replace the Cantina crop: the two are different photographs, and the Cantina
one must keep the print's edges.

The page offers it at 1033 px, the crop's native width, and at 720 px, through
`srcset` and the same `sizes` value on both sources: `100vw`. The cover runs
edge to edge at every width, so above 1033 px the browser upscales the native
crop — 1.39× at 1440 px, 1.86× at 1920 px. ADR-0009 records that cost; no
larger copy exists because the brief fixes the assets. Regenerate all four
files with:

```sh
# native 4:5 crop, then the two JPEG copies and their WebP twins
magick /Users/angelo/svino/images/svino.jpg -gravity center \
  -crop 1033x1291+0+0 +repage -strip /tmp/svino-borgo-hero.png
magick /tmp/svino-borgo-hero.png -strip \
  -sampling-factor 2x2,1x1,1x1 -quality 92 \
  assets/img/svino-borgo-hero-1033.jpg
cwebp -q 78 /tmp/svino-borgo-hero.png \
  -o assets/img/svino-borgo-hero-1033.webp
magick /tmp/svino-borgo-hero.png -resize 720x900! -strip \
  -sampling-factor 2x2,1x1,1x1 -quality 92 \
  assets/img/svino-borgo-hero-720.jpg
cwebp -q 78 -resize 720 900 /tmp/svino-borgo-hero.png \
  -o assets/img/svino-borgo-hero-720.webp
```

Keep both copies RGB and in 4:5, and keep the `<img>` intrinsic 720 × 900 in
step with the crop.

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

`assets/icons/favicon.svg` and `assets/icons/apple-touch-icon.png` are both
derived from the signature outline already inlined in `index.html`. They are not
new artwork. The tab icon inverts the page's pairing: a cream-light `#f2e8d5`
disc with the signature in bordeaux `#5c1a24`, and a bordeaux ring 0.12 units
thick drawn inside the disc so the cream does not dissolve into a white or
light tab bar. The inversion is deliberate and site-only — the print master
sets the signature cream on bordeaux, and the icon is not a copy of that
pairing. Do not "correct" it back to match the signature. The page declares the
icons, and keeps `theme-color` bordeaux, in its `<head>`.

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
`scripts/render-touch-icon.mjs`, which swaps the disc for a full-square
`<rect>`, drops the ring and hands the result to `rsvg-convert`; never render
it from a copy:

```sh
node scripts/render-touch-icon.mjs
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
4. Render the touch icon from that vector, never from a copy:

   ```sh
   node scripts/render-touch-icon.mjs
   ```

Keep `theme-color` equal to the stylesheet's `--bordeaux` token: the icon is the
mark, the browser chrome is the frame, and cream chrome on a cream page would
flatten both. The test suite checks the declarations, the two files, the disc's
shape and centring, the ring, the mark's colour, and the touch icon's
180 × 180 size, RGB colour model and cream corner, so a regeneration that misses
a step fails before publishing.

The print workspace is separate and must not be modified from this repository.
Do not commit print sources, print build scripts or generated print artefacts
here, and do not run the print pipeline as part of publishing the site. Nothing
in this repository authorises a change to `/Users/angelo/svino`.

## Content policy

The page states nothing the Comitato has not decided. Until it decides, the
following are absent by choice:

- any entry statement or price;
- any contact details (email, phone, social account);
- any programme;
- any placeholder copy — "in via di definizione", "da definire",
  "prossimamente" and the like.

Empty is acceptable; a placeholder is not. Do not invent details to fill a
section: the number of Cantine, food, duration and weather are not stated
because they are not decided. The same rule applies to issues, pull requests
and documentation.

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
