/**
 * Routes permanently retired in the 2026-11-27 product reset.
 *
 * The owner dropped the PDF, image and generic file-processing tools and the
 * Share-Safe File Check. Nothing on the site replaces them, so they answer
 * 410 Gone instead of redirecting to an unrelated page (decision D-012 in
 * docs/research/decision-log.md). The source is kept in git under the tag
 * archive/file-tools-2026-11-27.
 *
 * Used by functions/tools/, functions/categories/ and functions/blog/articles/ ([[path]].js);
 * public/_routes.json must not exclude these prefixes or the Functions never run.
 */

/** Whole tool categories that were file processing only. */
export const RETIRED_TOOL_PREFIXES = Object.freeze([
  '/tools/pdf/',
  '/tools/image/',
  '/tools/demo-phase7/',
  '/tools/demo-phase8/'
]);

/** Single file tools inside categories that otherwise stay. */
export const RETIRED_TOOL_ROUTES = Object.freeze([
  '/tools/data/audio-spectrum/',
  '/tools/data/checksum-calculator/',
  '/tools/data/csv-json-summarizer/',
  '/tools/data/csv-to-json/',
  '/tools/data/csv-viewer/',
  '/tools/data/duplicate-finder/',
  '/tools/data/file-merger/',
  '/tools/data/file-organizer/',
  '/tools/data/file-renamer/',
  '/tools/data/file-splitter/',
  '/tools/data/json-to-csv/',
  '/tools/design/mockup-generator/',
  '/tools/security/share-safe-check/',
  '/tools/social/app-icon-generator/',
  '/tools/social/favicon-generator/',
  '/tools/social/instagram-photo/',
  '/tools/social/social-image-resizer/',
  '/tools/social/twitter-video/',
  '/tools/social/youtube-thumbnail/'
]);

/** Category hubs that only listed retired tools. */
export const RETIRED_CATEGORY_ROUTES = Object.freeze([
  '/categories/image-tools/',
  '/categories/pdf-tools/'
]);

/** Published blog articles whose subject was a retired tool. */
export const RETIRED_ARTICLE_SLUGS = Object.freeze([
  'edit-pdf-without-adobe-acrobat-free-methods',
  'pdf-financial-records'
]);

function normalize(pathname) {
  let path = String(pathname || '/');
  try { path = decodeURIComponent(path); } catch { /* keep raw */ }
  path = path.toLowerCase().replace(/\/{2,}/g, '/');
  path = path.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  return path.endsWith('/') ? path : `${path}/`;
}

export function isRetiredPath(pathname) {
  const path = normalize(pathname);
  if (RETIRED_TOOL_PREFIXES.some((prefix) => path.startsWith(prefix))) return true;
  if (RETIRED_TOOL_ROUTES.some((route) => path.startsWith(route))) return true;
  if (RETIRED_CATEGORY_ROUTES.includes(path)) return true;
  const article = path.match(/^\/blog\/articles\/([^/]+)\/$/);
  return Boolean(article && RETIRED_ARTICLE_SLUGS.includes(article[1]));
}

const GONE_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>This page has been retired | MC NovaTools</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem;color:#1f2937;background:#fff}a{color:#1d4ed8}</style>
</head><body><main><h1>This page has been retired</h1>
<p>MC NovaTools no longer offers its PDF, image and file-processing tools. This page was removed on purpose and is not coming back.</p>
<p><a href="/">Go to the home page</a></p></main></body></html>`;

export function goneResponse(method = 'GET') {
  return new Response(method === 'HEAD' ? null : GONE_HTML, {
    status: 410,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'noindex',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

/** Pages Functions handler: 410 for retired paths, otherwise the static asset. */
export function handleRetired(context) {
  const { pathname } = new URL(context.request.url);
  if (isRetiredPath(pathname)) return goneResponse(context.request.method);
  return context.next();
}
