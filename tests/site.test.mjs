import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import { parseHTML } from 'linkedom';

const ROOT = resolve(import.meta.dirname, '..');
const SITE = join(ROOT, '_site');
const SITE_ORIGIN = 'https://svino-turania.github.io';
const MAP_ORIGIN = 'https://www.openstreetmap.org';

const CANTINA_PARAGRAPH =
  'Per la seconda edizione si entra nelle cantine del borgo: si assaggia il vino di Turania e da una cantina si passa alla successiva. Vi aspettiamo.';

const IMAGE_TYPE_BY_EXTENSION = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
]);

function normalize(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function readJpegFrame(bytes) {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    if (marker === 0xda) {
      break;
    }
    if (marker >= 0xd0 && marker <= 0xd7) {
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
  return null;
}

function readImage(bytes, mime) {
  if (mime === 'image/jpeg') {
    assert.deepEqual(
      [...bytes.subarray(0, 3)],
      [0xff, 0xd8, 0xff],
      'il file scaricabile non ha l’intestazione di un JPEG',
    );
    const frame = readJpegFrame(bytes);
    assert.ok(frame, 'il JPEG scaricabile non è un’immagine leggibile');
    return frame;
  }

  if (mime === 'image/png') {
    assert.deepEqual(
      [...bytes.subarray(0, 8)],
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      'il file scaricabile non ha l’intestazione di un PNG',
    );
    return {
      width: bytes.readUInt32BE(16),
      height: bytes.readUInt32BE(20),
      components: null,
    };
  }

  if (mime === 'image/webp') {
    assert.equal(
      bytes.subarray(0, 4).toString('ascii'),
      'RIFF',
      'il file scaricabile non ha l’intestazione di un WebP',
    );
    assert.equal(
      bytes.subarray(8, 12).toString('ascii'),
      'WEBP',
      'il file scaricabile non è un WebP',
    );
    return { width: null, height: null, components: null };
  }

  assert.fail(`tipo di immagine non verificabile: ${mime}`);
}

function loadSite() {
  const file = join(SITE, 'index.html');
  assert.ok(existsSync(file), 'la build non ha prodotto _site/index.html');
  const { document } = parseHTML(readFileSync(file, 'utf8'));
  return document;
}

function metaContent(document, attribute, key) {
  const meta = document.querySelector(`meta[${attribute}="${key}"]`);
  assert.ok(meta, `manca il meta ${attribute}="${key}"`);
  return normalize(meta.getAttribute('content') ?? '');
}

function jpegDimensions(buffer) {
  assert.equal(
    buffer.readUInt16BE(0),
    0xffd8,
    'l’immagine di anteprima non è un JPEG',
  );
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = buffer.readUInt16BE(offset + 2);
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  assert.fail('dimensioni JPEG non trovate');
}

test('la pagina costruita riporta i fatti stampati sulla Locandina', () => {
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

test('il link alla mappa porta a Turania (RI) e si apre in un nuovo contesto sicuro', () => {
  const document = loadSite();
  const link = [...document.querySelectorAll('a[href]')].find((anchor) =>
    anchor.getAttribute('href').includes('openstreetmap'),
  );

  assert.ok(link, 'manca il link fuori sede alla mappa');

  const url = new URL(link.getAttribute('href'));
  assert.equal(
    decodeURIComponent(url.searchParams.get('query') ?? ''),
    'Turania (RI)',
    'la ricerca sulla mappa non punta a Turania (RI)',
  );

  assert.match(normalize(link.textContent), /Turania \(RI\)/);
  assert.equal(link.getAttribute('target'), '_blank');

  const rel = (link.getAttribute('rel') ?? '').split(/\s+/);
  assert.ok(rel.includes('noopener'), 'il link alla mappa non ha rel="noopener"');
  assert.ok(rel.includes('noreferrer'), 'il link alla mappa non ha rel="noreferrer"');
});

test('il download della Locandina è un’immagine dello stesso sito con tipo dichiarato', () => {
  const document = loadSite();
  const link = document.querySelector('a[download]');

  assert.ok(link, 'manca il link per scaricare la Locandina');
  assert.notEqual(
    link.getAttribute('download'),
    null,
    'il link della Locandina non ha l’attributo download',
  );

  const name = normalize(
    link.getAttribute('aria-label') ?? link.textContent ?? '',
  );
  assert.ok(name.length > 0, 'il link della Locandina non ha testo discernibile');
  assert.match(name, /Scarica la Locandina/i, 'il link non dice che scarica la Locandina');

  const href = link.getAttribute('href');
  assert.ok(href, 'il link della Locandina non ha un href');
  assert.ok(
    !/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(href),
    `il download non è un percorso relativo: ${href}`,
  );

  const url = new URL(href, `${SITE_ORIGIN}/`);
  assert.equal(url.origin, SITE_ORIGIN, 'il download punta a un altro host');

  const extension = extname(decodeURIComponent(url.pathname)).toLowerCase();
  const expectedType = IMAGE_TYPE_BY_EXTENSION.get(extension);
  assert.ok(expectedType, `il download non è un’immagine web: ${extension}`);

  assert.equal(
    link.getAttribute('type'),
    expectedType,
    'il tipo dichiarato dal link non corrisponde all’estensione del file',
  );

  const file = join(SITE, decodeURIComponent(url.pathname));
  assert.ok(existsSync(file), `il file scaricabile non esiste nella build: ${url.pathname}`);

  const bytes = readFileSync(file);
  assert.ok(bytes.length > 0, 'il file scaricabile è vuoto');

  const image = readImage(bytes, expectedType);
  assert.ok(
    image.width >= 800 && image.height >= 800,
    `il download è troppo piccolo per essere leggibile: ${image.width}×${image.height}`,
  );
  assert.notEqual(
    image.components,
    4,
    'il download è un’immagine CMYK, non una copia RGB per il web',
  );
});

test('la build non distribuisce PDF, file CMYK o master di stampa', () => {
  const files = readdirSync(SITE, { recursive: true }).map(String);

  for (const name of files) {
    const base = name.split('/').pop().toLowerCase();
    assert.ok(!base.endsWith('.pdf'), `la build contiene un PDF: ${name}`);
    assert.ok(!base.includes('cmyk'), `la build contiene un file CMYK: ${name}`);
    assert.ok(
      !/(svino_a3|print[-_]?ready|(?:^|[-_.])master(?:[-_.]|$))/.test(base),
      `la build contiene un master di stampa: ${name}`,
    );
  }
});

test('modificare un valore in front matter cambia la pagina senza toccare i template', () => {
  const buildDir = mkdtempSync(join(tmpdir(), 'svino-build-'));

  try {
    cpSync(join(ROOT, 'src'), join(buildDir, 'src'), { recursive: true });
    cpSync(
      join(ROOT, 'eleventy.config.js'),
      join(buildDir, 'eleventy.config.js'),
    );

    const entryPath = join(buildDir, 'src', 'index.md');
    const edited = readFileSync(entryPath, 'utf8')
      .replace('date: 2026-12-06', 'date: 2027-01-03')
      .replace('place: "Turania (RI)"', 'place: "Sentinella (ZZ)"')
      .replace('time: "12:00"', 'time: "13:30"')
      .concat('\n## Sezione futura\n\nTesto aggiunto in seguito.\n');
    writeFileSync(entryPath, edited);

    execFileSync(
      process.execPath,
      [join(ROOT, 'node_modules', '@11ty', 'eleventy', 'cmd.cjs'), '--quiet'],
      { cwd: buildDir, stdio: 'pipe' },
    );

    const { document } = parseHTML(
      readFileSync(join(buildDir, '_site', 'index.html'), 'utf8'),
    );
    const text = normalize(document.body.textContent);

    assert.ok(text.includes('Sentinella (ZZ)'), 'il nuovo luogo non appare');
    assert.ok(text.includes('13:30'), 'il nuovo orario non appare');
    assert.ok(text.includes('GENNAIO 2027'), 'la nuova data non appare');
    assert.ok(
      !text.includes('Turania (RI)') && !text.includes('DICEMBRE 2026'),
      'un vecchio valore di front matter è rimasto nella pagina',
    );
    assert.ok(
      text.includes('Sezione futura') && text.includes('Testo aggiunto in seguito.'),
      'una nuova sezione dello stesso entry non finisce nella stessa pagina',
    );

    const routes = readdirSync(join(buildDir, '_site'), { recursive: true })
      .map(String)
      .filter((file) => file.endsWith('.html'));
    assert.deepEqual(routes, ['index.html'], 'la nuova sezione ha creato una rotta');
  } finally {
    rmSync(buildDir, { recursive: true, force: true });
  }
});

test('il documento è italiano, ha un solo titolo principale e link leggibili', () => {
  const document = loadSite();

  assert.equal(document.documentElement.getAttribute('lang'), 'it');

  const title = normalize(document.title);
  assert.ok(title.includes('sVino'), 'il titolo non nomina sVino');
  assert.ok(title.includes('Turania (RI)'), 'il titolo non nomina il luogo');

  const headings = document.querySelectorAll('h1');
  assert.equal(headings.length, 1, 'la pagina deve avere un solo h1');
  assert.ok(normalize(headings[0].textContent).includes('sVino'));

  for (const link of document.querySelectorAll('a[href]')) {
    const name = normalize(
      link.getAttribute('aria-label') ?? link.textContent ?? '',
    );
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
    `l’immagine di anteprima non esiste in _site: ${imageUrl.pathname}`,
  );
  assert.deepEqual(
    jpegDimensions(readFileSync(imageFile)),
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
    'summary_large_image',
  );
  assert.equal(metaContent(document, 'name', 'twitter:title'), title);
  assert.equal(
    metaContent(document, 'name', 'twitter:description'),
    description,
  );
  assert.equal(metaContent(document, 'name', 'twitter:image'), image);
});

test('la pagina è indicizzabile e resta in italiano', () => {
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

test('le sezioni compaiono nell’ordine della Locandina', () => {
  const document = loadSite();
  const text = normalize(document.body.textContent);
  const order = [
    'sVino',
    'Per le cantine di Turania',
    'DICEMBRE 2026',
    'Per la seconda edizione',
    'DALLE ORE',
    'DOVE',
    'A CURA DI',
    'nella mappa',
    'Scarica la Locandina',
  ];

  let previous = -1;
  for (const token of order) {
    const index = text.indexOf(token);
    assert.ok(index >= 0, `manca "${token}"`);
    assert.ok(index > previous, `"${token}" è fuori ordine`);
    previous = index;
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
    const url = new URL(element.getAttribute('src'), `${SITE_ORIGIN}/`);
    assert.equal(
      url.origin,
      SITE_ORIGIN,
      `risorsa di terze parti: ${element.getAttribute('src')}`,
    );
  }

  for (const element of document.querySelectorAll('[srcset]')) {
    for (const candidate of element.getAttribute('srcset').split(',')) {
      const source = candidate.trim().split(/\s+/)[0];
      const url = new URL(source, `${SITE_ORIGIN}/`);
      assert.equal(url.origin, SITE_ORIGIN, `risorsa di terze parti: ${source}`);
    }
  }

  for (const link of document.querySelectorAll('link[href]')) {
    const url = new URL(link.getAttribute('href'), `${SITE_ORIGIN}/`);
    assert.equal(
      url.origin,
      SITE_ORIGIN,
      `risorsa di terze parti: ${link.getAttribute('href')}`,
    );
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

  const files = readdirSync(SITE, { recursive: true }).map(String);
  assert.deepEqual(
    files.filter((file) => file.endsWith('.js')),
    [],
    'la build contiene file JavaScript',
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
  const text = normalize(document.body.textContent).toLowerCase();
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
