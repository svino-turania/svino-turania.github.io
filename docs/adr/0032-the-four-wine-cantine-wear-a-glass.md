# The four wine Cantine wear a glass

- **Status:** accepted
- **Date:** 2026-11-28
- **Amends:** ADR-0022 (a dot keeps its role, its 44 px target, its leader and
  its panel, but not its single form: four dots gain a size and a glyph);
  ADR-0024 (the bloom's ring follows the mark's size); ADR-0027 (the wine-list
  promise gains a mark on the plan; the panels stand unchanged)
- **Related:** ADR-0023, ADR-0030, `GLOSSARY.md` (*Cantina*, *Mappa del
  Borgo*), README (*Composition*, *Editorial workflow*, *Content policy*,
  *Tests*), `index.html`, `assets/css/style.css`, `tests/site.test.mjs`

## Context

The Mappa del Borgo draws eleven entries — the ten confirmed Cantine and the
`Piazzale della chiesa` — as identical dots. A visitor can only learn what a
place offers by opening its panel. The prose already promises that the walk
stops to eat, and ADR-0027 gave every panel its facts: a provider line where
the Comitato has confirmed one, and a sentence on what visitors find inside.

Those facts already split the plan. Four panels name no provider and carry the
wine-list promise; six name dishes; and `Quissi de Brunetto` names a provider,
`Da Tobia`, with gin e amari — something besides wine, and no food at all. Any
mark that claims to label *food* has to either misdraw `Quissi de Brunetto` or
introduce a third class for it.

## Decision

**A Cantina whose panel confirms nothing but wine is drawn as a bordeaux seal
with a wine glass; every other entry keeps the plain dot.**

### Which dots

- **The rule is derived from the panel, not from a new confirmation.** A dot is
  a seal if and only if its panel has no provider and carries the wine-list
  sentence. Today those are `Quissi de Casianu`, `Quissi de Santuccella`,
  `Quissi de Santu` (the macellaru dot) and `Quissi de Gabriele`.
- **The plain dots are the other seven**: the six with a confirmed dish
  (Medecu, Cacafino, Callaru, the ammazzatora, Puzzicò and the piazzale) and
  `Quissi de Brunetto`.
- **Brunetto's plainness is the point.** The pair reads *only wine* / *serves
  something besides wine*, so a confirmed provider with gin and amari is
  honestly plain. The pair does not read *wine* / *food*, and the panels say
  which is which.
- **The mark follows the panel's facts.** If the Comitato confirms a provider
  for one of the four, that panel gains the provider line and a sentence
  written from the new facts, and its dot returns to plain. If the promise is
  withdrawn, the sentence goes and the seal goes with it.

### How it is drawn

- **A filled bordeaux disc 22 px across, the glass knocked out in cream.** The
  glass is Google's Material `wine_bar`, taken unaltered apart from
  `currentColor`, from the same Apache-2.0 set already inlined for the Bagni;
  it sits at 16 px, the Bagni's size.
- **Not a bordeaux outline circle.** A Bagno is `--ink-muted` ink on cream: a
  facility. A bordeaux circle with a bordeaux glyph inside would be that same
  object in another hue, and a distinction carried by hue alone is the one the
  page's accessibility rule refuses. The seal differs by fill and reversed
  contrast, not by colour.
- **Hover and focus move the fill to `--link-hover`**, the glass staying cream;
  bronze on cream is 6.30:1, past the 3:1 a graphic needs. The focus outline on
  the 44 px target is unchanged.
- **The bloom's ring grows from 13 to 22 px and still ends on the 44 px
  target's edge**, so it blooms from the mark's edge and thins out at the same
  place: 2× for a seal against the plain dot's 3.2×. The 44 px target, the
  leader and the stagger in `--bloom` are unchanged.
- **The nudge values are re-solved for the wider mark** from the plan's
  percentages and written in the markup, as ADR-0022 has them. Casianu, in the
  piazza cluster, takes the largest step aside among the seals, clearing the
  church Bagno without collapsing its target from Enzo's.

### What it does not say

- **No word and no legend.** The glass is not self-explaining — every one of
  the eleven places serves wine, so a glass that is true everywhere cannot by
  itself say *only*. The panel's sentence teaches the mark, and that is the
  whole of its explanation.
- **No count.** The seals are facts about single places. The Mappa still prints
  no number and no total, and the reader may count the seals exactly as they
  may count the two Casse.
- **No change to the accessible name.** The dot still announces the place's
  name; the glass is `aria-hidden`, and a screen-reader user meets the fact one
  Enter away, in the panel, as every visitor does before they learn the mark.
- **No new script, request, colour, font or asset.** The glyph is inlined with
  the Bagni's.

### Paper and no script

- **The seals print with their fill**, as the dots and the Bagni do
  (`print-color-adjust: exact`).
- **Without script the seals go with the dots**, as the Cassa's ring goes while
  its word stays. A seal has no word to keep, and the four entries still flow
  below the plan, each saying that it is wine.

## Consequences

- **The plan now has two forms of entry.** The Cassa keeps its hollow gold ring
  and the Bagni their bronze circles, so the glossary's rule that the filled
  bordeaux mark is what opens a panel holds in two sizes and two widths.
- **A content edit changes the drawing.** Adding a provider to one of the four
  turns a seal back into a dot, and the suite must pin which four are seals so
  the change is seen in review rather than discovered on the page.
- **The mark is learned, not read.** A visitor who never opens a wine panel
  learns nothing from the glass; the page accepts that, because the panel is
  where every fact about a place already lives.
- **The README, the suite and the CSS follow when the mark is built.** This
  record fixes the decision; the implementation moves *Composition*, the
  pictogram section and the tests with it.

## Considered options

- **A fork marking the Cantine with a kitchen.** Rejected: it reads at a glance
  and answers the visitor's likeliest question, but `Quissi de Brunetto` serves
  gin and amari, so the fork would need a third glyph or would misdraw it.
  The inverted pair — the exception gets the mark — keeps the plain dot as the
  page's baseline.
- **The word `Solo vino` beside each seal, as the Cassa writes its name.**
  Rejected: it would be true and accessible, but it repeats a second word four
  times over a dense plan, and it makes the glass redundant beside it. One mark
  or one word, not both.
- **An open bordeaux ring for the wine dots.** Rejected: it spends the page's
  hollow-ring idiom, which the Cassa owns, and a hollow ring meaning *only
  wine* fights a hollow ring meaning *not a tasting room*.
- **A two-mark key under the plan.** Rejected: the page has no legend and no
  visible caption, and a key would be its first.
- **Adding the fact to the dot's accessible name.** Rejected for the reason
  ADR-0027 gives: the dot's name is the place's name, and the provider — or the
  absence of one — belongs to the panel.
