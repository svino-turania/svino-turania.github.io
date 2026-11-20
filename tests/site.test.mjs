import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { inflateSync } from 'node:zlib';
import { parseHTML } from 'linkedom';

const ROOT = resolve(import.meta.dirname, '..');

// The single seam: the repository root, as a static server serves it.
const SITE = ROOT;
const SITE_ORIGIN = 'https://svino-turania.github.io';

// Both photographs run edge to edge at every width: they are full-bleed
// sections of the cover, so the browser sizes them against the viewport.
const PHOTO_SIZES = '100vw';
const HERO_SIZES = '100vw';

const CANTINA_PARAGRAPH =
  "Per la seconda edizione si torna nelle cantine del borgo: si assaggia il vino e da una cantina si passa alla successiva. Lungo il percorso ci si ferma a mangiare, si cammina piano. Si parla con chi si incontra, e non si guarda l'orologio. Questa pagina sarà aggiornata con tutte le novità dell'evento. Vi aspettiamo.";

/*
 * The Programma the Comitato confirmed for the second edition: the one act it
 * has announced, and the one paragraph approved for it. The Comitato has set an
 * end time that the page deliberately does not publish, and the date band
 * already carries the start, so the paragraph holds no time and the suite fails
 * if a clock time appears.
 */
const PROGRAMMA_PARAGRAPH =
  "I Menestrelli del Cicolano girano per il borgo con organetto, fisarmonica, chitarra e tamburo. Suonano stornelli e canti popolari in dialetto, e i saltarelli delle feste di paese. Si fermano, suonano, ripartono; chi li ascolta resta lì, e poi la passeggiata prosegue con il bicchiere in mano.";

const PHOTO_ALT =
  "Interno di una cantina scavata nella roccia: soffitto e pareti di pietra grezza, una lampadina nuda appesa a un filo, damigiane di vetro anche dentro cesti di vimini, una botte coricata e un grande tino chiaro con il coperchio; un palo di legno regge la volta.";

const HERO_ALT =
  "Primo piano di un grappolo d'uva nera: acini fitti e tondi, di un viola quasi nero, con riflessi chiari e un rametto verde tra gli acini.";

/*
 * The two profiles the Comitato confirmed in November 2026: the name the
 * anchor exposes, its destination, and the two values the counter records.
 */
const PROFILES = Object.freeze([
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/comitato_feste_turania',
    click: 'apri-instagram',
    title: 'Apri Instagram',
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/comitato.feste.turania',
    click: 'apri-facebook',
    title: 'Apri Facebook',
  },
]);

/*
 * The four photographs in the gallery, in page order. The landscape is the
 * one wide frame; the three portraits follow in one row.
 */
const GALLERY_PHOTOS = Object.freeze([
  {
    src: 'assets/img/svino-cantina-pietro-1195.jpg',
    webp: 'assets/img/svino-cantina-pietro-1195.webp',
    width: 1195,
    height: 896,
    alt: "Due archi di mattoni in una cantina sotterranea: sotto il primo, una botte di legno coricata; oltre il secondo, la parete di tufo e un'apertura illuminata da una luce calda.",
  },
  {
    src: 'assets/img/svino-cantina-vale-896.jpg',
    webp: 'assets/img/svino-cantina-vale-896.webp',
    width: 896,
    height: 1195,
    alt: 'Una cantina scavata nella roccia: in primo piano un torchio a vite con il cestello di doghe, a destra una passerella di tavole con damigiane e cesti, in fondo un arco buio.',
  },
  {
    src: 'assets/img/svino-botte-896.jpg',
    webp: 'assets/img/svino-botte-896.webp',
    width: 896,
    height: 1195,
    alt: 'Una grande botte di legno coricata sotto una volta scavata nella roccia: doghe scure cerchiate di ferro, una lampada accesa sulla parete di tufo.',
  },
  {
    src: 'assets/img/svino-torchio-896.jpg',
    webp: 'assets/img/svino-torchio-896.webp',
    width: 896,
    height: 1195,
    alt: 'Un torchio a vite in legno e ferro: il cestello di doghe cerchiato di ferro, la vite e il volano; dietro, tini di plastica, una bilancia appesa e attrezzi della cantina.',
  },
]);

const IMAGE_TYPE_BY_EXTENSION = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
]);

/*
 * Every image the site ships. The ground adds no image file: its grain is a
 * data URI. This is an exact inventory, like the font allowlist, so a new
 * image fails whatever it is called, not only one named after the grain.
 */
const SHIPPED_IMAGE_FILES = Object.freeze([
  'assets/download/locandina-svino-ii-edizione.jpg',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/favicon.svg',
  'assets/img/svino-botte-896.jpg',
  'assets/img/svino-botte-896.webp',
  'assets/img/svino-cantina-1200.jpg',
  'assets/img/svino-cantina-1200.webp',
  'assets/img/svino-cantina-2048.jpg',
  'assets/img/svino-cantina-2048.webp',
  'assets/img/svino-cantina-pietro-1195.jpg',
  'assets/img/svino-cantina-pietro-1195.webp',
  'assets/img/svino-cantina-vale-896.jpg',
  'assets/img/svino-cantina-vale-896.webp',
  'assets/img/svino-quadrato-og.jpg',
  'assets/img/svino-torchio-896.jpg',
  'assets/img/svino-torchio-896.webp',
  'assets/img/svino-uva-1152.jpg',
  'assets/img/svino-uva-1152.webp',
  'assets/img/svino-uva-1536.jpg',
  'assets/img/svino-uva-1536.webp',
  'assets/img/svino-uva-768.jpg',
  'assets/img/svino-uva-768.webp',
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

/* The body's rule: the cream ground the page is painted on. */
function bodyRule(css = servedStylesheet()) {
  const clean = stripCssComments(css);
  const rule = clean.match(/(?:^|})\s*body\s*\{([^}]*)\}/s);
  assert.ok(rule, 'manca la regola del corpo');
  return rule[1];
}

/* One token's declared value, as the stylesheet ships it. */
function tokenValue(name, css = servedStylesheet()) {
  const tokens = layerBlock(css, 'tokens');
  const match = tokens.match(new RegExp(`--${name}\\s*:\\s*([^;]+);`));
  assert.ok(match, `manca il token --${name}`);
  return match[1].trim();
}

/* The inline SVG behind a data URI token, decoded to the markup a browser reads. */
function inlineSvg(value) {
  const uri = value.match(/^url\("(data:image\/svg\+xml,([^"]+))"\)$/s);
  assert.ok(uri, 'il valore non è un data URI SVG in linea');
  return decodeURIComponent(uri[2]);
}

/*
 * The page has one base composition and one desktop composition at 64 rem.
 * No 48 rem override may return, the 64 rem block is the only min-width
 * threshold, and no max-width override exists at all. The gallery's phone
 * rhythm asks the gallery's own content box instead (see the gallery test),
 * so it adds no viewport breakpoint; the helper is the suite's single
 * statement of that contract.
 */
function assertDesktopComposition(css) {
  assert.equal(
    atRuleBlocks(css, '@media\\s*\\(min-width:\\s*48rem\\)').length,
    0,
    'il foglio di stile conserva un blocco da 48 rem: la pagina ha ancora due soglie',
  );
  assert.equal(
    atRuleBlocks(css, '@media\\s*\\(min-width:\\s*64rem\\)').length,
    1,
    'la pagina non ha una sola composizione desktop a 64 rem',
  );
  assert.equal(
    atRuleBlocks(css, '@media\\s*\\([^)]*max-width').length,
    0,
    'la pagina aggiunge una soglia da viewport stretto: una componente chiede la propria larghezza',
  );
}

/* The body of the one desktop block, for the rules that only exist there. */
function desktopComposition(css) {
  const block = atRuleBlocks(css, '@media\\s*\\(min-width:\\s*64rem\\)')[0];
  assert.ok(block, 'manca la composizione desktop a 64 rem');
  return css.slice(block.start, block.end);
}

function rgb(hexColour) {
  return {
    r: Number.parseInt(hexColour.slice(1, 3), 16),
    g: Number.parseInt(hexColour.slice(3, 5), 16),
    b: Number.parseInt(hexColour.slice(5, 7), 16),
  };
}

/*
 * WCAG 2.1 relative luminance, computed from the served primitives. Accepts a
 * served hex or a colour the suite has already mixed and composited.
 */
function relativeLuminance(colour) {
  const channel = (value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const { r, g, b } = typeof colour === 'string' ? rgb(colour) : colour;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/* WCAG 2.1 relative-luminance contrast, computed from the served primitives. */
function contrastRatio(foreground, background) {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  return (lighter + 0.05) / (darker + 0.05);
}

/* A token's colour, following role aliases back to the served primitive. */
function resolveTokenColour(name, css = servedStylesheet()) {
  const value = tokenValue(name, css);
  const alias = value.match(/^var\(--([a-z-]+)\)$/);
  if (alias) {
    return resolveTokenColour(alias[1], css);
  }
  return paletteToken(name);
}

/*
 * A two-role tone as the browser resolves it: the sRGB colour-mix the token
 * declares, mixed from the served palette. The suite reads the mix, not a
 * copy of its result, so a palette change moves both together.
 */
function mixedTone(name, css = servedStylesheet()) {
  const value = tokenValue(name, css);
  const mix = value.match(
    /^color-mix\(\s*in srgb\s*,\s*var\(--([a-z-]+)\)\s+(\d+(?:\.\d+)?)%\s*,\s*var\(--([a-z-]+)\)\s*\)$/,
  );
  assert.ok(
    mix,
    `--${name} non è una mescolanza sRGB di due ruoli: ${value}`,
  );
  const first = rgb(resolveTokenColour(mix[1], css));
  const second = rgb(resolveTokenColour(mix[3], css));
  const firstShare = Number(mix[2]) / 100;
  const secondShare = 1 - firstShare;
  return {
    r: first.r * firstShare + second.r * secondShare,
    g: first.g * firstShare + second.g * secondShare,
    b: first.b * firstShare + second.b * secondShare,
  };
}

/*
 * The field under the grain. The tile's RGB is neutral black, but its alpha is
 * the turbulence's own and averages about 0.55 in a browser, so a rect at
 * --grain-opacity darkens each channel by about 0.55 x the token. The measured
 * ends in the tokens note are read through this composite, which the captured
 * ground confirms: the old 0.03 tile moved cream to rgb(233 221 195).
 */
const GRAIN_MEAN_ALPHA = 0.55;
function groundUnderGrain(tone, css = servedStylesheet()) {
  const grain = Number(tokenValue('grain-opacity', css)) * GRAIN_MEAN_ALPHA;
  return {
    r: tone.r * (1 - grain),
    g: tone.g * (1 - grain),
    b: tone.b * (1 - grain),
  };
}

/* A mixed colour as the served hex a note records. */
function hexOf(colour) {
  return `#${[colour.r, colour.g, colour.b]
    .map((value) => Math.round(value).toString(16).padStart(2, '0'))
    .join('')}`;
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
 * The shipped entries that are files on disk. The directory walk also reports
 * directories; the assertions that read every shipped file skip those.
 */
function shippedFilesOnDisk() {
  return shippedFiles().filter((file) => statSync(join(SITE, file)).isFile());
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

test('il Programma confermato segue la prosa e non porta un orario', () => {
  const html = readFileSync(join(SITE, 'index.html'), 'utf8');
  const document = loadSite();

  const prose = document.querySelector('.cantina');
  const programme = prose?.querySelector('section[aria-labelledby="programma"]');
  assert.ok(programme, 'manca il Programma dentro la prosa delle Cantine');

  const heading = programme.querySelector('h2#programma');
  assert.ok(heading, 'manca il titolo PROGRAMMA con l’ancora che la sezione nomina');
  assert.equal(
    normalize(heading.textContent),
    'PROGRAMMA',
    'il titolo del Programma non è l’etichetta stampata',
  );
  assert.equal(
    document.querySelectorAll('h2').length,
    1,
    'il Programma non è l’unico titolo di secondo livello della pagina',
  );

  const paragraphs = [...programme.querySelectorAll('p')].map((node) =>
    normalize(node.textContent),
  );
  assert.equal(paragraphs.length, 1, 'il Programma ha un solo paragrafo approvato');
  assert.equal(
    paragraphs[0],
    PROGRAMMA_PARAGRAPH,
    'il paragrafo del Programma non è quello approvato, alla lettera',
  );
  assert.doesNotMatch(
    paragraphs[0],
    /\d{1,2}:\d{2}/,
    'il Programma stampa un orario: la finestra del gruppo non si pubblica',
  );
  assert.equal(
    programme.querySelector('time, dt, dd'),
    null,
    'il Programma contiene un orario o una lista di fatti',
  );

  // Source order: after the approved prose's closing marker, before the
  // gallery. The Programma is prose of the page, not a second band.
  const endMarker = html.indexOf('CANTINA — FINE REGIONE MODIFICABILE');
  const sectionAt = html.indexOf('aria-labelledby="programma"');
  const galleryAt = html.indexOf('<section class="gallery"');
  assert.ok(endMarker !== -1, 'manca il segnaposto di fine della regione');
  assert.ok(sectionAt !== -1, 'manca la sezione del Programma');
  assert.ok(galleryAt !== -1, 'manca la galleria');
  assert.ok(endMarker < sectionAt, 'il Programma sta dentro la regione modificabile');
  assert.ok(sectionAt < galleryAt, 'il Programma non precede la galleria');
});

test('il fregio dei Menestrelli è decorativo e nomina i quattro strumenti', () => {
  const document = loadSite();
  const programme = document.querySelector('.cantina > .programma');
  assert.ok(programme, 'manca il Programma dentro la prosa delle Cantine');

  const plate = programme.querySelector('svg.programma__plate');
  assert.ok(plate, 'manca il fregio del Programma');
  assert.equal(
    plate.getAttribute('aria-hidden'),
    'true',
    'il fregio non è nascosto alle tecnologie assistive',
  );
  assert.equal(
    plate.getAttribute('focusable'),
    'false',
    'il fregio può ricevere il fuoco',
  );
  assert.equal(
    plate.querySelector('title, text, image, use'),
    null,
    'il fregio porta un titolo, del testo, un’immagine o un riferimento',
  );
  assert.equal(
    [...plate.querySelectorAll('*')].filter(
      (node) => node.hasAttribute('href') || node.hasAttribute('xlink:href'),
    ).length,
    0,
    'il fregio porta un riferimento esterno',
  );

  const instruments = [...plate.querySelectorAll('[data-instrument]')]
    .map((node) => node.getAttribute('data-instrument'))
    .sort();
  assert.deepEqual(
    instruments,
    ['chitarra', 'fisarmonica', 'organetto', 'tamburo'],
    'il fregio non nomina esattamente i quattro strumenti del paragrafo',
  );
  for (const instrument of instruments) {
    assert.ok(
      PROGRAMMA_PARAGRAPH.includes(instrument),
      `il fregio nomina uno strumento che il paragrafo non nomina: ${instrument}`,
    );
  }

  const paragraph = programme.querySelector('p');
  assert.ok(paragraph, 'manca il paragrafo del Programma');
  assert.equal(
    programme.querySelectorAll('p').length,
    1,
    'il fregio ha aggiunto un paragrafo al Programma',
  );
  assert.equal(
    plate.nextElementSibling,
    paragraph,
    'il fregio non sta fra l’etichetta e il paragrafo',
  );
});

test('il fregio del Programma sta accanto al paragrafo e si sovrappone', () => {
  const css = stripCssComments(servedStylesheet());
  const base = css.match(/(?:^|})\s*\.programma\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(base, 'manca la regola del Programma');
  assert.match(base, /display:\s*grid/, 'il Programma non è una griglia');
  assert.match(
    base,
    /grid-template-areas:\s*"label"\s*"stage"/,
    'il Programma non impagina etichetta e fregio',
  );

  const plate = css.match(/(?:^|})\s*\.programma__plate\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(plate, 'manca la regola del fregio');
  assert.match(plate, /inline-size:\s*14rem/, 'il fregio non ha la misura del telefono');
  assert.match(plate, /color:\s*var\(--ornament\)/, 'il fregio non usa l’oro tinto');
  assert.match(plate, /stroke-width:\s*1\.6/, 'il fregio non ha il tratto unico');
  assert.match(plate, /pointer-events:\s*none/, 'il fregio intercetta il puntatore');
  assert.match(
    plate,
    /margin-block-start:\s*var\(--space-7\)/,
    'il fregio del telefono non è abbassato',
  );

  const proseBase = css.match(/(?:^|})\s*\.programma > p\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(proseBase, 'manca la regola del paragrafo del Programma');
  assert.match(
    proseBase,
    /text-shadow:\s*0 0 2px var\(--surface\)/,
    'il paragrafo non ha l’alone crema sul telefono',
  );

  const desktop = desktopComposition(css);
  assert.match(
    desktop,
    /\.programma\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*34rem\)\s*minmax\(0,\s*1fr\)/s,
    'la colonna del paragrafo non è di 34 rem',
  );
  assert.match(
    desktop,
    /\.programma__plate\s*\{[^}]*inline-size:\s*34rem/s,
    'il fregio desktop non è di 34 rem',
  );
  assert.match(
    desktop,
    /\.programma__plate\s*\{[^}]*justify-self:\s*end/s,
    'il fregio non è allineato a destra',
  );
  assert.match(
    desktop,
    /\.programma__plate\s*\{[^}]*max-inline-size:\s*none/s,
    'il fregio non può eccedere la propria traccia per sovrapporsi',
  );
  assert.match(
    desktop,
    /\.programma__plate\s*\{[^}]*margin-block-start:\s*0/s,
    'il fregio desktop resta abbassato',
  );
  const desktopProse = desktop.match(/\.programma > p\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(desktopProse, 'manca la regola desktop del paragrafo del Programma');
  assert.doesNotMatch(
    desktopProse,
    /text-shadow/,
    'il paragrafo desktop azzera l’ombra che eredita dalla pagina',
  );
});

test('il calice della prosa è decorativo e apre il capitolo della prosa', () => {
  const document = loadSite();
  const prose = document.querySelector('.cantina');
  assert.ok(prose, 'manca la prosa delle Cantine');

  const opening = prose.querySelector('.apertura');
  assert.ok(opening, 'manca il capitolo della prosa');
  const paragraphs = opening.querySelectorAll('.apertura__prose > p');
  assert.equal(
    paragraphs.length,
    2,
    'il capitolo non tiene i due paragrafi approvati',
  );

  const plate = opening.querySelector('svg.cantina__plate');
  assert.ok(plate, 'manca il calice della prosa');
  assert.equal(
    plate.parentElement,
    opening,
    'il calice non è il disegno del capitolo della prosa',
  );
  assert.equal(
    plate.nextElementSibling,
    opening.querySelector('.apertura__prose'),
    'il calice non precede la prosa del capitolo',
  );
  assert.equal(
    plate.getAttribute('aria-hidden'),
    'true',
    'il calice non è nascosto alle tecnologie assistive',
  );
  assert.equal(
    plate.getAttribute('focusable'),
    'false',
    'il calice può ricevere il fuoco',
  );
  assert.equal(
    plate.querySelector('title, text, image, use'),
    null,
    'il calice porta un titolo, del testo, un’immagine o un riferimento',
  );
  assert.equal(
    [...plate.querySelectorAll('*')].filter(
      (node) => node.hasAttribute('href') || node.hasAttribute('xlink:href'),
    ).length,
    0,
    'il calice porta un riferimento esterno',
  );

  const figure = plate.querySelector('[data-figure]');
  assert.ok(figure, 'manca il gruppo del calice');
  assert.equal(
    figure.getAttribute('data-figure'),
    'calice',
    'il disegno non nomina il calice',
  );
  assert.ok(
    CANTINA_PARAGRAPH.includes('vino'),
    'il paragrafo non nomina più il vino che il calice disegna',
  );
});

test('il calice è il secondo disegno, alla stessa altezza del fregio', () => {
  const css = stripCssComments(servedStylesheet());

  const opening = css.match(/(?:^|})\s*\.apertura\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(opening, 'manca la regola del capitolo della prosa');
  assert.match(opening, /display:\s*grid/, 'il capitolo non è una griglia');
  assert.match(
    opening,
    /grid-template-areas:\s*"stage"/,
    'il capitolo non impagina il disegno',
  );

  const prose = css.match(/(?:^|})\s*\.apertura__prose\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(prose, 'manca la regola della prosa del capitolo');
  assert.match(prose, /position:\s*relative/, 'la prosa non sta sopra il calice');
  assert.match(prose, /z-index:\s*1/, 'la prosa non sta sopra il calice');

  const halo =
    css.match(/(?:^|})\s*\.apertura__prose\s*>\s*p\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(halo, 'manca la regola dei paragrafi della prosa');
  assert.match(
    halo,
    /text-shadow:\s*0 0 2px var\(--surface\)/,
    'la prosa non ha l’alone crema sul calice',
  );

  const plate = css.match(/(?:^|})\s*\.cantina__plate\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(plate, 'manca la regola del calice');
  assert.match(plate, /grid-area:\s*stage/, 'il calice non impagina nella sua area');
  assert.match(plate, /justify-self:\s*end/, 'il calice non sta a destra');
  assert.match(
    plate,
    /inline-size:\s*calc\(14rem \* 376 \/ 358 \* 120 \/ 149\)/,
    'il calice del telefono non ha l’altezza del fregio del Programma',
  );
  assert.match(
    plate,
    /aspect-ratio:\s*120 \/ 149/,
    'il calice non ha la proporzione del disegno',
  );
  assert.match(plate, /color:\s*var\(--ornament\)/, 'il calice non usa l’oro tinto');
  assert.match(plate, /fill:\s*none/, 'il calice è riempito');
  assert.match(plate, /stroke-width:\s*1\.6/, 'il calice non ha il tratto unico');
  assert.match(plate, /pointer-events:\s*none/, 'il calice intercetta il puntatore');
  assert.match(
    plate,
    /margin-block-start:\s*var\(--space-7\)/,
    'il calice del telefono non è abbassato',
  );

  const desktop = desktopComposition(css);
  assert.match(
    desktop,
    /\.apertura\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*34rem\)\s*minmax\(0,\s*1fr\)/s,
    'la colonna della prosa non è di 34 rem',
  );
  assert.match(
    desktop,
    /\.apertura__prose\s*\{[^}]*grid-area:\s*text/s,
    'la prosa desktop non sta nella colonna del testo',
  );
  assert.match(
    desktop,
    /\.cantina__plate\s*\{[^}]*inline-size:\s*calc\(34rem \* 376 \/ 358 \* 120 \/ 149\)/s,
    'il calice desktop non ha l’altezza del fregio del Programma',
  );
  assert.match(
    desktop,
    /\.cantina__plate\s*\{[^}]*justify-self:\s*end/s,
    'il calice desktop non sta a destra',
  );
  assert.match(
    desktop,
    /\.cantina__plate\s*\{[^}]*max-inline-size:\s*none/s,
    'il calice non può eccedere la propria traccia per sovrapporsi',
  );
  assert.match(
    desktop,
    /\.cantina__plate\s*\{[^}]*margin-block-start:\s*0/s,
    'il calice desktop resta abbassato',
  );
});

test('il calice si inchiostra per primo e condivide l’idioma dei due disegni', () => {
  const css = stripCssComments(servedStylesheet());

  const motion =
    css.match(/\.apertura\s*>\s*\.cantina__plate\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(motion, 'manca il movimento del calice');
  assert.match(motion, /animation:\s*ink-in\b/, 'il calice non si inchiostra');
  assert.match(
    motion,
    /animation-timeline:\s*view\(\)/,
    'il calice non segue lo scorrimento',
  );

  const startOf = (body) =>
    Number(body.match(/animation-range:\s*entry\s+(\d+)%/)?.[1]);
  const first =
    css.match(/\.apertura__prose\s*>\s*p:nth-of-type\(1\)\s*\{([^}]*)\}/s)?.[1] ??
    '';
  assert.ok(first, 'manca il movimento del primo paragrafo');
  assert.ok(
    startOf(motion) < startOf(first),
    'la prosa sale prima del suo disegno',
  );

  for (const [name, selector] of [
    ['il fregio del Programma', '\\.programma__plate'],
    ['il calice della prosa', '\\.cantina__plate'],
  ]) {
    const body =
      css.match(new RegExp(`(?:^|})\\s*${selector}\\s*\\{([^}]*)\\}`, 's'))?.[1] ??
      '';
    assert.ok(body, `manca la regola: ${name}`);
    assert.match(body, /color:\s*var\(--ornament\)/, `${name} non usa l’oro tinto`);
    assert.match(body, /fill:\s*none/, `${name} è riempito`);
    assert.match(body, /stroke-width:\s*1\.6/, `${name} non ha il tratto unico`);
    assert.match(
      body,
      /stroke-linecap:\s*round/,
      `${name} non ha il tratto arrotondato`,
    );
    assert.match(body, /pointer-events:\s*none/, `${name} intercetta il puntatore`);
  }
});

test('l’etichetta del Programma ha il registro stampato delle etichette', () => {
  const css = stripCssComments(servedStylesheet());

  // The heading is a printed label like DOVE and DALLE ORE, not a serif
  // headline: sans, the small step, bold, wide tracking, muted ink. Inside
  // .cantina it would otherwise inherit the prose's serif and its reading step.
  const label = css.match(/\.programma\s+h2\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(label, 'manca la regola dell’etichetta PROGRAMMA');
  for (const [declaration, why] of [
    [/font-family\s*:\s*var\(--sans\)/, 'l’etichetta non è in sans'],
    [/font-size\s*:\s*var\(--step--1\)/, 'l’etichetta non usa il passo piccolo'],
    [/font-weight\s*:\s*700/, 'l’etichetta non è in grassetto'],
    [/letter-spacing\s*:\s*0\.16em/, 'l’etichetta non ha la spaziatura delle altre etichette'],
    [/color\s*:\s*var\(--ink-muted\)/, 'l’etichetta non è in inchiostro attenuato'],
  ]) {
    assert.match(label, declaration, why);
  }

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
 * The printed date is one lockup: the weekday above the numeral at display
 * scale on a phone, on one line from 64 rem, with the time under DALLE ORE.
 * The DOM keeps the printed order (day, weekday, month) so the time element
 * reads as one date. The exactly-once test proves the time has no second home.
 */
test('la data è un lockup orizzontale allineato a sinistra con un solo luogo per l’orario', () => {
  const document = loadSite();
  const page = document.querySelector('main.page');
  assert.ok(page, 'manca la pagina');

  const date = page.querySelector('section.date');
  assert.ok(date, 'manca il blocco della data');
  assert.equal(
    date.parentElement,
    page,
    'la data non è un blocco della pagina',
  );

  const lockup = date.querySelector('time.date-lockup[datetime="2026-12-06"]');
  assert.ok(lockup, 'il lockup non è un <time> con datetime="2026-12-06"');

  // The markup keeps the printed order; the grid areas, not the DOM, put the
  // weekday above the numeral on a phone and on one line from 64 rem.
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

/*
 * The date is a band on cream between two gold hairlines. It runs edge to edge
 * and pads its content back onto the shell. It is no longer a dark surface:
 * the closing band is the page's only strong one. The rules are the print's,
 * not a panel's edge, so the band carries hairlines but still no shadow and no
 * radius.
 */
test('la data è una banda a tutta larghezza fra due filetti d’oro', () => {
  const css = stripCssComments(servedStylesheet());
  assertDesktopComposition(css);
  const layout = layerBlock(css, 'layout');
  const components = layerBlock(css, 'components');

  const date = layout.match(/\.date\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(date, 'manca la regola della data');
  assert.match(
    date,
    /padding-inline:\s*var\(--shell-pad\)/,
    'la data non riporta il contenuto sulla shell della pagina',
  );
  assert.match(
    date,
    /min-inline-size:\s*0\s*;/,
    'la data non può restringersi e spinge la pagina di lato al 200% di zoom',
  );
  assert.doesNotMatch(
    date,
    /\d(?:vw|vmin|vmax)\b/,
    'la data si dimensiona con il viewport e può scorrere in orizzontale',
  );

  // A band, not a dark field: ruled top and bottom, on the page's cream.
  const dateComponent =
    components.match(/\.date\s*\{([^{}]*display:\s*grid[^{}]*)\}/s)?.[1] ?? '';
  assert.match(
    dateComponent,
    /display:\s*grid\s*;/,
    'la data non è una griglia che può distribuire il proprio interno',
  );
  assert.match(
    dateComponent,
    /border-block:\s*1px solid var\(--rule\)/,
    'la data non è una banda fra due filetti d’oro',
  );
  for (const [, block] of css.matchAll(/\.date\s*\{([^}]*)\}/gs)) {
    assert.doesNotMatch(
      block,
      /background:\s*var\(--strong\)/,
      'la data è ancora una superficie forte',
    );
    assert.doesNotMatch(
      block,
      /\bbox-shadow\s*:/,
      'la data proietta un’ombra: è un pannello',
    );
    assert.doesNotMatch(
      block,
      /\bborder-radius\s*:/,
      'la data ha angoli arrotondati: è un pannello',
    );
  }

  // The label and the clock are one row by construction, not by the grid's
  // implicit placement. `grid-auto-flow: column` is the one part of the
  // construction an engine can ignore while the rest of the page still
  // renders; when it does, row flow drops 12:00 under DALLE ORE (the iPhone
  // 12 mini report). The browser-level check is the review harness; this
  // assertion keeps the fragile construct from coming back.
  const timeComponent =
    components.match(/\.date-time\s*\{([^{}]*)\}/s)?.[1] ?? '';
  assert.match(
    timeComponent,
    /display:\s*flex\s*;/,
    'l’orario non è una riga esplicita: «DALLE ORE» e l’ora possono separarsi',
  );
  assert.doesNotMatch(
    components,
    /\.date-time\s*\{[^}]*grid-auto-flow/s,
    'l’orario torna a dipendere dal flusso implicito della griglia',
  );

  // At 200% text zoom the band's words wrap inside it and never push the page
  // sideways.
  assert.match(
    components,
    /\.date-lockup\s*>\s*\*,\s*\.date-time\s*>\s*\*\s*\{[^}]*max-inline-size:\s*100%/s,
    'le parole della data non sono limitate alla larghezza della banda',
  );
  assert.match(
    components,
    /\.date-lockup\s*>\s*\*,\s*\.date-time\s*>\s*\*\s*\{[^}]*overflow-wrap:\s*anywhere/s,
    'le parole della data non possono andare a capo dentro la banda',
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
    'Scarica la locandina',
    'sVino — II EDIZIONE',
    'Le visite sono contate senza cookie',
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
  assert.doesNotMatch(css, /\.sheet\b/, 'il foglio di stile conserva .sheet');

  // The page is the viewport: the cover runs edge to edge and each section
  // insets its own content on the shell. There is no sheet and no column.
  const page = document.querySelector('main.page');
  assert.ok(page, 'manca la pagina');
  assert.match(
    css,
    /\.page\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s,
    'la pagina non è una griglia a piena larghezza',
  );
  assert.doesNotMatch(
    css,
    /\.page\s*\{[^}]*max-inline-size/s,
    'la pagina conserva una misura: è ancora una colonna',
  );
  assert.match(
    css,
    /\.page\s*\{[^}]*padding:\s*0/s,
    'la pagina conserva un margine interno: le sezioni non arrivano ai bordi',
  );
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

test('la carta del corpo posa la grana come un tassello SVG in linea', () => {
  const css = stripCssComments(servedStylesheet());
  const body = bodyRule(css);
  const grain = tokenValue('grain-image', css);

  /*
   * The cream surface is declared first and stays; the grain is an image
   * layer added after it, because the shorthand resets the layer list.
   */
  const surface = body.indexOf('background: var(--surface)');
  const image = body.indexOf('background-image: var(--grain-image)');
  assert.ok(surface >= 0, 'il corpo perde la carta di crema');
  assert.ok(
    image > surface,
    'la grana sostituisce la carta invece di posarsi sopra',
  );

  // Inline turbulence, tiled from its own square and stitched at the seam.
  const svg = inlineSvg(grain);
  assert.match(
    svg,
    /<feTurbulence\b[^>]*type=['"]fractalNoise['"]/,
    'la grana non è rumore frattale',
  );
  assert.match(
    svg,
    /<feTurbulence\b[^>]*stitchTiles=['"]stitch['"]/,
    'la grana non è cucita: il tassello ripete la cucitura',
  );
  const tile = svg.match(
    /<svg\b[^>]*width=['"](\d+)['"][^>]*height=['"](\d+)['"]/,
  );
  assert.ok(tile, 'il tassello della grana non dichiara la propria misura');
  assert.equal(tile[1], tile[2], 'il tassello della grana non è quadrato');
  assert.equal(
    Number(tile[1]),
    480,
    `il tassello della grana non misura 480 px: ${tile[1]} px`,
  );
  // The fibre is coarse enough not to read as a screen, but the tile is large
  // enough that its repetition is not seen across a viewport.
  assert.match(
    svg,
    /<feTurbulence\b[^>]*baseFrequency=['"]0\.5['"]/,
    'la frequenza della grana non è 0.5',
  );
  // The grain is the first background layer, so its repeat value comes
  // first; later ground layers may extend the list.
  const repeat = body.match(/background-repeat:\s*([^;]+);/)?.[1].trim() ?? '';
  assert.match(
    repeat,
    /^repeat(?:\s*,|$)/,
    `la grana non è il primo strato a tasselli: ${repeat}`,
  );
});

test('la grana è neutra e non attinge alla palette', () => {
  const css = stripCssComments(servedStylesheet());
  const svg = inlineSvg(tokenValue('grain-image', css));

  // The noise is reduced to a neutral scale before it is laid down.
  assert.match(
    svg,
    /<feColorMatrix\b/,
    'la grana conserva i canali di colore del rumore',
  );
  assert.doesNotMatch(
    svg,
    /#[0-9a-fA-F]{3,8}\b/,
    'la grana dichiara un colore invece di restare neutra',
  );
  assert.doesNotMatch(
    svg,
    /var\(--[a-z-]+\)/,
    'la grana legge un ruolo della palette',
  );
  assert.doesNotMatch(
    svg,
    /(?:--|#)(?:bordeaux|cream|gold|bronze)/i,
    'la grana nomina una primitiva della palette',
  );
});

test('l’opacità della grana vive in un token semantico sotto il tetto di 0.10', () => {
  const css = stripCssComments(servedStylesheet());
  const opacity = tokenValue('grain-opacity', css);

  // A bare number in the tokens layer, not a colour and not a magic decimal
  // buried in the base rule.
  assert.match(
    opacity,
    /^(?:0(?:\.\d+)?|1(?:\.0+)?)$/,
    `l’opacità della grana non è un numero: ${opacity}`,
  );
  const value = Number(opacity);
  assert.ok(value > 0, 'la grana non è visibile');
  assert.ok(
    value <= 0.1,
    `la grana supera il tetto concordato di 0.10: ${value}`,
  );

  // The inline SVG cannot read this document's custom properties, so the
  // shipped tile repeats the value; the contract is that the two agree.
  const svg = inlineSvg(tokenValue('grain-image', css));
  const embedded = svg.match(/\bopacity=['"]([0-9.]+)['"]/);
  assert.ok(embedded, 'il tassello della grana non dichiara la propria opacità');
  assert.equal(
    Number(embedded[1]),
    value,
    `la grana spedita (${embedded[1]}) non segue il token (${value})`,
  );
});

test('il fondo non aggiunge un file, una richiesta o un movimento', () => {
  const css = stripCssComments(servedStylesheet());
  const body = bodyRule(css);
  const grain = tokenValue('grain-image', css);
  const svg = inlineSvg(grain);

  // The ground is inline: the only image is the data URI, and the SVG's own
  // references stay inside the tile.
  assert.match(
    grain,
    /^url\("data:image\/svg\+xml,/,
    'la grana non è un data URI: è un file da caricare',
  );
  assert.doesNotMatch(
    svg,
    /<(?:animate|animateTransform|animateMotion|set)\b/,
    'il tassello della grana contiene un movimento',
  );
  assert.doesNotMatch(
    svg,
    /url\((?!#)/,
    'il tassello della grana richiede una risorsa fuori da sé',
  );
  // The site's images are an exact, known set. The ground ships no file: its
  // grain is the data URI above, so the inventory does not grow.
  const images = shippedFilesOnDisk()
    .filter((file) => /\.(?:avif|gif|ico|jpe?g|png|svg|tiff?|webp)$/i.test(file))
    .sort();
  assert.deepEqual(
    images,
    [...SHIPPED_IMAGE_FILES],
    `il fondo aggiunge un file immagine: ${images.join(', ')}`,
  );

  // Still and flat: the ground adds no motion, shadow or rounding to the page.
  assert.doesNotMatch(
    body,
    /\b(?:animation|transition|transform|will-change|box-shadow|border-radius)\s*:/,
    'il fondo del corpo aggiunge movimento o un pannello',
  );
  assert.doesNotMatch(
    css,
    /@keyframes\s+(?:grain|ground|paper|noise)\b/i,
    'il fondo ha una sequenza di fotogrammi',
  );
});

test('la carta riceve un solo campo di luce continuo sotto la grana', () => {
  const css = stripCssComments(servedStylesheet());
  const body = bodyRule(css);

  // The cream surface stays the base colour; the ground is two image layers,
  // grain on top and one field beneath it, added after the shorthand.
  const image =
    body.match(/background-image:\s*([^;]+);/)?.[1].trim() ?? '';
  assert.equal(
    image,
    'var(--grain-image), var(--ground-field)',
    `il corpo non posa la grana sopra un solo campo: ${image}`,
  );
  // The grain tiles; the field is painted once, over the document.
  const repeat =
    body.match(/background-repeat:\s*([^;]+);/)?.[1].trim() ?? '';
  assert.equal(
    repeat,
    'repeat, no-repeat',
    `il campo si ripete invece di scorrere una volta: ${repeat}`,
  );

  // One field for the whole page, not a wash per section: the body is its
  // only consumer, and it is a single vertical gradient.
  const field = tokenValue('ground-field', css);
  assert.match(
    field,
    /^linear-gradient\(\s*to bottom\s*,/,
    `il campo non è una discesa verticale: ${field}`,
  );
  // The descent is the ticket's: light near the date, the cream surface
  // through the prose, the deep tone at the foot.
  const stops = [...field.matchAll(/var\(--([a-z-]+)\)\s+\d+%/g)].map(
    ([, name]) => name,
  );
  assert.deepEqual(
    stops,
    ['ground-light', 'ground-light', 'surface', 'ground-deep'],
    `il campo non scende dal chiaro al fondo passando per la carta: ${stops.join(', ')}`,
  );
  assert.equal(
    [...css.matchAll(/var\(--ground-field\)/g)].length,
    1,
    'il campo è dipinto più di una volta: è un lavaggio per sezione',
  );

  // The date stays a band on the page's cream: the field shows through it and
  // the band adds no background, shadow or radius of its own.
  for (const [, block] of css.matchAll(/\.date\s*\{([^}]*)\}/gs)) {
    assert.doesNotMatch(
      block,
      /\bbackground(?:-image)?\s*:/,
      'la data dipinge un fondo sopra il campo',
    );
    assert.doesNotMatch(
      block,
      /\bbox-shadow\s*:|(?:^|[;\s])border-radius\s*:/,
      'la data è diventata un pannello sopra il campo',
    );
  }
});

test('i due toni del campo sono mescolanze della palette, non colori nuovi', () => {
  const css = stripCssComments(servedStylesheet());
  const tokens = layerBlock(css, 'tokens');
  const light = tokenValue('ground-light', css);
  const deep = tokenValue('ground-deep', css);

  for (const [name, value] of [
    ['ground-light', light],
    ['ground-deep', deep],
  ]) {
    assert.match(
      value,
      /^color-mix\(\s*in srgb\s*,/,
      `--${name} non è una mescolanza sRGB: ${value}`,
    );
    assert.doesNotMatch(
      value,
      /#[0-9a-fA-F]{3,8}\b/,
      `--${name} introduce un colore grezzo invece di mescolare la palette`,
    );
    // Every source is a token the stylesheet actually ships; tokenValue
    // asserts its presence with its own message.
    for (const [, source] of value.matchAll(/var\(--([a-z-]+)\)/g)) {
      tokenValue(source, css);
    }
  }

  // The light end leans on the print's light paper, the deep end on its warm
  // neutral, and both on the page's own surface.
  assert.match(
    light,
    /var\(--cream-light\)/,
    'il capo chiaro non attinge alla carta chiara della stampa',
  );
  assert.match(
    deep,
    /var\(--bronze\)/,
    'il capo scuro non attinge al neutro caldo della stampa',
  );
  for (const [name, value] of [
    ['ground-light', light],
    ['ground-deep', deep],
  ]) {
    assert.match(
      value,
      /var\(--surface\)/,
      `--${name} non parte dalla superficie della pagina`,
    );
  }

  // No new primitive entered the palette: the tokens layer holds exactly the
  // six printed colours and nothing else with a raw value.
  const primitives = [...tokens.matchAll(/--([a-z-]+)\s*:\s*#[0-9a-fA-F]{6}\s*;/g)]
    .map(([, name]) => name)
    .sort();
  assert.deepEqual(
    primitives,
    ['bordeaux', 'bronze', 'cream', 'cream-light', 'gold', 'gold-light'],
    `il campo ha aggiunto una primitiva: ${primitives.join(', ')}`,
  );
});

test('l’oro tinto del fregio lascia il bordeaux sopra AA', () => {
  const css = stripCssComments(servedStylesheet());
  const value = tokenValue('ornament', css);
  assert.match(
    value,
    /^color-mix\(\s*in srgb\s*,\s*var\(--gold\)\s+40%\s*,\s*var\(--cream\)\s*\)$/,
    `l’oro tinto non è una mescolanza di oro e crema: ${value}`,
  );

  const ornament = mixedTone('ornament', css);
  const bordeaux = rgb(resolveTokenColour('bordeaux', css));
  const cream = rgb(resolveTokenColour('cream', css));
  const onOrnament = contrastRatio(bordeaux, ornament);
  const onCream = contrastRatio(ornament, cream);
  assert.ok(
    onOrnament >= 4.5,
    `il bordeaux sul fregio misura ${onOrnament.toFixed(2)}:1, sotto AA`,
  );
  assert.ok(
    onCream >= 1.4,
    `il fregio si perde nel crema: ${onCream.toFixed(2)}:1`,
  );
});

test('tutto il testo porta la stessa ombra leggera', () => {
  const css = stripCssComments(servedStylesheet());
  const body = bodyRule(css);
  assert.match(
    body,
    /text-shadow:\s*var\(--text-shadow\)/,
    'il corpo non porta l’ombra della pagina',
  );
  const value = tokenValue('text-shadow', css);
  assert.match(
    value,
    /^0 1px 1px color-mix\(\s*in srgb\s*,\s*var\(--bronze\)\s+30%\s*,\s*transparent\s*\)$/,
    `l’ombra non è un’incisione calda: ${value}`,
  );
});

test('il campo resta entro il sedici per cento e il bordeaux regge su entrambi i capi', () => {
  const css = stripCssComments(servedStylesheet());
  const lightTone = mixedTone('ground-light', css);
  const deepTone = mixedTone('ground-deep', css);
  // The grain is a texture: its mean darkens both ends by the same proportion,
  // so the field's span is measured on the tones themselves. The ends the note
  // records are read through the grain, for the contrast checks below.
  const lightest = groundUnderGrain(lightTone, css);
  const darkest = groundUnderGrain(deepTone, css);
  const lightLuminance = relativeLuminance(lightest);
  const darkLuminance = relativeLuminance(darkest);
  const delta = relativeLuminance(lightTone) - relativeLuminance(deepTone);

  // The cap is measured, not assumed: both ends of the field differ by at most
  // sixteen points of relative luminance.
  assert.ok(delta > 0, 'il campo non ha direzione: i due capi coincidono');
  assert.ok(
    delta <= 0.16,
    `il campo copre ${(delta * 100).toFixed(2)} punti di luminanza: supera il 16%`,
  );

  // The note beside the rule records the same measurement, so a reader reads
  // the number the suite checks rather than a second copy of the palette.
  const blocks = atRuleBlocks(servedStylesheet(), '@layer\\s+tokens\\s*\\{');
  const rawTokens = servedStylesheet().slice(blocks[0].start, blocks[0].end + 1);
  const note =
    [...rawTokens.matchAll(/\/\*[\s\S]*?\*\//g)]
      .map(([comment]) => comment)
      .find((comment) => /lightest ground/i.test(comment)) ?? '';
  assert.ok(note, 'manca la misura del campo accanto alla palette');
  const literal = (text) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.match(
    note,
    new RegExp(
      `lightest ground\\s+≈\\s+${literal(hexOf(lightest))}\\s+luminance\\s+${literal(lightLuminance.toFixed(4))}`,
    ),
    'la nota non registra il capo più chiaro del campo',
  );
  assert.match(
    note,
    new RegExp(
      `darkest ground\\s+≈\\s+${literal(hexOf(darkest))}\\s+luminance\\s+${literal(darkLuminance.toFixed(4))}`,
    ),
    'la nota non registra il capo più scuro del campo',
  );
  assert.match(
    note,
    new RegExp(`delta\\s+${literal((delta * 100).toFixed(2))}`),
    'la nota non registra il salto totale del campo',
  );

  // Worst case for the page's ink: bordeaux over either end of the field, at
  // the grain's full strength, still clears AA for normal text.
  const bordeaux = paletteToken('bordeaux');
  const onLightest = contrastRatio(bordeaux, lightest);
  const onDarkest = contrastRatio(bordeaux, darkest);
  for (const [label, ratio] of [
    ['chiarissimo', onLightest],
    ['scurissimo', onDarkest],
  ]) {
    assert.ok(
      ratio >= 4.5,
      `il bordeaux sul fondo ${label} misura ${ratio.toFixed(2)}:1, sotto AA`,
    );
  }
  assert.match(
    note,
    new RegExp(`lightest ground[^\\n]*${literal(onLightest.toFixed(2))}:1`),
    'la nota non registra il bordeaux sul capo più chiaro',
  );
  assert.match(
    note,
    new RegExp(`darkest ground[^\\n]*${literal(onDarkest.toFixed(2))}:1`),
    'la nota non registra il bordeaux sul capo più scuro',
  );

  // The muted ink is why the palette's bronze moved: at the worst point of the
  // field it still clears AA for normal text.
  const bronze = paletteToken('bronze');
  const mutedOnDarkest = contrastRatio(bronze, darkest);
  assert.ok(
    mutedOnDarkest >= 4.5,
    `il bronzo sul fondo più scuro misura ${mutedOnDarkest.toFixed(2)}:1, sotto AA`,
  );
  assert.match(
    note,
    new RegExp(`muted ink[^\\n]*${literal(mutedOnDarkest.toFixed(2))}:1`),
    'la nota non registra il bronzo sul capo più scuro',
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

  for (const token of [
    'recede',
    'press',
    'ink',
    'settle',
    'date',
    'numeral',
    'quick',
    'rule',
    'scroll',
    'after-paper',
    'after-press',
    'after-lockup',
  ]) {
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
  const page = document.querySelector('main.page');
  assert.ok(page, 'manca la pagina');

  const header = page.firstElementChild;
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

test('la firma occupa la larghezza della sua colonna a ogni larghezza', () => {
  const css = stripCssComments(servedStylesheet());
  assertDesktopComposition(css);

  const layout = layerBlock(css, 'layout');
  const shared =
    layout.match(/\.lockup,\s*\.signature\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(
    shared,
    'manca la regola che dà alla firma la larghezza della sua colonna',
  );
  assert.match(
    shared,
    /(?:^|;)\s*inline-size\s*:\s*100%/,
    'la firma e il titolo non occupano la larghezza della loro colonna',
  );

  // The masthead's content box is the shell on a phone; from 64 rem the
  // signature is capped so the cover keeps a third of the photograph.
  const masthead = layout.match(/\.masthead\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.match(
    masthead,
    /padding-inline:\s*var\(--shell-pad\)/,
    'la testata non sta sulla shell della pagina',
  );
  assert.match(
    desktopComposition(css),
    /\.signature\s*\{[^}]*max-inline-size:\s*36rem/s,
    'la firma non è limitata a 36 rem sulla composizione desktop',
  );

  assert.doesNotMatch(
    css,
    /--signature-size/,
    'la firma conserva un tetto fisso per un layout che non esiste più',
  );
});

test('i due fatti stanno su due colonne e ognuno va a capo dentro la sua', () => {
  const css = stripCssComments(servedStylesheet());
  assertDesktopComposition(css);

  const facts = css.match(/\.facts\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(facts, 'manca la regola dei fatti');
  assert.match(
    facts,
    /(?:^|;)\s*display\s*:\s*grid/,
    'i fatti non sono una lista composta',
  );
  assert.match(
    facts,
    /(?:^|;)\s*grid-template-columns\s*:\s*repeat\(\s*2\s*,\s*minmax\(\s*0\s*,\s*1fr\s*\)\s*\)/,
    'i due fatti non stanno su due colonne',
  );

  const fact = css.match(/\.fact\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.match(
    fact,
    /(?:^|;)\s*min-inline-size\s*:\s*0/,
    'un fatto non può restringersi e andare a capo dentro la sua colonna',
  );
});

test('le due azioni tipografiche stanno una sopra l’altra a tutta riga, con la riga che attraversa il fondo', () => {
  const css = stripCssComments(servedStylesheet());
  assertDesktopComposition(css);

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
    'sul telefono le due azioni tipografiche non stanno una sopra l’altra a tutta riga',
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

  // On the desktop composition the band splits: facts left, actions right.
  // The actions stay stacked in their column — pairing them would shrink or
  // wrap the Locandina label — and each rule still crosses its action.
  const desktop = desktopComposition(css);
  assert.match(
    desktop,
    /\.band__inner\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*7fr\)\s*minmax\(0,\s*5fr\)/s,
    'la banda desktop non divide fatti e azioni in due colonne',
  );
  assert.match(
    desktop,
    /\.band__actions\s*\{[^}]*grid-column:\s*2/s,
    'le azioni non stanno nella colonna di destra della banda',
  );
});

/*
 * On the desktop composition the facts and the actions start on the same
 * horizontal line. The actions column is taller than the facts — it carries
 * four actions — so the grid must align the two columns at the top. Bottom
 * alignment lifted the actions above the facts once the profile icons joined
 * the column.
 */
test('sul desktop i fatti e le azioni della banda partono dalla stessa riga', () => {
  const css = stripCssComments(servedStylesheet());
  assertDesktopComposition(css);

  const desktop = desktopComposition(css);
  const inner = desktop.match(/\.band__inner\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(inner, 'manca la regola desktop della banda');
  assert.match(
    inner,
    /(?:^|;)\s*align-items\s*:\s*start/,
    'i fatti e le azioni non partono dalla stessa riga',
  );
  assert.doesNotMatch(
    inner,
    /(?:^|;)\s*align-items\s*:\s*end/,
    'le colonne sono allineate al piede: le azioni salgono sopra i fatti',
  );
});

/*
 * The Cantina photograph follows the date's lower hairline directly: the band
 * is the separation, not a margin. It runs edge to edge at every width and
 * declares no measure of its own.
 */
test('la fotografia segue la data e esce dai margini a ogni larghezza', () => {
  const css = stripCssComments(servedStylesheet());
  assertDesktopComposition(css);
  const layout = layerBlock(css, 'layout');

  const band = layout.match(/\.photo-band\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(band, 'manca la regola della banda della fotografia');
  assert.match(
    band,
    /margin:\s*0\s*;/,
    'la fotografia conserva un margine che la stacca dalla data',
  );
  assert.match(
    band,
    /inline-size:\s*100%/,
    'la fotografia non occupa la larghezza della pagina',
  );

  // There is no larger block margin for a wider layout to restore.
  assert.doesNotMatch(
    css,
    /--photo-space/,
    'la fotografia conserva un margine per un layout che non esiste più',
  );
});

test('la banda bordeaux chiude la pagina con fatti, azioni e colophon ed è l’unica superficie forte', () => {
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
  // The closing band is the page's only strong surface. The date is a band on
  // cream now, so one rule declares the bordeaux ground and one consumer
  // reads it.
  const strongRules = [
    ...css.matchAll(
      /([^{}]+)\{\s*([^{}]*background:\s*var\(--strong\)\s*;[^{}]*)\}/gs,
    ),
  ];
  assert.equal(
    strongRules.length,
    1,
    'la superficie forte non ha una sola casa',
  );
  const [, strongSelector, strongBody] = strongRules[0];
  assert.equal(
    normalize(strongSelector),
    '.band',
    'la superficie forte non è la sola banda che chiude la pagina',
  );
  assert.match(
    strongBody,
    /background:\s*var\(--strong\)\s*;/,
    'la superficie forte non dichiara il fondo bordeaux semantico',
  );
  assert.match(
    strongBody,
    /color:\s*var\(--strong-ink\)\s*;/,
    'la superficie forte non dichiara il testo crema semantico',
  );
  assert.doesNotMatch(
    strongBody,
    /#[0-9a-fA-F]{3,8}\b/,
    'la superficie forte dichiara un colore grezzo invece di un ruolo',
  );
  assert.doesNotMatch(
    css,
    /\.date\s*\{[^{}]*background:\s*var\(--strong\)/s,
    'la data è ancora una superficie forte',
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

/*
 * The date is a band on cream: it reads the page's ordinary ink and muted ink,
 * and the day, the month and the time inherit the band's ink rather than
 * declaring a colour of their own.
 */
test('la data legge l’inchiostro della pagina, non la superficie forte', () => {
  const css = stripCssComments(servedStylesheet());
  const components = layerBlock(css, 'components');

  // The labels carry the muted ink…
  assert.match(
    components,
    /\.date-weekday\s*\{[^}]*color:\s*var\(--ink-muted\)/s,
    'il giorno della settimana non legge l’inchiostro attenuato della pagina',
  );
  assert.match(
    components,
    /\.date-time dt\s*\{[^}]*color:\s*var\(--ink-muted\)/s,
    'DALLE ORE non legge l’inchiostro attenuato della pagina',
  );

  // …while the day, the month and the time inherit the date's ink, so they
  // must not declare a colour of their own on the cream page.
  for (const [selector, label] of [
    ['.date-day', 'il giorno'],
    ['.date-month', 'il mese'],
    ['.date-time dd', 'l’orario'],
  ]) {
    const rule =
      components.match(
        new RegExp(`${selector.replace(/\./g, '\\.')}\\s*\\{([^}]*)\\}`, 's'),
      )?.[1] ?? '';
    assert.ok(rule, `manca la regola di ${label}`);
    assert.doesNotMatch(
      rule,
      /\bcolor\s*:/,
      `${label} dichiara un colore proprio invece di ereditare l’inchiostro della data`,
    );
  }

  assert.doesNotMatch(
    css,
    /var\(--band(?:-[a-z-]+)?\)/,
    'la data legge un ruolo intitolato alla banda',
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
    ['bronze', '1.58'],
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
    /bronze[^\n]*(?:mai|non|never)[^\n]*testo|bronze[^\n]*1\.58:1[^\n]*(?:mai|non|never)/i,
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
  const actions = [
    ...band.querySelectorAll('.map-link a, .locandina-download a'),
  ];
  assert.equal(actions.length, 2, 'la banda non ha le due azioni tipografiche');

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

/*
 * First of the three narrow guards. It states the script allowance on its own
 * so that the blanket third-party assertion can be removed without silently
 * dropping the guarantee: exactly one script, the counter's, with no inline
 * handler and no shipped .js.
 */
test('la pagina carica un solo script, il contatore, e nessun gestore inline o file .js', () => {
  const document = loadSite();
  const scripts = [...document.querySelectorAll('script')];
  assert.equal(
    scripts.length,
    1,
    'la pagina contiene più di uno script, o nessuno',
  );

  const script = scripts[0];
  assert.equal(
    script.getAttribute('src'),
    'https://gc.zgo.at/count.js',
    'lo script non è quello del contatore',
  );
  assert.equal(
    script.getAttribute('data-goatcounter'),
    'https://svino.goatcounter.com/count',
    'lo script non punta al contatore',
  );
  assert.ok(script.hasAttribute('async'), 'lo script del contatore non è async');
  assert.equal(script.textContent.trim(), '', 'lo script contiene codice inline');

  for (const element of document.querySelectorAll('*')) {
    for (const attribute of element.getAttributeNames()) {
      assert.ok(
        !attribute.startsWith('on'),
        `attributo JavaScript inline: ${attribute}`,
      );
    }
  }

  const shipped = shippedFiles().filter((file) => /\.js$/i.test(file));
  assert.deepEqual(
    shipped,
    [],
    `il sito spedisce file JavaScript: ${shipped.join(', ')}`,
  );
});

/*
 * Second of the three narrow guards: a documented denylist of hosts that
 * ship analytics, advertising or session recording. Entries are hostnames,
 * and a subdomain matches its entry, so the map's google.com destination
 * stays allowed while google-analytics.com does not. A match anywhere in the
 * page, the stylesheet or a shipped asset fails the suite.
 */
const TRACKER_HOSTS = Object.freeze([
  // Analytics
  'google-analytics.com',
  'googletagmanager.com',
  'googlesyndication.com',
  'googleadservices.com',
  'matomo.cloud',
  'plausible.io',
  'segment.com',
  'segment.io',
  'mixpanel.com',
  'amplitude.com',
  'heap.io',
  'heapanalytics.com',
  'statcounter.com',
  'chartbeat.com',
  'parsely.com',
  'quantserve.com',
  'scorecardresearch.com',
  'mc.yandex.ru',
  'bat.bing.com',
  'analytics.tiktok.com',
  // Advertising and social pixels
  'doubleclick.net',
  'adservice.google.com',
  'connect.facebook.net',
  'ads.linkedin.com',
  'ads.twitter.com',
  'static.ads-twitter.com',
  'criteo.com',
  'criteo.net',
  'taboola.com',
  'outbrain.com',
  'adroll.com',
  // Session recording and behaviour analytics
  'hotjar.com',
  'fullstory.com',
  'clarity.ms',
  'smartlook.com',
  'logrocket.com',
  'mouseflow.com',
  'inspectlet.com',
  'crazyegg.com',
  'luckyorange.com',
]);

/*
 * Every hostname-looking token in the text, so the denylist is matched on
 * host boundaries instead of on bare substrings.
 */
function hostTokens(text) {
  return text.match(/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}/gi) ?? [];
}

function deniedTrackerHost(text) {
  for (const token of hostTokens(text)) {
    const host = token.toLowerCase().replace(/\.$/, '');
    const denied = TRACKER_HOSTS.find(
      (entry) => host === entry || host.endsWith(`.${entry}`),
    );
    if (denied) {
      return { host };
    }
  }
  return null;
}

test('nessun host di tracciamento, pubblicità o registrazione sessione compare nel sito', () => {
  for (const file of shippedFilesOnDisk()) {
    const text = readFileSync(join(SITE, file), 'utf8');
    const hit = deniedTrackerHost(text);
    assert.ok(
      !hit,
      `${file} nomina un host in denylist: ${hit?.host ?? ''}`,
    );
  }
});

/*
 * The counter is one script and one fallback pixel. The script reads the
 * source, the region and the four clicks; the pixel in <noscript> counts a
 * reader without JavaScript and is never rendered when scripting is on. The
 * test pins both services and the privacy attributes so the line cannot
 * quietly become another vendor.
 */
test('c’è un solo contatore: uno script esterno e un pixel di riserva senza JavaScript', () => {
  const document = loadSite();

  const scripts = [...document.querySelectorAll('script')];
  assert.equal(scripts.length, 1, 'la pagina non ha un solo script');
  const script = scripts[0];
  const rawSrc = script.getAttribute('src') ?? '';
  assert.ok(rawSrc, 'lo script del contatore non ha src');
  const src = new URL(rawSrc);
  assert.equal(src.protocol, 'https:', 'lo script del contatore non usa HTTPS');
  assert.equal(
    src.hostname,
    'gc.zgo.at',
    `lo script non è su gc.zgo.at: ${src.hostname}`,
  );
  assert.equal(src.pathname, '/count.js', 'lo script non è count.js');

  const rawEndpoint = script.getAttribute('data-goatcounter') ?? '';
  assert.ok(rawEndpoint, 'lo script non ha l’endpoint del contatore');
  const endpoint = new URL(rawEndpoint);
  assert.equal(endpoint.protocol, 'https:', 'il contatore non usa HTTPS');
  assert.match(
    endpoint.hostname,
    /^[a-z0-9-]+\.goatcounter\.com$/,
    `il contatore non è su GoatCounter: ${endpoint.hostname}`,
  );
  assert.equal(endpoint.pathname, '/count', 'il contatore non usa /count');
  assert.ok(script.hasAttribute('async'), 'lo script del contatore non è async');
  assert.equal(script.textContent.trim(), '', 'lo script contiene codice inline');
  assert.equal(
    document.body.lastElementChild,
    script,
    'lo script non è l’ultimo elemento del corpo',
  );

  const counters = [
    ...document.querySelectorAll('img[src*="goatcounter.com/count"]'),
  ];
  assert.equal(counters.length, 1, 'la pagina non ha un pixel di riserva');

  const counter = counters[0];
  const fallback = counter.closest('noscript');
  assert.ok(fallback, 'il pixel di riserva non sta in noscript');
  assert.ok(
    document.querySelector('.colophon')?.contains(fallback),
    'il pixel di riserva non sta nel colophon',
  );

  const raw = counter.getAttribute('src') ?? '';
  assert.ok(raw, 'il pixel di riserva non ha src');
  const url = new URL(raw);
  assert.equal(url.protocol, 'https:', 'il pixel di riserva non usa HTTPS');
  assert.match(
    url.hostname,
    /^[a-z0-9-]+\.goatcounter\.com$/,
    `il pixel di riserva non è su GoatCounter: ${url.hostname}`,
  );
  assert.equal(url.pathname, '/count', 'il pixel di riserva non usa /count');
  assert.equal(
    url.searchParams.get('p'),
    '/',
    'il pixel di riserva non conta la pagina',
  );
  assert.equal(
    counter.getAttribute('alt'),
    '',
    'il pixel di riserva non è decorativo',
  );
  assert.equal(
    counter.getAttribute('width'),
    '1',
    'il pixel di riserva non è largo un pixel',
  );
  assert.equal(
    counter.getAttribute('height'),
    '1',
    'il pixel di riserva non è alto un pixel',
  );
  assert.equal(
    counter.getAttribute('referrerpolicy'),
    'no-referrer',
    'il pixel di riserva può inviare il Referer',
  );

  const externalImages = [...document.querySelectorAll('img')].filter((image) =>
    /^https?:\/\//i.test(image.getAttribute('src') ?? ''),
  );
  assert.equal(
    externalImages.length,
    1,
    'la pagina fa altre richieste immagine esterne',
  );
  assert.equal(
    externalImages[0],
    counter,
    'la richiesta immagine esterna non è il pixel di riserva',
  );
});

test('i quattro link misurano il clic: la mappa, la locandina, Instagram e Facebook', () => {
  const document = loadSite();
  const clickable = [...document.querySelectorAll('[data-goatcounter-click]')];
  assert.equal(
    clickable.length,
    4,
    'la pagina non misura esattamente quattro clic',
  );

  const map = document.querySelector('a[href^="https://www.google.com/maps/"]');
  assert.ok(map, 'manca il link alla mappa');
  assert.equal(map.getAttribute('data-goatcounter-click'), 'apri-mappa');
  assert.equal(map.getAttribute('data-goatcounter-title'), 'Apri la mappa');

  const download = document.querySelector('a[download]');
  assert.ok(download, 'manca il link alla locandina');
  assert.equal(
    download.getAttribute('data-goatcounter-click'),
    'scarica-locandina',
  );
  assert.equal(
    download.getAttribute('data-goatcounter-title'),
    'Scarica la locandina',
  );

  const profiles = PROFILES.map(({ name, href, click, title }) => {
    const anchor = document.querySelector(`a[href="${href}"]`);
    assert.ok(anchor, `manca il link a ${name}`);
    assert.equal(
      anchor.getAttribute('data-goatcounter-click'),
      click,
      `il clic su ${name} non è misurato come ${click}`,
    );
    assert.equal(
      anchor.getAttribute('data-goatcounter-title'),
      title,
      `il clic su ${name} non è intitolato "${title}"`,
    );
    return anchor;
  });

  // The two profiles are the band's last actions, after the Locandina.
  const actions = [...document.querySelectorAll('.band__actions a')];
  assert.deepEqual(
    actions.slice(-2),
    profiles,
    'i profili non chiudono le azioni della banda dopo la Locandina',
  );
  assert.equal(
    actions[actions.length - 3],
    download,
    'i profili non seguono il download della Locandina',
  );
});

/*
 * The two profile actions are icon-only: the anchor carries the name, the
 * glyph is decoration. The glyph is inline SVG in `currentColor`, so the band's
 * ink roles reach it and the page makes no request for it.
 */
test('i profili sono icone in linea, senza testo visibile e con nome accessibile', () => {
  const document = loadSite();

  for (const { href, name } of PROFILES) {
    const anchor = document.querySelector(`a[href="${href}"]`);
    assert.ok(anchor, `manca il link a ${name}`);
    assert.ok(
      document.querySelector('.band__actions').contains(anchor),
      `il link a ${name} non sta nelle azioni della banda`,
    );
    assert.equal(
      anchor.getAttribute('target'),
      '_blank',
      `il link a ${name} non si apre in un nuovo contesto`,
    );
    assert.equal(
      anchor.getAttribute('rel'),
      'noopener noreferrer',
      `il link a ${name} non è isolato dal contesto che apre`,
    );
    assert.equal(
      accessibleName(document, anchor),
      name,
      `il link a ${name} non ha il nome accessibile "${name}"`,
    );
    assert.equal(
      normalize(anchor.textContent),
      '',
      `il link a ${name} porta testo visibile`,
    );
    assert.equal(
      anchor.querySelectorAll('img, picture, object, embed').length,
      0,
      `il link a ${name} carica un'immagine invece di un'icona in linea`,
    );

    const icon = anchor.querySelector('svg');
    assert.ok(icon, `il link a ${name} non contiene un'icona SVG`);
    assert.equal(
      [...anchor.children].filter(
        (child) => child.tagName.toLowerCase() === 'svg',
      ).length,
      1,
      `il link a ${name} non ha una sola icona in linea`,
    );
    assert.equal(
      icon.getAttribute('aria-hidden'),
      'true',
      `l'icona di ${name} non è nascosta alle tecnologie assistive`,
    );
    assert.equal(
      icon.getAttribute('focusable'),
      'false',
      `l'icona di ${name} può ricevere il focus`,
    );

    const shapes = [
      ...icon.querySelectorAll('path, circle, rect, line, polyline, polygon'),
    ];
    assert.ok(shapes.length > 0, `l'icona di ${name} non disegna nulla`);
    for (const shape of shapes) {
      const inks = [shape.getAttribute('fill'), shape.getAttribute('stroke')]
        .filter((ink) => ink && ink !== 'none');
      assert.ok(inks.length > 0, `l'icona di ${name} non inchiostra una forma`);
      for (const ink of inks) {
        assert.equal(
          ink,
          'currentColor',
          `l'icona di ${name} non inchiostra con currentColor: ${ink}`,
        );
      }
      assert.doesNotMatch(
        shape.outerHTML,
        /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/,
        `l'icona di ${name} porta un colore grezzo`,
      );
    }
    assert.doesNotMatch(
      icon.outerHTML,
      /<(?:image|use)\b|\bhref=|\bxlink:href=|url\(|https?:\/\//i,
      `l'icona di ${name} richiede una risorsa fuori da sé`,
    );
    assert.equal(
      anchor.querySelectorAll('[src], [srcset]').length,
      0,
      `il link a ${name} nomina una risorsa`,
    );
  }
});

test('i profili hanno un bersaglio di almeno 44 px e restano azioni della banda', () => {
  const css = stripCssComments(servedStylesheet());

  const groupRule = css.match(/\.band__social\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(groupRule, 'i profili non hanno un gruppo nella banda');
  assert.match(
    groupRule,
    /(?:^|;)\s*display\s*:\s*flex/,
    'i profili non stanno in fila, come un gruppo di icone',
  );
  assert.match(
    groupRule,
    /(?:^|;)\s*gap\s*:\s*var\(--space-3\)/,
    'i profili non hanno la spaziatura delle azioni',
  );

  const targetRule =
    css.match(/\.band__social\s+a\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(targetRule, 'i profili non hanno una regola di bersaglio');
  const inline = targetRule.match(
    /(?:^|;)\s*(?:min-)?inline-size\s*:\s*(\d+)px/,
  );
  assert.ok(inline, 'il bersaglio dei profili non dichiara la larghezza');
  assert.ok(
    Number(inline[1]) >= 44,
    `il bersaglio dei profili è largo ${inline[1]} px, sotto i 44`,
  );
  const block = targetRule.match(
    /(?:^|;)\s*(?:min-)?block-size\s*:\s*(\d+)px/,
  );
  assert.ok(block, 'il bersaglio dei profili non dichiara l’altezza');
  assert.ok(
    Number(block[1]) >= 44,
    `il bersaglio dei profili è alto ${block[1]} px, sotto i 44`,
  );
  assert.match(targetRule, /(?:^|;)\s*display\s*:\s*inline-flex/, 'l’icona non è centrata nel bersaglio');
  assert.match(targetRule, /(?:^|;)\s*align-items\s*:\s*center/, 'l’icona non è centrata in verticale');
  assert.match(targetRule, /(?:^|;)\s*justify-content\s*:\s*center/, 'l’icona non è centrata in orizzontale');
  // The typographic actions keep room between the text and the rule; the icon
  // resets it, or the inherited space would push the glyph off centre.
  assert.match(
    targetRule,
    /(?:^|;)\s*padding-block-end\s*:\s*0/,
    'il bersaglio dei profili eredita lo spazio del testo e decentra l’icona',
  );

  // The band's ink shift is what hover and focus do to its actions, and the
  // glyph reads `currentColor`, so the shift reaches it without a rule of its
  // own.
  const hoverRule =
    css.match(
      /\.band__actions a:hover,\s*\.band__actions a:focus-visible\s*\{([^}]*)\}/s,
    )?.[1] ?? '';
  assert.ok(hoverRule, 'le azioni della banda non hanno uno stato di hover');
  assert.match(
    hoverRule,
    /(?:^|;)\s*color\s*:\s*var\(--link-hover\)/,
    'hover e focus non cambiano l’inchiostro dell’azione',
  );
});

test('il colophon dichiara il contatore e dove leggere l’informativa', () => {
  const document = loadSite();
  const line = document.querySelector('.colophon .colophon__counter');
  assert.ok(line, 'il colophon non dichiara il contatore');
  assert.match(
    normalize(line.textContent),
    /Le visite sono contate senza cookie da GoatCounter/i,
    'la dichiarazione non dice che il contatore è senza cookie',
  );
  const link = line.querySelector(
    'a[href="https://www.goatcounter.com/help/privacy"]',
  );
  assert.ok(link, 'la dichiarazione non linka l’informativa del contatore');
  assert.match(
    normalize(link.textContent),
    /informativa/i,
    'il link non dice che porta all’informativa',
  );
  const rel = (link.getAttribute('rel') ?? '').split(/\s+/);
  assert.ok(rel.includes('noopener'), 'il link non ha rel="noopener"');
  assert.ok(rel.includes('noreferrer'), 'il link non ha rel="noreferrer"');
  assert.equal(
    link.getAttribute('target'),
    '_blank',
    'il link non apre un nuovo contesto',
  );
});

test('il contatore è fuori dal flusso e invisibile', () => {
  const css = stripCssComments(servedStylesheet());
  const rule = css.match(/\.counter\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.match(rule, /position:\s*absolute/, 'il contatore resta nel flusso');
  assert.match(rule, /clip-path:\s*inset\(50%\)/, 'il contatore è visibile');
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

test('la data sta fra l’immagine di apertura e la fotografia della cantina, che precede la prosa', () => {
  const document = loadSite();
  const header = document.querySelector('header');
  const hero = document.querySelector('.hero-photo picture img');
  const date = document.querySelector('section[aria-label="Data e ora"]');
  const band = document.querySelector('.photo-band');
  const picture = band?.querySelector('picture');
  const photo = picture?.querySelector('img');
  const prose = document.querySelector('.cantina');
  const page = document.querySelector('main.page');

  assert.ok(header, 'manca la testata della pagina');
  assert.ok(hero, 'manca l’immagine di apertura');
  assert.ok(date, 'manca il blocco della data');
  assert.ok(picture, 'la fotografia della cantina non è servita dentro un elemento picture');
  assert.ok(photo, 'manca la fotografia della cantina');
  assert.ok(prose, 'manca la prosa delle Cantine');
  assert.ok(page, 'manca la pagina');

  const elements = [...document.querySelectorAll('*')];
  const headerAt = elements.indexOf(header);
  const heroAt = elements.indexOf(hero);
  const photoAt = elements.indexOf(photo);
  const dateAt = elements.indexOf(date);
  const proseAt = elements.indexOf(prose);
  assert.ok(headerAt < heroAt, 'l’immagine di apertura non segue la testata');
  assert.ok(heroAt < dateAt, 'la data non segue l’immagine di apertura');
  assert.ok(dateAt < photoAt, 'la fotografia della cantina non segue la data');
  assert.ok(photoAt < proseAt, 'la fotografia della cantina non precede la prosa');
  for (const element of [header, hero, date, photo, prose]) {
    assert.ok(
      page.contains(element),
      'un blocco della pagina non è dentro la colonna',
    );
  }

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

test('la fotografia della cantina offre una sorgente di almeno 2048 px e dichiara la misura della pagina', () => {
  const document = loadSite();
  const picture = document.querySelector('.photo-band picture');
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
    'la sorgente non dichiara la larghezza della pagina',
  );
  assert.equal(
    photo.getAttribute('sizes'),
    PHOTO_SIZES,
    'il ripiego non dichiara la larghezza della pagina',
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

/*
 * The opening photograph is the cover. It shares the page's first row with
 * the masthead, which sits at its foot, inside the shell, on a bordeaux scrim.
 * The masthead reads the on-photo roles; both were measured on the crop's
 * brightest pixel behind it, not assumed. On a phone the crop keeps 4:5; from
 * 64 rem it widens to a cover.
 */
test('l’immagine di apertura è la copertina, con la testata su una velatura bordeaux', () => {
  const document = loadSite();
  const css = stripCssComments(servedStylesheet());
  const layout = layerBlock(css, 'layout');
  const components = layerBlock(css, 'components');

  const hero = document.querySelector('.hero-photo');
  const header = document.querySelector('header.masthead');
  assert.ok(hero, 'manca l’immagine di apertura');
  assert.ok(header, 'manca la testata');

  // The two share the first row: the signature is set on the photograph.
  const shared =
    layout.match(/\.masthead,\s*\.hero-photo\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(shared, 'la testata e l’apertura non condividono una regola');
  assert.match(
    shared,
    /grid-row:\s*1\s*;/,
    'la testata e l’apertura non condividono la riga',
  );
  assert.match(
    shared,
    /grid-column:\s*1\s*;/,
    'la testata e l’apertura non condividono la colonna',
  );

  // The masthead is the later layer, at the photograph's foot, on the shell.
  const mastheadLayer = layout.match(/\.masthead\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.match(
    mastheadLayer,
    /z-index:\s*2\s*;/,
    'la testata non sta sopra l’immagine',
  );
  assert.match(
    mastheadLayer,
    /align-self:\s*end\s*;/,
    'la testata non sta in basso sulla copertina',
  );
  assert.match(
    mastheadLayer,
    /padding-inline:\s*var\(--shell-pad\)/,
    'la testata non sta sulla shell della pagina',
  );

  // The scrim: bordeaux rising from the foot of the photograph, anchored to
  // the masthead so it holds behind the type at every width.
  const scrim = components.match(/\.masthead::before\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.ok(scrim, 'manca la velatura della copertina');
  assert.match(
    scrim,
    /linear-gradient\(\s*to top/,
    'la velatura non sale dal piede della fotografia',
  );
  assert.match(
    scrim,
    /color-mix\(in srgb,\s*var\(--strong\)\s*86%,\s*transparent\)/,
    'la velatura non è il bordeaux della superficie forte',
  );
  assert.match(
    scrim,
    /inset-block:\s*calc\(-1\s*\*\s*var\(--space-8\)\)\s*0/,
    'la velatura non è ancorata alla testata e scende con essa',
  );
  assert.match(scrim, /z-index:\s*-1\s*;/, 'la velatura non sta dietro la testata');
  assert.match(scrim, /pointer-events:\s*none/, 'la velatura intercetta il puntatore');

  // The masthead takes the on-photo roles: cream and cream-light, measured on
  // the crop's brightest pixel.
  const mastheadInk = components.match(/\.masthead\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.match(
    mastheadInk,
    /--ink:\s*var\(--on-photo\)/,
    'la testata non legge l’inchiostro della copertina',
  );
  assert.match(
    mastheadInk,
    /--ink-muted:\s*var\(--on-photo-soft\)/,
    'il sottotitolo non legge l’inchiostro attenuato della copertina',
  );
  const tokens = layerBlock(css, 'tokens');
  for (const role of ['on-photo', 'on-photo-soft']) {
    assert.match(
      tokens,
      new RegExp(`--${role}\\s*:\\s*var\\(--[a-z-]+\\)\\s*;`),
      `manca il ruolo --${role}`,
    );
  }

  // The scrim's weakest stop is measured, not assumed: both on-photo roles
  // must clear AA over the scrim composited on a pure-white photograph pixel.
  const scrimAlphas = [...scrim.matchAll(/var\(--strong\)\s*(\d+)%/g)].map(
    (match) => Number(match[1]),
  );
  assert.ok(scrimAlphas.length >= 2, 'la velatura non dichiara le sue fermate');
  const hold = Math.min(...scrimAlphas) / 100;
  const bordeaux = rgb(paletteToken('bordeaux'));
  const scrimOnWhite = `#${['r', 'g', 'b']
    .map((channel) =>
      Math.round(hold * bordeaux[channel] + (1 - hold) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
  for (const role of ['cream', 'cream-light']) {
    assert.ok(
      contrastRatio(paletteToken(role), scrimOnWhite) >= 4.5,
      `il ${role} sulla velatura non raggiunge il rapporto 4.5:1`,
    );
  }

  // The crops: the phone's 4:5, the desktop's wide cover.
  assert.match(
    components,
    /\.hero-photo img\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*5/s,
    'l’immagine di apertura non è ritagliata 4:5 sul telefono',
  );
  assert.match(
    desktopComposition(css),
    /\.hero-photo img\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*2/s,
    'la copertina desktop non ha il ritaglio largo',
  );
});

test('l’immagine di apertura è il grappolo, servito in tre misure e descritto', () => {
  const document = loadSite();
  const hero = document.querySelector('.hero-photo picture img');
  assert.ok(hero, 'manca l’immagine di apertura');

  assert.equal(hero.getAttribute('src'), '/assets/img/svino-uva-768.jpg');
  assert.equal(hero.getAttribute('width'), '768');
  assert.equal(hero.getAttribute('height'), '1024');
  assert.equal(normalize(hero.getAttribute('alt') ?? ''), HERO_ALT);
  assert.ok(
    !/Turania/i.test(hero.getAttribute('alt') ?? ''),
    'l’immagine di apertura è presentata come un luogo reale',
  );

  const webp = document.querySelector(
    '.hero-photo source[type="image/webp"][srcset]',
  );
  assert.ok(webp, 'manca la sorgente WebP dell’apertura');
  assert.equal(webp.getAttribute('sizes'), HERO_SIZES);
  assert.equal(hero.getAttribute('sizes'), HERO_SIZES);

  const candidates = parseSrcset(hero.getAttribute('srcset') ?? '');
  assert.deepEqual(
    candidates.map((candidate) => candidate.width),
    [768, 1152, 1536],
    'l’apertura non è servita nelle tre misure dell’ingrandimento',
  );
  assert.deepEqual(
    parseSrcset(webp.getAttribute('srcset')).map((candidate) => candidate.width),
    [768, 1152, 1536],
    'le copie WebP non seguono le misure del JPEG',
  );

  for (const candidate of candidates) {
    const { file, url } = siteFileFor(candidate.url);
    assert.match(url.pathname, /\.jpe?g$/i, 'una copia dell’apertura non è un JPEG');
    const frame = jpegFrame(readFileSync(file));
    assert.equal(
      frame.width,
      candidate.width,
      'la copia dichiarata non ha la larghezza dichiarata',
    );
    assert.equal(frame.components, 3, 'l’apertura non è RGB');
    assert.ok(
      Math.abs(frame.width / frame.height - 3 / 4) < 0.002,
      'l’apertura non tiene il 3:4 del grappolo',
    );
  }

  for (const candidate of parseSrcset(webp.getAttribute('srcset'))) {
    const bytes = readFileSync(siteFileFor(candidate.url).file);
    assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
    assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
  }
});

test('la galleria chiude la pagina con quattro fotografie descritte e leggere', () => {
  const document = loadSite();
  const gallery = document.querySelector('.gallery');
  const prose = document.querySelector('.cantina');
  const band = document.querySelector('footer.band');
  assert.ok(gallery, 'manca la galleria delle cantine');
  assert.ok(prose, 'manca la prosa delle Cantine');
  assert.ok(band, 'manca la banda che chiude la pagina');

  const elements = [...document.querySelectorAll('*')];
  const proseAt = elements.indexOf(prose);
  const galleryAt = elements.indexOf(gallery);
  const bandAt = elements.indexOf(band);
  assert.ok(proseAt < galleryAt, 'la galleria non segue la prosa');
  assert.ok(galleryAt < bandAt, 'la galleria non precede la banda');

  // No visible copy joins the photographs: no heading, no caption.
  assert.equal(gallery.querySelector('h2, h3, figcaption'), null);

  const frames = [...gallery.querySelectorAll('figure.gallery__frame')];
  assert.equal(frames.length, GALLERY_PHOTOS.length, 'la galleria non ha quattro fotografie');
  const wide = frames.filter((frame) => frame.classList.contains('gallery__frame--wide'));
  assert.equal(wide.length, 1, 'la galleria non ha una sola fotografia orizzontale');
  assert.equal(
    gallery.querySelectorAll('.gallery__row figure.gallery__frame').length,
    GALLERY_PHOTOS.length - 1,
    'le fotografie verticali non stanno tutte nella fila',
  );

  const images = frames.map((frame) => frame.querySelector('picture img'));
  for (const [index, image] of images.entries()) {
    const photo = GALLERY_PHOTOS[index];
    assert.ok(image, `manca la fotografia ${photo.src}`);
    assert.equal(
      normalize(image.getAttribute('alt') ?? ''),
      photo.alt,
      `la descrizione della fotografia ${photo.src} non è quella approvata`,
    );
    assert.ok(
      !/Turania/i.test(image.getAttribute('alt') ?? ''),
      'una fotografia della galleria è presentata come un luogo reale',
    );
    assert.equal(image.getAttribute('width'), String(photo.width));
    assert.equal(image.getAttribute('height'), String(photo.height));
    assert.equal(image.getAttribute('loading'), 'lazy', 'una fotografia non è caricata sotto la piega');
    assert.equal(image.getAttribute('decoding'), 'async', 'una fotografia non decodifica in asincrono');
    assert.equal(image.getAttribute('fetchpriority'), null, 'una fotografia contende la priorità alla copertina');

    const picture = image.closest('picture');
    const webp = picture.querySelector('source[type="image/webp"][srcset]');
    assert.ok(webp, `manca la sorgente WebP di ${photo.src}`);
    assert.ok(
      siteFileFor(webp.getAttribute('srcset')).file === siteFileFor(photo.webp).file,
      `la sorgente WebP di ${photo.src} non è quella dichiarata`,
    );

    const jpeg = siteFileFor(image.getAttribute('src'));
    assert.match(jpeg.url.pathname, /\.jpe?g$/i, `il ripiego di ${photo.src} non è un JPEG`);
    const frame = jpegFrame(readFileSync(jpeg.file));
    assert.deepEqual(
      { width: frame.width, height: frame.height, components: frame.components },
      { width: photo.width, height: photo.height, components: 3 },
      `il JPEG di ${photo.src} non è RGB ${photo.width}×${photo.height}`,
    );

    const webpBytes = readFileSync(siteFileFor(photo.webp).file);
    assert.equal(webpBytes.subarray(0, 4).toString('ascii'), 'RIFF');
    assert.equal(webpBytes.subarray(8, 12).toString('ascii'), 'WEBP');
  }

  // The gallery adds no torn edge and no panel: only the Cantina band tears.
  const css = stripCssComments(servedStylesheet());
  const galleryRules = layerBlock(css, 'layout').match(/\.gallery[\s\S]*?(?=\n\s*\})/)?.[0] ?? '';
  assert.doesNotMatch(galleryRules, /clip-path/, 'la galleria si arroga uno strappo');

  // On a phone the row is a pair and the last portrait closes it at full
  // width. The condition is the gallery's own content box, not a viewport
  // threshold: assertDesktopComposition guards the page's breakpoints.
  const layout = layerBlock(css, 'layout');
  assert.match(
    layout,
    /\.gallery\s*\{[^}]*container-type:\s*inline-size/,
    'la galleria non è un contenitore: la sua composizione da telefono guarderebbe il viewport',
  );
  const phone = atRuleBlocks(layout, '@container\\s*\\(max-width:\\s*37rem\\)');
  assert.equal(phone.length, 1, 'la galleria non ha una composizione da telefono');
  const phoneRules = layout.slice(phone[0].start, phone[0].end + 1);
  assert.match(
    phoneRules,
    /\.gallery__row\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
    'la fila delle verticali resta a una colonna sul telefono',
  );
  assert.match(
    phoneRules,
    /\.gallery__row\s*>\s*\.gallery__frame:last-child\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/,
    'l’ultima fotografia non chiude la galleria a piena larghezza',
  );

  const preloads = [...document.querySelectorAll('link[rel~="preload"]')];
  assert.equal(
    preloads.filter((link) => /svino-(?:uva|botte|cantina-vale|cantina-pietro|torchio)/.test(link.getAttribute('href') ?? '')).length,
    0,
    'una fotografia della galleria è precaricata',
  );
});

test('la pagina ha una shell e una sola composizione desktop', () => {
  const css = stripCssComments(servedStylesheet());
  assertDesktopComposition(css);

  const tokens = layerBlock(css, 'tokens');
  assert.match(tokens, /--shell\s*:\s*76rem\s*;/, 'la shell non è 76 rem');
  assert.match(tokens, /--measure\s*:\s*48rem\s*;/, 'la misura della prosa non è 48 rem');
  assert.match(
    tokens,
    /--gutter\s*:\s*clamp\(/,
    'il margine della pagina non è fluido',
  );
  assert.match(
    tokens,
    /--shell-pad\s*:\s*max\(var\(--gutter\),\s*calc\(\(100%\s*-\s*var\(--shell\)\)\s*\/\s*2\)\)/,
    'la shell non calcola il proprio inset',
  );

  const layout = layerBlock(css, 'layout');
  assert.match(
    layout,
    /\.page\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s,
    'la pagina non è una griglia a piena larghezza',
  );
  assert.doesNotMatch(
    layout,
    /\.page\s*\{[^}]*max-inline-size/s,
    'la pagina conserva una misura: è ancora una colonna',
  );
});

test('la fotografia esce dai margini della pagina a ogni larghezza', () => {
  const css = stripCssComments(servedStylesheet());
  assertDesktopComposition(css);
  const layout = layerBlock(css, 'layout');

  /*
   * The page is the viewport, so the photograph bleeds by occupying the grid's
   * whole column. It declares no measure of its own and no negative margin —
   * the old trick for escaping a column that no longer exists.
   */
  assert.match(
    layout,
    /\.page\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s,
    'la pagina non è a piena larghezza',
  );

  const band = layout.match(/\.photo-band\s*\{([^}]*)\}/s);
  assert.ok(band, 'manca la banda della fotografia');
  assert.match(
    band[1],
    /inline-size:\s*100%/,
    'la fotografia non occupa la larghezza della pagina',
  );
  assert.match(
    band[1],
    /margin:\s*0/,
    'la fotografia conserva un margine laterale',
  );
  assert.doesNotMatch(
    band[1],
    /\d(?:vw|vmin|vmax)\b/,
    'la fotografia si dimensiona con il viewport e può scorrere in orizzontale',
  );
});

test('l’immagine di apertura ha alta priorità, la cantina no, e nessuna è precaricata', () => {
  const document = loadSite();
  const hero = document.querySelector('.hero-photo picture img');
  const cantina = document.querySelector('.photo-band picture img');
  assert.ok(hero, 'manca l’immagine di apertura');
  assert.ok(cantina, 'manca la fotografia della cantina');

  assert.equal(
    hero.getAttribute('decoding'),
    'async',
    'l’immagine di apertura non decodifica in asincrono',
  );
  assert.equal(
    hero.getAttribute('fetchpriority'),
    'high',
    'l’immagine di apertura non ha alta priorità di caricamento',
  );
  assert.equal(
    cantina.getAttribute('decoding'),
    'async',
    'la fotografia della cantina non decodifica in asincrono',
  );
  assert.equal(
    cantina.getAttribute('fetchpriority'),
    'low',
    'la fotografia della cantina non cede la priorità all’apertura',
  );

  const preloads = [...document.querySelectorAll('link[rel~="preload"]')].filter(
    (link) =>
      link.getAttribute('as') === 'image' ||
      /svino-(?:cantina|borgo)/.test(link.getAttribute('href') ?? ''),
  );
  assert.deepEqual(
    preloads.map((link) => link.getAttribute('href')),
    [],
    'un’immagine è precaricata: il preload duplica il caricamento',
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
});

/*
 * Third of the three narrow guards. It keeps the unlicensed demo font out of
 * the site and every font request on the origin: no Breathing file, no
 * shipped signature file, no Google Fonts host, no external font load from
 * the page, stylesheet or their imports, and every @font-face resolving to a
 * local WOFF2.
 */
test('il font Breathing, la firma spedita e i font fuori sede restano fuori dal sito', () => {
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

  const fontFiles = shippedFilesOnDisk().filter((file) =>
    /\.(?:woff2?|ttf|otf)$/i.test(file),
  );
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
  // A font can also be fetched around the stylesheet: an inline url(http...)
  // in a style attribute or style element, or an external @import.
  assert.doesNotMatch(
    html,
    /url\(\s*['"]?(?:https?:)?\/\//i,
    'la pagina richiede un font da un host esterno',
  );
  assert.doesNotMatch(
    html,
    /@import\s+(?:url\(\s*)?['"]?\s*(?:https?:)?\/\//i,
    'la pagina importa un foglio di stile da un host esterno',
  );
  /*
   * Or through a link: a preload/prefetch of a font file, or a stylesheet,
   * which is where @font-face is declared. Those stay on the origin, so a
   * font CDN cannot slip in beside the local stylesheet.
   */
  for (const link of loadSite().querySelectorAll('link[href]')) {
    const href = (link.getAttribute('href') ?? '').trim();
    if (!/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(href)) {
      continue;
    }
    const rel = (link.getAttribute('rel') ?? '').toLowerCase().split(/\s+/);
    const type = (link.getAttribute('type') ?? '').toLowerCase();
    const as = (link.getAttribute('as') ?? '').toLowerCase();
    assert.ok(
      !(type.startsWith('font/') || as === 'font' || rel.includes('stylesheet')),
      `la pagina carica un font o un foglio di stile fuori sede: ${href}`,
    );
  }

  const css = servedStylesheet();
  const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/gi)].map(
    (match) => match[1],
  );
  assert.ok(faces.length > 0, 'il foglio di stile non dichiara facce @font-face');

  for (const face of faces) {
    const source = face.match(/src\s*:\s*url\(\s*["']?([^"')]+)["']?\s*\)/i);
    assert.ok(source, `una faccia @font-face non dichiara un src: ${face}`);
    const url = source[1].trim();
    assert.match(url, /\.woff2$/i, `il font non è un WOFF2 locale: ${url}`);
    assert.ok(
      !/^(?:[a-z]+:)?\/\//i.test(url) && !url.startsWith('/'),
      `il font è richiesto fuori sede: ${url}`,
    );
  }

  assert.doesNotMatch(
    css,
    /fonts\.(?:googleapis|gstatic)\.com/i,
    'il foglio di stile nomina Google Fonts',
  );
  assert.doesNotMatch(
    css,
    /url\(\s*['"]?(?:https?:)?\/\//i,
    'il foglio di stile richiede un font da un host esterno',
  );
  assert.doesNotMatch(
    css,
    /@import\s+(?:url\(\s*)?['"]?\s*(?:https?:)?\/\//i,
    'il foglio di stile importa un foglio da un host esterno',
  );
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

test('ogni immagine ha una descrizione testuale, salvo il contatore decorativo', () => {
  const document = loadSite();
  const images = [...document.querySelectorAll('img')];

  assert.ok(images.length > 0, 'la pagina non contiene immagini');
  for (const image of images) {
    const alt = image.getAttribute('alt');
    assert.notEqual(
      alt,
      null,
      `immagine senza attributo alt: ${image.getAttribute('src') ?? '(senza src)'}`,
    );
    if (alt === '') {
      assert.match(
        image.getAttribute('src') ?? '',
        /^https:\/\/[a-z0-9-]+\.goatcounter\.com\/count\?/,
        'solo il contatore può avere un alt vuoto',
      );
      assert.ok(
        image.closest('noscript'),
        'solo il pixel di riserva può avere un alt vuoto',
      );
      assert.equal(image.getAttribute('width'), '1');
      assert.equal(image.getAttribute('height'), '1');
      continue;
    }
    assert.ok(
      normalize(alt).length > 0,
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

test('il movimento della pagina usa i token, lascia fermo l’eroe e ha una via per chi riduce il movimento', () => {
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
   * The entrance is a sequence, not five simultaneous arrivals: every step
   * after the paper waits on a delay token, never on a raw number.
   */
  const stagger = [...css.matchAll(/var\(--motion-after-[a-z-]+\)/g)];
  assert.ok(stagger.length >= 4, 'l’ingresso non è sequenziato');

  /*
   * The photograph is the paper, so it opens by stepping back out of the arch
   * and is never dissolved: every photograph keyframe moves the view, none
   * touches its opacity. The fade was what the page read as a template, and a
   * browser is the only place that can judge it; this guard keeps the rule.
   */
  const photograph = atRuleBlocks(css, '@keyframes\\s+photograph-[\\w-]+\\s*\\{');
  assert.ok(photograph.length > 0, 'manca il movimento della fotografia');
  for (const block of photograph) {
    const body = css.slice(block.start, block.end);
    assert.doesNotMatch(
      body,
      /\bopacity\s*:/,
      'la fotografia sfuma invece di arretrare',
    );
    assert.match(body, /transform\s*:\s*scale\(/, 'la fotografia non arretra');
  }

  /*
   * Every duration and delay comes from the motion tokens, in the shorthand
   * above, in any duration or delay longhand, and in the base transitions. The
   * reduce block's `transition: none` is the one exception: it is how the page
   * stands still.
   */
  const durations = [
    ...css.matchAll(
      /(?:^|[;{\s])(animation-duration|animation-delay|transition-duration|transition)\s*:\s*([^;}]+)/g,
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
      `il tempo di ${property} non usa un token: ${value}`,
    );
    assert.doesNotMatch(
      value,
      /\d+(?:\.\d+)?m?s\b/,
      `il tempo di ${property} è un numero magico: ${value}`,
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
   * The page reveals only the Cantina photograph, the prose and Programma, the
   * gallery and the band as they enter the viewport. The hero — the signature,
   * its lockup and subtitle, and the date — is present on the first screen and
   * never waits for the scroll. Its one scroll effect is the grapes' drift,
   * which is transform-only and never hides the cover.
   */
  const rules = stripCssComments(css);
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

  const HERO_DRIFT = /\.hero-photo\s+picture\b/;
  for (const selector of reveals) {
    if (HERO_DRIFT.test(selector)) {
      continue;
    }
    assert.doesNotMatch(
      selector,
      /(?:\.masthead|\.signature|\.lockup|\.subtitle|\.date|\.hero-photo)\b/,
      `l’eroe ha un reveal scroll: ${selector}`,
    );
    assert.match(
      selector,
      /\.(?:cantina|apertura)(?:__[a-z]+)?\b|\.facts\b|\.band__actions\b|\.photo-band\b|\.gallery__frame\b/,
      `il reveal scroll è fuori dalla fotografia, dalla prosa, dalla galleria e dalla banda: ${selector}`,
    );
    assert.doesNotMatch(
      selector,
      /\.band__inner\b/,
      'la banda intera sfuma: le azioni non devono stare in un contenitore che sfuma',
    );
  }

  /*
   * The cover's drift is the one hero scroll effect. It rides the picture
   * wrapper, never fades, and keeps a scale margin so the frame's edges stay
   * covered. It is not a reveal: no opacity, no clip.
   */
  assert.equal(
    reveals.filter((selector) => HERO_DRIFT.test(selector)).length,
    1,
    'manca la deriva dell’uva dietro la testata',
  );
  const driftRule =
    rules.match(/\.hero-photo\s+picture\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.match(driftRule, /animation:\s*cover-drift\b/, 'la deriva non è la copertina');
  assert.match(
    driftRule,
    /animation-timeline:\s*view\(\)/,
    'la deriva non segue lo scorrimento',
  );
  assert.match(
    driftRule,
    /animation-range:\s*exit\s+0%\s+exit\s+100%/,
    'la deriva non parte dal primo pixel di scorrimento',
  );
  assert.doesNotMatch(driftRule, /\bopacity\s*:/, 'l’uva sfuma invece di scorrere');

  const driftKeyframes = atRuleBlocks(css, '@keyframes\\s+cover-drift\\s*\\{');
  assert.equal(driftKeyframes.length, 1, 'manca la sequenza della deriva');
  const driftBody = css.slice(driftKeyframes[0].start, driftKeyframes[0].end);
  assert.doesNotMatch(driftBody, /\bopacity\s*:/, 'la deriva dell’uva è una dissolvenza');
  assert.match(
    driftBody,
    /scale\(\s*1\.0[4-9]/,
    'la deriva non tiene il margine della cornice',
  );
  assert.match(driftBody, /translateY\(\s*-?2%\)/, 'la deriva non scorre');

  /*
   * The date's numeral is set into the band with the rest of the press.
   */
  const numeralRule =
    [...rules.matchAll(/\.date-day\s*\{([^}]*)\}/gs)]
      .map((match) => match[1])
      .find((body) => /numeral-set/.test(body)) ?? '';
  assert.match(
    numeralRule,
    /animation:\s*numeral-set\s+var\(--motion-numeral\)/,
    'il numero della data non si posa con un token',
  );
  assert.match(
    numeralRule,
    /var\(--motion-after-paper\)/,
    'il numero non entra con la data',
  );
  const numeralKeyframes = atRuleBlocks(css, '@keyframes\\s+numeral-set\\s*\\{');
  assert.equal(numeralKeyframes.length, 1, 'manca la posa del numero');
  const numeralBody = css.slice(numeralKeyframes[0].start, numeralKeyframes[0].end);
  assert.match(numeralBody, /translateY\(\s*0\.06em\s*\)/, 'il numero non si posa');
  assert.doesNotMatch(numeralBody, /\bopacity\s*:/, 'il numero sfuma invece di posarsi');

  const ruleBodyFor = (selector) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return rules.match(new RegExp(`${escaped}\\s*\\{([^{}]*)\\}`, 's'))?.[1] ?? '';
  };

  /*
   * The prose prints in reading order. The range starts are asserted to be
   * increasing, so a later paragraph cannot arrive before an earlier one.
   */
  const proseOrder = [
    '.apertura__prose > p:nth-of-type(1)',
    '.apertura__prose > p:nth-of-type(2)',
    '.cantina > .programma > p',
  ];
  const proseStarts = proseOrder.map((selector) => {
    const body = ruleBodyFor(selector);
    assert.match(
      body,
      /animation:\s*section-rise\b/,
      `la prosa non sale: ${selector}`,
    );
    const start = body.match(/animation-range:\s*entry\s+(\d+)%/)?.[1];
    assert.ok(start !== undefined, `manca l’intervallo della prosa: ${selector}`);
    return Number(start);
  });
  assert.deepEqual(
    proseStarts,
    [...proseStarts].sort((a, b) => a - b),
    'la prosa non si stampa in ordine',
  );
  assert.equal(
    new Set(proseStarts).size,
    proseStarts.length,
    'la prosa si rivela tutta insieme',
  );

  const labelBody = ruleBodyFor('.cantina > .programma > h2');
  assert.match(
    labelBody,
    /animation:\s*ink-in\b/,
    'l’etichetta del Programma non si inchiostra',
  );
  assert.match(
    labelBody,
    /animation-timeline:\s*view\(\)/,
    'l’etichetta non segue lo scorrimento',
  );

  /*
   * The plate is the drawing between the label and the paragraph: it inks
   * after the label and before the prose, so the section prints in order.
   */
  const plateBody = ruleBodyFor('.cantina > .programma > .programma__plate');
  assert.match(plateBody, /animation:\s*ink-in\b/, 'il fregio non si inchiostra');
  assert.match(
    plateBody,
    /animation-timeline:\s*view\(\)/,
    'il fregio non segue lo scorrimento',
  );
  const plateStart = Number(
    plateBody.match(/animation-range:\s*entry\s+(\d+)%/)?.[1],
  );
  const labelStart = Number(
    labelBody.match(/animation-range:\s*entry\s+(\d+)%/)?.[1],
  );
  assert.ok(
    labelStart < plateStart && plateStart < proseStarts[2],
    'il fregio non si inchiostra fra l’etichetta e il paragrafo',
  );

  /*
   * The gallery recedes lead first, then the portraits left to right.
   */
  const galleryOrder = [
    '.gallery__frame--wide img',
    '.gallery__row > .gallery__frame:nth-child(1) img',
    '.gallery__row > .gallery__frame:nth-child(2) img',
    '.gallery__row > .gallery__frame:nth-child(3) img',
  ];
  const galleryStarts = galleryOrder.map((selector) => {
    const body = ruleBodyFor(selector);
    assert.match(
      body,
      /animation:\s*photograph-recede\b/,
      `la galleria non arretra: ${selector}`,
    );
    const start = body.match(/animation-range:\s*cover\s+(\d+)%/)?.[1];
    assert.ok(start !== undefined, `manca l’intervallo della galleria: ${selector}`);
    return Number(start);
  });
  assert.deepEqual(
    galleryStarts,
    [...galleryStarts].sort((a, b) => a - b),
    'la galleria non va dalla guida ai ritratti',
  );

  /*
   * The facts rise in order and are never hidden; the action rules draw in
   * order. The band itself carries no animation.
   */
  const factsOrder = ['.facts > :nth-child(1)', '.facts > :nth-child(2)'];
  const factStarts = factsOrder.map((selector) => {
    const body = ruleBodyFor(selector);
    assert.match(body, /animation:\s*fact-rise\b/, `i fatti non salgono: ${selector}`);
    assert.doesNotMatch(body, /\bopacity\s*:/, 'i fatti vengono nascosti');
    const start = body.match(/animation-range:\s*entry\s+(\d+)%/)?.[1];
    assert.ok(start !== undefined, `manca l’intervallo dei fatti: ${selector}`);
    return Number(start);
  });
  assert.deepEqual(factStarts, [...factStarts].sort((a, b) => a - b));

  const actionOrder = [
    '.band__actions > p:nth-of-type(1) > a::before',
    '.band__actions > p:nth-of-type(2) > a::before',
    '.band__actions > .band__social > a::before',
  ];
  const actionStarts = actionOrder.map((selector) => {
    const body = ruleBodyFor(selector);
    assert.match(body, /animation:\s*rule-rule\b/, `il filetto non si tira: ${selector}`);
    const start = body.match(/animation-range:\s*entry\s+(\d+)%/)?.[1];
    assert.ok(start !== undefined, `manca l’intervallo del filetto: ${selector}`);
    return Number(start);
  });
  assert.deepEqual(actionStarts, [...actionStarts].sort((a, b) => a - b));
  assert.equal(
    actionStarts[2],
    actionStarts[1],
    'i filetti dei profili non si tirano con la Locandina',
  );
  assert.doesNotMatch(
    rules,
    /\.facts\s*\{[^}]*\bopacity\s*:/s,
    'i fatti sono nascosti dal loro contenitore',
  );
  assert.doesNotMatch(
    rules,
    /\.band(?:__inner|__actions)?\s*\{[^}]*\bopacity\s*:/s,
    'la banda o le azioni vengono nascoste',
  );

  /*
   * Two ways the photograph's reveal was silently still, both invisible to a
   * static check and both found by driving a browser. The frame crops with
   * `clip`: a `hidden` frame is the nearest scroll container, so the image's
   * view() timeline is measured against a box that never scrolls and pins at
   * its end. And the range is measured over the whole crossing (`cover`): on a
   * phone the band is already most of the way through `entry` when the page
   * settles, so the recede is over before it is seen. These two assertions
   * guard the lines that fix it; the rendering itself needs a browser.
   */
  const frame = rules.match(/\.photo-frame\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.match(
    frame,
    /overflow:\s*clip\b/,
    'la cornice crea un contenitore di scorrimento e ferma il reveal della fotografia',
  );
  const photoReveal = rules.match(/\.photo-band\s+img\s*\{([^}]*)\}/s)?.[1] ?? '';
  assert.match(
    photoReveal,
    /animation-range:\s*cover\b/,
    'il reveal della fotografia si misura con entry e finisce prima di essere visto',
  );

  /*
   * Nothing waits for an animation to be usable: the band that holds the two
   * actions never fades as a whole, and focus is immediate.
   */
  const clean = stripCssComments(css);
  assert.doesNotMatch(
    clean,
    /\.band(?:__inner|__actions)?\s*\{[^}]*\banimation\s*:/s,
    'la banda o le sue azioni sfumano: le azioni devono essere subito visibili',
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
