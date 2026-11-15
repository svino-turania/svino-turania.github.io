import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { inflateSync } from 'node:zlib';
import { parseHTML } from 'linkedom';

const ROOT = resolve(import.meta.dirname, '..');

// The single seam: the repository root, as a static server serves it.
const SITE = ROOT;
const SITE_ORIGIN = 'https://svino-turania.github.io';
const MAP_ORIGIN = 'https://www.google.com';

// The photograph's slot: edge to edge on the phone; from 48 rem up, the 84 rem
// spread measure less its inline padding. Above 84 rem the page is capped at
// 84 rem and the gutters are 5.5vw a side; between 48 and 84 rem the page is
// the viewport less the same gutters. On the phone the band bleeds past the
// 24px gutters, so the slot is the whole viewport.
const PHOTO_SIZES =
  '(min-width: 84rem) calc(84rem - 2 * min(5.5vw, 96px)), (min-width: 48rem) calc(100vw - 11vw), 100vw';

const CANTINA_PARAGRAPH =
  "Per la seconda edizione si torna nelle cantine del borgo: si assaggia il vino e da una cantina si passa alla successiva, con il bicchiere in mano. Si cammina piano. Ci si ferma a parlare con chi si incontra, e non si guarda l'orologio. Questa pagina sarà aggiornata con tutte le novità dell'evento. Il programma e gli aggiornamenti arriveranno qui presto. Vi aspettiamo.";

const PHOTO_ALT =
  "Interno di una cantina scavata nella roccia: soffitto e pareti di pietra grezza, una lampadina nuda appesa a un filo, damigiane di vetro anche dentro cesti di vimini, una botte coricata e un grande tino chiaro con il coperchio; un palo di legno regge la volta.";

const IMAGE_TYPE_BY_EXTENSION = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
]);

function normalize(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function servedStylesheet() {
  const file = join(SITE, 'assets', 'css', 'style.css');
  assert.ok(existsSync(file), 'manca il foglio di stile nel sito');
  return readFileSync(file, 'utf8');
}

/*
 * The span of every at-rule block whose header matches. Brace counting is
 * enough for this stylesheet: it has no braces inside strings, and it lets a
 * @media block nested in @supports be found as its own block.
 */
function atRuleBlocks(css, header) {
  const blocks = [];
  const pattern = new RegExp(header, 'gi');
  let match;
  while ((match = pattern.exec(css)) !== null) {
    let depth = 0;
    let index = match.index;
    for (; index < css.length; index += 1) {
      if (css[index] === '{') {
        depth += 1;
      } else if (css[index] === '}') {
        depth -= 1;
        if (depth === 0) {
          break;
        }
      }
    }
    blocks.push({ start: match.index, end: index });
  }
  return blocks;
}

/*
 * The selector of the rule that owns the declaration at `index`. The nearest
 * `{` backwards opens the rule; the previous `{` or `}` is the edge of the
 * surrounding at-rule (or of the previous rule).
 */
function selectorAt(css, index) {
  const open = css.lastIndexOf('{', index);
  assert.ok(open !== -1, 'dichiarazione fuori da una regola');
  const start = Math.max(
    css.lastIndexOf('}', open - 1),
    css.lastIndexOf('{', open - 1),
  );
  return normalize(css.slice(start + 1, open));
}

/* The selectors whose rules carry animation-timeline: view(). */
function viewTimelines(css) {
  const supports = atRuleBlocks(
    css,
    '@supports\\s*\\(animation-timeline:\\s*view\\(\\)\\)',
  );
  const selectors = [];
  for (const block of supports) {
    const open = css.indexOf('{', block.start);
    const body = css.slice(open + 1, block.end);
    for (const use of body.matchAll(/animation-timeline\s*:\s*view\(\)/g)) {
      selectors.push(selectorAt(css, open + 1 + use.index));
    }
  }
  return selectors;
}

function withoutBlocks(css, blocks) {
  let result = css;
  for (const { start, end } of [...blocks].sort((a, b) => b.start - a.start)) {
    result = result.slice(0, start) + result.slice(end + 1);
  }
  return result;
}

function paletteToken(name) {
  const source = servedStylesheet().match(
    new RegExp(`--${name}\\s*:\\s*(#[0-9a-fA-F]{6})\\s*;`),
  );
  assert.ok(source, `manca il token --${name} nel foglio di stile`);
  return source[1].toLowerCase();
}

function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/* The declarations of one named cascade layer, braces included. */
function layerBlock(css, name, source = servedStylesheet()) {
  const clean = stripCssComments(source);
  const blocks = atRuleBlocks(clean, `@layer\\s+${name}\\s*\\{`);
  assert.equal(blocks.length, 1, `manca il layer ${name} nel foglio di stile`);
  return clean.slice(blocks[0].start, blocks[0].end + 1);
}

/*
 * The declarations of every 48 rem override: the deliberate large-format
 * spread, as opposed to the phone the base rules describe.
 */
function wideSpread(css) {
  return atRuleBlocks(css, '@media\\s*\\(min-width:\\s*48rem\\)')
    .map(({ start, end }) => css.slice(css.indexOf('{', start) + 1, end))
    .join('\n');
}

function rgb(hexColour) {
  return {
    r: Number.parseInt(hexColour.slice(1, 3), 16),
    g: Number.parseInt(hexColour.slice(3, 5), 16),
    b: Number.parseInt(hexColour.slice(5, 7), 16),
  };
}

/* WCAG 2.1 relative-luminance contrast, computed from the served primitives. */
function contrastRatio(foreground, background) {
  const channel = (value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (hex) => {
    const { r, g, b } = rgb(hex);
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

/*
 * The circles of the tab icon, as a browser drawing it would: the cream disc
 * that is its ground and the bordeaux ring that holds it off a light tab bar.
 */
function svgCircles(svg) {
  return [...svg.matchAll(/<circle\b([^>]*)\/>/gi)].map(([, attributes]) => {
    const attribute = (name) => {
      const match = attributes.match(new RegExp(`\\b${name}="([^"]+)"`));
      return match ? match[1].trim() : null;
    };
    return {
      cx: Number(attribute('cx')),
      cy: Number(attribute('cy')),
      r: Number(attribute('r')),
      fill: attribute('fill')?.toLowerCase() ?? null,
      stroke: attribute('stroke')?.toLowerCase() ?? null,
      strokeWidth: Number(attribute('stroke-width') ?? 0),
    };
  });
}

/*
 * Read the IHDR of a PNG and the first decoded pixel, as a browser drawing the
 * touch icon would: its size, its colour model and the colour of its corner.
 */
function pngFrame(bytes) {
  assert.equal(
    bytes.subarray(0, 8).toString('hex'),
    '89504e470d0a1a0a',
    'il file non è un PNG',
  );
  assert.equal(bytes.subarray(12, 16).toString('ascii'), 'IHDR');
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bitDepth: bytes[24],
    colorType: bytes[25],
  };
}

function pngTopLeftPixel(bytes) {
  const { bitDepth, colorType } = pngFrame(bytes);
  assert.equal(bitDepth, 8, `profondità PNG non attesa: ${bitDepth}`);
  assert.ok(
    colorType === 2 || colorType === 6,
    `modello di colore PNG non atteso: ${colorType}`,
  );

  const chunks = [];
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii');
    if (type === 'IDAT') {
      chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
    }
    if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }
  const scanlines = inflateSync(Buffer.concat(chunks));
  // For the first pixel of the first row every filter predictor is zero, so
  // the stored samples are the pixel's RGB values.
  return { r: scanlines[1], g: scanlines[2], b: scanlines[3] };
}

/*
 * Everything a static server publishes from the repository root: the page
 * document and the assets tree. This is an allowlist, so node_modules, the
 * tests, the repository documents and .git are never in scope for the
 * directory-walking assertions below.
 */
function shippedFiles() {
  const files = ['index.html'];
  const assets = join(SITE, 'assets');
  if (existsSync(assets)) {
    for (const name of readdirSync(assets, { recursive: true })) {
      files.push(join('assets', String(name)));
    }
  }
  return files;
}

/*
 * Read the SOF header of a JPEG as a browser loading the file would: the
 * type, the pixel size and the colour model. One parser serves the download,
 * the photograph and the social preview.
 */
function jpegFrame(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'il file non è un JPEG');
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    if (marker === 0xda) {
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = bytes.readUInt16BE(offset + 2);
    const isFrameHeader =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isFrameHeader) {
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7),
        components: bytes[offset + 9],
      };
    }
    offset += 2 + length;
  }
  assert.fail('dimensioni JPEG non trovate');
}

function jpegSize(file) {
  const { width, height } = jpegFrame(readFileSync(file));
  return { width, height };
}

function siteFileFor(rawUrl) {
  assert.ok(
    !/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(rawUrl),
    `la risorsa non è un percorso relativo: ${rawUrl}`,
  );
  const url = new URL(rawUrl, `${SITE_ORIGIN}/`);
  assert.equal(url.origin, SITE_ORIGIN, `la risorsa punta a un altro host: ${rawUrl}`);
  const file = join(SITE, decodeURIComponent(url.pathname));
  assert.ok(existsSync(file), `la risorsa non esiste nel sito: ${url.pathname}`);
  return { url, file };
}

function sameOriginUrl(rawUrl) {
  const url = new URL(rawUrl, `${SITE_ORIGIN}/`);
  assert.equal(url.origin, SITE_ORIGIN, `risorsa di terze parti: ${rawUrl}`);
  return url;
}

function loadSite() {
  const file = join(SITE, 'index.html');
  assert.ok(existsSync(file), 'manca index.html alla radice del sito');
  const { document } = parseHTML(readFileSync(file, 'utf8'));
  return document;
}

/*
 * Read the candidates a browser sees in a srcset: each one is a URL and the
 * width descriptor that lets it choose against the layout width.
 */
function parseSrcset(value) {
  return value
    .split(',')
    .map((candidate) => candidate.trim())
    .filter(Boolean)
    .map((candidate) => {
      const [url, descriptor] = candidate.split(/\s+/);
      return {
        url,
        width: descriptor && /^\d+w$/.test(descriptor)
          ? Number.parseInt(descriptor, 10)
          : null,
      };
    });
}

/* The candidates wide enough for a laptop screen: 2048 px and up. */
function wideCandidates(value) {
  return parseSrcset(value).filter(
    (candidate) => candidate.width !== null && candidate.width >= 2048,
  );
}

function metaContent(document, attribute, key) {
  const meta = document.querySelector(`meta[${attribute}="${key}"]`);
  assert.ok(meta, `manca il meta ${attribute}="${key}"`);
  return normalize(meta.getAttribute('content') ?? '');
}

function accessibleName(document, element) {
  const labelledBy = normalize(element.getAttribute('aria-labelledby') ?? '');
  if (labelledBy !== '') {
    return labelledBy
      .split(/\s+/)
      .map(
        (id) =>
          document.getElementById(id) ?? element.querySelector(`[id="${id}"]`),
      )
      .filter(Boolean)
      .map((node) => normalize(node.textContent))
      .join(' ');
  }
  const ariaLabel = normalize(element.getAttribute('aria-label') ?? '');
  if (ariaLabel !== '') {
    return ariaLabel;
  }
  const text = normalize(element.textContent ?? '');
  if (text !== '') {
    return text;
  }
  return normalize(element.querySelector('img[alt]')?.getAttribute('alt') ?? '');
}

/*
 * All the text a visitor or a link checker receives: the title, the body and
 * every meta value (description, Open Graph, Twitter, image alt). Attributes
 * are read from the parsed document, so entities are already resolved.
 */
function wholeDocumentText(document) {
  const parts = [document.title, document.body.textContent];
  for (const meta of document.querySelectorAll('meta[content]')) {
    parts.push(meta.getAttribute('content'));
  }
  return normalize(parts.join(' ')).toLowerCase();
}

/*
 * The text a visitor reads in the body, with metadata out of scope. Comments
 * are not part of textContent; scripts, styles, templates and hidden nodes are
 * removed so the count reflects what is on the page.
 */
function visibleBodyText(document) {
  const body = document.body.cloneNode(true);
  for (const node of body.querySelectorAll('script, style, template, [hidden]')) {
    node.remove();
  }
  return normalize(body.textContent);
}

function occurrences(text, fact) {
  return text.split(fact).length - 1;
}

test('la pagina servita riporta i fatti stampati sulla Locandina', () => {
  const document = loadSite();
  const text = normalize(document.body.textContent);

  const date = document.querySelector('time[datetime="2026-12-06"]');
  assert.ok(date, 'manca un elemento time con la data del 6 dicembre 2026');
  assert.match(normalize(date.textContent), /^6\s+DOMENICA\s+DICEMBRE 2026$/);

  for (const fact of [
    '12:00',
    'DALLE ORE',
    'DOVE',
    'A CURA DI',
    'Turania (RI)',
    'Comitato Feste Turania',
    'Per le cantine di Turania',
    'II EDIZIONE',
  ]) {
    assert.ok(text.includes(fact), `manca il fatto stampato "${fact}"`);
  }

  assert.ok(
    text.includes(CANTINA_PARAGRAPH),
    'il paragrafo delle Cantine non è riportato alla lettera',
  );
});

test('ogni fatto compare una sola volta nel testo visibile della pagina', () => {
  const document = loadSite();
  const text = visibleBodyText(document);

  for (const fact of ['12:00', 'Turania (RI)', 'Comitato Feste Turania']) {
    assert.equal(
      occurrences(text, fact),
      1,
      `il fatto "${fact}" compare ${occurrences(text, fact)} volte, non una`,
    );
  }

  for (const label of ['DALLE ORE', 'DOVE', 'A CURA DI']) {
    assert.equal(
      occurrences(text, label),
      1,
      `l’etichetta "${label}" compare ${occurrences(text, label)} volte, non una`,
    );
  }
});

test('la prosa delle Cantine sta alla lettera dentro la regione modificabile', () => {
  const html = readFileSync(join(SITE, 'index.html'), 'utf8');
  const startMarker = 'CANTINA — INIZIO REGIONE MODIFICABILE';
  const endMarker = 'CANTINA — FINE REGIONE MODIFICABILE';
  assert.equal(html.split(startMarker).length, 2, 'manca o si ripete il segnaposto d’inizio');
  assert.equal(html.split(endMarker).length, 2, 'manca o si ripete il segnaposto di fine');

  const start = html.indexOf(startMarker) + startMarker.length;
  const end = html.indexOf(endMarker);
  assert.ok(start < end, 'la regione modificabile è vuota o rovesciata');

  const fragment = html.slice(start, end).replace(/-->/g, '').replace(/<!--/g, '');
  const { document } = parseHTML(`<!doctype html><html><body>${fragment}</body></html>`);
  const paragraphs = [...document.querySelectorAll('p')].map((node) =>
    normalize(node.textContent),
  );

  assert.equal(paragraphs.length, 2, 'la regione non contiene i due paragrafi approvati');
  assert.equal(
    normalize(paragraphs.join(' ')),
    CANTINA_PARAGRAPH,
    'i paragrafi dentro la regione non sono quelli approvati, alla lettera',
  );
});

test('le literal della data concordano con l’attributo datetime', () => {
  const document = loadSite();
  const time = document.querySelector('time[datetime]');
  assert.ok(time, 'manca un elemento time con un attributo datetime');

  const iso = time.getAttribute('datetime');
  assert.match(
    iso,
    /^\d{4}-\d{2}-\d{2}$/,
    `datetime non è una data ISO: ${iso}`,
  );
  const date = new Date(`${iso}T00:00:00Z`);

  // Recompute the date independently of the page with the same locale the
  // printed date uses; the literals must not drift away from datetime.
  const weekday = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    timeZone: 'UTC',
  })
    .format(date)
    .toUpperCase();
  const month = new Intl.DateTimeFormat('it-IT', {
    month: 'long',
    timeZone: 'UTC',
  })
    .format(date)
    .toUpperCase();
  const day = String(date.getUTCDate());
  const year = String(date.getUTCFullYear());

  assert.equal(
    normalize(time.textContent),
    `${day} ${weekday} ${month} ${year}`,
    'giorno, giorno della settimana, mese o anno non concordano con datetime',
  );
});

/*
 * The printed date is one vertical lockup: the weekday above the numeral at
 * display scale, the month beneath, the time under DALLE ORE. The DOM keeps
 * the printed order (day, weekday, month) so the time element reads as one
 * date. The exactly-once test proves the time has no second home.
 */
test('la data è un lockup verticale allineato a sinistra con un solo luogo per l’orario', () => {
  const document = loadSite();
  const spread = document.querySelector('main.spread');
  assert.ok(spread, 'manca la griglia della pagina');

  const date = spread.querySelector('section.date');
  assert.ok(date, 'manca il blocco della data');
  assert.equal(
    date.parentElement,
    spread,
    'la data non è un blocco della griglia',
  );

  const lockup = date.querySelector('time.date-lockup[datetime="2026-12-06"]');
  assert.ok(lockup, 'il lockup non è un <time> con datetime="2026-12-06"');

  // The markup keeps the printed order; the grid areas, not the DOM, put the
  // weekday above the numeral on screen.
  const parts = [...lockup.children];
  assert.deepEqual(
    parts.map((node) => node.getAttribute('class')),
    ['date-day', 'date-weekday', 'date-month'],
    'l’ordine del DOM non è giorno, giorno della settimana, mese',
  );
  assert.deepEqual(
    parts.map((node) => normalize(node.textContent)),
    ['6', 'DOMENICA', 'DICEMBRE 2026'],
    'le parti del lockup non sono quelle stampate',
  );

  // One visible home for the time: the DALLE ORE label and its clock value
  // sit in the date block, directly under the lockup.
  const timeHome = date.querySelector('dl.date-time');
  assert.ok(timeHome, 'manca il luogo dell’orario nella data');
  assert.equal(
    lockup.nextElementSibling,
    timeHome,
    'l’orario non segue il lockup della data',
  );
  const label = [...timeHome.querySelectorAll('dt')].find(
    (node) => normalize(node.textContent) === 'DALLE ORE',
  );
  assert.ok(label, 'manca DALLE ORE sotto la data');
  assert.match(
    normalize(label.nextElementSibling?.textContent ?? ''),
    /^\d{2}:\d{2}$/,
    'il valore sotto DALLE ORE non è un orario',
  );

});

test('la pagina spedita è solo index.html e non contiene sintassi di template', () => {
  const pages = shippedFiles().filter((file) => file.endsWith('.html'));
  assert.deepEqual(
    pages,
    ['index.html'],
    `il sito spedisce più di una pagina HTML: ${pages.join(', ')}`,
  );

  const html = readFileSync(join(SITE, 'index.html'), 'utf8');
  assert.doesNotMatch(
    html,
    /\{\{|\{%|\{#/,
    'la pagina contiene sintassi di template non risolta',
  );
});

test('il link alla mappa porta a Turania (RI) e si apre in un nuovo contesto sicuro', () => {
  const document = loadSite();
  const link = [...document.querySelectorAll('a[href]')].find((anchor) =>
    anchor.getAttribute('href').includes('google.com/maps'),
  );

  assert.ok(link, 'manca il link fuori sede alla mappa');

  const url = new URL(link.getAttribute('href'));
  assert.equal(
    decodeURIComponent(url.searchParams.get('query') ?? ''),
    'Turania (RI)',
    'la ricerca sulla mappa non punta a Turania (RI)',
  );

  // The destination is the place; the link text need not repeat it, because
  // the place is stated once under DOVE.
  assert.match(
    normalize(link.textContent),
    /mappa/i,
    'il link non dice che apre la mappa',
  );
  assert.equal(link.getAttribute('target'), '_blank');

  const rel = (link.getAttribute('rel') ?? '').split(/\s+/);
  assert.ok(rel.includes('noopener'), 'il link alla mappa non ha rel="noopener"');
  assert.ok(rel.includes('noreferrer'), 'il link alla mappa non ha rel="noreferrer"');
});

test('la Locandina si scarica da un solo link nella banda che chiude la pagina', () => {
  const document = loadSite();
  const band = document.querySelector('footer.band');
  assert.ok(band, 'manca la banda bordeaux che chiude la pagina');

  const downloads = [...document.querySelectorAll('a[download]')];
  assert.equal(
    downloads.length,
    1,
    'la pagina deve offrire un solo link per scaricare la Locandina',
  );

  const link = downloads[0];
  assert.ok(
    band.contains(link),
    'il link della Locandina non è dentro la banda che chiude la pagina',
  );

  const name = accessibleName(document, link);
  assert.match(
    name,
    /Scarica la Locandina/i,
    'il link non dice che scarica la Locandina',
  );

  assert.notEqual(
    link.getAttribute('download'),
    null,
    'il link della Locandina non ha l’attributo download',
  );
  const href = link.getAttribute('href');
  assert.ok(href, 'il link della Locandina non ha un href');

  const { file, url } = siteFileFor(href);
  const extension = extname(decodeURIComponent(url.pathname)).toLowerCase();
  const expectedType = IMAGE_TYPE_BY_EXTENSION.get(extension);
  assert.ok(expectedType, `il download non è un’immagine web: ${extension}`);
  assert.equal(
    link.getAttribute('type'),
    expectedType,
    'il tipo dichiarato dal link non corrisponde all’estensione del file',
  );

  const bytes = readFileSync(file);
  assert.ok(bytes.length > 0, 'il file scaricabile è vuoto');

  const image = jpegFrame(bytes);
  assert.ok(
    image.width >= 800 && image.height >= 800,
    `il download è troppo piccolo per essere leggibile: ${image.width}×${image.height}`,
  );
  assert.notEqual(
    image.components,
    4,
    'il download è un’immagine CMYK, non una copia RGB per il web',
  );

  /*
   * The label duplicated the link and hid one copy by composition. The spread
   * has one anchor in a band present at every width, so no rule that styles
   * the band or its actions may hide them. A utility that hides something
   * else on the page is not this contract's business.
   */
  const css = stripCssComments(servedStylesheet());
  const bandSelectors =
    /(?:\.band\b|\.band__|\.facts\b|\.map-link\b|\.locandina-download\b|\.action\b|\.action__|a\[download\])/;
  const hiding = /\b(?:display\s*:\s*none|visibility\s*:\s*hidden)\b/;
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!bandSelectors.test(selector)) {
      continue;
    }
    assert.doesNotMatch(
      body,
      hiding,
      `il foglio di stile nasconde la banda o le sue azioni: ${normalize(selector)}`,
    );
  }
});

test('il sito non distribuisce PDF, file CMYK o master di stampa', () => {
  const files = shippedFiles();

  for (const name of files) {
    const base = name.split('/').pop().toLowerCase();
    assert.ok(!base.endsWith('.pdf'), `il sito contiene un PDF: ${name}`);
    assert.ok(!base.includes('cmyk'), `il sito contiene un file CMYK: ${name}`);
    assert.ok(
      !/(svino_a3|print[-_]?ready|(?:^|[-_.])master(?:[-_.]|$))/.test(base),
      `il sito contiene un master di stampa: ${name}`,
    );
  }
});

test('il titolo del documento e i link sono leggibili', () => {
  const document = loadSite();

  const title = normalize(document.title);
  assert.ok(title.includes('sVino'), 'il titolo non nomina sVino');
  assert.ok(title.includes('Turania (RI)'), 'il titolo non nomina il luogo');

  for (const link of document.querySelectorAll('a[href]')) {
    const name = accessibleName(document, link);
    assert.ok(
      name.length > 0,
      `un link senza testo discernibile punta a ${link.getAttribute('href')}`,
    );
  }
});

test('la pagina ha titolo, descrizione e indirizzo canonico in italiano', () => {
  const document = loadSite();
  const facts = ['sVino', 'II EDIZIONE', '6 dicembre 2026', 'Turania (RI)'];

  const title = normalize(document.title);
  for (const fact of facts) {
    assert.ok(title.includes(fact), `il titolo non nomina "${fact}"`);
  }

  const description = metaContent(document, 'name', 'description');
  for (const fact of facts) {
    assert.ok(
      description.includes(fact),
      `la descrizione non nomina "${fact}"`,
    );
  }

  const canonical = document.querySelector('link[rel="canonical"]');
  assert.ok(canonical, 'manca il link canonico');
  assert.equal(canonical.getAttribute('href'), `${SITE_ORIGIN}/`);
});

test('la pagina fornisce anteprime Open Graph e Twitter con l’immagine quadrata', () => {
  const document = loadSite();
  const title = normalize(document.title);
  const description = metaContent(document, 'name', 'description');
  const canonical = document
    .querySelector('link[rel="canonical"]')
    .getAttribute('href');

  assert.equal(metaContent(document, 'property', 'og:type'), 'website');
  assert.equal(metaContent(document, 'property', 'og:site_name'), 'sVino');
  assert.equal(metaContent(document, 'property', 'og:title'), title);
  assert.equal(
    metaContent(document, 'property', 'og:description'),
    description,
  );
  assert.equal(metaContent(document, 'property', 'og:url'), canonical);
  assert.equal(metaContent(document, 'property', 'og:locale'), 'it_IT');

  const image = metaContent(document, 'property', 'og:image');
  const imageUrl = new URL(image);
  assert.equal(
    imageUrl.origin,
    SITE_ORIGIN,
    'l’immagine di anteprima non è servita dallo stesso sito',
  );
  assert.equal(imageUrl.protocol, 'https:');
  assert.equal(imageUrl.search, '');
  assert.equal(imageUrl.hash, '');

  const imageFile = join(SITE, decodeURIComponent(imageUrl.pathname));
  assert.ok(
    existsSync(imageFile),
    `l’immagine di anteprima non esiste nel sito: ${imageUrl.pathname}`,
  );
  assert.deepEqual(
    jpegSize(imageFile),
    { width: 1080, height: 1080 },
    'l’anteprima non è quadrata 1080×1080',
  );

  assert.equal(metaContent(document, 'property', 'og:image:type'), 'image/jpeg');
  assert.equal(metaContent(document, 'property', 'og:image:width'), '1080');
  assert.equal(metaContent(document, 'property', 'og:image:height'), '1080');
  const imageAlt = metaContent(document, 'property', 'og:image:alt');
  assert.match(imageAlt, /sVino/);
  assert.match(imageAlt, /Turania \(RI\)/);

  assert.equal(
    metaContent(document, 'name', 'twitter:card'),
    'summary',
  );
  assert.equal(metaContent(document, 'name', 'twitter:title'), title);
  assert.equal(
    metaContent(document, 'name', 'twitter:description'),
    description,
  );
  assert.equal(metaContent(document, 'name', 'twitter:image'), image);
});

test('la pagina dichiara un’icona, un’icona touch e il colore del tema della palette', () => {
  const document = loadSite();

  const icon = document.querySelector('link[rel="icon"]');
  assert.ok(icon, 'manca il link rel="icon"');
  assert.equal(
    icon.getAttribute('type'),
    'image/svg+xml',
    'l’icona dichiarata non è un SVG',
  );
  const iconUrl = sameOriginUrl(icon.getAttribute('href'));
  assert.match(iconUrl.pathname, /\.svg$/i, 'l’icona non è un file SVG');

  const touch = document.querySelector('link[rel="apple-touch-icon"]');
  assert.ok(touch, 'manca il link rel="apple-touch-icon"');
  const touchUrl = sameOriginUrl(touch.getAttribute('href'));
  assert.match(touchUrl.pathname, /\.png$/i, 'l’icona touch non è un PNG');

  const theme = document.querySelector('meta[name="theme-color"]');
  assert.ok(theme, 'manca il meta theme-color');
  assert.equal(
    normalize(theme.getAttribute('content') ?? '').toLowerCase(),
    paletteToken('bordeaux'),
    'il colore del tema non è il bordeaux della palette',
  );
});

test('le due icone esistono nel sito e sono l’unico patrimonio iconografico', () => {
  const document = loadSite();

  for (const rel of ['icon', 'apple-touch-icon']) {
    const link = document.querySelector(`link[rel="${rel}"]`);
    assert.ok(link, `manca il link rel="${rel}"`);
    siteFileFor(link.getAttribute('href'));
  }

  const icons = shippedFiles()
    .filter((file) => file.startsWith('assets/icons/'))
    .sort();
  assert.deepEqual(
    icons,
    ['assets/icons/apple-touch-icon.png', 'assets/icons/favicon.svg'],
    `il sito distribuisce altri file di identità: ${icons.join(', ')}`,
  );
});

test('l’icona vettoriale è la firma in bordeaux su un disco di crema chiara', () => {
  const document = loadSite();
  const href = document.querySelector('link[rel="icon"]').getAttribute('href');
  const { file } = siteFileFor(href);
  const svg = readFileSync(file, 'utf8');

  const viewBox = svg.match(/<svg\b[^>]*\bviewBox="([^"]+)"/);
  assert.ok(viewBox, 'l’icona SVG non ha un viewBox');
  const [x, y, width, height] = viewBox[1].trim().split(/\s+/).map(Number);
  assert.equal(width, height, 'il viewBox dell’icona non è quadrato');
  const radius = width / 2;
  const centre = { x: x + radius, y: y + radius };

  const signaturePath = document.querySelector('h1 svg[role="img"] path[d]');
  assert.ok(
    signaturePath,
    'la firma inline non contiene il tracciato vettoriale',
  );
  const outline = svg.match(/<path\b[^>]*\bd="([^"]+)"/);
  assert.ok(outline, 'l’icona SVG non contiene il tracciato della firma');
  // The icon crops the inline path but must not redraw or reflow it: the
  // two path data strings stay identical, so they cannot drift silently.
  assert.equal(
    normalize(outline[1]),
    normalize(signaturePath.getAttribute('d')),
    'il tracciato dell’icona non è esattamente quello della firma inline',
  );
  assert.doesNotMatch(
    svg,
    /<text\b/i,
    'l’icona contiene il lockup testuale invece del solo marchio',
  );

  const ground = paletteToken('cream-light');
  const mark = paletteToken('bordeaux');

  const circles = svgCircles(svg);
  const disc = circles.find((circle) => circle.fill === ground);
  assert.ok(disc, 'l’icona non ha un disco di crema chiara come fondo');
  assert.ok(
    Math.abs(disc.cx - centre.x) < 1e-6 && Math.abs(disc.cy - centre.y) < 1e-6,
    'il disco non è centrato nel viewBox',
  );
  assert.ok(
    Math.abs(disc.r - radius) < 1e-6,
    'il disco non riempie il viewBox: l’icona non è circolare',
  );

  const ring = circles.find((circle) => circle.stroke === mark);
  assert.ok(ring, 'manca l’anello bordeaux che stacca il disco dai tab chiari');
  assert.equal(ring.fill, 'none', 'l’anello non è solo un contorno');
  assert.ok(ring.r > 0 && ring.strokeWidth > 0, 'l’anello non ha spessore');
  assert.ok(
    ring.r + ring.strokeWidth / 2 <= radius + 1e-6,
    'l’anello esce dal viewBox e viene tagliato',
  );

  const markFill = svg.match(/<path\b[^>]*\bfill="([^"]+)"/i);
  assert.equal(
    markFill?.[1]?.toLowerCase(),
    mark,
    'il marchio dell’icona non è in bordeaux',
  );
});

test('l’icona touch è un PNG 180×180 RGB sul fondo di crema chiara', () => {
  const document = loadSite();
  const href = document
    .querySelector('link[rel="apple-touch-icon"]')
    .getAttribute('href');
  const { file } = siteFileFor(href);
  const bytes = readFileSync(file);

  const frame = pngFrame(bytes);
  assert.equal(frame.width, 180, 'l’icona touch non è larga 180 px');
  assert.equal(frame.height, 180, 'l’icona touch non è alta 180 px');
  assert.equal(frame.bitDepth, 8, 'l’icona touch non è un PNG a 8 bit');
  assert.equal(
    frame.colorType,
    2,
    'l’icona touch ha un canale alfa: iOS comporrebbe gli angoli sul nero',
  );
  assert.deepEqual(
    pngTopLeftPixel(bytes),
    rgb(paletteToken('cream-light')),
    'l’angolo dell’icona touch non è di crema chiara',
  );
});

test('le icone restano nella testata e non diventano immagini del corpo', () => {
  const document = loadSite();
  const sources = [
    ...document.querySelectorAll(
      'body img[src], body source[srcset], body object[data], body embed[src]',
    ),
  ].map(
    (element) =>
      element.getAttribute('src') ??
      element.getAttribute('srcset') ??
      element.getAttribute('data') ??
      '',
  );

  assert.deepEqual(
    sources.filter((source) => /assets\/icons\//.test(source)),
    [],
    'un’icona è usata come immagine nel corpo della pagina',
  );
});

test('la pagina è indicizzabile e dichiarata in italiano', () => {
  const document = loadSite();

  assert.equal(document.documentElement.getAttribute('lang'), 'it');

  const html = readFileSync(join(SITE, 'index.html'), 'utf8');
  assert.doesNotMatch(
    html,
    /noindex|nofollow|noarchive/i,
    'la pagina chiede ai motori di ricerca di non indicizzarla',
  );

  for (const meta of document.querySelectorAll(
    'meta[name="robots"], meta[name="googlebot"]',
  )) {
    assert.doesNotMatch(
      meta.getAttribute('content') ?? '',
      /noindex|none/i,
      'un meta robots blocca l’indicizzazione',
    );
  }
});

test('la pagina si legge dalla firma e chiude sulla banda', () => {
  const document = loadSite();
  const text = normalize(document.body.textContent);
  // Brand first: the signature, then its subtitle, the date, the prose, and one
  // closing band in the order facts, map, download, colophon. There is one
  // download in the page, so the old desktop-before-phone order cannot hold.
  const order = [
    'sVino',
    'Per le cantine di Turania',
    'DICEMBRE 2026',
    'DALLE ORE',
    'Per la seconda edizione',
    'DOVE',
    'A CURA DI',
    'mappa',
    'Scarica la Locandina',
    'sVino — II EDIZIONE',
  ];

  let previous = -1;
  for (const token of order) {
    const index = text.indexOf(token);
    assert.ok(index >= 0, `manca "${token}"`);
    assert.ok(index > previous, `"${token}" è fuori ordine`);
    previous = index;
  }
});

test('la pagina è la carta: nessun pannello, nessuna ombra, nessun foglio', () => {
  const document = loadSite();
  const css = stripCssComments(servedStylesheet());

  assert.ok(
    !document.querySelector('.sheet'),
    'la pagina contiene ancora il pannello .sheet',
  );
  assert.ok(
    !document.querySelector('.page'),
    'la pagina contiene ancora il contenitore .page',
  );
  assert.doesNotMatch(css, /\.sheet\b/, 'il foglio di stile conserva .sheet');
  assert.doesNotMatch(css, /\.page\b/, 'il foglio di stile conserva .page');
  assert.doesNotMatch(
    css,
    /box-shadow/i,
    'la pagina usa un’ombra: un pannello flottante è ancora presente',
  );
  assert.match(
    css,
    /body\s*\{[^}]*background:\s*var\(--surface\)/s,
    'la superficie del corpo non è la carta di crema',
  );
});

test('il foglio di stile isola i token e dichiara l’ordine dei layer', () => {
  const css = servedStylesheet();
  const clean = stripCssComments(css);

  assert.match(
    clean,
    /@layer\s+tokens\s*,\s*base\s*,\s*layout\s*,\s*components\s*,\s*motion\s*;/,
    'l’ordine dei layer non è dichiarato',
  );

  const tokens = layerBlock(css, 'tokens');
  for (const primitive of [
    'bordeaux',
    'cream',
    'cream-light',
    'gold',
    'gold-light',
    'bronze',
  ]) {
    assert.match(
      tokens,
      new RegExp(`--${primitive}\\s*:\\s*#[0-9a-fA-F]{6}\\s*;`),
      `manca la primitiva --${primitive}`,
    );
  }

  for (const role of [
    'surface',
    'ink',
    'ink-muted',
    'rule',
    'link',
    'strong',
    'strong-ink',
    'strong-ink-muted',
    'strong-rule',
  ]) {
    assert.match(
      tokens,
      new RegExp(`--${role}\\s*:\\s*var\\(--[a-z-]+\\)\\s*;`),
      `manca il ruolo semantico --${role}`,
    );
  }

  // The strong surface has one vocabulary, and none of it is named after the
  // closing band that first reads it.
  assert.doesNotMatch(
    tokens,
    /--band(?:-[a-z-]+)?\s*:/,
    'la palette conserva ruoli intitolati alla banda che chiude la pagina',
  );

  const typeSteps = ['--step--1', '--step-0', '--step-1', '--step-2'];
  for (const step of typeSteps) {
    const value = tokens.match(new RegExp(`${step}\\s*:\\s*([^;]+);`))?.[1] ?? '';
    assert.match(value, /clamp\(/, `la scala tipografica ${step} non è fluida`);
  }

  for (const token of ['ink', 'rule', 'date', 'quick', 'settle', 'scroll']) {
    assert.match(
      tokens,
      new RegExp(`--motion-${token}\\s*:\\s*[^;]+;`),
      `manca il token --motion-${token}`,
    );
  }

  // No raw hex outside the primitive block: the semantic layer is the only
  // channel a component may read colour through.
  const outside = clean.replace(tokens, '');
  assert.doesNotMatch(
    outside,
    /#[0-9a-fA-F]{3,8}\b/,
    'una regola fuori dal blocco delle primitive usa un colore esadecimale',
  );
});

test('la testata apre la pagina: firma grande a sinistra e sottotitolo sotto', () => {
  const document = loadSite();
  const spread = document.querySelector('main.spread');
  assert.ok(spread, 'manca la griglia della pagina');

  const header = spread.firstElementChild;
  assert.equal(header?.tagName, 'HEADER', 'la testata non apre la pagina');
  assert.equal(
    header.getAttribute('class'),
    'masthead',
    'il primo blocco della pagina non è la testata',
  );

  const h1 = header.querySelector('h1');
  assert.ok(h1, 'manca il titolo principale nella testata');
  const signature = h1.querySelector('svg.signature[role="img"]');
  assert.ok(signature, 'la firma non è nella testata');
  const subtitle = header.querySelector('.subtitle');
  assert.ok(subtitle, 'manca il sottotitolo sotto la firma');

  const elements = [...document.querySelectorAll('*')];
  assert.ok(
    elements.indexOf(signature) < elements.indexOf(subtitle),
    'il sottotitolo non segue la firma',
  );

  const date = document.querySelector('section.date');
  assert.ok(date, 'manca la data');
  assert.ok(
    elements.indexOf(header) < elements.indexOf(date),
    'la data non segue la testata',
  );
});

test('sul telefono la firma occupa la larghezza della misura e a 48 rem torna alla sua dimensione', () => {
  const css = stripCssComments(servedStylesheet());

  const lockup = css.match(/\.lockup\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(lockup, 'manca la regola del titolo della testata');
  assert.match(
    lockup,
    /(?:^|;)\s*(?:inline-size|width)\s*:\s*100%/,
    'sul telefono il titolo della testata non dà alla firma la larghezza della misura',
  );

  const signature = css.match(/\.signature\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(signature, 'manca la regola della firma');
  assert.match(
    signature,
    /(?:^|;)\s*(?:inline-size|width)\s*:\s*100%/,
    'sul telefono la firma non occupa la larghezza della misura',
  );

  const wide = wideSpread(css);
  const wideSignature = wide.match(/\.signature\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(
    wideSignature,
    'a 48 rem la firma non torna alla dimensione dello spread',
  );
  assert.match(
    wideSignature,
    /(?:^|;)\s*(?:inline-size|width)\s*:\s*var\(--signature-size\)/,
    'a 48 rem la firma non torna alla dimensione --signature-size',
  );
});

test('sul telefono i due fatti stanno su due colonne e ognuno va a capo dentro la sua', () => {
  const css = stripCssComments(servedStylesheet());

  const facts = css.match(/\.facts\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(facts, 'manca la regola dei fatti');
  assert.match(
    facts,
    /(?:^|;)\s*display\s*:\s*grid/,
    'sul telefono i fatti non sono una lista composta',
  );
  assert.match(
    facts,
    /(?:^|;)\s*grid-template-columns\s*:\s*repeat\(\s*2\s*,\s*minmax\(\s*0\s*,\s*1fr\s*\)\s*\)/,
    'sul telefono i due fatti non stanno su due colonne',
  );

  const fact = css.match(/\.fact\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.match(
    fact,
    /(?:^|;)\s*min-inline-size\s*:\s*0/,
    'un fatto non può restringersi e andare a capo dentro la sua colonna',
  );

  const wide = wideSpread(css);
  const wideFacts = wide.match(/\.facts\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(wideFacts, 'a 48 rem i fatti non tornano allo spread');
  assert.match(
    wideFacts,
    /(?:^|;)\s*display\s*:\s*flex/,
    'a 48 rem i fatti non tornano in linea',
  );
  assert.match(
    wideFacts,
    /(?:^|;)\s*flex-wrap\s*:\s*wrap/,
    'a 48 rem i fatti non possono andare a capo',
  );
  assert.match(
    wideFacts,
    /(?:^|;)\s*gap\s*:\s*var\(--space-6\)\s+var\(--space-8\)/,
    'a 48 rem i fatti non conservano la distanza dello spread',
  );
});

test('sul telefono le due azioni stanno una sopra l’altra a tutta riga, con la riga che attraversa il fondo', () => {
  const css = stripCssComments(servedStylesheet());

  const inner = css.match(/\.band__inner\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(inner, 'manca la regola interna della banda');
  assert.match(
    inner,
    /(?:^|;)\s*display\s*:\s*grid/,
    'sul telefono la banda non impila i fatti e le azioni in una colonna',
  );

  const actions = css.match(/\.band__actions\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(actions, 'manca la regola delle azioni');
  assert.match(
    actions,
    /(?:^|;)\s*(?:display\s*:\s*grid|flex-direction\s*:\s*column)/,
    'sul telefono le due azioni non stanno una sopra l’altra a tutta riga',
  );

  const action =
    css.match(/\.band__actions\s*>\s*p\s*>\s*a\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(action, 'sul telefono un’azione non dichiara la larghezza della riga');
  assert.match(
    action,
    /(?:^|;)\s*inline-size\s*:\s*100%/,
    'sul telefono un’azione non occupa la riga: la sua riga non la attraversa',
  );

  const label = css.match(/\.map-link,\s*\.locandina-download\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.match(
    label,
    /(?:^|;)\s*font-size\s*:\s*var\(--step-0\)/,
    'sul telefono l’etichetta della Locandina è rimpicciolita',
  );

  const ruleLine = css.match(/\.band__actions\s+a::before\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.match(
    ruleLine,
    /(?:^|;)\s*inset-inline\s*:\s*0/,
    'la riga dell’azione non attraversa la riga della banda',
  );

  const wide = wideSpread(css);
  const wideInner = wide.match(/\.band__inner\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(wideInner, 'a 48 rem la banda non torna allo spread');
  assert.match(
    wideInner,
    /(?:^|;)\s*display\s*:\s*flex/,
    'a 48 rem la banda non torna in linea',
  );
  assert.match(
    wideInner,
    /(?:^|;)\s*justify-content\s*:\s*space-between/,
    'a 48 rem i fatti e le azioni non tornano ai due lati della banda',
  );
  assert.match(
    wideInner,
    /(?:^|;)\s*gap\s*:\s*var\(--space-4\)\s+var\(--space-8\)/,
    'a 48 rem la banda non conserva la distanza dello spread',
  );

  const wideActions = wide.match(/\.band__actions\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(wideActions, 'a 48 rem le azioni non tornano allo spread');
  assert.match(
    wideActions,
    /(?:^|;)\s*display\s*:\s*flex/,
    'a 48 rem le due azioni non tornano in linea',
  );
  assert.match(
    wideActions,
    /(?:^|;)\s*gap\s*:\s*var\(--space-3\)\s+var\(--space-5\)/,
    'a 48 rem le azioni non conservano la distanza dello spread',
  );

  const wideAction =
    wide.match(/\.band__actions\s*>\s*p\s*>\s*a\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.match(
    wideAction,
    /(?:^|;)\s*inline-size\s*:\s*auto/,
    'a 48 rem un’azione non torna alla larghezza del suo testo',
  );
});

test('sul telefono la fotografia si avvicina alla data e a 48 rem torna la distanza dello spread', () => {
  const css = stripCssComments(servedStylesheet());

  const band = css.match(/\.photo-band\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(band, 'manca la regola della banda della fotografia');
  const phone = band
    .match(/(?:^|;)\s*margin-block-start\s*:\s*([^;]+);/)?.[1]
    ?.trim();
  assert.ok(phone, 'sul telefono la fotografia non dichiara il margine superiore');

  const rem = phone.match(/^([\d.]+)rem$/);
  assert.ok(rem, `il margine superiore della fotografia non è in rem: ${phone}`);
  const value = Number(rem[1]);
  assert.ok(
    Math.abs(value - 2.5) <= 0.5,
    `sul telefono la fotografia è a ${value} rem dalla data, non circa 2.5`,
  );

  const tokens = layerBlock(css, 'tokens');
  const photoSpace = tokens.match(/--photo-space\s*:\s*clamp\(\s*([\d.]+)rem/)?.[1];
  assert.ok(photoSpace, 'manca il valore desktop --photo-space');
  assert.ok(
    value < Number(photoSpace),
    `sul telefono la fotografia (${value} rem) non si avvicina alla data più dello spread (${photoSpace} rem)`,
  );

  const wide = wideSpread(css);
  const wideBand = wide.match(/\.photo-band\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(wideBand, 'a 48 rem la fotografia non torna allo spread');
  assert.match(
    wideBand,
    /(?:^|;)\s*margin-block-start\s*:\s*var\(--photo-space\)/,
    'a 48 rem la fotografia non torna alla distanza --photo-space',
  );
});

test('una sola banda bordeaux chiude la pagina con fatti, azioni e colophon', () => {
  const document = loadSite();
  const bands = [...document.querySelectorAll('.band')];
  assert.equal(bands.length, 1, 'la pagina non ha una sola banda');

  const band = bands[0];
  assert.equal(band.tagName, 'FOOTER', 'la banda non chiude la pagina');
  const text = normalize(band.textContent);
  for (const fact of [
    'DOVE',
    'A CURA DI',
    'Turania (RI)',
    'Comitato Feste Turania',
  ]) {
    assert.ok(text.includes(fact), `la banda non riporta "${fact}"`);
  }
  assert.ok(
    band.querySelector('a[href*="google.com/maps"]'),
    'la banda non contiene il link alla mappa',
  );
  assert.ok(band.querySelector('a[download]'), 'la banda non contiene il download');
  assert.match(
    normalize(band.querySelector('.colophon')?.textContent ?? ''),
    /sVino — II EDIZIONE/,
    'la banda non chiude con il colophon',
  );

  const css = stripCssComments(servedStylesheet());
  const tokens = layerBlock(css, 'tokens');
  assert.match(
    tokens,
    /--strong:\s*var\(--bordeaux\)\s*;/,
    'la superficie forte non è bordeaux',
  );
  assert.match(
    tokens,
    /--strong-ink:\s*var\(--cream\)\s*;/,
    'il testo della superficie forte non è crema',
  );
  assert.match(
    tokens,
    /--strong-ink-muted:\s*var\(--gold-light\)\s*;/,
    'il testo secondario della superficie forte non è oro chiaro',
  );
  assert.match(
    tokens,
    /--strong-rule:\s*var\(--gold-light\)\s*;/,
    'la riga della superficie forte non è oro chiaro',
  );
  assert.equal(
    (css.match(/background(?:-color)?:\s*var\(--strong\)/g) ?? []).length,
    1,
    'la superficie forte non appare una volta sola: la data non è ancora una seconda superficie',
  );
  assert.match(
    css,
    /\.band\s*\{[^}]*background:\s*var\(--strong\)/s,
    'la banda non dichiara il fondo della superficie forte',
  );
  assert.match(
    css,
    /\.band\s*\{[^}]*color:\s*var\(--strong-ink\)/s,
    'la banda non dichiara il testo della superficie forte',
  );
  // The band reads the strong-surface vocabulary, never a raw colour and
  // never a role named after itself.
  assert.doesNotMatch(
    css,
    /var\(--band(?:-[a-z-]+)?\)/,
    'un componente legge ancora un ruolo intitolato alla banda',
  );
  assert.doesNotMatch(
    css,
    /prefers-color-scheme/,
    'il foglio di stile introduce una seconda presentazione',
  );

  // Text on bordeaux is measured, not assumed: both tones clear AA on the
  // strong surface.
  assert.ok(
    contrastRatio(paletteToken('cream'), paletteToken('bordeaux')) >= 4.5,
    'il crema sulla superficie forte non raggiunge il rapporto 4.5:1',
  );
  assert.ok(
    contrastRatio(paletteToken('gold-light'), paletteToken('bordeaux')) >= 4.5,
    'l’oro chiaro sulla superficie forte non raggiunge il rapporto 4.5:1',
  );
});

test('il contrasto della superficie forte è misurato e annotato accanto alla palette', () => {
  const css = servedStylesheet();
  const blocks = atRuleBlocks(css, '@layer\\s+tokens\\s*\\{');
  assert.equal(blocks.length, 1, 'manca il layer dei token');
  const tokens = css.slice(blocks[0].start, blocks[0].end + 1);

  // The note is part of the palette block, not a stray comment elsewhere.
  const note = tokens.match(/\/\*[\s\S]*?\*\//)?.[0] ?? '';
  assert.ok(note, 'la palette non annota il contrasto misurato');
  assert.ok(
    tokens.indexOf(note) < tokens.indexOf('--bordeaux'),
    'il contrasto non è annotato accanto alle primitive',
  );

  // The note describes the surface as a whole, not the band that first
  // consumed it: the date joins the same vocabulary.
  assert.match(
    note,
    /strong surface/i,
    'la nota non descrive la superficie forte',
  );
  assert.doesNotMatch(
    note,
    /bordeaux band/i,
    'la nota descrive ancora la banda invece della superficie forte',
  );

  // The numbers come from the served primitives, not from memory: each one is
  // recomputed here with WCAG 2.1 relative luminance and must also be written
  // in the note next to its token. The strong surface's base is the bordeaux
  // primitive, and cream carries its body text.
  const bordeaux = paletteToken('bordeaux');
  for (const [token, expected] of [
    ['cream', '9.94'],
    ['cream-light', '10.61'],
    ['gold-light', '5.75'],
    ['gold', '3.78'],
    ['bronze', '2.09'],
  ]) {
    const measured = contrastRatio(paletteToken(token), bordeaux).toFixed(2);
    assert.equal(
      measured,
      expected,
      `il contrasto misurato di --${token} sulla superficie forte è ${measured}:1, non ${expected}:1`,
    );
    assert.match(
      note,
      new RegExp(`--${token}\\s[^\\n]*${expected}:1`),
      `la nota della palette non registra --${token} a ${expected}:1 sulla superficie forte`,
    );
  }

  assert.match(
    note,
    /bronze[^\n]*(?:mai|non|never)[^\n]*testo|bronze[^\n]*2\.09:1[^\n]*(?:mai|non|never)/i,
    'la nota non avverte che il bronzo non regge il testo sulla superficie forte',
  );

  const cream = Number(
    note.match(/--cream\s[^\n]*?(\d+\.\d+):1/)?.[1] ?? NaN,
  );
  assert.ok(
    cream >= 4.5,
    `il crema sulla superficie forte è annotato a ${cream}:1, sotto il minimo di 4.5:1`,
  );
});

test('la mappa e la Locandina sono azioni tipografiche con riga e freccia, non bottoni', () => {
  const document = loadSite();
  const band = document.querySelector('footer.band');
  assert.ok(band, 'manca la banda che chiude la pagina');
  const actions = [...band.querySelectorAll('.band__actions a')];
  assert.equal(actions.length, 2, 'la banda non ha le due azioni');

  const css = stripCssComments(servedStylesheet());
  const actionRule = css.match(/\.band__actions\s+a\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(actionRule, 'le azioni della banda non hanno una regola');
  assert.match(
    actionRule,
    /text-decoration\s*:\s*none/,
    'le azioni conservano la sottolineatura invece della riga',
  );
  assert.doesNotMatch(
    actionRule,
    /background(?:-color)?\s*:/,
    'un’azione ha un fondo: è un bottone, non una riga',
  );
  assert.doesNotMatch(
    actionRule,
    /border-radius\s*:/,
    'un’azione ha un angolo arrotondato da bottone',
  );

  /*
   * The rule is a pseudo-line, not a border, so it can be ruled from the left
   * without moving the link's text or its focus indicator.
   */
  const ruleLine = css.match(/\.band__actions\s+a::before\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(ruleLine, 'le azioni non portano una riga tipografica');
  assert.match(
    ruleLine,
    /(?:block-size|height)\s*:\s*1px/,
    'la riga non ha lo spessore di un pixel',
  );
  assert.match(
    ruleLine,
    /background(?:-color)?\s*:\s*var\(--rule\)/,
    'la riga non usa il colore delle righe',
  );
  assert.match(
    ruleLine,
    /(?:inset-block-end|bottom)\s*:\s*0/,
    'la riga non è appoggiata al piede dell’azione',
  );

  /*
   * The arrow is decoration and it is markup, not CSS content: each action
   * carries exactly one element hidden from assistive tech with the arrow.
   * The name is computed from the markup without what that tech ignores.
   */
  for (const anchor of actions) {
    const hidden = [...anchor.querySelectorAll('[aria-hidden="true"]')];
    assert.equal(
      hidden.length,
      1,
      `l’azione "${normalize(anchor.textContent)}" non ha una sola freccia decorativa`,
    );
    assert.equal(
      normalize(hidden[0].textContent),
      '→',
      'l’elemento nascosto dell’azione non contiene la freccia',
    );

    const spoken = anchor.cloneNode(true);
    for (const node of spoken.querySelectorAll('[aria-hidden="true"]')) {
      node.remove();
    }
    const name = normalize(spoken.textContent);
    assert.ok(name.length > 0, 'l’azione non ha un nome senza la freccia');
    assert.doesNotMatch(
      name,
      /→|&rarr;/i,
      `la freccia è nel nome accessibile di "${name}"`,
    );
  }
});

test('la pagina non carica JavaScript né risorse di terze parti', () => {
  const document = loadSite();

  assert.equal(document.querySelectorAll('script').length, 0);

  for (const element of document.querySelectorAll('*')) {
    for (const attribute of element.getAttributeNames()) {
      assert.ok(
        !attribute.startsWith('on'),
        `attributo JavaScript inline: ${attribute}`,
      );
    }
  }

  for (const element of document.querySelectorAll('[src]')) {
    sameOriginUrl(element.getAttribute('src'));
  }

  for (const element of document.querySelectorAll('[srcset]')) {
    for (const candidate of element.getAttribute('srcset').split(',')) {
      sameOriginUrl(candidate.trim().split(/\s+/)[0]);
    }
  }

  for (const link of document.querySelectorAll('link[href]')) {
    sameOriginUrl(link.getAttribute('href'));
  }

  for (const anchor of document.querySelectorAll('a[href]')) {
    const href = anchor.getAttribute('href');
    const url = new URL(href, `${SITE_ORIGIN}/`);
    if (url.origin === SITE_ORIGIN) {
      continue;
    }
    assert.equal(
      url.origin,
      MAP_ORIGIN,
      `link verso un host non ammesso: ${href}`,
    );
  }

  const files = shippedFiles();
  assert.deepEqual(
    files.filter((file) => file.endsWith('.js')),
    [],
    'il sito contiene file JavaScript',
  );

  for (const file of files.filter((name) => name.endsWith('.css'))) {
    const css = readFileSync(join(SITE, file), 'utf8');
    assert.doesNotMatch(
      css,
      /https?:\/\//i,
      `il CSS ${file} carica una risorsa esterna`,
    );
  }
});

test('la pagina non promette nulla che il comitato non abbia deciso', () => {
  const document = loadSite();
  const text = wholeDocumentText(document);
  const html = readFileSync(join(SITE, 'index.html'), 'utf8');

  for (const phrase of [
    'ingresso',
    'entrata',
    'in via di definizione',
    'da definire',
    'da decidere',
    'lorem ipsum',
    'placeholder',
    'prossimamente',
    'tbd',
    'todo',
    'xxx',
  ]) {
    assert.ok(!text.includes(phrase), `testo non ammesso: "${phrase}"`);
  }

  assert.doesNotMatch(html, /mailto:|tel:/i, 'la pagina espone un contatto');
  assert.doesNotMatch(
    text,
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
    'la pagina contiene un indirizzo email',
  );
  for (const phone of [
    /\+\d{1,3}[\s.\-/]?\(?\d{1,4}\)?[\s.\-/]?\d{3,}/,
    /\b0\d{1,4}[\s.\-/]\d{5,}\b/,
    /\b3\d{2}[\s.\-/]?\d{6,7}\b/,
  ]) {
    assert.doesNotMatch(text, phone, 'la pagina contiene un numero di telefono');
  }
});

test('la fotografia segue la data e precede la prosa nella griglia', () => {
  const document = loadSite();
  const header = document.querySelector('header');
  const picture = document.querySelector('picture');
  const photo = picture?.querySelector('img');
  const date = document.querySelector('section[aria-label="Data e ora"]');
  const prose = document.querySelector('.cantina');
  const spread = document.querySelector('main.spread');

  assert.ok(header, 'manca la testata della pagina');
  assert.ok(picture, 'la fotografia non è servita dentro un elemento picture');
  assert.ok(photo, 'manca la fotografia');
  assert.ok(date, 'manca il blocco della data');
  assert.ok(prose, 'manca la prosa delle Cantine');
  assert.ok(spread, 'manca la griglia della pagina');

  const elements = [...document.querySelectorAll('*')];
  const headerAt = elements.indexOf(header);
  const photoAt = elements.indexOf(photo);
  const dateAt = elements.indexOf(date);
  const proseAt = elements.indexOf(prose);
  assert.ok(headerAt < dateAt, 'la data non segue la testata');
  assert.ok(dateAt < photoAt, 'la fotografia non segue la data');
  assert.ok(photoAt < proseAt, 'la fotografia non precede la prosa');
  assert.ok(
    spread.contains(photo),
    'la fotografia non è dentro la griglia della pagina',
  );

  const alt = normalize(photo.getAttribute('alt') ?? '');
  assert.equal(
    alt,
    PHOTO_ALT,
    'la descrizione della fotografia non è quella approvata',
  );
  assert.ok(
    !/Turania/i.test(alt),
    'la descrizione della fotografia la presenta come un luogo reale',
  );
  assert.equal(photo.getAttribute('width'), '1200');
  assert.equal(photo.getAttribute('height'), '756');

  const webp = picture.querySelector('source[srcset]');
  assert.ok(webp, 'manca la sorgente WebP della fotografia');
  assert.equal(webp.getAttribute('type'), 'image/webp');

  const jpeg = siteFileFor(photo.getAttribute('src'));
  assert.match(jpeg.url.pathname, /\.jpe?g$/i, 'il ripiego non è un JPEG');
  assert.deepEqual(
    jpegSize(jpeg.file),
    { width: 1200, height: 756 },
    'il JPEG della fotografia non è 1200×756',
  );

  const webpSource = webp.getAttribute('srcset').trim().split(/\s+/)[0];
  const webpFile = siteFileFor(webpSource).file;
  const webpBytes = readFileSync(webpFile);
  assert.equal(webpBytes.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(webpBytes.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(webpBytes.length > 0, 'il WebP della fotografia è vuoto');
});

test('la fotografia offre una sorgente di almeno 2048 px e dichiara la misura della griglia', () => {
  const document = loadSite();
  const picture = document.querySelector('picture');
  const photo = picture?.querySelector('img');
  assert.ok(picture, 'la fotografia non è servita dentro un elemento picture');
  assert.ok(photo, 'manca la fotografia');

  const jpegCandidates = parseSrcset(photo.getAttribute('srcset') ?? '');
  const largeJpeg = wideCandidates(photo.getAttribute('srcset') ?? '');
  assert.ok(
    largeJpeg.length > 0,
    'la fotografia non offre un JPEG di almeno 2048 px',
  );

  for (const candidate of largeJpeg) {
    const { file, url } = siteFileFor(candidate.url);
    assert.match(url.pathname, /\.jpe?g$/i, 'la sorgente grande non è un JPEG');
    const frame = jpegFrame(readFileSync(file));
    assert.ok(
      frame.width >= 2048,
      `il JPEG grande dichiara ${candidate.width}w ma misura ${frame.width} px`,
    );
    assert.equal(
      frame.components,
      3,
      'il JPEG grande non è RGB: la fotografia è un’immagine CMYK',
    );
    assert.ok(
      Math.abs(frame.width / frame.height - 1200 / 756) < 0.002,
      'il JPEG grande non mantiene l’inquadratura approvata',
    );
  }

  const webp = picture.querySelector('source[type="image/webp"][srcset]');
  assert.ok(webp, 'manca la sorgente WebP della fotografia');
  const largeWebp = wideCandidates(webp.getAttribute('srcset'));
  assert.ok(
    largeWebp.length > 0,
    'la sorgente WebP non offre un candidato di almeno 2048 px',
  );
  for (const candidate of largeWebp) {
    const bytes = readFileSync(siteFileFor(candidate.url).file);
    assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
    assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
    assert.ok(bytes.length > 0, 'il WebP grande della fotografia è vuoto');
  }

  assert.equal(
    webp.getAttribute('sizes'),
    PHOTO_SIZES,
    'la sorgente non dichiara la misura della griglia',
  );
  assert.equal(
    photo.getAttribute('sizes'),
    PHOTO_SIZES,
    'il ripiego non dichiara la misura della griglia',
  );

  assert.deepEqual(
    jpegSize(siteFileFor(photo.getAttribute('src')).file),
    { width: 1200, height: 756 },
    'il ripiego stretto non è più la copia 1200×756',
  );
  assert.ok(
    jpegCandidates.some((candidate) => candidate.width === 1200),
    'la copia 1200 non è più offerta come candidato stretto',
  );
});

test('il sito non spedisce alcuna immagine di strappo', () => {
  const files = shippedFiles();
  const tearImages = files.filter(
    (file) =>
      /\.(?:png|jpe?g|webp|gif|avif|svg)$/i.test(file) &&
      /(?:tear|fibra|fiber|strappo|edge)/i.test(file.split('/').pop()),
  );

  assert.deepEqual(
    tearImages,
    [],
    `il sito contiene un'immagine di strappo: ${tearImages.join(', ')}`,
  );
});

test('la fotografia tiene la banda 303:191 e un solo strappo misurato sulla banda', () => {
  const css = stripCssComments(servedStylesheet());

  assert.match(
    css,
    /\.photo-frame\s*\{[^}]*aspect-ratio:\s*303\s*\/\s*191/s,
    'la fotografia non tiene la banda 303:191 della stampa',
  );

  /*
   * The print's tear is a fraction of the band's WIDTH. It must be measured
   * against the photograph band itself, not the viewport: the band declares
   * inline-size containment and the teeth are cqw offsets. Without that, the
   * teeth would compress on a phone and swell on a wide screen.
   */
  assert.match(
    css,
    /\.photo-band\s*\{[^}]*container-type:\s*inline-size/s,
    'la banda della fotografia non è un contenitore di larghezza: lo strappo non ha riferimento',
  );

  // Exactly one torn edge on the page, and it is the photograph's lower edge.
  assert.equal(
    [...css.matchAll(/clip-path:\s*polygon\(/g)].length,
    1,
    'la pagina non ha esattamente uno strappo',
  );
  const rule = css.match(
    /\.photo-frame\s*\{[^}]*?clip-path:\s*(polygon\([^;]+\));/s,
  );
  assert.ok(rule, 'lo strappo non è sul bordo della fotografia');
  const polygon = rule[1];

  assert.match(
    polygon,
    /cqw/,
    'lo strappo non è espresso contro la larghezza della banda',
  );
  assert.doesNotMatch(
    polygon,
    /\d(?:vw|vh|vmin|vmax)\b/,
    'lo strappo usa ancora la larghezza del viewport',
  );

  const points = [...polygon.matchAll(/(-?[\d.]+%)\s+(-?[\d.]+%|calc\([^)]+\))/g)].map(
    ([, x, y]) => ({ x, y }),
  );
  assert.ok(points.length > 10, 'lo strappo non è abbastanza fine per una carta');

  assert.equal(points[0].x, '0%', 'lo strappo non parte dall’angolo in alto a sinistra');
  assert.equal(points[0].y, '0%', 'il bordo superiore non è dritto');
  assert.equal(points[1].x, '100%', 'il bordo superiore non arriva a destra');
  assert.equal(points[1].y, '0%', 'il bordo superiore non è dritto');

  // One edge is torn: every point after the two top corners sits on the lower
  // edge, offset from it by a length in cqw — 1% of the band's inline size.
  for (const point of points.slice(2)) {
    assert.match(
      point.y,
      /^calc\(100%\s*-\s*[\d.]+cqw\)$/,
      'un punto dello strappo non è sul bordo inferiore o non è misurato sulla banda',
    );
    assert.ok(
      Number.parseFloat(point.x) >= 0 && Number.parseFloat(point.x) <= 100,
      'lo strappo esce dalla larghezza della banda',
    );
  }
});

test('la fotografia esce dai margini della pagina sul telefono e rientra nella misura da 48 rem', () => {
  const css = stripCssComments(servedStylesheet());
  const layout = layerBlock(css, 'layout');

  /*
   * The page's inline padding is where the gutters live. The bleed is the
   * photograph giving that padding back at both edges — not a viewport-sized
   * band, which would scroll at 320 px.
   */
  assert.match(
    layout,
    /\.spread\s*\{[^}]*padding-inline:\s*var\(--page-pad\)/s,
    'la griglia non dichiara il margine interno da cui la fotografia deve uscire',
  );

  const phoneBand = layout.match(/\.photo-band\s*\{([^}]*)\}/s);
  assert.ok(phoneBand, 'manca la banda della fotografia sul telefono');
  assert.match(
    phoneBand[1],
    /margin-inline:\s*calc\(\s*-1\s*\*\s*var\(--page-pad\)\s*\)/,
    'sotto 48 rem la fotografia non annulla il margine interno della pagina e non arriva ai bordi',
  );
  assert.doesNotMatch(
    phoneBand[1],
    /\d(?:vw|vmin|vmax)\b/,
    'la fotografia si dimensiona con il viewport e può scorrere in orizzontale',
  );

  const wide = atRuleBlocks(css, '@media\\s*\\(min-width:\\s*48rem\\)');
  assert.equal(wide.length, 1, 'manca il blocco della misura da 48 rem');
  const wideBody = css.slice(css.indexOf('{', wide[0].start) + 1, wide[0].end);
  const wideBand = wideBody.match(/\.photo-band\s*\{([^}]*)\}/s);
  assert.ok(wideBand, 'la fotografia non rientra nella misura da 48 rem');
  assert.match(
    wideBand[1],
    /margin-inline:\s*0\s*;/,
    'da 48 rem la fotografia non torna dentro i margini della pagina',
  );
});

test('la fotografia decodifica in asincrono, ha alta priorità e non è precaricata', () => {
  const document = loadSite();
  const photo = document.querySelector('picture img');
  assert.ok(photo, 'manca la fotografia');

  assert.equal(
    photo.getAttribute('decoding'),
    'async',
    'la fotografia non decodifica in asincrono',
  );
  assert.equal(
    photo.getAttribute('fetchpriority'),
    'high',
    'la fotografia non ha alta priorità di caricamento',
  );

  const preloads = [...document.querySelectorAll('link[rel~="preload"]')].filter(
    (link) =>
      link.getAttribute('as') === 'image' ||
      /svino-cantina/.test(link.getAttribute('href') ?? ''),
  );
  assert.deepEqual(
    preloads.map((link) => link.getAttribute('href')),
    [],
    'la fotografia è precaricata: il preload duplica il caricamento',
  );
});

test('la testata riporta la firma come tracciato inline con nome accessibile e il lockup come testo', () => {
  const document = loadSite();
  const heading = document.querySelector('h1');
  assert.ok(heading, 'manca il titolo principale');

  const signature = heading.querySelector('svg[role="img"]');
  assert.ok(signature, 'la firma non è un SVG inline con role="img"');

  const name = accessibleName(document, signature);
  assert.match(
    name,
    /sVino/,
    `il nome accessibile della firma non nomina l’evento: "${name}"`,
  );

  const outline = [...signature.querySelectorAll('path[d]')].find(
    (path) => normalize(path.getAttribute('d') ?? '') !== '',
  );
  assert.ok(
    outline,
    'lo SVG della firma non contiene un tracciato vettoriale inline',
  );

  const lockup = [...signature.querySelectorAll('text')]
    .map((node) => normalize(node.textContent))
    .find((value) => value === 'II EDIZIONE');
  assert.ok(lockup, 'il lockup II EDIZIONE non è testo dentro lo SVG');

  for (const element of document.querySelectorAll(
    'img[src], object[data], embed[src]',
  )) {
    const source =
      element.getAttribute('src') ?? element.getAttribute('data') ?? '';
    assert.doesNotMatch(
      source,
      /signature/i,
      `la firma è distribuita come risorsa invece che inline: ${source}`,
    );
  }
});

test('il sito non distribuisce il font Breathing e non richiede font esterni', () => {
  const files = shippedFiles();

  for (const file of files) {
    assert.doesNotMatch(
      file,
      /breathing/i,
      `il sito contiene il font Breathing: ${file}`,
    );
  }
  assert.deepEqual(
    files.filter((file) => /signature/i.test(file)),
    [],
    'la firma è distribuita come file separato invece che inline',
  );

  const fontFiles = files.filter((file) => /\.(?:woff2?|ttf|otf)$/i.test(file));
  for (const file of fontFiles) {
    assert.match(
      file,
      /(?:^|\/)assets\/fonts\/(?:SVSerif|SVSans)-(?:Regular|Bold)\.woff2$/,
      `il sito contiene un font non ammesso: ${file}`,
    );
  }

  const html = readFileSync(join(SITE, 'index.html'), 'utf8');
  assert.doesNotMatch(
    html,
    /breathing|fonts\.(?:googleapis|gstatic)\.com|@font-face/i,
    'la pagina richiede o nomina un font esterno',
  );
  assert.doesNotMatch(
    html,
    /url\(\s*['"]?https?:\/\//i,
    'la pagina richiede un font da un host esterno',
  );
});

test('i font auto-ospitati sono WOFF2 dello stesso sito', () => {
  const cssPath = join(SITE, 'assets', 'css', 'style.css');
  const css = servedStylesheet();
  const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/gi)].map(
    (match) => match[1],
  );

  assert.ok(faces.length >= 4, 'mancano le facce @font-face dei due font');

  for (const face of faces) {
    const source = face.match(/src\s*:\s*url\(\s*["']?([^"')]+)["']?\s*\)\s*format\(\s*["']woff2["']\s*\)/i);
    assert.ok(
      source,
      `una faccia @font-face non punta a un WOFF2: ${face}`,
    );

    const url = source[1].trim();
    assert.ok(
      !/^(?:[a-z]+:)?\/\//i.test(url),
      `il font è richiesto da un host esterno: ${url}`,
    );
    assert.ok(
      !url.startsWith('/'),
      `il font usa un percorso assoluto invece di uno relativo: ${url}`,
    );

    const asset = resolve(dirname(cssPath), url);
    assert.ok(existsSync(asset), `il file WOFF2 dichiarato manca: ${url}`);
    assert.match(asset, /\.woff2$/i);

    assert.match(face, /font-display\s*:\s*swap/i, `font-display: swap manca in ${url}`);
  }

  for (const name of [
    'SVSerif-Regular',
    'SVSerif-Bold',
    'SVSans-Regular',
    'SVSans-Bold',
  ]) {
    assert.ok(
      existsSync(join(SITE, 'assets', 'fonts', `${name}.woff2`)),
      `manca il font ${name}.woff2 nel sito`,
    );
  }

  assert.doesNotMatch(css, /https?:\/\//i, 'il CSS richiama un host esterno');
});

test('la licenza dei font è la OFL 1.1 completa e nomina i titolari dei diritti', () => {
  const licencePath = join(SITE, 'assets', 'fonts', 'OFL-1.1.txt');
  assert.ok(
    existsSync(licencePath),
    'manca il testo della licenza OFL accanto ai font',
  );

  const licence = readFileSync(licencePath, 'utf8');
  assert.match(
    licence,
    /SIL OPEN FONT LICENSE Version 1\.1/i,
    'il file di licenza non è la SIL OFL 1.1',
  );
  assert.doesNotMatch(
    licence,
    /<[^>\n]+>/,
    'la licenza contiene ancora segnaposto <...>',
  );
  assert.match(
    licence,
    /The Lora Project Authors/,
    'la licenza non nomina il titolare dei diritti di Lora',
  );
  assert.match(
    licence,
    /tyPoland Lukasz Dziedzic/,
    'la licenza non nomina il titolare dei diritti di Lato',
  );
  assert.match(
    licence,
    /Reserved Font Name "Lora"/,
    'la licenza non riporta il nome riservato Lora',
  );
  assert.match(
    licence,
    /Reserved Font Name "Lato"/,
    'la licenza non riporta il nome riservato Lato',
  );
  assert.match(licence, /SV Serif/, 'la licenza non spiega il nome SV Serif');
  assert.match(licence, /SV Sans/, 'la licenza non spiega il nome SV Sans');
});

test('la gerarchia dei titoli segue l’ordine visivo senza saltare livelli', () => {
  const document = loadSite();
  const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')];

  assert.ok(headings.length > 0, 'la pagina non ha titoli');
  assert.equal(
    headings.filter((heading) => heading.tagName === 'H1').length,
    1,
    'la pagina deve avere un solo titolo principale',
  );
  assert.equal(headings[0].tagName, 'H1', 'il primo titolo non è il titolo principale');

  let previous = 0;
  for (const heading of headings) {
    const level = Number(heading.tagName.slice(1));
    assert.ok(
      level <= previous + 1,
      `salto di livello: da h${previous} a h${level} ("${normalize(heading.textContent)}")`,
    );
    previous = level;
  }

  const heading = headings[0];
  const headingName = [
    normalize(heading.textContent),
    normalize(heading.querySelector('svg[role="img"] title')?.textContent ?? ''),
  ].join(' ');
  assert.match(
    headingName,
    /sVino/,
    'il nome del titolo principale non nomina l’evento',
  );
});

test('ogni immagine ha una descrizione testuale non vuota', () => {
  const document = loadSite();
  const images = [...document.querySelectorAll('img')];

  assert.ok(images.length > 0, 'la pagina non contiene immagini');
  for (const image of images) {
    const alt = normalize(image.getAttribute('alt') ?? '');
    assert.ok(
      alt.length > 0,
      `immagine senza descrizione: ${image.getAttribute('src') ?? '(senza src)'}`,
    );
  }
});

test('ogni link ha un nome discernibile e resta raggiungibile da tastiera', () => {
  const document = loadSite();
  const links = [...document.querySelectorAll('a')];

  assert.ok(links.length > 0, 'la pagina non contiene link');
  for (const link of links) {
    const href = link.getAttribute('href');
    assert.ok(href, 'un link non ha href');
    assert.ok(
      accessibleName(document, link).length > 0,
      `link senza nome discernibile: ${href}`,
    );
    assert.notEqual(
      link.getAttribute('tabindex'),
      '-1',
      `un link è escluso dall’ordine di tabulazione: ${href}`,
    );
  }
});

test('il foglio di stile espone un indicatore di focus visibile sui link', () => {
  const css = servedStylesheet();
  const rules = [...css.matchAll(/([^{}]+:focus-visible[^{}]*)\{([^}]*)\}/g)];
  const linkRule = rules.find((rule) =>
    /(?:^|,)\s*a\s*:focus-visible/i.test(rule[1]),
  );

  assert.ok(linkRule, 'manca una regola :focus-visible per i link');

  const outline = linkRule[2].match(/(?:^|;)\s*outline\s*:\s*([^;}]+)/i);
  assert.ok(outline, 'la regola :focus-visible non dichiara un outline');

  const value = outline[1].trim();
  assert.doesNotMatch(
    value,
    /\bnone\b|\b0(?:px)?\b/i,
    `l’indicatore di focus è assente: outline: ${value}`,
  );
  assert.match(value, /\b(?:solid|dashed|dotted|double|auto)\b/i, `stile di outline non visibile: ${value}`);

  const width = value.match(/(\d+(?:\.\d+)?)(px|rem)/i);
  assert.ok(width, `l’outline non dichiara una larghezza: ${value}`);
  const pixels = width[2].toLowerCase() === 'rem'
    ? Number(width[1]) * 16
    : Number(width[1]);
  assert.ok(pixels >= 2, `outline troppo sottile: ${value}`);
});

test('il movimento del spread usa i token, lascia fermo l’eroe e ha una via per chi riduce il movimento', () => {
  const css = servedStylesheet();

  assert.doesNotMatch(
    css,
    /\binfinite\b/i,
    'il movimento non deve ripetersi senza fine',
  );

  const noPreference = atRuleBlocks(
    css,
    '@media\\s*\\(prefers-reduced-motion:\\s*no-preference\\)',
  );
  assert.ok(noPreference.length > 0, 'manca il blocco no-preference');

  const animations = [...css.matchAll(/(?:^|[;{\s])animation\s*:\s*([^;}]+)/g)];
  assert.ok(animations.length > 0, 'manca il movimento d’ingresso');

  for (const animation of animations) {
    assert.ok(
      noPreference.some(
        ({ start, end }) => animation.index > start && animation.index < end,
      ),
      `animazione fuori da no-preference: ${normalize(animation[1])}`,
    );
    assert.match(
      animation[1],
      /var\(--motion-/,
      `l’animazione non usa un token di durata: ${normalize(animation[1])}`,
    );
    assert.doesNotMatch(
      animation[1],
      /(?:^|\s)\d+(?:\.\d+)?m?s(?:\s|$)/,
      `l’animazione contiene una durata magica: ${normalize(animation[1])}`,
    );
  }

  /*
   * Every duration comes from the motion tokens, in the shorthand above, in
   * any duration longhand, and in the base transitions. The reduce block's
   * `transition: none` is the one exception: it is how the page stands still.
   */
  const durations = [
    ...css.matchAll(
      /(?:^|[;{\s])(animation-duration|transition-duration|transition)\s*:\s*([^;}]+)/g,
    ),
  ];
  assert.ok(durations.length > 0, 'manca una transizione da misurare');
  for (const [, property, rawValue] of durations) {
    const value = normalize(rawValue);
    if (property === 'transition' && value === 'none') {
      continue;
    }
    assert.match(
      value,
      /var\(--motion-/,
      `la durata di ${property} non usa un token: ${value}`,
    );
    assert.doesNotMatch(
      value,
      /\d+(?:\.\d+)?m?s\b/,
      `la durata di ${property} è un numero magico: ${value}`,
    );
  }

  const supports = atRuleBlocks(
    css,
    '@supports\\s*\\(animation-timeline:\\s*view\\(\\)\\)',
  );
  assert.ok(supports.length > 0, 'manca il blocco @supports per view()');

  for (const use of css.matchAll(/animation-timeline\s*:\s*view\(\)/g)) {
    assert.ok(
      supports.some(({ start, end }) => use.index > start && use.index < end),
      'animation-timeline: view() è fuori dal blocco @supports',
    );
  }

  /*
   * The spread reveals only the prose and the band as they enter the viewport.
   * The hero — the signature, its lockup and subtitle, and the date — is
   * present on the first screen and never waits for the scroll.
   */
  const reveals = viewTimelines(css);
  assert.ok(reveals.length > 0, 'manca il reveal scroll della prosa e della banda');
  assert.ok(
    reveals.some((selector) => /\.cantina\b/.test(selector)),
    'la prosa non si rivela entrando nel viewport',
  );
  assert.ok(
    reveals.some((selector) => /\.facts\b/.test(selector)),
    'i fatti non si rivelano entrando nel viewport',
  );
  for (const selector of reveals) {
    assert.doesNotMatch(
      selector,
      /(?:\.masthead|\.signature|\.lockup|\.subtitle|\.date)\b/,
      `l’eroe ha un reveal scroll: ${selector}`,
    );
    assert.match(
      selector,
      /\.cantina\b|\.facts\b|\.band__actions\b/,
      `il reveal scroll è fuori dalla prosa e dalla banda: ${selector}`,
    );
    assert.doesNotMatch(
      selector,
      /\.band__inner\b/,
      'la banda intera sfuma: le due azioni non devono stare in un contenitore che sfuma',
    );
  }

  /*
   * Nothing waits for an animation to be usable: the band that holds the two
   * actions never fades as a whole, and focus is immediate.
   */
  const clean = stripCssComments(css);
  assert.doesNotMatch(
    clean,
    /\.band(?:__inner|__actions)?\s*\{[^}]*\banimation\s*:/s,
    'la banda o le sue azioni sfumano: le due azioni devono essere subito visibili',
  );
  for (const [, selector, body] of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (/:focus(?:-visible|-within)?\b/.test(selector)) {
      assert.doesNotMatch(
        body,
        /\b(?:animation|transition)\s*:/,
        `il focus anima: ${normalize(selector)}`,
      );
    }
  }

  /*
   * With motion off, the served page is the finished spread: no element is
   * left invisible or shrunk by the base stylesheet. Only the keyframes and
   * the no-preference blocks may hold an entrance's first frame.
   */
  const keyframes = atRuleBlocks(css, '@keyframes\\s+[\\w-]+\\s*\\{');
  const base = withoutBlocks(css, [...noPreference, ...keyframes]);
  assert.doesNotMatch(
    base,
    /\bopacity\s*:\s*0(?:[;\s}]|$)/,
    'un elemento parte invisibile fuori dal movimento',
  );
  assert.doesNotMatch(
    base,
    /\btransform\s*:[^;]*\bscale[XY]?\(\s*0\s*\)/,
    'un elemento parte rimpicciolito fuori dal movimento',
  );

  const reduce = atRuleBlocks(
    css,
    '@media\\s*\\(prefers-reduced-motion:\\s*reduce\\)',
  );
  assert.deepEqual(reduce.length, 1, 'manca il blocco reduce');
  assert.match(
    css.slice(reduce[0].start, reduce[0].end),
    /transition\s*:\s*none/,
    'il blocco reduce non spegne le transizioni',
  );
});
