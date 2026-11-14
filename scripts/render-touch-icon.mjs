#!/usr/bin/env node
/*
 * Render assets/icons/apple-touch-icon.png from assets/icons/favicon.svg.
 *
 * The tab icon is a cream disc on transparent corners, held off a white tab
 * bar by a bordeaux ring. iOS masks the touch icon itself and composites
 * transparent pixels onto black, so the touch icon must be a full cream square
 * with no ring. This script derives that square from the SVG — never from a
 * copy — and hands it to rsvg-convert.
 *
 * Usage: node scripts/render-touch-icon.mjs
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const ICON = join(ROOT, 'assets', 'icons', 'favicon.svg');
const OUTPUT = join(ROOT, 'assets', 'icons', 'apple-touch-icon.png');

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

const render = spawnSync(
  'rsvg-convert',
  ['-w', '180', '-h', '180', '-o', OUTPUT, '-'],
  { input: square },
);
if (render.error) {
  throw render.error;
}
if (render.status !== 0) {
  throw new Error(`rsvg-convert ha fallito: ${render.stderr.toString()}`);
}

console.log(`scritto ${OUTPUT}`);
