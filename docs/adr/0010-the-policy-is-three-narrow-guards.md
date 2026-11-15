# The policy is three narrow guards

- **Status:** accepted
- **Date:** 2026-11-15
- **Supersedes in part:** ADR-0005, ADR-0006, ADR-0007, ADR-0008 and ADR-0009 —
  the "no third-party hosts" element of their "The constraints do not move"
  clause, and the same phrase in ADR-0005's list of surviving tests. Every other
  constraint in those ADRs stands.
- **Related:** ADR-0003, README (*Tests*, *Signature and the demo font*),
  `assets/css/style.css`, `tests/site.test.mjs`, issue #53

## Context

The suite had one blanket test: the page loads no JavaScript and no third-party
resources. It asserted no `<script>`, no inline `on*` handler and no shipped
`.js`; it required every `src`, `srcset`, `link[href]` and anchor `href` to stay
on the origin, with the map link the single exception; and it failed on any
`https?://` appearing anywhere in a shipped stylesheet.

The rule was cheap to write and total. It also treated a string as a request.
The paper ground adds a grain through an inline SVG `data:` URI, and that URI
carries the namespace `http://www.w3.org/2000/svg`. Nothing is fetched, but the
blanket scan sees an absolute URL and fails. The same scan would forbid any
external resource the Comitato might choose later, whatever its purpose.

The blanket block was not cost-free to remove. The no-JavaScript assertions
lived inside it, so deleting the block would have silently dropped the
no-script guarantee. The stylesheet scan was also doing licence and privacy
work: it was the automated guard that the Breathing lettering, whose demo is
licensed "Personal Use Only", is never fetched from a font CDN at runtime, and
it caught the known tracker hosts.

## Decision

The blanket ban is removed. The policy is three guards, each a separate test,
so no one of them can be dropped by editing another:

- **No JavaScript.** The served page has no `<script>` element, no element with
  an `on*` attribute, and no shipped `.js` file. This is stated on its own.
- **No known tracker host.** A frozen, documented tracker denylist names hosts
  that ship analytics, advertising and session recording: Google Analytics and
  Tag Manager, Matomo, Plausible, Segment, Mixpanel, Amplitude, Heap, Hotjar,
  FullStory, Clarity, Smartlook, LogRocket and the rest of the list in
  `tests/site.test.mjs`. Entries are hostnames matched on host boundaries, so
  an entry also matches its subdomains: `www.google-analytics.com` is denied,
  while the map's `www.google.com` is allowed because `google.com` is not on
  the denylist. Every shipped file — the page, the stylesheet and each asset —
  is scanned, and any match fails the suite.
- **No external font.** No file named after Breathing is shipped, and no
  separate signature file is shipped. Every shipped font file is one of the
  four self-hosted `assets/fonts/SV(Serif|Sans)-(Regular|Bold).woff2`. The page
  names no `@font-face` and no external font, contains no `url(http…)` and no
  external `@import`, and links no external stylesheet and no external link
  that names a font (`as="font"` or a `font/…` type): a stylesheet link is
  checked because `@font-face` can only enter through CSS. Every `@font-face`
  in the stylesheet resolves to a relative local `.woff2`, and the stylesheet
  names no Google Fonts host, contains no `url(http…)` and no external
  `@import`.

The same-origin assertions over `src`, `srcset`, `link[href]` and anchor `href`
are gone, as is the blanket `https?://` scan of shipped CSS; the font guard
keeps its narrower `url(http…)` check. The map link keeps its own test —
destination `Turania (RI)`, `rel="noopener noreferrer"` — unchanged. The
per-asset resolver that the icon, photograph, download and social-preview tests
use stays: it checks a specific resource, and it is not a blanket rule.

Nothing else about the site changes. SV Serif and SV Sans are still the
self-hosted OFL subsets with their licence text beside them. There is still no
build step (ADR-0003) and no JavaScript.

ADR-0005 to ADR-0009 each wrote "no third-party hosts" into their list of
constraints that do not move. This ADR supersedes that element of each, in
part. The historical ADRs are not rewritten: their record of what was true when
they were accepted stands. Every other constraint they state — no JavaScript,
no build step, the self-hosted OFL fonts, the signature as outlines, no new copy
the Comitato has not approved — continues.

## Consequences

- **A string is no longer a request.** The grain's inline SVG namespace, and
  any other absolute string carried as data rather than as a load, passes. The
  guards look for load patterns, not for the bare presence of a URL.
- **External resources are no longer forbidden by default.** Adding one is a
  decision, taken with the Comitato, not a suite failure. The map link stops
  being the one permitted exception by rule and becomes simply the one external
  link the page has.
- **The guards protect a specific set, not privacy in general.** The denylist
  fails on the hosts it names, matched on host boundaries; a tracker it does
  not name passes. It is a floor maintained by hand, and the list has to grow
  when a new host earns its place. The no-JavaScript contract means no script
  can run from the page's own markup; an external resource that is not a font,
  a stylesheet or a listed tracker is not otherwise inspected.
- **Some coverage is genuinely lost.** A new external `<img src>` or anchor
  would no longer fail a general assertion. An external stylesheet link does
  still fail, but only through the font guard, because a stylesheet is where
  `@font-face` is declared. The assets the page actually uses are still
  resolved file by file, and the map link still has its own test.
- **The no-script guarantee no longer depends on a host rule.** It survives
  this ADR as its own test, which is why the block was split before it was
  removed.
- **README and the stylesheet header state the narrower policy.** The *Tests*
  section names the three guards, *Signature and the demo font* points at the
  font guard for the Breathing rule, and the stylesheet's type note says the
  fonts are served from this origin rather than that no request leaves it.
- **`GLOSSARY.md` is unchanged.** "Tracker denylist" and "font guard" are
  policy terms, not terms of the event.

## Considered options

- **Keep the blanket ban and except the SVG namespace or `data:` URIs.**
  Rejected: the exception list grows one string at a time, and the rule still
  forbids the Comitato's future external resources by default.
- **Delete the blanket block without replacing anything.** Rejected: it drops
  the no-JavaScript guarantee and the Breathing licence guard in the same edit.
  That is the failure this ADR exists to prevent.
- **Keep the blanket host ban only for fonts.** Rejected: the no-script
  contract deserves a test of its own, independent of what fonts are loaded,
  and the tracker intent is not a font rule.
- **An allowlist of external hosts.** Rejected: it is the blanket rule by
  another name. The decision is a denylist plus the font guard, not a curated
  set of permitted hosts.
- **Describing the denylist as complete privacy protection.** Rejected: no
  list of hosts is complete, and the documentation should not say the page is
  private. The guards are a floor, and this ADR says so.
