# The map is a hand-drawn schematic

- **Status:** superseded by ADR-0022
- **Date:** 2026-11-25
- **Superseded by:** ADR-0022 (the map is a real plan, its dots open native
  dialogs, and the page runs two executable scripts)
- **Related:** ADR-0003, ADR-0010, ADR-0014, ADR-0019, ADR-0020, README
  (*Composition*, *Motion*, *Content policy*, *Search visibility*, *Tests*),
  `GLOSSARY.md`, `index.html`, `assets/css/style.css`,
  `tests/site.test.mjs`

## Context

The page was asked for an interactive map of Turania on which the Cantine can
be placed, each with a note of what visitors find inside. The page is one
static file with no build step (ADR-0003) and exactly one executable script,
the counter's (ADR-0010, ADR-0014). Its motion is CSS only, and its only
external requests are the two links in the closing band and the counter.

An embedded slippy map is the usual reading of "interactive map", and it is the
one answer the page cannot take. It would bring a tile library and a second
script, requests to a tile host at runtime, the cookie and consent questions
the page has avoided, and a cartographic language — labels, controls, a zoom
chrome — that belongs to no other element on the page.

Two facts about the content decide the rest.

- **The register is provisional.** The Cantine register lives with the
  Comitato outside this repository and is not final: some rows are confirmed,
  others are still to confirm, and a candidate is unplaced. The page's count is
  not decided, several titles are handwritten transcriptions whose spellings
  are unconfirmed, the "vino" rows are hypotheses, and the route is not
  decided — a drawn map, a list of stops and an external link are all still
  open. The register gives no address or coordinate for any Cantina; the only
  positional hints are *piazza* and *sotto le mura*.
- **OpenStreetMap cannot draw the borgo.** A check of the data found nine
  buildings within 500 m, six of them in a 25 × 52 m block by the piazza; zero
  footways, zero steps and zero service roads; no named street in the core; and
  409 m of paved way near the piazza in five unnamed segments. Drawn as it is,
  the data would read as broken, not as a place. A true plan would need a
  different source — a regional CTR or an orthophoto trace — with a different
  effort and a different licence.

## Decision

The Mappa del Borgo is **an inline, hand-drawn SVG schematic**, not a tile map
and not an OSM trace.

- **Drawn, not traced.** The drawing uses the landmarks' names and their rough
  relation, not their coordinates, so it carries no ODbL obligation and the
  page's licence stays clean. It is indicative and not to scale, and no
  visible caption says so: the statement lives in the SVG's `<desc>` and in
  this record.
- **The same ink as the plates.** One 1.6 px stroke in `--ornament`, no fill,
  no frame, no shadow, on the cream ground. The dots are the page's only
  filled marks, in `--ink`.
- **Three anchors and no route.** `Piazza Umberto I`, *la chiesa* and *il
  comune* place the drawing. The pins carry no number and no connecting line:
  the register leaves the route undecided, so the drawing claims places, not an
  order.
- **The piazza enters the visible body, once.** The README's rule that the
  `Event` location stays structured data is amended deliberately: the piazza's
  name is the map's anchor. It appears nowhere else in the prose.
- **Dots are in-page links, and the list is the legend.** Each dot is an `<a>`
  whose `href` names a `<details>` entry by `id`; the entry's summary is the
  Cantina's name and its open body is what visitors find inside. There is no
  JavaScript: the entry is native disclosure, and a browser without support for
  opening a `details` on fragment navigation still scrolls to it. On the
  desktop the list sits beside the drawing; on the phone it follows it.
- **Only confirmed Cantine, and no count.** The chapter carries the six
  Comitato-confirmed rows and their confirmed lines. It names no count, no
  unconfirmed title and no provider the register marks unconfirmed; a row held
  while its name is to confirm stays out of the page. Empty is allowed; a
  placeholder is not.
- **Positions are a scaffold.** Until the Comitato supplies the handwritten
  sketch with the Cantine's places, the dots sit at invented positions. The
  sketch is the source of truth and stays in the private comitato repository;
  the page carries only the drawn result, and each dot moves by its `cx` and
  `cy`.
- **The chapter is not a strong surface.** It follows the Cantina prose and
  precedes the Programma, on cream, in the chapters' label register. It adds no
  counter event.

## Consequences

The page gains its first in-page controls and its first visible occurrence of
the piazza's name; the suite gains guards for both. The map is not a
navigational instrument: a reader who wants to reach Turania still uses the
closing band's Google Maps link, and the schematic is only the picture of the
walk inside the borgo.

Publishing is gated, not decided. The Comitato must still choose the route
form and supply the sketch; until both exist, the branch that carries this
chapter is a draft, and its random positions never reach `main`. If a
later edition wants a true plan, it needs a licensed base map, and the licence
question returns with it.
