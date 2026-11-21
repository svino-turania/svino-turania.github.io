#!/usr/bin/env node
/*
 * Render the raster icons from assets/icons/favicon.svg.
 *
 * Two outputs, because they answer to different consumers:
 *
 * - assets/icons/favicon-256.png is the icon declared to search engines and
 *   browsers. It is the SVG as drawn: a cream disc on transparent corners,
 *   held off a white tab bar by a bordeaux ring. Google Search does not
 *   render SVG icons — it lists BMP, GIF, ICO, PNG, JPEG, PPM and TIFF — so
 *   the raster is what Google shows beside a result.
 * - assets/icons/apple-touch-icon.png is the home-screen icon. iOS masks it
 *   itself and composites transparent pixels onto black, so it must be a
 *   full cream square with no ring.
 *
 * Both are derived from the SVG — never from a copy.
 *
 * Usage: node scripts/render-icons.mjs
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const ICONS = join(ROOT, 'assets', 'icons');
const ICON = join(ICONS, 'favicon.svg');
const FAVICON = join(ICONS, 'favicon-256.png');
const TOUCH = join(ICONS, 'apple-touch-icon.png');

function paletteToken(name) {
  const css = readFileSync(join(ROOT, 'assets', 'css', 'style.css'), 'utf8');
  const match = css.match(
    new RegExp(`--${name}\\s*:\\s*(#[0-9a-fA-F]{6})\\s*;`),
  );
  if (!match) {
    throw new Error(`manca il token --${name} nel foglio di stile`);
  }
  return match[1].toLowerCase();
}

function render(input, size, output) {
  const result = spawnSync(
    'rsvg-convert',
    ['-w', String(size), '-h', String(size), '-o', output, '-'],
    { input },
  );
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`rsvg-convert ha fallito: ${result.stderr.toString()}`);
  }
  console.log(`scritto ${output}`);
}

const cream = paletteToken('cream-light');
const source = readFileSync(ICON, 'utf8');

const viewBox = source.match(/<svg\b[^>]*\bviewBox="([^"]+)"/);
if (!viewBox) {
  throw new Error('l’icona SVG non ha un viewBox');
}
const [x, y, width, height] = viewBox[1].trim().split(/\s+/).map(Number);

const ground = new RegExp(`<circle\\b[^>]*\\bfill="${cream}"[^>]*/>`, 'i');
if (!ground.test(source)) {
  throw new Error('l’icona non ha il disco di crema chiara come fondo');
}
const ring = /<circle\b[^>]*\bstroke="[^"]*"[^>]*\/>/i;
if (!ring.test(source)) {
  throw new Error('l’icona non ha l’anello bordeaux');
}

const square = source
  .replace(
    ground,
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${cream}"/>`,
  )
  .replace(ring, '');

render(source, 256, FAVICON);
render(square, 180, TOUCH);
