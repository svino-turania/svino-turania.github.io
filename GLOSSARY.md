# Glossary

The eleven terms sVino uses, with the meaning the organisation gives them. Use
this vocabulary and these spellings in code, tests, issues and documents; do
not drift to synonyms.

Spelling and capitalisation fixed by the project:

- `sVino` — lower-case `s`, capital `V`. Never "Svino" or "SVino".
- `II Edizione` in running prose; the printed lockup is `II EDIZIONE`.
- `Turania (RI)` — with a space before the province abbreviation, exactly.
- `Locandina`, `Mappa del Borgo`, `Cantina`, `Borgo`, `Programma`, `Mercatino`
  and `Comitato Feste Turania` are capitalised when they name the event's own
  artefact, venues and body.

## sVino

The event: a wine tasting held in the Cantine of the Borgo, on 6 December
2026, a cura del Comitato Feste Turania. Always written `sVino`. The wine is
not from Turania: do not write "il vino di Turania", nor "vino locale" or
"del territorio". The Mercatino's `produttori locali` describe the producers,
not the wine: the wine rule stands, and `vino locale` remains forbidden.
The capital V is deliberate and highlights "Vino"; the signature lettering
keeps it as a separate gesture, with no ligature and no tracking.

## Edizione

One edition of sVino. This project covers the second one. In running prose
write `II Edizione`; on the Locandina and in the `edition` value the lockup is
set in capitals as `II EDIZIONE`. The Roman numeral is part of the name. The
Cantina paragraph refers to it in words as *la seconda edizione*; that is
prose, not the lockup.

## Cantina

A wine cellar of the Borgo. The event happens inside the Cantine: visitors
taste wine and move from one Cantina to the next. Some of the Cantine also
serve food, confirmed by the Comitato in November 2026; the page prose says
only that the walk stops to eat, naming no vendor and no number of Cantine.
Capitalise when
naming the event's venues as a set (`le Cantine del Borgo`); the page prose
uses the lower-case form (`nelle cantine del borgo`).

The Mappa del Borgo names a Cantina only when the Comitato has confirmed it,
and prints what visitors find inside, naming the provider only where it is
confirmed. Each confirmed Cantina is one dot on the plan and one panel opened
from it; there is no separate list. The Mappa states no count of Cantine, no
route order, no title the Comitato has not confirmed and no price. Do not infer
a number, a menu, a vendor, a duration or a price from the term: none of those
is decided.

## Borgo

The village of Turania whose Cantine host the event. It is the Borgo of
Turania (RI), not a separate place. Lower-case in the page prose
(`il borgo`), capitalised when used as the name of the venue area.

## Comitato Feste Turania

The committee that organises sVino and the body that owns its content. It is
the `A CURA DI` value and appears exactly as `Comitato Feste Turania`, without
a leading article. It decides the Programma, any entry policy and any contact
details; until it does, none of those appears on the page.

## Programma

The running order of sVino: the acts, performances and events the Comitato
has confirmed, with the times it has set. An item belongs to the Programma
only once the Comitato has confirmed it; a proposal or a possibility does not.

## Mercatino

The market of local producers that sVino hosts, present since the first
edition. "Local" means the area around Turania; the term states no boundary,
village or list. Capitalise when naming the event's own market (`il
Mercatino`); the page prose uses the lower-case form (`un mercatino`). Do not
infer exhibitors, a count, a place or a time from the term; only the Comitato
confirms them.

## Locandina

The sVino poster. One master produces the A3 print format and the square and
story social formats. It is the reference for the page's facts and identity;
the Cantina prose is the page's own and is not printed on the Locandina. The
downloadable copy is a web-optimised RGB derivative of the Locandina, not the
print PDF; the two must never disagree.

## Mappa del Borgo

The page's picture of the walk: a real plan of the Borgo, exported from the
cadastral base, north-up and in scale, with the piazza, the church and the two
verified streets `Corso Trieste` and `Via Turano` as labels. The Comitato-confirmed
Cantine are dots — the page's only bordeaux marks — and each dot is a button
that opens the Cantina's panel, carrying its name and what visitors find inside.
The dots are the map's entries: there is no list beside or beneath the drawing.
It claims places, not an order, and names no count, no route and no Cantina the
Comitato has not confirmed. The positions are placeholders and each panel says
`Posizione indicativa` until the Comitato supplies its sketch. Capitalise when
naming the chapter (`la Mappa del Borgo`); the page prose does not use the term.

## Turania (RI)

The town where the event takes place, written exactly `Turania (RI)`. Use the
full form wherever the place is a printed value (`DOVE`) or a map query; the
prose may say `Turania` on its own. The same string is what the page passes to
the map application. The village was formerly called Petescia (see below).

## Petescia

The old name of Turania, and the name that appears inside the archival
photographs, whose printed lettering reads `PETESCIA SABINA`. It is the same
village under its earlier name, not a frazione and not a separate place. The
name is part of what a photograph shows and is never written into the page's
prose or printed values, which use `Turania (RI)`.
