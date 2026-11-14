# svino-turania.github.io

The one-page Italian site for sVino, II Edizione — 6 dicembre 2026, Turania
(RI) — published at <https://svino-turania.github.io> from the public
repository `svino-turania/svino-turania.github.io`.

Status: the page currently carries the Locandina's facts and the map link.
The signature outlines, photograph, social preview, Locandina download and
accessibility work are tracked in issues #3–#8. The rules below describe the
system those tickets must preserve.

## Local build and preview

Use Node 22, the version the deployment workflow uses.

```sh
npm ci        # install exactly the dependencies in package-lock.json
npm test      # build to _site/, then run the tests over the built output
npm start     # Eleventy dev server, with live reload disabled
```

`npm start` serves <http://localhost:8080/>. Leave it running and reload after
an edit; stop it with `Ctrl+C`. The preview is deliberately JavaScript-free, as
the deployed page is. To build without serving, run `npm run build`; the output
is `_site/`, which is ignored by git.

Check the page in a phone-sized viewport before merging: in the browser's
responsive mode use 320 px wide (the narrowest supported layout) and a normal
phone width, then repeat at 200% text zoom. The date and the place must remain
readable, with no horizontal scrolling and no clipped text.

## Editor workflow (Comitato)

Editors change the page in the GitHub web editor and install nothing. All
editable content lives in `src/index.md`; editors never touch templates under
`src/_includes/` or `src/assets/`.

The front matter between the two `---` lines holds five short values:

| Key         | Current value                 | What it controls                                 |
| ----------- | ----------------------------- | ------------------------------------------------ |
| `time`      | `"12:00"`                     | the time in the date strip and under `DALLE ORE` |
| `place`     | `"Turania (RI)"`              | the `DOVE` value and the map search              |
| `organiser` | `"Comitato Feste Turania"`    | the `A CURA DI` value                            |
| `edition`   | `"II EDIZIONE"`               | the edition lockup beside the signature          |
| `subtitle`  | `"Per le cantine di Turania"` | the subtitle under the signature                 |

The event date is a separate front-matter value (`date: 2026-12-06`). It is not
one of the five: change it only if the Comitato moves the event.

Below the second `---` is the Markdown body, currently the approved Cantina
paragraph. Write plain Markdown — no HTML, no styling. A change cannot break
the layout because the template supplies all structure.

To propose a change:

1. Open `src/index.md` on GitHub and use the pencil button.
2. Commit to a new branch and open a pull request rather than committing to
   `main`.
3. Treat the pull request as the review point. GitHub shows the Markdown diff,
   but it does not render the Eleventy template; a maintainer previews the
   built page from the pull-request branch with `npm ci && npm start`.
4. Merge after the preview. A merge to `main` deploys automatically.

If a change needs a new layout or a new asset, open an issue for the
maintainer instead of editing templates.

## Content model

There is one content entry, `src/index.md`, and it produces one page at one
address. Front matter carries the short values and the date; the Markdown body
carries the prose.

When the Comitato supplies the programme, it is added as a section of the same
entry (for example `## Programma`) — not as a new page or route. The address
that was printed on the Locandina stays the address of the programme. The
programme is absent until that content exists; nothing is added to fill the
space.

## Signature and the demo font

The signature ships as outlined vector paths extracted from the print master,
not as live text and not as a webfont.

The lettering comes from Breathing (Din Studio), whose demo is marked
"Personal Use Only": it is not OFL and its licence does not cover promotional
use. The font file must never be committed to this repository and must never be
fetched at runtime — no `@font-face`, no CDN, no font file in the build. The
outline is the only form in which the lettering is distributed. The build test
that fails on any third-party host catches a font CDN or a tracker; the ban on
committing the font file itself is a review rule.

If the lettering ever changes, re-extract the outline from the updated print
master. Do not add Breathing to the repository, and do not re-typeset the
signature on the site.

The identity type is Lora for dates and numbers and Lato for information, both
SIL Open Font License. When the identity tickets introduce them, they are
self-hosted as subsets, never requested from a third-party host. The signature
is the one exception delivered as a path.

## Derived assets and the print master

The print workspace at `/Users/angelo/svino` remains the source of truth for
the identity: `Svino_A3_master_v11.svg` and the accompanying v11 print and
social files define the palette, type, signature, photograph, tear profile and
wording. The site derives from them, never the reverse.

Site assets are derivatives, regenerated from the master rather than edited
independently. When each asset lands, it is generated this way:

- the signature outline;
- the photograph derivative;
- the square social preview image;
- the Locandina download (the RGB JPEG under `src/assets/download/`, rendered
  from the print master).

The printable Locandina and the downloadable copy must never disagree. When a
print master carries the QR code (a future v12), regenerate the download from
that same master — not from an earlier one — so the poster on paper and the
poster on the page are the same object.

The downloadable copy is `src/assets/download/locandina-svino-ii-edizione.jpg`:
a 1240 × 1744 RGB JPEG rendered from `Svino_A3_master_v11.svg` with
`rsvg-convert -w 1240`, then converted with `sips` at JPEG quality 78. Regenerate
it with the same recipe from the QR-bearing master once v12 exists; never edit
the JPEG independently of the master it derives from.

The print workspace is separate and must not be modified from this repository.
Do not commit print sources, print build scripts or generated print artefacts
here, and do not run the print pipeline as part of the site build. Nothing in
this repository authorises a change to `/Users/angelo/svino`.

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main` and on manual
dispatch. It installs with `npm ci`, runs `npm test` (which builds the site and
tests the built output), builds again, uploads `_site/` as the Pages artefact
and deploys it with the Pages Actions. A failing test stops the deployment.

GitHub Pages serves from the Actions deployment, not from a branch folder. The
workflow does not run on pull requests, so preview a pull request locally
before merging.

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

`tests/site.test.mjs` enforces the policy over the built page: it fails on
banned placeholder phrases, email addresses, phone numbers and `mailto:` or
`tel:` links.

## Tests

The test seam is the built output, `_site/`, not template internals. `npm test`
runs `npm run build` and then `node --test tests/*.test.mjs`. The tests read
`_site/index.html`, its assets and its metadata as a visitor or link checker
would: the printed facts and the Cantina paragraph verbatim, the map link, the
declared language, headings and link names, the absence of JavaScript and
third-party hosts, and the content policy. A separate test rebuilds a temporary
copy of `src/` with edited front matter to prove the content model — it does
not import template code or assert on class names.

New assertions belong in `tests/site.test.mjs` and must be observable in the
built page.

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
