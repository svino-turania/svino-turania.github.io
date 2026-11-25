# The map is a real plan and its dots open dialogs

- **Status:** accepted
- **Date:** 2026-11-26
- **Supersedes:** ADR-0021 (the hand-drawn schematic)
- **Amends:** ADR-0014 (the script allowance: one executable script becomes
  two, and the counter stays last); the one-script constraint in ADR-0016 and
  ADR-0017 is amended in the same way
- **Related:** ADR-0003, ADR-0010, ADR-0014, ADR-0019, `GLOSSARY.md` (*Mappa del
  Borgo*, *Cantina*), README (*Composition*, *Motion*, *Editor workflow*,
  *Search visibility*, *Content policy*, *Tests*), `index.html`,
  `assets/css/style.css`, `assets/img/mappa-del-borgo.svg`,
  `tests/site.test.mjs`

## Context

ADR-0021 drew the Mappa del Borgo by hand: invented lanes, a handful of
rectangular buildings, three anchors and six unlabelled dots that jumped to a
list of `<details>` entries. The drawing was indicative by construction and
said so only in the SVG's description. It did not look like Turania. A visitor
who knows the Borgo could not find themselves on it, and the list took a whole
column beside the drawing on the desktop and a stack of entries below it on the
phone. The Comitato asked for the real buildings and the real streets, for the
confirmed Cantine to open in a panel, and for the list to leave the page.

A real plan already exists outside the page. The cadastral extract used to lay
out the OSP print sheets carries the Borgo's building footprints, its streets
and its piazza, north-up and in scale. The maintainer holds permission to
publish a plan derived from that extract. Nothing about the page changed in the
meantime: it is one static file with no build step (ADR-0003), one scroll story
(ADR-0019), CSS-only motion, and a narrow script allowance that ADR-0014
pinned to the counter. The register of Cantine is still provisional: only six
rows are confirmed, the positions are not decided, and the Comitato's sketch is
still to come.

The alternative bases do not replace the cadastral one today. OpenStreetMap
still has too few buildings and no named street in the core (ADR-0021), and an
embedded tile map would bring a library, a second runtime host and a
cartographic chrome the page does not use.

## Decision

**The Mappa del Borgo is a real plan of the Borgo, served as one generated SVG,
and each confirmed Cantina's dot is a button that opens its own native dialog.
There is no list.**

### The base, the frame and the export

- **The base is the cadastral extract already used for the OSP sheets.** It is
  an extract of the municipal cadastral base in EPSG:7792. The plan is clipped to
  the OSP frame — E 335343–335616, N 4666880–4667276, 273 × 396 m — and is
  north-up. It carries the buildings, the streets and the piazza veil, and
  excludes parcels, the grid, the frame, contour lines, water, symbols and text.
- **Permission and provenance are recorded here.** The maintainer holds the
  source holder's permission to publish a plan derived from the cadastral
  extract. The permission sets no visible credit line today; if it later
  requires one, it goes under the drawing in the page's small print, in the
  wording the permission specifies.
- **Only the rendered SVG is committed.** The source data and the export script
  live outside the site repository. The export reads the cadastral layers,
  clips them to the frame and bakes the page's palette; the site remains
  build-free and serves the finished asset. The SVG is never edited by hand: a
  change of frame or palette is a re-export, and the asset itself carries a
  comment saying so.
- **The fallback is a different export, not a different page.** If the
  permission ever narrows, the same chapter, markup, labels and script can take
  an open base — Microsoft building footprints with OpenStreetMap street names,
  or the Lazio DBGT — and only the export changes.

### The asset and the palette

- **A separate SVG with a transparent ground.** Its `viewBox` is in metres
  (`0 0 273 396`), its intrinsic size is 546 × 792 and keeps the 273:396 ratio,
  and it carries a `title` and a `description` for a reader who opens the file
  on its own. It has no frame, no shadow and no rounded corner.
- **The palette is baked into the file.** Streets are `#f2e8d5`, building
  footprints `#c0a579`, the piazza `#e5d6b8` and the hairlines `#a9854f`. An
  external image cannot read the page's custom properties, so a palette change
  is a re-export, not a CSS change. Bordeaux (`#5c1a24`) is reserved for the
  HTML dots; it appears nowhere in the asset.
- **The asset is safe as an image.** No `<text>`, no `<script>`, no external
  reference, no embedded raster and no `url()` outside itself. The page styles
  everything that is not the drawing: the labels, the dots and the panel.

### The chapter, the image and the labels

- **The chapter does not move.** The Mappa stays between the Cantina prose and
  the Programma, on cream, with its printed label `LA MAPPA DEL BORGO`. There is
  no new chapter, band or prose outside the drawing and the dialogs; the
  closing band's Google Maps link remains the way to reach Turania.
- **The drawing is an image with declared dimensions.** The plan is an `<img>`
  pointing at the committed SVG, `loading="lazy"`, `decoding="async"`, with
  `width="546"` and `height="792"`. The positioned drawing box carries the
  273:396 aspect, so the chapter reserves the plan's height before the file
  arrives.
- **The visible labels are HTML text, not SVG text.** Over the plan:
  `Piazza Umberto I` (the page's one visible occurrence of the name, in the
  place label's register), `la chiesa`, and the two verified street names
  `SP 37` and `Via Turano`, set along their streets. The comune is not
  labelled. The labels use the page's serif and sans registers with a cream
  halo. A discreet, `aria-hidden` `N` sits in the top-right; there is no scale
  bar, no grid, no frame and no visible caption. `SP 37` is a verified name and
  the chapter's only permitted digit.
- **The alt describes the plan without a count or the piazza's name.** It says
  what the drawing contains and that the Cantine's positions are indicative;
  it states no number and does not name `Piazza Umberto I`.

### The dots and the dialogs

- **Six dots, one per confirmed Cantina.** Each is a `<button type="button">`
  positioned by percentage inside the drawing box, with an accessible name equal
  to the Cantina's name, a 44 px hit target, and a ring and dot drawn in the
  page's ink. They are the page's only bordeaux-filled marks. Hover and focus
  re-ink the ring; the dots take the page's focus indicator. They carry no
  number and no text. Their positions are random placeholders, distinct and
  inside the plan; they are not the Comitato's sketch.
- **Each dot opens a native `<dialog>`.** Every confirmed Cantina has one
  `<dialog class="mappa__dialog">`, labelled by its heading, containing the
  Cantina's name, what visitors find inside, `Posizione indicativa` and a
  visible `Chiudi` button. The dot opens it with the native modal method; Esc,
  the close button and a click outside the panel close it, and focus returns to
  the dot. The panel is cream paper with an ink text and a gold hairline, no
  shadow and no rounded corner, on a bordeaux scrim; it adds no motion.
- **The dialogs are the single source of truth and the only entries.** There is
  no list, no `<details>` and no second copy of a Cantina's text on screen. A
  Cantina is added or removed by one dot and one dialog with the same id.

### The fallbacks and the script contract

- **Without JavaScript the content remains.** A `<noscript>` stylesheet flows
  the six dialogs inline under the plan, with the page's spacing and a gold
  hairline between entries, and hides the close controls and the dead dots. The
  plan and its labels remain. The fallback reuses the dialogs; it does not
  duplicate their text.
- **On paper the chapter is complete.** The print rule shows the plan and the
  six entries under it, hides the close controls, keeps the dots as printed
  marks and avoids breaking the drawing across a fold. It reuses the same six
  dialogs.
- **Exactly two executable scripts.** A small inline script, placed after the
  dialogs and before the counter, binds each dot to its dialog and the
  `Chiudi` control, and closes the dialog on a click outside the panel; Esc and
  the focus return are the browser's. The GoatCounter script remains the last
  executable script. There is no shipped `.js` file and no `on*` attribute. The
  inline script is deliberately small and pinned by a test, so it cannot grow
  into an application.
- **No new analytics and no new request.** The map adds no GoatCounter event,
  so the dashboard's two-click set stays comparable. It makes no third-party
  request; the page's external requests stay the counter's script and fallback
  pixel, and the social and map links.

### Layout

- **One object at every width.** On the phone the drawing uses the chapter's
  full measure; from the tablet and desktop compositions it is capped at about
  40 rem and centred, so it stays one screen-high object. The chapter's label
  remains above it, there is no list column, and the page does not scroll
  sideways at any width or at 200% text zoom.

## Consequences

- **The page now depends on a permission.** The plan is publishable because the
  maintainer holds permission for a derived plan. If that scope narrows, the
  open fallback keeps the chapter and changes only the export; it does not
  change the markup, the labels or the script.
- **The asset is reproducible only outside the repository.** The commit holds a
  rendered SVG, not the cadastral extract. A future re-export needs the
  maintainer's source data and script; a reader of the public repository cannot
  rebuild the drawing from what is committed.
- **A palette change is a re-export.** The baked colours cannot follow the CSS
  tokens. Changing a colour means running the export again and committing the
  new SVG, not editing the stylesheet.
- **The plan remains indicative in one respect.** The geometry is real, but the
  Cantine's positions are not: the dots stay random placeholders and every
  panel says `Posizione indicativa` until the Comitato supplies its sketch. If a
  real Cantina later falls outside the OSP frame, the frame is widened and the
  asset re-exported; the dots are then placed from the sketch.
- **The map still claims no route.** It marks places, not an order. There is no
  count, no stop number, no connecting line and no route; the closing band's
  Google Maps link remains the way to reach Turania.
- **The no-script contract is now a two-script contract.** The count is
  deliberate, not an erosion: the second script is the map's small inline
  binding, it sits before the counter, and the guard test still says exactly two
  executable scripts are allowed, not that scripts are allowed.
- **The dialogs' behaviour is native, not simulated.** The static suite pins the
  markup, the CSS guarantees and the script's binding and close handling; the
  open, Esc, click-outside and focus-return behaviour is verified with the
  capture harness and a manual check. The no-script render and the print view
  are checked the same way.
- **The text remains searchable.** The Cantina names and inside lines stay in
  the dialogs' HTML, so the page remains discoverable without a list on screen.
  No structured data is added for individual Cantine and the `Event` metadata is
  unchanged.
- **ADR-0021 is superseded and ADR-0014 is amended.** The glossary's *Mappa del
  Borgo* and *Cantina* entries and the README move with the page; the earlier
  one-script records gain a pointer to this one so no record claims the page has
  one executable script.

## Considered options

- **Keep the hand-drawn schematic and add dialogs.** Rejected: the Comitato
  asked for the real Borgo, and a visitor who knows the place cannot orient on
  invented lanes.
- **An embedded slippy map.** Still rejected for the reasons ADR-0021 gives: a
  library, a second runtime host, runtime data, cookie and consent questions,
  and a chrome that belongs to no other element on the page.
- **Draw the labels inside the SVG.** Rejected: an external image cannot use the
  page's fonts or text styling, and the labels would be edited in the export
  instead of with the page's content.
- **Keep the list as the no-script fallback.** Rejected: it duplicates the
  Cantina text and reintroduces the column the Comitato asked to remove. The
  `<noscript>` style reuses the dialogs themselves.
- **A general dialog system.** Rejected as out of scope: one binding for the
  Mappa's dots, and no popover for any other content.
