# The counter is one script and a fallback pixel

- **Status:** accepted
- **Date:** 2026-11-16
- **Supersedes:** ADR-0013. Supersedes in part the no-JavaScript element of
  ADR-0005, ADR-0006, ADR-0007, ADR-0008, ADR-0009, ADR-0010 and ADR-0011.
- **Related:** ADR-0003, ADR-0010, ADR-0013, README (*Motion*, *Tests*),
  `index.html`, `tests/site.test.mjs`

## Context

ADR-0013 chose one GoatCounter pixel and no script. It recorded the limit
plainly: a pixel is requested by the page, so at most it carries the page's own
URL, never the site the visitor arrived from; GoatCounter's pixel documentation
says the same, recording neither the referrer nor the screen size. It also
deferred source deliberately: "If source later becomes necessary, that is a new
decision to overturn the no-JavaScript guard, not an incremental change to this
one."

Source and the page's two actions became necessary. The questions the data must
now answer are:

- which **domain** sent a visitor, to tell a link from a chat from a search;
- whether the page reached **beyond the province**, from the region report;
- whether a visitor **opened the map** or **downloaded the Locandina**.

The pixel answers the source question not at all and cannot see either click.
Region is not a client question: the service derives it from the request IP, so
the pixel and the script read the same report, and the account enables the
Region toggle if the hosted service offers it. The script is what reads
`document.referrer` and binds clicks, and it still sets no cookie: the service
stores no cookies, no localStorage, no IP and no full User-Agent, and recognises
a session only in memory for eight hours.

Three limits bound the result. The referrer is **origin-level**, not a post:
`document.referrer` obeys the referring site's policy, and modern browsers
default to `strict-origin-when-cross-origin`, which sends only the origin;
in-app browsers often send nothing, and the printed QR sends nothing.
GoatCounter's location report stops at **country or region**: the built-in GeoIP
database is Country-only, region needs a City database, and city is an open
request the maintainer does not expect to land in 2026. And the page is still
one static file with no build step (ADR-0003) and CSS-only motion.

## Decision

The site counts visits with **GoatCounter's script**, and keeps **the pixel as
a no-JavaScript fallback**.

- The script is `https://gc.zgo.at/count.js`, loaded `async` from the end of
  `<body>` with `data-goatcounter="https://svino.goatcounter.com/count"`. It
  runs after the anchors are parsed, so its click bindings find them. It
  carries no `data-goatcounter-settings`: local and framed visits stay
  uncounted, and the pageview and click binding stay on by default.
- The pageview's path is the canonical link's path, `/`; its title is
  `document.title`. No query string splits the dashboard.
- The pixel is unchanged except for its home: `p=/`, `t=sVino II EDIZIONE`, an
  empty `alt`, `width="1"`, `height="1"`, `referrerpolicy="no-referrer"`, in
  the colophon inside `<noscript>`. A visitor with JavaScript never renders it,
  so nothing is counted twice; a visitor without JavaScript is still counted,
  without a referrer.
- **The two actions are events.** *Apri la mappa* carries
  `data-goatcounter-click="apri-mappa"` and
  `data-goatcounter-title="Apri la mappa"`; *Scarica la locandina* carries
  `scarica-locandina` and `Scarica la locandina`. No custom JavaScript and no
  inline handler. Both count once per session unless an element says
  otherwise; that is the useful number for two links.
- **Location is region, never city.** It is a service setting, not a script
  feature: the maintainer enables the Region toggle in Settings → Data
  collection if the hosted service offers it; a greyed-out toggle is the hard
  ceiling. City is recorded here as unavailable, not as a goal.
- **Screen size is not stored.** The service's Screen size setting is turned
  off; the script's request may still carry the width, and the report ignores
  it.
- **Individual pageviews stay off.** The account stays aggregate-only; the
  per-view table stores a session ID and is a separate privacy decision.
- **The disclosure is unchanged.** The colophon keeps the Comitato-approved
  sentence *Le visite sono contate senza cookie da GoatCounter (informativa
  privacy)*. It remains true: the script adds no cookie and no persistent
  identifier. The Comitato is told that the counter now also records the source
  domain, the region and the two clicks.
- **Retention is unchanged.** Fourteen months on the service; after the event
  the maintainer exports JSON, keeps the summary, and deletes the account and
  its data by January 2028. The export now includes referrers, locations and
  events.
- **The cutover is now.** The event is 6 December 2026, so the script and the
  events are deployed before the campaign's peak; the path `/` continues and
  nothing is backfilled.
- **The no-JavaScript guard is narrowed, not dropped.** It becomes: exactly one
  `<script>`, its `src` pinned to `gc.zgo.at/count.js` and its
  `data-goatcounter` pinned to the account; no element carries an `on*`
  attribute; no `.js` file is shipped. The denylist and font guards stand.
  GoatCounter is permitted by this decision, not by its absence from the
  denylist; the denylist is unchanged.
- **The tests pin the new shape.** One script with its host, path, endpoint,
  `async` and position at the end of `<body>`; one fallback pixel inside
  `<noscript>` with its privacy attributes; exactly two
  `data-goatcounter-click` attributes, on the map and the Locandina; the
  empty-`alt` exception applies only to the fallback pixel. The external image
  assertion still permits one image, the pixel.

## Consequences

- **The page runs a third-party script.** That is a supply-chain surface the
  pixel did not have, and SRI would pin bytes the service updates on its own
  schedule. The page now requests two third-party hosts, `gc.zgo.at` and
  `svino.goatcounter.com`.
- **The source is a domain, not a post.** A link from a story, a post and a
  profile on the same host reads the same; a QR scan or an in-app browser reads
  as direct. The data answers "where did they come from" at the level of the
  site, not the share.
- **Region can be wrong.** Carrier NAT and VPNs put a visitor in the wrong
  region; the report is a direction, not a map. City is not available.
- **Events are visits, not people.** A click counts once per session, so ten
  people and one person clicking ten times are not the same number; the session
  window is eight hours.
- **Blocked scripts are lost.** A visitor whose blocker stops `gc.zgo.at` is
  not counted by the script, and the `<noscript>` pixel does not fire because
  JavaScript is enabled. The fallback covers only JavaScript-disabled visitors.
- **The pixel's label and the script's title differ.** The fallback writes
  `sVino II EDIZIONE`; the script writes the full document title. The path is
  `/` in both, so the totals merge; the label may not.
- **History starts at the cutover.** The running path total continues, but no
  past hit gains a referrer, a region or an event; there is no backfill.
- **The "one external request" claim ends.** The README and the colophon
  comment describe a script, a count request and a fallback pixel instead.
- **The no-JavaScript contract is now a one-script contract.** Motion stays
  CSS-only; no effect may depend on the counter script, and the guard test says
  exactly one script is allowed, not that scripts are allowed.
- **`GLOSSARY.md` is unchanged.** "Source", "region" and "event" are measurement
  terms, not terms of the event, as ADR-0013 said of "visit" and "page view".

## Considered options

- **Keep the pixel and no script.** Rejected: it cannot see the referrer, the
  region or a click, which are the questions that prompted this ADR.
- **The script with no fallback pixel.** Rejected: a JavaScript-disabled
  visitor would vanish from the count, and this site spent several ADRs
  declaring that visitor a first-class reader. The fallback costs one
  `<noscript>` block.
- **The script and individual pageview collection.** Rejected: it stores a
  session ID per view and moves the account from aggregate-only to per-visit
  records. The extra detail does not answer a question the summary does not.
- **GoatCounter with a City GeoIP database, or a tool that reports city.**
  Deferred, not rejected on principle: the hosted account cannot set the
  database, and the tools that do city break at least one standing constraint
  — free forever, EU hosting, or the fourteen-month retention window — while
  city-level data on a small village edges toward identifying a reader. Region
  is the ceiling this decision accepts.
- **Search Console plus a channel short link.** Still deferred for the reasons
  ADR-0013 gives: it covers search or a posting habit, not the printed QR, and
  it is two more accounts.
- **No analytics at all.** Still defensible: the script and the pixel are easy
  to remove. Rejected because the campaign now needs the source domain and the
  two clicks.
