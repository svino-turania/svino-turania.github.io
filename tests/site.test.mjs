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
import { join, resolve } from 'node:path';
import { parseHTML } from 'linkedom';

const ROOT = resolve(import.meta.dirname, '..');
const SITE = join(ROOT, '_site');
const SITE_ORIGIN = 'https://svino-turania.github.io';
const MAP_ORIGIN = 'https://www.openstreetmap.org';

const CANTINA_PARAGRAPH =
  'Per la seconda edizione si entra nelle cantine del borgo: si assaggia il vino di Turania e da una cantina si passa alla successiva. Vi aspettiamo.';

function normalize(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function loadSite() {
  const file = join(SITE, 'index.html');
  assert.ok(existsSync(file), 'la build non ha prodotto _site/index.html');
  const { document } = parseHTML(readFileSync(file, 'utf8'));
  return document;
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
    assert.ok(
      !text.includes('Turania (RI)'),
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
