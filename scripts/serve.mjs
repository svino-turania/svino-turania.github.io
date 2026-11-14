#!/usr/bin/env node

/*
 * Local preview server. Serves exactly the files the deployment publishes —
 * index.html and assets/ — with no build step and no dependencies. Nothing
 * outside those paths is reachable, so .git and the repository documents stay
 * offline even while the server runs.
 *
 *   npm start            # http://127.0.0.1:8080/
 *   PORT=3000 npm start
 */

import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const ASSETS = resolve(ROOT, 'assets');
const PAGE = resolve(ROOT, 'index.html');
const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? '127.0.0.1';

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.xml', 'application/xml'],
]);

/* Map a request path to a published file, or null if it is outside the site. */
function servedFile(pathname) {
  if (pathname === '/' || pathname === '/index.html') {
    return PAGE;
  }

  const file = resolve(ROOT, `.${pathname}`);
  if (!file.startsWith(ASSETS + sep)) {
    return null;
  }
  return file;
}

function fileFor(requestUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  } catch {
    return { status: 400 };
  }

  const file = servedFile(pathname);
  if (file === null) {
    return { status: 404 };
  }

  try {
    if (!statSync(file).isFile()) {
      return { status: 404 };
    }
  } catch {
    return { status: 404 };
  }

  return { status: 200, filePath: file };
}

const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }

  const found = fileFor(request.url ?? '/');
  if (found.status !== 200) {
    response.writeHead(found.status, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(`${found.status} ${found.status === 404 ? 'Not Found' : 'Bad Request'}\n`);
    return;
  }

  const { filePath } = found;
  const { size } = statSync(filePath);
  const type = MIME.get(extname(filePath).toLowerCase()) ?? 'application/octet-stream';

  response.writeHead(200, {
    'Content-Type': type,
    'Content-Length': size,
    // Testing means editing: never let the browser hold a stale copy.
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
});

server.listen(PORT, HOST, () => {
  console.log(`sVino local preview: http://${HOST}:${PORT}/  (Ctrl+C to stop)`);
});
