# The stylesheet arrives under its own hash

- **Status:** accepted
- **Date:** 2026-11-27
- **Related:** ADR-0003, README (*Deployment*, *Preview locally*, *Tests*),
  `index.html`, `assets/css/style.css`, `tests/site.test.mjs`

## Context

On 2026-11-27 the `integration/spec-78` merge (`d99db49`) deployed correctly —
the uploaded Pages artefact was byte-identical to the branch, tree hash
`f5feba9` — yet the owner saw "some styles not applied" within a minute of the
deploy and reverted it (`06cc268`).

GitHub Pages serves every file, `index.html` included, with
`cache-control: max-age=600`. The page and its stylesheet are separate cache
entries, so a browser can fetch the new document and still hold the previous
`style.css` under the same URL for up to ten minutes. `scripts/serve.mjs` sends
`no-store`, so the local preview can never show this: comparing the deployment
with localhost compared two caching realities, not two trees.

Serving the deployed HTML with the pre-merge stylesheet reproduces the symptom
exactly. The merge had added the Mappa's rules — 852 lines, 29 new selectors —
so with the old sheet `.mappa` computed `display: block` and `.mappa__dot`
`position: static` at 16×6, against `display: grid` and `absolute` at 44×44 with
the matching sheet. Everything that existed before the merge kept its rules,
which is why only "some" styles were missing.

## Decision

**The page links the stylesheet under a URL that carries the sheet's content
hash: `/assets/css/style.css?v=<first ten hex of its SHA-256>`.**

- **The suite recomputes the hash.** Editing `assets/css/style.css` without
  restamping the link fails `npm test`, and the failure names the value to
  paste. The deploy needs a passing test, so a mismatched pair cannot ship.
- **The stamp changes the browser's cache key.** Browsers key on the full URL,
  so a page fetched after a deploy asks for a URL the browser has never stored;
  the markup and the sheet arrive together.
- **The local server ignores the query.** It resolves the pathname, so the
  preview works unchanged, and the stamp is invisible locally.
- **No build step.** ADR-0003 stands: the stamp is a literal in `index.html`,
  not generated at deploy time.

## Consequences

- **The Pages CDN is not covered, and the record says so.** Asking Fastly for
  its debug headers returns the same `fastly-debug-digest` for
  `/assets/css/style.css?v=<random>` and the base URL, so GitHub's cache key
  ignores the query string. The edge copy is refreshed by the deployment itself;
  the stamp fixes the copy the browser keeps, which is the one the page cannot
  otherwise refresh.
- **Editing the sheet costs one line.** After changing `assets/css/style.css`,
  update the `?v=` in `index.html`; the suite prints the current hash when it
  fails. This is the price of no build step, and it is paid only when the sheet
  changes.
- **Assets other than the stylesheet stay unversioned.** A stale photograph or
  plan lasts at most ten minutes and does not break the layout. If that ever
  matters, the same stamp applies.

## Considered options

- **Busting with the commit SHA.** Rejected: a commit that does not touch the
  sheet would still change the URL, and every deploy would re-download it.
- **A manual counter (`?v=2`).** Rejected: it drifts from the content silently;
  the hash cannot.
- **Renaming the file to `style.<hash>.css`.** Robust at the CDN too, but it
  renames a 100 KB file on every CSS edit and breaks the stable path the
  documents and tests use. Not worth it for a ten-minute edge window that the
  deploy already closes.
- **Inlining the sheet in `index.html`.** It removes the separate request but
  makes every page load re-download the sheet and turns the stylesheet into
  HTML, against the editing workflow.
- **Doing nothing and documenting the wait.** Rejected: the owner reasonably
  read the result as a broken deploy and reverted a good merge. The cost of that
  mistake is higher than one line and one test.
