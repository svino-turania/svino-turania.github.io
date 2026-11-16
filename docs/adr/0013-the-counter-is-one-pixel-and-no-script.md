# The counter is one pixel and no script

- **Status:** proposed — the account is created (`svino`); awaiting the
  Comitato's approval of the notice line before merge
- **Date:** 2026-11-16
- **Related:** ADR-0003, ADR-0010, README (*Tests*, *Content policy*),
  `tests/site.test.mjs`

## Context

The page is one static file with no build step (ADR-0003) and no JavaScript
(ADR-0010). Adding analytics was asked for plainly: "some free analytics". The
useful question behind it is narrow — is the page being seen at all, and when —
not who is reading it or what they do on it. The page has two actions, the map
and the Locandina download, and neither is worth an event pipeline.

Three facts decide the shape of the answer.

- **GitHub Pages keeps no access logs.** Repository Insights measures the
  repository, not the published page, and keeps fourteen days. There is no
  server-side measurement to enable.
- **The Locandina's QR code is printed and points at the bare URL.** A scan
  carries no referrer of its own, so scans cannot be separated from word of
  mouth or a link pasted into a chat, whatever the tool.
- **Without JavaScript, no service can see where a visitor came from.** A pixel
  is requested by the page, so at most it carries the page's own URL, never the
  site the visitor arrived from. GoatCounter's own documentation says the
  tracking pixel records neither the referrer nor the screen size, and its
  handler reads only the query string, never the `Referer` header. Matomo's
  beacon documentation lists the same loss, including social network URLs. The
  external referrer is known only to the server that served the HTML, and
  GitHub Pages does not expose it.

The constraints were agreed before the tool was chosen: free forever without a
card; no cookies, no consent banner, no personal identifiers; EU hosting; data
export; a reporting window ending twelve months after the event. The repo's
tracker denylist names Plausible, Matomo Cloud, Statcounter and the rest of
the advertising and session-recording hosts; GoatCounter is not on it. Under
ADR-0010 the denylist is a floor, not an allowlist, and adding an external host
is a decision, not a suite failure.

## Decision

The site counts visits with **one GoatCounter pixel and no script**. It is the
page's only external request.

- The pixel is the hosted service's counting endpoint,
  `https://svino.goatcounter.com/count?p=/&t=sVino%20II%20EDIZIONE`, loaded as
  a one-pixel image. `p` is required by the service; the path is `/` because the
  site is one page, and `t` is the dashboard's label for it. The site code
  `svino` is the account's, and the account belongs to the maintainer.
- It records the time, the path, the dashboard label from `t`, the country, the
  browser, the operating system, the language and the service's bot flag. It
  records no referrer, no screen size, no event and no click. The Locandina
  download and the map link are not measured.
- The image carries `alt=""`, `width="1"`, `height="1"`,
  `referrerpolicy="no-referrer"` and a `.counter` class that takes it out of
  the flow and makes it invisible. It sits in the colophon, the page's small
  print.
- The colophon gains one Comitato-approved sentence naming the counter and
  linking its privacy policy. The proposed wording is: *Le visite sono contate
  senza cookie da GoatCounter ([informativa privacy](https://www.goatcounter.com/help/privacy)).*
  It is not published until the Comitato approves it.
- Retention on the service is set to fourteen months: the event plus the
  agreed twelve-month window. After the event the maintainer exports the data
  as JSON, keeps the summary, and deletes the account and its data by January
  2028.
- The account belongs to the maintainer, as the site's plumbing does. The
  Comitato receives the dashboard's secret read-only link, and a short exported
  summary if it prefers one.
- **Source is explicitly not measured.** Google Search Console and channel
  short links were considered and deferred: the first covers only search, the
  second only works if every post uses the short link, and neither can attribute
  the printed QR. If source later becomes necessary, that is a new decision to
  overturn the no-JavaScript guard, not an incremental change to this one. The
  pixel does not make the site half-measured by accident; it makes it measured
  only for what a pixel can see.
- GoatCounter is permitted **by this decision**, not by its absence from the
  denylist. The denylist is left unchanged. A test pins the pixel's host and
  path, so it cannot silently become another vendor or another service.

The no-JavaScript guard stands unchanged: no `<script>`, no inline handler, no
shipped `.js`. Only the alt-text test is amended, to allow exactly this one
decorative image an empty `alt`, and the band's contents gain the notice line
and its link.

## Consequences

- **Every visit makes a third-party request.** Visitors who block analytics
  hosts are not counted; ad-blocker estimates put the loss in the low tens of
  percent, and the number is a direction, not a census. Counts are page views,
  not people.
- **No source, no clicks, no funnels.** Traffic timing is the only campaign
  signal: a spike after the poster goes up or a post is shared. The QR and word
  of mouth are indistinguishable.
- **Bots may inflate the count.** The pixel is cheap for crawlers to request;
  the service flags bots, and the dashboard's bot-excluded view is the one to
  read.
- **The free tier is a fair-use promise, not a published quota.** The service
  says small sites are fine and millions of daily page views are not. There is
  no numeric cap to design against, and the terms may change. The data is
  exportable as JSON, so the exit is real.
- **The disclosure is one line, not a privacy notice.** It tells a visitor that
  a cookie-free counter is used and where the processor's policy is; it does not
  identify the controller, the legal basis or the retention period, as Article
  13 asks. The Comitato must decide whether that is sufficient for this event,
  or whether a fuller notice is needed. The service's policy is not the site's
  notice.
- **The colophon changes.** It gains one line and one external link, so the
  band's documented contents and its tests change with it. The link opens the
  privacy policy in a new tab with `noopener noreferrer`, like the map link.
- **The tests grow a host.** The pixel is the only external image; a test pins
  its host, path, size, empty alt and referrer policy, and the alt test allows
  the empty alt only for it. The no-script and denylist guards are untouched.
- **A second page would break the path.** `p=/` is correct while the site is one
  page (ADR-0003's one-page rule). A second page would need its own pixel or a
  server-side path, and is a new decision.
- **`GLOSSARY.md` is unchanged.** "Visit", "page view" and "source" are
  measurement terms, not terms of the event.

## Considered options

- **A script tag from a free cookie-less service** (GoatCounter's own script,
  Umami, Plausible, Google Analytics). Rejected: it breaks the no-JavaScript
  guard, which is a stated contract with its own test. The GoatCounter dashboard
  offered exactly this snippet when the account was created — a `<script>` from
  `gc.zgo.at` — and it was declined in favour of the pixel. It is the only
  complete answer if referrers are wanted, so it is recorded here as the
  alternative to choose deliberately, not to drift into.
- **Simple Analytics' no-JS pixel with UTM-tagged links.** It is the only pixel
  that reads campaign tags, because it sends the page URL as the referrer. Its
  free plan keeps only thirty days of history, likely requires a badge, and its
  free plan does not document that the pixel is included. Rejected: the
  retention window cannot be met without monthly exports, and the badge is a
  visible third-party mark on the poster.
- **Matomo's image tracker.** Self-hosted it is free software but needs PHP and
  MySQL hosting; Matomo Cloud has no free tier; and its beacon documents the
  same loss of referrers. Rejected.
- **Statcounter.** Its free tier is five thousand sessions a month and fourteen
  days, and it sets a cookie to tell new from returning visitors. Rejected.
- **GoatCounter pixel plus Search Console plus a channel short link.** Deferred,
  not rejected on principle: it buys partial source data at the cost of two more
  accounts and a posting habit the Comitato does not yet have. The pixel alone
  answers the question that was actually asked.
- **Cloudflare Web Analytics.** Free and cookie-less, but its beacon is
  JavaScript and its proxy needs DNS control the github.io domain does not
  have. Rejected.
- **GitHub's own traffic data.** Fourteen days, repository rather than page, and
  search engines excluded from its referrers. Rejected as a substitute.
- **No analytics at all.** A defensible option, and the one-line pixel is easy
  to remove. Rejected because "is anyone finding the page" is worth one request
  per visit; the guard tests still hold either way.
