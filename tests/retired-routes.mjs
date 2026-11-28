import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import {
  RETIRED_TOOL_PREFIXES,
  RETIRED_TOOL_ROUTES,
  isRetiredPath,
  handleRetired
} from '../src/server/http/retired-routes.mjs';

// Retired tools and articles answer 410; the rest of the site is untouched.
for (const path of [
  '/tools/pdf/merge/', '/tools/pdf/merge', '/tools/pdf/redact/index.html', '/tools/image/compress/',
  '/tools/security/share-safe-check/', '/tools/Security/Share-Safe-Check', '/tools/data/file-merger/',
  '/blog/articles/pdf-financial-records', '/blog/articles/pdf-financial-records.html',
  '/blog/articles/edit-pdf-without-adobe-acrobat-free-methods/',
  '/categories/pdf-tools.html', '/categories/image-tools', '/categories/pdf-tools/'
]) assert.equal(isRetiredPath(path), true, `${path} should be retired`);

for (const path of [
  '/', '/tools/', '/tools/security/rlsproof/', '/tools/security/jwt-decoder/', '/tools/data/sql-formatter/',
  '/tools/design/invoice-generator/', '/tools/finance/retirement/', '/tools/pdfx/', '/tools/data/csv-to-jsonx/',
  '/blog/articles/understanding-json-web-tokens-structure-security', '/blog/articles/',
  '/categories/', '/categories/finance-tools.html', '/categories/security-tools'
]) assert.equal(isRetiredPath(path), false, `${path} must keep working`);

const next = () => 'static';
const gone = handleRetired({ request: new Request('https://mc-novatools.com/tools/pdf/split/'), next });
assert.equal(gone.status, 410);
assert.match(gone.headers.get('X-Robots-Tag'), /noindex/);
assert.match(await gone.text(), /retired/i);
const head = handleRetired({ request: new Request('https://mc-novatools.com/tools/pdf/split/', { method: 'HEAD' }), next });
assert.equal(head.status, 410);
assert.equal(handleRetired({ request: new Request('https://mc-novatools.com/tools/finance/roi-calculator/'), next }), 'static');

// The source of every retired tool is gone (kept in git: archive/file-tools-2026-11-27).
for (const route of [...RETIRED_TOOL_PREFIXES, ...RETIRED_TOOL_ROUTES]) {
  assert.equal(existsSync(`src${route}`), false, `src${route} should be deleted`);
}

for (const slug of ['pdf-tools', 'image-tools']) assert.equal(existsSync(`categories/${slug}.html`), false);

// The Functions only run when _routes.json leaves these prefixes in.
const routes = JSON.parse(readFileSync('public/_routes.json', 'utf8'));
const excluded = (path) => routes.exclude.some((rule) => rule.endsWith('/*') ? path.startsWith(rule.slice(0, -1)) : path === rule);
for (const route of [...RETIRED_TOOL_PREFIXES, ...RETIRED_TOOL_ROUTES, '/categories/pdf-tools.html', '/blog/articles/pdf-financial-records']) {
  assert.equal(excluded(route), false, `${route} is excluded from Functions in public/_routes.json`);
}
assert.equal(routes.exclude.length + routes.include.length <= 100, true, 'Cloudflare allows at most 100 route rules');

console.log('retired routes: pass');
