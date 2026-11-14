# ADR 0001: The first print run carries the GitHub Pages URL

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** the sVino maintainer and the Comitato Feste Turania
- **Related:** spec #1, ticket #9

## Context

The II Edizione Locandina is finished and ready for print. A QR code cannot be
added to a poster without a destination that resolves: printing a QR that leads
nowhere wastes ink and breaks the one promise the code makes.

The event needs a live address now, before the print run, and the address that
goes into the poster is effectively permanent — it is printed on paper that
people keep, photograph and hand to others. The site is a public repository
named `svino-turania.github.io`, the GitHub Pages organisation-site convention,
so it serves the root of the domain rather than a subpath and needs no extra
configuration to get there.

A custom domain would be nicer to read and say aloud, but it costs money and
time: registering and paying for the name, configuring DNS, waiting for
propagation, and provisioning TLS before the address can be trusted in print.
The first print run has a date; the domain does not need to be settled for it.

The QR itself is not part of this build (see the spec). It is generated only
once the page resolves over HTTPS. That condition is what makes the URL a
decision rather than a placeholder.

## Decision

The first print run carries `https://svino-turania.github.io` and no custom
domain.

- The address is the one printed on the Locandina, used by the QR when it is
  generated, and used as the site's canonical address.
- The QR is generated only after that address resolves over HTTPS on a phone.
- Changing the URL later invalidates every printed copy that carries it. A
  future change is a new decision and a new print master, not an edit to this
  one.

## Consequences

Positive:

- No domain purchase, DNS setup or TLS provisioning before the print deadline.
- The address is live as soon as the repository deploys through GitHub Actions.
- The organisation-site repository convention keeps the page at the root, with
  no path segment to explain or shorten.
- HTTPS is provided by GitHub Pages, which is the gate for generating the QR.

Negative:

- The address is longer and less memorable than a custom domain; it is harder
  to read over the phone or fit beside the QR.
- It is tied to the organisation and repository names. Renaming either changes
  the address.
- If the event later moves to a custom domain, redirects can help online but
  cannot change ink already on paper. The printed copies keep the old address
  and must still resolve for as long as they are in circulation.

## Alternatives considered

- **Register a custom domain before printing.** Rejected for the first run:
  it adds cost and DNS/TLS lead time to a deadline, and the address is not the
  thing the poster is waiting for. It remains a reasonable decision for a later
  print run, recorded in a new ADR.
- **Publish from a project-named repository.** Rejected: GitHub Pages would
  serve the site under a subpath, the address would be worse for print, and the
  repository would need renaming if a custom domain were adopted later.
- **Wait for a custom domain before printing the Locandina.** Rejected: the
  poster cannot wait indefinitely, and the committee accepted the cost/time
  trade-off in favour of publishing now.
