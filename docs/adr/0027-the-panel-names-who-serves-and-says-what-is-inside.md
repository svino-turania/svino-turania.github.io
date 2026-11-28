# The panel names who serves and says what is inside

- **Status:** accepted
- **Date:** 2026-11-27
- **Amends:** ADR-0026 (the panel's single inside line becomes a provider
  paragraph and a sentence; the heading, the dots, the positions, the Casse,
  the labels, the fallbacks and the script contract stand)
- **Amended by:** ADR-0032 (the four wine-list panels' dots become bordeaux
  seals with a wine glass; the panels stand)
- **Related:** ADR-0022, ADR-0023, ADR-0024, ADR-0025, ADR-0026, `GLOSSARY.md`
  (*Cantina*, *Mappa del Borgo*), README (*Composition*, *Editor workflow*,
  *Content policy*, *Tests*), `index.html`, `assets/css/style.css`,
  `tests/site.test.mjs`

## Context

ADR-0026 gave every panel one inside line that joined the provider who serves
with the food on offer by a dash: `Pro Loco Civita — polpette al sugo`. Two
things were wrong with it. The provider — the event's partner — sat buried in
the same line as the dishes, so a visitor could not see at a glance who serves;
and on the four Cantine where no provider is confirmed the line said only
`vino`, which reads as a field left unfilled rather than a deliberate omission.
The line also spoke in a directory's voice: a list of goods, not the page's
`voi` register.

## Decision

**The panel has three parts. The place's name stays the heading; the provider
takes a line of its own, present only where the Comitato has confirmed one; one
sentence says what visitors find inside.**

### The markup

- **Three slots, in order.** `<h3>` for the place's name, an optional
  `<p class="mappa__dialog-provider">`, a `<p class="mappa__dialog-sentence">`,
  then `Chiudi`. The dialog keeps `aria-labelledby` on the heading, so a screen
  reader still announces the place's name and no new name.
- **Two providers, two equal lines.** `Settecapocce` and `Palaterra` share one
  paragraph, joined by a `<br>` with no separator and no rank; the sentence says
  nothing about which one serves which item, because the Comitato has not
  assigned them.
- **No provider, no paragraph.** On the four Cantine that serve only wine the
  provider element is absent — not empty, not a dash, not a generic word — and
  the sentence follows the heading at the same spacing it has after a provider.
- **No new focus stop and no new behaviour.** The provider and the sentence are
  ordinary text; Tab still reaches only the dot and `Chiudi`, and Esc,
  click-outside, focus return, the opening motion, print and the no-script
  fallback are unchanged.

### The visual register

- **The provider is a printed label, not prose.** Same vocabulary as the
  chapter's labels and the Cassa's name: `--sans`, uppercase via CSS, `--step--1`,
  weight 700, `0.16em` tracking, `--ink-muted`, `line-height: 1.2`. Uppercasing in
  CSS keeps the confirmed names' own spelling in the markup.
- **The sentence is the dialog's prose.** `--serif` (the dialog's own face) at
  `--step-0`, `line-height: 1.5`, `--ink`.
- **Spacing is spacing, nothing else.** `--space-2` between the heading and the
  provider; `--space-3` between whichever of the two precedes the sentence. No
  new colour, font, rule, shadow, radius or frame.

### The copy rule

- **Every sentence is derived from Comitato-confirmed facts.** It speaks in the
  page's `voi` voice, matching `Vi aspettiamo`, and may borrow a word or an
  image the page already uses (`ai piedi della chiesa`). It may not add a claim
  about smell, temperature, freshness, origin, preparation, quantity, time or
  price, nor a superlative or a `da non perdere`. The confirmed dishes keep their
  wording and their order.
- **One invitation each, and no repeated gesture.** The panels do not share a
  catchphrase: `senza fretta` and `con calma` are not used as a closing formula,
  and the wine-list promise carries the commitment without a mood borrowed to
  fill it. An invitation that appears on every panel stops being an invitation
  and becomes the page's one tone.
- **Every panel is pinned verbatim.** The suite asserts each provider and each
  sentence exactly, so a new fact cannot enter — and a confirmed one cannot
  leave — without a change the review sees.

### The wine-list promise

- **One sentence for the four Cantine with no provider.** *Assaggiate il vino:
  la lista dei vini arriverà su questa pagina.*
- **It is a commitment, not a placeholder.** This is a deliberate exception to
  the content policy's no-placeholder rule: the Comitato will publish the list,
  and the sentence says so in the future tense. It carries no timeline word —
  not `presto`, not `a breve`, not `prossimamente` — because the page cannot
  keep a timeline it has not been given. `Arriverà` says the list is coming
  without promising when.
- **A test pins it.** The content-policy block pins the sentence verbatim and
  requires its four occurrences, so a later edit cannot soften it into filler.
- **Withdrawal means removal.** If the Comitato withdraws the commitment, the
  sentence is removed, not hedged. If it later confirms a provider for one of
  these Cantine, that panel gains the provider line and a sentence written from
  the new facts; the shared sentence then covers only the panels still without
  a provider.

### The piazzale

- **It follows the same model.** `Pro Loco Turania` on the provider line, then
  its own sentence. The piazzale is not a special case in the markup, the
  register or the tests.

## Consequences

- **A visitor sees who serves before reading what is on offer**, and a screen
  reader hears the names as ordinary text in visual order, after the heading.
- **An unconfirmed provider is simply absent**, which reads as deliberate
  because the panel's other two parts still stand in their places.
- **The page keeps its voice.** The panels now invite rather than list, and the
  shared wine-list sentence turns an absence into a promise the Comitato can
  keep.
- **The content policy has one documented exception**, pinned by a test, so a
  future editor sees why the wine-list sentence is allowed and why nothing like
  it may be added elsewhere.
- **The panel's frame, motion, print and no-script behaviour are untouched.**
  The suite's existing guards for them pass unchanged; the new rules add no
  movement, colour, font or frame.
- **No new surface.** No script, external request, font, colour, image or plan
  export is added, and `assets/img/mappa-del-borgo.svg` is untouched.
- **The docs move with the copy.** The README's composition, editor workflow and
  content policy describe the provider line and the sentence, and the glossary's
  *Cantina* entry now places the provider on the provider line, not an inside
  line.

## Considered options

- **Keep the single inside line and style the provider inside it.** Rejected: a
  name sharing a line with the dishes still reads as part of the food list, and
  a dash is a separator the page nowhere else uses for people.
- **Put the provider above the heading, or in a `<dl>`.** Rejected: the heading
  is the dialog's accessible name and must stay the place's name; a definition
  list would add a second register and more markup for two short strings.
- **Number or rank the two providers.** Rejected: the Comitato has not ranked
  them; two equal lines are the only honest arrangement.
- **Print `vino` on the four panels with no provider.** Rejected: it reads as an
  unfinished field, and it is not a sentence.
- **Say `prossimamente` on the wine panels.** Rejected: the content policy bans
  it, and it is filler rather than a commitment. The promise says what the
  Comitato will do, not that something is vaguely coming.
- **Write a different sentence for each of the four wine panels.** Rejected:
  they share the same confirmed fact — wine, and the list to come — and one
  sentence keeps the promise consistent and easy to withdraw.
- **Keep the `senza fretta` cadence on every panel.** Rejected: repeated on five
  panels it stopped reading as hospitality and became the page's only mood, and
  the wine promise leaned on the cadence instead of on the commitment it makes.
- **Add the provider as an `aria-label` on the dot.** Rejected: the dot's name is
  the place's name, and the provider is what a visitor hears once the panel is
  open, in reading order.
