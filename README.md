# svino-turania.github.io

The one-page Italian site for sVino, II Edizione — 6 dicembre 2026, Turania
(RI) — published at <https://svino-turania.github.io> from the public
repository `svino-turania/svino-turania.github.io`.

Status: the page carries the Locandina's facts, the Cantina paragraph and
the map link. The identity (palette and type), the outlined signature with
the `II EDIZIONE` lockup, the Borgo photograph with its torn edges, the Open
Graph and Twitter metadata, the square social preview, the Locandina
download and the accessibility work are all in place. The rules below
describe the system that work preserves.

## The site is the files it is

The site is `index.html` at the repository root, with the `assets/` tree
beside it. A static server delivers exactly those files; nothing is generated
locally or in CI. There is one page at one address, and the address printed on
the Locandina stays the address of the site.

Node is required only to run the tests (see [Tests](#tests)). Editing the page
needs a browser and the GitHub web editor, nothing else.

## Preview locally

Serve the repository root with any static server and open the address it
prints. The page must be requested over HTTP, not opened as a `file:`, so that
the stylesheet and fonts under `/assets/` load.

```sh
python3 -m http.server 8080    # then open http://localhost:8080/
```

Check the three compositions before merging, in the browser's responsive mode:

- 320 and 390 px: the phone column, with no horizontal scrolling;
- 768 px: one readable column with the facts after the prose;
- 1024, 1440×900 and 1920 px: the desktop grid, with the rail beside the prose.
  At 1440×900 the signature, the photograph and the date strip must fit the
  first screen.

Repeat at 200% text zoom: the date, the place and the organiser must stay
readable, with no horizontal scrolling and no clipped text.

## Composition

The phone and tablet compositions are one column, in the Locandina's stacking:
signature, photograph, date strip, Cantina prose, facts, footer. Desktop is the
only composition that changes structure. From 64 rem (1024 px) the prose and the
facts share a grid: the prose keeps a readable measure on the left and a
bordeaux rail on the right carries `DOVE`, `A CURA DI` and the Locandina
download. The date strip carries the time; the footer carries the map link and
the colophon.

Each fact has one home, so the page does not read as duplicated boilerplate:
the time is in the date strip under `DALLE ORE`; the place is under `DOVE`; the
organiser is under `A CURA DI`. The map link opens the same search without
repeating the place, and the colophon states the edition only. The Locandina has
one download link in the DOM — it lives in the facts region, which is the rail
on desktop and the footer region on phone and tablet. Do not duplicate it to
move it.

On desktop the photograph is height-capped so the first screen fits a 1440×900
laptop while the page still uses the full width of the screen. The two torn
edges keep the print's width-relative profile, so the cap does not compress
their teeth.

## Editor workflow (Comitato)

Editors change `index.html` in the GitHub web editor and install nothing. It is
the only file that carries content; `assets/` holds the stylesheet, fonts and
images and is not edited for a routine change.

A comment at the top of `<body>` maps the editable values. Each value also has
a short comment beside it in the file:

| What                  | Current value                  | Where it appears on the page                                  |
| --------------------- | ------------------------------ | ------------------------------------------------------------- |
| Date                  | `datetime="2026-12-06"`        | the `datetime` attribute of `<time>` is the source of truth    |
| Day number            | `6`                            | inside the date strip, under the weekday                       |
| Weekday               | `DOMENICA`                     | inside the date strip                                          |
| Month and year        | `DICEMBRE 2026`                | inside the date strip                                          |
| Time                  | `12:00`                        | the date strip, under `DALLE ORE`                             |
| Place                 | `Turania (RI)`                 | `DOVE` in the facts rail, plus the title/description metadata |
| Organiser             | `Comitato Feste Turania`       | the `A CURA DI` value                                         |
| Subtitle              | `Per le cantine di Turania`    | under the signature                                           |
| Edition               | `II EDIZIONE`                  | the lockup beside the signature, the colophon and the metadata |
| Photograph description| the approved Italian sentence  | the `alt` attribute of the Borgo photograph                   |
| Locandina download    | `assets/download/locandina-svino-ii-edizione.jpg` | the one link in the facts region (rail on desktop, footer on phone) |

The date is the one value the page states in several forms. Change
`datetime="2026-12-06"` only if the Comitato moves the event, then bring the
day number, the weekday and the month and year into agreement with it. A test
recomputes all four from `datetime` with the Italian locale and fails if they
drift, so a wrong weekday cannot be published. The title, the description, the
Open Graph and Twitter tags and the `og:image:alt` value repeat the edition,
the date and the place: update them in the same change so the page and its
social preview agree.

The body text states each fact once. If the place changes, update `DOVE`, the
metadata and the query in the map link's `href`, which must keep matching the
place (`Turania%20(RI)` today); do not repeat the place in the link text or the
colophon. If the time changes, update only the value under `DALLE ORE` in the
date strip. A test counts `12:00`, `Turania (RI)`, `Comitato Feste Turania`,
`DALLE ORE`, `DOVE` and `A CURA DI` in the visible body text and fails if any
appears more than once.

The Locandina download is a single link in the facts region. It is the rail on
desktop and the footer region on phone and tablet; keep one `<a download>`, not
one per composition.

The Cantina paragraph sits between the `CANTINA — INIZIO REGIONE MODIFICABILE`
and `CANTINA — FINE REGIONE MODIFICABILE` comments. Keep the paragraph inside
those markers.

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
Locandina stays the address of the programme. Add the section inside the
Cantina prose region, after the approved paragraph and before the facts
`aside`; it then inherits the prose measure in all three compositions:

```html
<section aria-labelledby="programma">
  <h2 id="programma">Programma</h2>
  <p>…</p>
</section>
```

Keep the heading order valid: the signature is the page's only `h1`, so the
programme heading is an `h2`. The programme is absent until that content
exists; nothing is added to fill the space.

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
would: the printed facts and the Cantina paragraph verbatim, the date literals
against `datetime`, the map destination, the declared language, headings and
link names, the absence of JavaScript and third-party hosts, and the content
policy.

The suite also asserts the composition's contracts: the time, place, organiser
and the `DALLE ORE`, `DOVE`, `A CURA DI` labels each occur exactly once in the
visible body text; the map link opens `Turania (RI)` in a new context with
`noopener noreferrer` and its text need not repeat the place; the section order
puts the strip's time before the prose, the facts after it, and closes with the
map link and the colophon; and there is exactly one Locandina download link in
the DOM. The layout itself is verified by rendering at 320, 390, 768, 1024,
1440 and 1920 and at 200% text zoom, not by asserting the stylesheet.

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
The outline is the only form in which the lettering is distributed. The test
that fails on any third-party host catches a font CDN or a tracker; the ban on
committing the font file itself is a review rule.

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
the identity: `Svino_A3_master_v11.svg` and the accompanying v11 print and
social files define the palette, type, signature, photograph, tear profile and
wording. The site derives from them, never the reverse.

Site assets under `assets/` are derivatives, regenerated from the master rather
than edited independently. They are:

- the signature outline, inlined in `index.html`;
- the tab icon and the touch icon, under `assets/icons/`, derived from that
  inline outline;
- the photograph derivative, under `assets/img/`;
- the square social preview image, under `assets/img/`;
- the Locandina download, under `assets/download/`, rendered from the print
  master.

### The photograph

The photograph derives from the print master's photograph crop,
`/Users/angelo/svino/images/build/svino_a3.jpg`: 2048 × 1291, RGB, already
cropped to the approved framing. The site's 1200 × 756 copy is that same crop
scaled — the two differ only by resampling, so the framing cannot drift between
them. `images/svino.jpg` (2048 × 1359) is the photograph before the print crop;
do not use it for the site, or the edges will disagree with the poster.

The page offers the crop at its native 2048 px width for laptop screens and the
1200 px copy for narrow screens and slower connections, through `srcset` and
`sizes="100vw"` on the WebP source and on the JPEG fallback. Never upscale: the
wide candidate is the crop itself, not a larger render of the 1200 px copy.

Regenerate all four files from the crop with:

```sh
# 1200 px narrow copy: JPEG and WebP
sips --resampleWidth 1200 /Users/angelo/svino/images/build/svino_a3.jpg \
  --out assets/img/svino-borgo-1200.jpg
cwebp -q 78 -resize 1200 756 /Users/angelo/svino/images/build/svino_a3.jpg \
  -o assets/img/svino-borgo-1200.webp

# 2048 px wide candidate: JPEG and WebP
magick /Users/angelo/svino/images/build/svino_a3.jpg \
  -strip -sampling-factor 2x2,1x1,1x1 -quality 93 \
  assets/img/svino-borgo-2048.jpg
cwebp -q 78 /Users/angelo/svino/images/build/svino_a3.jpg \
  -o assets/img/svino-borgo-2048.webp
```

Keep both variants RGB — never CMYK — and keep the two widths in step: they are
the same crop, and the `<img>` keeps the approved 1200 × 756 intrinsic size. The
1200 px JPEG stays the `<img>` fallback for browsers that read no `srcset`.

The printable Locandina and the downloadable copy must never disagree. When a
print master carries the QR code (a future v12), regenerate the download from
that same master — not from an earlier one — so the poster on paper and the
poster on the page are the same object.

The downloadable copy is `assets/download/locandina-svino-ii-edizione.jpg`:
a 1240 × 1744 RGB JPEG rendered from `Svino_A3_master_v11.svg` with
`rsvg-convert -w 1240`, then converted with `sips` at JPEG quality 78. Regenerate
it with the same recipe from the QR-bearing master once v12 exists; never edit
the JPEG independently of the master it derives from.

### Icons for the tab and home screen

`assets/icons/favicon.svg` and `assets/icons/apple-touch-icon.png` are both
derived from the signature outline already inlined in `index.html`. They are not
new artwork: the print's bordeaux `#5c1a24` is the ground and cream-light
`#f2e8d5` is the mark, the same pairing the signature uses. The page declares
them, and that ground as `theme-color`, in its `<head>`.

The page SVG's viewBox keeps room below the outline for the `II EDIZIONE`
lockup. The icon crops to the outline's own bounds instead —
`x −0.0243333333 … 2.521`, `y −1.313 … 0.1348571429` — so the tab shows the
mark and not the empty lockup band. The icon's square viewBox is 2.82 units
wide, which leaves about 5 % of the wider axis as padding and centres the mark
vertically.

Regenerate both if the signature outline changes:

1. Replace the `d` of the inline path in `index.html` with the new outline.
2. Recompute its bounds. A browser reports them with
   `document.querySelector('path').getBBox()`; the outline is the only path, so
   the bounding box is the mark. Update the crop numbers if they moved.
3. Rebuild `assets/icons/favicon.svg`: a square `viewBox` centred on those
   bounds, a full-square `<rect fill="#5c1a24">`, then the same path with
   `fill="#f2e8d5"` and no `<text>` lockup.
4. Render the touch icon from that vector, never from a copy:

   ```sh
   rsvg-convert -w 180 -h 180 \
     -o assets/icons/apple-touch-icon.png assets/icons/favicon.svg
   ```

Keep `theme-color` equal to the stylesheet's `--bordeaux` token. The test suite
checks the declarations, the two files, the touch icon's 180 × 180 size and its
bordeaux corner, so a regeneration that misses a step fails before publishing.

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
