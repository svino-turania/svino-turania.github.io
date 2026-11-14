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

Check the page in a phone-sized viewport before merging: in the browser's
responsive mode use 320 px wide (the narrowest supported layout) and a normal
phone width, then repeat at 200% text zoom. The date and the place must remain
readable, with no horizontal scrolling and no clipped text.

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
| Time                  | `12:00`                        | the phrase “dalle ore 12:00” and the value under `DALLE ORE`   |
| Place                 | `Turania (RI)`                 | `DOVE`, the map link, the title and the colophon               |
| Organiser             | `Comitato Feste Turania`       | the `A CURA DI` value                                          |
| Subtitle              | `Per le cantine di Turania`    | under the signature                                            |
| Edition               | `II EDIZIONE`                  | the lockup beside the signature, the colophon and the metadata |
| Photograph description| the approved Italian sentence  | the `alt` attribute of the Borgo photograph                    |

The date is the one value the page states in several forms. Change
`datetime="2026-12-06"` only if the Comitato moves the event, then bring the
day number, the weekday and the month and year into agreement with it. A test
recomputes all four from `datetime` with the Italian locale and fails if they
drift, so a wrong weekday cannot be published. The title, the description, the
Open Graph and Twitter tags and the `og:image:alt` value repeat the edition,
the date and the place: update them in the same change so the page and its
social preview agree.

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
Locandina stays the address of the programme. Add the section inside `<main>`,
after the Cantina region, using the existing `.wrap` container so it lines up
with the rest of the page:

```html
<div class="wrap">
  <section aria-labelledby="programma">
    <h2 id="programma">Programma</h2>
    <p>…</p>
  </section>
</div>
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
against `datetime`, the map link, the declared language, headings and link
names, the absence of JavaScript and third-party hosts, and the content policy.

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
- the photograph derivative, under `assets/img/`;
- the square social preview image, under `assets/img/`;
- the Locandina download, under `assets/download/`, rendered from the print
  master.

The printable Locandina and the downloadable copy must never disagree. When a
print master carries the QR code (a future v12), regenerate the download from
that same master — not from an earlier one — so the poster on paper and the
poster on the page are the same object.

The downloadable copy is `assets/download/locandina-svino-ii-edizione.jpg`:
a 1240 × 1744 RGB JPEG rendered from `Svino_A3_master_v11.svg` with
`rsvg-convert -w 1240`, then converted with `sips` at JPEG quality 78. Regenerate
it with the same recipe from the QR-bearing master once v12 exists; never edit
the JPEG independently of the master it derives from.

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
