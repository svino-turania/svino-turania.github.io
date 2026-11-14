# The page interprets the Locandina for the screen

- **Status:** superseded by ADR-0004 for the composition; the tear derivation
  below still stands
- **Date:** 2026-11-14
- **Related:** README (*Derived assets and the print master*), `assets/css/style.css`

The site is an interpretation of the Locandina, not a transcription of it. The
print master stays the source of identity — palette, type, signature,
photograph, tear profile, wording — and the site derives from it. What the
screen is allowed to change is the *scale* the composition is set at, never the
composition itself: the photograph sits above the date strip, the tear reveals
the layer beneath, the signature heads the page.

That licence has one consequence that is not obvious from the stylesheet. The
tear's amplitude is defined by the print as 4 mm of 303 mm — a fraction of the
**width**. The page originally expressed it as a percentage of the photograph's
box **height**, which is equivalent only while the box keeps the exact print
aspect. Because the page must also put the date above the fold on a 1440×900
laptop, and a full-bleed photograph at that width is 908 px tall, the box height
has to be capped. A height-relative tear would compress its teeth when that
happens. So the polygons are expressed against width, and the tear keeps its
size whatever the box does.

The price is that the page abandons the print's absolute scale on short
viewports: the photograph is cropped rather than proportionally shrunk, and the
page is no longer a poster rendered at browser width. Shrinking the whole
collage to fit was rejected because it produces a ~645 px poster marooned on a
1440 canvas, which is faithful and not a website.

## Considered options

- **Scale the whole collage uniformly to fit the viewport.** Exact in every
  proportion, and reads as a small poster on a large canvas.
- **A full-viewport cover photograph with the date pinned to its lower edge.**
  Keeps the print's top-of-poster composition and still hides the date at some
  viewport heights.
- **Change the photograph's aspect on desktop.** Requires re-deriving both tear
  polygons from the print profile at a new normalisation on every change.
