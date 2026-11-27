/**
 * Share-Safe File Check — page controller.
 *
 * Reads the chosen file into memory, scans it with share-safe-core.mjs, and on
 * request builds a cleaned copy and scans that copy again, so the page only
 * reports what the re-scan confirms. pdf-lib and JSZip are loaded on demand
 * from the site's own bundle. The file never leaves the tab: this module makes
 * no network requests of its own.
 *
 * Every string taken from a file is rendered with textContent, never as HTML.
 */
import {
  MAX_FILE_BYTES, detectFileType, sortFindings, summarize,
  scanJpeg, cleanJpeg, scanPng, cleanPng, scanWebp, cleanWebp,
  scanPdf, cleanPdf, scanOoxml, cleanOoxml, scanText, cleanText,
  findHiddenText, hiddenTextFindings
} from './share-safe-core.mjs';

const $ = (id) => document.getElementById(id);
const SEVERITY_LABEL = { high: 'High risk', medium: 'Worth checking', low: 'Low risk' };
const TYPE_LABEL = {
  jpeg: 'JPEG photo', png: 'PNG image', webp: 'WebP image', pdf: 'PDF document',
  docx: 'Word document', xlsx: 'Excel workbook', pptx: 'PowerPoint presentation',
  json: 'JSON / HAR file', text: 'Text or log file'
};
const MIME = {
  jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  json: 'application/json', text: 'text/plain'
};

let current = null; // { file, bytes, kind, scan }
let downloadUrl = null;

const loadPdfLib = () => import('pdf-lib');
const loadJsZip = () => import('jszip').then((m) => m.default || m);

// pdf.js is served from this site (/vendor/pdfjs/, copied from pdfjs-dist at
// build time), the same copy PDF Redact uses. It renders pages for the hidden
// text check; the PDF bytes are handed to it in memory and never sent anywhere.
const PDFJS_BASE = '/vendor/pdfjs/';
const HIDDEN_TEXT_MAX_PAGES = 60;
const HIDDEN_TEXT_SCALE = 1.5;
let pdfjsPending = null;
function loadPdfJs() {
  pdfjsPending = pdfjsPending || import(/* @vite-ignore */ `${PDFJS_BASE}pdf.min.mjs`)
    .then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}pdf.worker.min.mjs`;
      return lib;
    })
    .catch((error) => { pdfjsPending = null; throw error; });
  return pdfjsPending;
}

/** Renders each page and lists text runs that sit where nothing is visible. */
async function checkHiddenText(bytes, onProgress) {
  const pdfjs = await loadPdfJs();
  const task = pdfjs.getDocument({
    data: bytes.slice(), // pdf.js takes ownership of the buffer it is given
    isEvalSupported: false,
    cMapUrl: `${PDFJS_BASE}cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${PDFJS_BASE}standard_fonts/`,
    wasmUrl: `${PDFJS_BASE}wasm/`,
    iccUrl: `${PDFJS_BASE}iccs/`
  });
  try {
    const doc = await task.promise;
    const totalPages = doc.numPages;
    const pagesChecked = Math.min(totalPages, HIDDEN_TEXT_MAX_PAGES);
    const pages = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
    for (let number = 1; number <= pagesChecked; number += 1) {
      onProgress?.(number, pagesChecked);
      const page = await doc.getPage(number);
      const viewport = page.getViewport({ scale: HIDDEN_TEXT_SCALE });
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: ctx, viewport, intent: 'print', annotationMode: pdfjs.AnnotationMode.ENABLE }).promise;
      const content = await page.getTextContent();
      const items = content.items
        .filter((item) => typeof item.str === 'string' && item.str.trim())
        .map((item) => {
          const tx = pdfjs.Util.transform(viewport.transform, item.transform);
          const fontHeight = Math.hypot(tx[2], tx[3]);
          return { str: item.str, x: tx[4], y: tx[5] - fontHeight * 0.9, width: item.width * HIDDEN_TEXT_SCALE, height: fontHeight * 1.1 };
        });
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hits = findHiddenText(items, image);
      if (hits.length) pages.push({ page: number, hits });
      page.cleanup();
    }
    canvas.width = 0;
    canvas.height = 0;
    return hiddenTextFindings(pages, { pagesChecked, totalPages });
  } finally {
    // In pdf.js 6 the loading task owns the document and its worker.
    await task.destroy();
  }
}

/** Structural scan, plus the rendered hidden-text check for PDFs. */
async function fullScan(bytes, kind) {
  const scan = await scanBytes(bytes, kind);
  if (scan && kind === 'pdf') {
    try {
      scan.findings.push(...await checkHiddenText(bytes, (n, total) => setStatus(`Checking page ${n} of ${total} for text hidden under boxes…`)));
    } catch (error) {
      scan.findings.push({
        id: 'pdf-hidden-text-error', severity: 'medium', cleanable: false,
        title: 'The hidden-text check could not run',
        detail: `Pages could not be rendered (${error.message}), so text hidden under boxes was not checked.`,
        fix: 'Open the file in PDF Redact, which renders every page, or try another browser.'
      });
    }
  }
  return scan;
}

function setStatus(message, isError = false) {
  const el = $('scanStatus');
  el.textContent = message;
  el.dataset.error = isError ? 'true' : 'false';
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function scanBytes(bytes, kind) {
  switch (kind) {
    case 'jpeg': return scanJpeg(bytes);
    case 'png': return scanPng(bytes);
    case 'webp': return scanWebp(bytes);
    case 'pdf': return scanPdf(bytes, await loadPdfLib());
    case 'docx': case 'xlsx': case 'pptx': case 'zip': {
      const JSZip = await loadJsZip();
      return scanOoxml(await JSZip.loadAsync(bytes), kind);
    }
    case 'json': case 'text': return scanText(new TextDecoder().decode(bytes), kind);
    default: return null;
  }
}

async function cleanBytes(bytes, kind) {
  switch (kind) {
    case 'jpeg': return cleanJpeg(bytes);
    case 'png': return cleanPng(bytes);
    case 'webp': return cleanWebp(bytes);
    case 'pdf': return cleanPdf(bytes, await loadPdfLib(), { removeComments: $('removeComments').checked });
    case 'docx': case 'xlsx': case 'pptx': {
      const JSZip = await loadJsZip();
      return cleanOoxml(await JSZip.loadAsync(bytes));
    }
    case 'json': case 'text': return new TextEncoder().encode(cleanText(new TextDecoder().decode(bytes), kind));
    default: throw new Error('This file type cannot be cleaned here.');
  }
}

function renderFindings(listEl, findings) {
  listEl.replaceChildren();
  for (const finding of sortFindings(findings)) {
    const li = document.createElement('li');
    li.className = 'finding';
    li.dataset.severity = finding.severity;
    const badge = document.createElement('span');
    badge.className = 'finding__badge';
    badge.textContent = SEVERITY_LABEL[finding.severity];
    const body = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = finding.title;
    const detail = document.createElement('p');
    detail.textContent = finding.detail;
    const fix = document.createElement('p');
    fix.className = 'finding__fix';
    fix.textContent = finding.cleanable
      ? 'Removed by “Create cleaned copy”.'
      : finding.fix || 'Not changed automatically — fix it in the app that made the file.';
    body.append(title, detail, fix);
    if (finding.location) {
      const map = document.createElement('a');
      map.href = `https://www.openstreetmap.org/?mlat=${finding.location.lat.toFixed(5)}&mlon=${finding.location.lon.toFixed(5)}#map=16/${finding.location.lat.toFixed(5)}/${finding.location.lon.toFixed(5)}`;
      map.target = '_blank';
      map.rel = 'noopener noreferrer';
      map.textContent = 'See this point on OpenStreetMap (opens a new tab and sends only the coordinates)';
      body.append(map);
    }
    li.append(badge, body);
    listEl.append(li);
  }
}

function summaryText(findings) {
  const c = summarize(findings);
  if (!findings.length) return 'Nothing found by these checks.';
  return `${c.high} high risk · ${c.medium} worth checking · ${c.low} low risk`;
}

function resetResult() {
  $('resultSection').hidden = true;
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = null;
}

async function handleFile(file) {
  resetResult();
  $('report').hidden = true;
  current = null;
  if (!file) return;
  if (file.size > MAX_FILE_BYTES) {
    setStatus(`This file is ${formatBytes(file.size)}. The limit is 50 MB because the whole file is held in this tab's memory.`, true);
    return;
  }
  setStatus('Reading the file in this tab…');
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = detectFileType(bytes, file.name);
    if (kind === 'heic') {
      setStatus('HEIC/HEIF photos cannot be read in the browser yet. On iPhone, share the photo with “Options → Location” switched off, or export it as JPEG and check that copy.', true);
      return;
    }
    if (kind === 'unknown' || kind === 'zip') {
      setStatus('This file type is not supported. Supported: PDF, JPEG, PNG, WebP, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), HAR/JSON and text or log files.', true);
      return;
    }
    const scan = await fullScan(bytes, kind);
    current = { file, bytes, kind, scan };
    $('fileMeta').textContent = `${file.name} · ${TYPE_LABEL[kind] || kind} · ${formatBytes(file.size)}`;
    $('scanSummary').textContent = summaryText(scan.findings);
    renderFindings($('findingsList'), scan.findings);
    $('pdfOptions').hidden = kind !== 'pdf';
    const cleanable = scan.findings.some((f) => f.cleanable);
    $('cleanBtn').disabled = !cleanable;
    $('cleanHint').textContent = cleanable
      ? 'The cleaned copy is checked again before you can download it.'
      : 'Nothing here can be removed automatically; follow the notes above.';
    $('report').hidden = false;
    setStatus('Check complete. Nothing was uploaded.');
  } catch (error) {
    setStatus(`The file could not be read: ${error.message}`, true);
  }
}

async function handleClean() {
  if (!current) return;
  resetResult();
  $('cleanBtn').disabled = true;
  setStatus('Creating the cleaned copy and checking it again…');
  try {
    const cleaned = await cleanBytes(current.bytes, current.kind);
    const after = await fullScan(cleaned, current.kind);
    const beforeCleanable = current.scan.findings.filter((f) => f.cleanable);
    const stillThere = after.findings.filter((f) => beforeCleanable.some((b) => b.id === f.id));
    $('resultSection').dataset.verified = stillThere.length ? 'false' : 'true';
    $('verifyResult').textContent = stillThere.length
      ? `${beforeCleanable.length - stillThere.length} of ${beforeCleanable.length} removable items are gone; ${stillThere.length} could not be removed (listed below).`
      : `Re-check passed: all ${beforeCleanable.length} removable item(s) are gone from the cleaned copy (${formatBytes(cleaned.length)}).`;
    $('afterSummary').textContent = `What the cleaned copy still contains: ${summaryText(after.findings)}`;
    renderFindings($('afterList'), after.findings);
    const dot = current.file.name.lastIndexOf('.');
    const base = dot > 0 ? current.file.name.slice(0, dot) : current.file.name;
    const ext = dot > 0 ? current.file.name.slice(dot) : '';
    downloadUrl = URL.createObjectURL(new Blob([cleaned], { type: MIME[current.kind] || 'application/octet-stream' }));
    const link = $('downloadLink');
    link.href = downloadUrl;
    link.download = `${base}-clean${ext}`;
    $('resultSection').hidden = false;
    setStatus('Cleaned copy ready. Open it once before you send it.');
  } catch (error) {
    setStatus(`Cleaning failed: ${error.message}`, true);
  } finally {
    $('cleanBtn').disabled = false;
  }
}

function init() {
  const dropzone = $('dropzone');
  const input = $('fileInput');
  if (!dropzone || !input) return;
  dropzone.addEventListener('click', () => input.click());
  dropzone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); }
  });
  input.addEventListener('change', () => handleFile(input.files[0]));
  dropzone.addEventListener('dragover', (event) => { event.preventDefault(); dropzone.classList.add('drag-active'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-active'));
  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('drag-active');
    handleFile(event.dataTransfer.files[0]);
  });
  $('cleanBtn').addEventListener('click', handleClean);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
