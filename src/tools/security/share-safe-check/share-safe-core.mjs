/**
 * Share-Safe File Check — analysis and cleaning core.
 *
 * Everything here works on bytes or text that the visitor already has in the
 * browser tab: nothing is fetched or uploaded. The functions are pure (no DOM)
 * so tests/share-safe-check.mjs can run them in Node against generated files.
 *
 * Each scanner returns { kind, findings, facts } where a finding is
 *   { id, severity: 'high' | 'medium' | 'low', title, detail, cleanable }
 * and `cleanable` says whether the matching cleaner removes it. Nothing is
 * reported as removed unless a re-scan of the cleaned output confirms it.
 */

export const MAX_FILE_BYTES = 50 * 1024 * 1024;

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };

export function sortFindings(findings) {
  return [...findings].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

export function summarize(findings) {
  const counts = { high: 0, medium: 0, low: 0 };
  for (const finding of findings) counts[finding.severity] += 1;
  return counts;
}

const latin1 = (bytes, start = 0, end = bytes.length) => {
  let out = '';
  const stop = Math.min(end, bytes.length);
  for (let i = start; i < stop; i += 0x8000) {
    out += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + 0x8000, stop)));
  }
  return out;
};

const utf8 = (bytes) => new TextDecoder('utf-8', { fatal: false }).decode(bytes);

function startsWith(bytes, signature, offset = 0) {
  if (bytes.length < offset + signature.length) return false;
  for (let i = 0; i < signature.length; i += 1) if (bytes[offset + i] !== signature[i]) return false;
  return true;
}

const ascii = (text) => [...text].map((ch) => ch.charCodeAt(0));

/* ------------------------------------------------------------------ */
/* Type detection                                                       */
/* ------------------------------------------------------------------ */

export function detectFileType(bytes, fileName = '') {
  const name = String(fileName).toLowerCase();
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (startsWith(bytes, ascii('RIFF')) && startsWith(bytes, ascii('WEBP'), 8)) return 'webp';
  if (latin1(bytes, 0, 1024).includes('%PDF-')) return 'pdf';
  if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04])) {
    if (/\.(docx|docm|dotx)$/.test(name)) return 'docx';
    if (/\.(xlsx|xlsm|xltx)$/.test(name)) return 'xlsx';
    if (/\.(pptx|pptm|potx)$/.test(name)) return 'pptx';
    return 'zip';
  }
  if (startsWith(bytes, ascii('ftyp'), 4)) return 'heic';
  if (/\.(har|json)$/.test(name)) return 'json';
  if (/\.(txt|log|env|ya?ml|ini|conf|cfg|csv|md)$/.test(name)) return 'text';
  // Fall back to text when the first bytes contain no NUL.
  const head = bytes.subarray(0, Math.min(bytes.length, 4096));
  if (head.length && !head.includes(0)) {
    const sample = utf8(head).trimStart();
    return sample.startsWith('{') || sample.startsWith('[') ? 'json' : 'text';
  }
  return 'unknown';
}

/* ------------------------------------------------------------------ */
/* TIFF / EXIF                                                          */
/* ------------------------------------------------------------------ */

const TYPE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

const IFD0_TAGS = { 0x010f: 'Make', 0x0110: 'Model', 0x0112: 'Orientation', 0x0131: 'Software', 0x0132: 'DateTime', 0x013b: 'Artist', 0x8298: 'Copyright', 0x9c9d: 'XPAuthor' };
const EXIF_TAGS = { 0x9003: 'DateTimeOriginal', 0xa420: 'ImageUniqueID', 0xa430: 'CameraOwnerName', 0xa431: 'BodySerialNumber', 0xa434: 'LensModel', 0xa435: 'LensSerialNumber' };
const GPS_TAGS = { 0x0001: 'GPSLatitudeRef', 0x0002: 'GPSLatitude', 0x0003: 'GPSLongitudeRef', 0x0004: 'GPSLongitude', 0x0006: 'GPSAltitude', 0x001d: 'GPSDateStamp' };

/**
 * Parses a TIFF structure (the body of an EXIF block) and returns the tags
 * that matter for privacy. Malformed offsets are skipped, never thrown.
 */
export function parseTiff(bytes) {
  const out = { tags: {}, hasThumbnail: false };
  if (bytes.length < 8) return out;
  const little = bytes[0] === 0x49 && bytes[1] === 0x49;
  if (!little && !(bytes[0] === 0x4d && bytes[1] === 0x4d)) return out;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u16 = (o) => (o + 2 <= bytes.length ? view.getUint16(o, little) : 0);
  const u32 = (o) => (o + 4 <= bytes.length ? view.getUint32(o, little) : 0);
  if (u16(2) !== 42) return out;

  const readValue = (entry) => {
    const type = u16(entry + 2);
    const count = u32(entry + 4);
    const size = (TYPE_SIZE[type] || 1) * count;
    if (count > 65536) return null;
    const at = size <= 4 ? entry + 8 : u32(entry + 8);
    if (at + size > bytes.length) return null;
    if (type === 2) return latin1(bytes, at, at + count).replace(/\0+$/, '').trim();
    if (type === 3) return count === 1 ? u16(at) : Array.from({ length: count }, (_, i) => u16(at + i * 2));
    if (type === 4 || type === 9) return count === 1 ? u32(at) : Array.from({ length: count }, (_, i) => u32(at + i * 4));
    if (type === 5 || type === 10) {
      return Array.from({ length: count }, (_, i) => {
        const den = u32(at + i * 8 + 4);
        return den ? u32(at + i * 8) / den : 0;
      });
    }
    if (type === 1 && count > 2 && count % 2 === 0) {
      // XP* tags are UTF-16LE strings stored as BYTE arrays.
      let s = '';
      for (let i = 0; i + 1 < count; i += 2) s += String.fromCharCode(bytes[at + i] | (bytes[at + i + 1] << 8));
      return s.replace(/\0+$/, '').trim();
    }
    return null;
  };

  const readIfd = (offset, names, visited) => {
    if (!offset || offset + 2 > bytes.length || visited.has(offset)) return { next: 0, pointers: {} };
    visited.add(offset);
    const count = u16(offset);
    const pointers = {};
    for (let i = 0; i < count && i < 512; i += 1) {
      const entry = offset + 2 + i * 12;
      if (entry + 12 > bytes.length) break;
      const tag = u16(entry);
      if (tag === 0x8769 || tag === 0x8825) {
        pointers[tag] = u32(entry + 8);
        continue;
      }
      const name = names[tag];
      if (!name) continue;
      const value = readValue(entry);
      if (value !== null && value !== '') out.tags[name] = value;
    }
    return { next: u32(offset + 2 + count * 12), pointers };
  };

  const visited = new Set();
  const ifd0 = readIfd(u32(4), IFD0_TAGS, visited);
  if (ifd0.pointers[0x8769]) readIfd(ifd0.pointers[0x8769], EXIF_TAGS, visited);
  if (ifd0.pointers[0x8825]) readIfd(ifd0.pointers[0x8825], GPS_TAGS, visited);
  if (ifd0.next && ifd0.next < bytes.length) out.hasThumbnail = true;
  return out;
}

function gpsDecimal(parts, ref) {
  if (!Array.isArray(parts) || parts.length < 3) return null;
  const value = parts[0] + parts[1] / 60 + parts[2] / 3600;
  if (!Number.isFinite(value)) return null;
  return /[SW]/i.test(String(ref || '')) ? -value : value;
}

function exifFindings(tiff, where = 'This image') {
  const t = tiff.tags;
  const findings = [];
  const lat = gpsDecimal(t.GPSLatitude, t.GPSLatitudeRef);
  const lon = gpsDecimal(t.GPSLongitude, t.GPSLongitudeRef);
  if (lat !== null && lon !== null && (lat !== 0 || lon !== 0)) {
    findings.push({
      id: 'exif-gps', severity: 'high', cleanable: true,
      title: 'GPS location',
      detail: `${where} records where it was taken: ${lat.toFixed(5)}, ${lon.toFixed(5)}. Anyone who receives the file can put that point on a map.`,
      location: { lat, lon }
    });
  }
  const serials = ['BodySerialNumber', 'LensSerialNumber', 'ImageUniqueID'].filter((k) => t[k]);
  if (serials.length) {
    findings.push({
      id: 'exif-serial', severity: 'medium', cleanable: true,
      title: 'Device serial number',
      detail: `${serials.map((k) => `${k}: ${t[k]}`).join(', ')}. A serial number links every photo taken with the same camera or phone.`
    });
  }
  const people = ['Artist', 'XPAuthor', 'CameraOwnerName', 'Copyright'].filter((k) => t[k]);
  if (people.length) {
    findings.push({
      id: 'exif-person', severity: 'medium', cleanable: true,
      title: 'Name of a person',
      detail: people.map((k) => `${k}: ${t[k]}`).join(', ')
    });
  }
  const device = ['Make', 'Model', 'LensModel', 'Software'].filter((k) => t[k]);
  if (device.length) {
    findings.push({
      id: 'exif-device', severity: 'low', cleanable: true,
      title: 'Camera, phone or editing software',
      detail: device.map((k) => `${k}: ${t[k]}`).join(', ')
    });
  }
  const when = t.DateTimeOriginal || t.DateTime;
  if (when) {
    findings.push({ id: 'exif-time', severity: 'low', cleanable: true, title: 'Date and time taken', detail: String(when) });
  }
  if (tiff.hasThumbnail) {
    findings.push({
      id: 'exif-thumbnail', severity: 'medium', cleanable: true,
      title: 'Embedded preview thumbnail',
      detail: 'A small copy of the image is stored inside its metadata. If the photo was cropped or edited later, the thumbnail can still show the original.'
    });
  }
  return findings;
}

function xmpFindings(xml, where) {
  const findings = [];
  if (!xml) return findings;
  const pick = (re) => (xml.match(re)?.[1] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const creator = pick(/<dc:creator>([\s\S]*?)<\/dc:creator>/);
  const tool = pick(/xmp:CreatorTool(?:="([^"]*)"|>([^<]*)<)/) || pick(/<xmp:CreatorTool>([^<]*)</);
  const history = (xml.match(/<rdf:li[^>]*stEvt:action/g) || []).length + (xml.match(/stEvt:action="/g) || []).length;
  const docId = /xmpMM:(?:Original)?DocumentID/.test(xml);
  const parts = [];
  if (creator) parts.push(`creator: ${creator}`);
  if (tool) parts.push(`created with: ${tool}`);
  if (history) parts.push(`${history} editing-history entries`);
  if (docId) parts.push('document IDs that link this file to its other versions');
  findings.push({
    id: 'xmp', severity: creator ? 'medium' : 'low', cleanable: true,
    title: 'XMP metadata block',
    detail: `${where} carries an XMP block${parts.length ? ` (${parts.join('; ')})` : ''}.`
  });
  return findings;
}

/* ------------------------------------------------------------------ */
/* JPEG                                                                 */
/* ------------------------------------------------------------------ */

function jpegSegments(bytes) {
  const segments = [];
  let offset = 2;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) return { segments, dataStart: -1 };
    const marker = bytes[offset + 1];
    if (marker === 0xff) { offset += 1; continue; }
    if (marker === 0xda) return { segments, dataStart: offset };
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) { offset += 2; continue; }
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2 || offset + 2 + length > bytes.length) return { segments, dataStart: -1 };
    segments.push({ marker, start: offset, end: offset + 2 + length, body: bytes.subarray(offset + 4, offset + 2 + length) });
    offset += 2 + length;
  }
  return { segments, dataStart: -1 };
}

const EXIF_HEADER = ascii('Exif\0\0');
const XMP_HEADER = 'http://ns.adobe.com/xap/1.0/';

export function scanJpeg(bytes, where = 'This photo') {
  const { segments } = jpegSegments(bytes);
  const findings = [];
  const facts = { orientation: 1 };
  for (const seg of segments) {
    if (seg.marker === 0xe1 && startsWith(seg.body, EXIF_HEADER)) {
      const tiff = parseTiff(seg.body.subarray(6));
      if (tiff.tags.Orientation) facts.orientation = Number(tiff.tags.Orientation) || 1;
      findings.push(...exifFindings(tiff, where));
    } else if (seg.marker === 0xe1 && latin1(seg.body, 0, 40).startsWith(XMP_HEADER)) {
      findings.push(...xmpFindings(utf8(seg.body), where));
    } else if (seg.marker === 0xed) {
      findings.push({ id: 'iptc', severity: 'medium', cleanable: true, title: 'IPTC / Photoshop block', detail: 'Press-photo fields such as caption, author, location and keywords can be stored here.' });
    } else if (seg.marker === 0xfe) {
      const text = latin1(seg.body).trim();
      if (text) findings.push({ id: 'jpeg-comment', severity: 'low', cleanable: true, title: 'Comment', detail: text.slice(0, 160) });
    }
  }
  return { kind: 'jpeg', findings: dedupe(findings), facts };
}

function minimalOrientationExif(orientation) {
  const body = [
    ...EXIF_HEADER,
    0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, // TIFF header, IFD0 at 8
    0x00, 0x01, // one entry
    0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, orientation & 0xff, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00 // no next IFD
  ];
  const length = body.length + 2;
  return [0xff, 0xe1, length >> 8, length & 0xff, ...body];
}

/**
 * Removes EXIF, XMP, IPTC, comments and maker segments without re-encoding the
 * image, so quality is unchanged. JFIF (APP0), ICC colour profiles (APP2) and
 * Adobe colour-transform (APP14) segments are kept because the picture can
 * render with the wrong colours without them. A rotated photo keeps a minimal
 * EXIF block holding only its orientation, so it does not appear sideways.
 */
export function cleanJpeg(bytes) {
  const { segments, dataStart } = jpegSegments(bytes);
  if (dataStart < 0) throw new Error('This JPEG is damaged or truncated, so it cannot be cleaned safely.');
  const { facts } = scanJpeg(bytes);
  const keep = new Set([0xe0, 0xe2, 0xee]);
  const parts = [Uint8Array.of(0xff, 0xd8)];
  let orientationWritten = facts.orientation === 1;
  for (const seg of segments) {
    const isApp = seg.marker >= 0xe0 && seg.marker <= 0xef;
    if ((isApp && !keep.has(seg.marker)) || seg.marker === 0xfe) continue;
    parts.push(bytes.subarray(seg.start, seg.end));
    if (!orientationWritten && seg.marker === 0xe0) {
      parts.push(Uint8Array.from(minimalOrientationExif(facts.orientation)));
      orientationWritten = true;
    }
  }
  if (!orientationWritten) parts.splice(1, 0, Uint8Array.from(minimalOrientationExif(facts.orientation)));
  parts.push(bytes.subarray(dataStart));
  return concat(parts);
}

/* ------------------------------------------------------------------ */
/* PNG                                                                  */
/* ------------------------------------------------------------------ */

function pngChunks(bytes) {
  const chunks = [];
  let offset = 8;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = latin1(bytes, offset + 4, offset + 8);
    const end = offset + 12 + length;
    if (end > bytes.length) break;
    chunks.push({ type, start: offset, end, data: bytes.subarray(offset + 8, offset + 8 + length) });
    offset = end;
    if (type === 'IEND') break;
  }
  return chunks;
}

const PNG_METADATA_CHUNKS = new Set(['tEXt', 'iTXt', 'zTXt', 'eXIf', 'tIME']);

export function scanPng(bytes, where = 'This image') {
  const findings = [];
  for (const chunk of pngChunks(bytes)) {
    if (chunk.type === 'eXIf') findings.push(...exifFindings(parseTiff(chunk.data), where));
    if (chunk.type === 'tEXt' || chunk.type === 'iTXt' || chunk.type === 'zTXt') {
      const nul = chunk.data.indexOf(0);
      const keyword = latin1(chunk.data, 0, nul < 0 ? Math.min(79, chunk.data.length) : nul);
      if (keyword === 'XML:com.adobe.xmp') {
        findings.push(...xmpFindings(utf8(chunk.data), where));
        continue;
      }
      let text = '';
      if (chunk.type === 'tEXt' && nul >= 0) text = latin1(chunk.data, nul + 1);
      if (chunk.type === 'iTXt' && nul >= 0 && chunk.data[nul + 1] === 0) {
        const rest = chunk.data.subarray(nul + 3);
        const lang = rest.indexOf(0);
        const trans = lang < 0 ? -1 : rest.indexOf(0, lang + 1);
        text = trans < 0 ? '' : utf8(rest.subarray(trans + 1));
      }
      const sensitive = /author|creator|artist|owner|comment|description|location|gps|user|copyright|parameters|prompt/i.test(keyword);
      findings.push({
        id: `png-text-${keyword}`, severity: sensitive ? 'medium' : 'low', cleanable: true,
        title: `Text field "${keyword}"`,
        detail: text ? text.slice(0, 200) : 'Compressed text field.'
      });
    }
    if (chunk.type === 'tIME') findings.push({ id: 'png-time', severity: 'low', cleanable: true, title: 'Last-modified time', detail: 'The PNG records when it was last saved.' });
  }
  return { kind: 'png', findings: dedupe(findings), facts: {} };
}

export function cleanPng(bytes) {
  const chunks = pngChunks(bytes);
  if (!chunks.length || chunks[chunks.length - 1].type !== 'IEND') throw new Error('This PNG is damaged or truncated, so it cannot be cleaned safely.');
  return concat([bytes.subarray(0, 8), ...chunks.filter((c) => !PNG_METADATA_CHUNKS.has(c.type)).map((c) => bytes.subarray(c.start, c.end))]);
}

/* ------------------------------------------------------------------ */
/* WebP                                                                 */
/* ------------------------------------------------------------------ */

function webpChunks(bytes) {
  const chunks = [];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = latin1(bytes, offset, offset + 4);
    const size = view.getUint32(offset + 4, true);
    const end = offset + 8 + size + (size % 2);
    if (offset + 8 + size > bytes.length) break;
    chunks.push({ type, start: offset, end: Math.min(end, bytes.length), data: bytes.subarray(offset + 8, offset + 8 + size) });
    offset = end;
  }
  return chunks;
}

export function scanWebp(bytes, where = 'This image') {
  const findings = [];
  for (const chunk of webpChunks(bytes)) {
    if (chunk.type === 'EXIF') {
      const body = startsWith(chunk.data, EXIF_HEADER) ? chunk.data.subarray(6) : chunk.data;
      findings.push(...exifFindings(parseTiff(body), where));
    }
    if (chunk.type === 'XMP ') findings.push(...xmpFindings(utf8(chunk.data), where));
  }
  return { kind: 'webp', findings: dedupe(findings), facts: {} };
}

export function cleanWebp(bytes) {
  const chunks = webpChunks(bytes);
  if (!chunks.length) throw new Error('This WebP file is damaged, so it cannot be cleaned safely.');
  const kept = chunks.filter((c) => c.type !== 'EXIF' && c.type !== 'XMP ').map((c) => {
    const copy = bytes.slice(c.start, c.end);
    // VP8X flags: bit 3 = EXIF present, bit 2 = XMP present.
    if (c.type === 'VP8X') copy[8] &= ~0x0c;
    return copy;
  });
  const body = concat(kept);
  const out = new Uint8Array(12 + body.length);
  out.set(bytes.subarray(0, 12));
  new DataView(out.buffer).setUint32(4, 4 + body.length, true);
  out.set(body, 12);
  return out;
}

/* ------------------------------------------------------------------ */
/* PDF                                                                  */
/* ------------------------------------------------------------------ */

const PDF_INFO_KEYS = ['Title', 'Author', 'Subject', 'Keywords', 'Creator', 'Producer', 'CreationDate', 'ModDate'];

function pdfRevisionCount(raw) {
  const eofs = (raw.match(/%%EOF/g) || []).length;
  // A linearized ("fast web view") file legitimately has two trailers.
  const linearized = /\/Linearized\s/.test(raw.slice(0, 2048));
  return Math.max(1, eofs - (linearized ? 1 : 0));
}

/**
 * @param {Uint8Array} bytes
 * @param {object} pdfLib the pdf-lib module (injected so Node tests and the
 *   browser bundle share this code without a static import of a large library)
 */
export async function scanPdf(bytes, pdfLib) {
  const { PDFDocument, PDFName, PDFDict, PDFArray } = pdfLib;
  const raw = latin1(bytes);
  const findings = [];
  const facts = { revisions: pdfRevisionCount(raw), encrypted: /\/Encrypt\s/.test(raw) };

  if (facts.encrypted) {
    findings.push({ id: 'pdf-encrypted', severity: 'medium', cleanable: false, title: 'Encrypted PDF', detail: 'The file is encrypted, so its contents cannot be fully inspected or cleaned here. Remove the password in the app that created it, then check it again.' });
  }

  if (facts.revisions > 1) {
    findings.push({
      id: 'pdf-revisions', severity: 'high', cleanable: true,
      title: `Saved ${facts.revisions} times without a full rewrite`,
      detail: 'Each incremental save appends changes to the end of the file and leaves the previous version inside it. Text you deleted, earlier metadata or an unredacted page can often be recovered from the older revisions.'
    });
  }

  let doc = null;
  try {
    doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false, throwOnInvalidObject: false });
  } catch {
    findings.push({ id: 'pdf-unreadable', severity: 'medium', cleanable: false, title: 'PDF structure could not be read', detail: 'Only a byte-level check was possible; open and re-save the file in a PDF app, then check it again.' });
  }

  if (doc) {
    const info = {};
    const getters = { Title: 'getTitle', Author: 'getAuthor', Subject: 'getSubject', Keywords: 'getKeywords', Creator: 'getCreator', Producer: 'getProducer', CreationDate: 'getCreationDate', ModDate: 'getModificationDate' };
    for (const key of PDF_INFO_KEYS) {
      try {
        const value = doc[getters[key]]();
        if (value instanceof Date) info[key] = value.toISOString();
        else if (value) info[key] = String(value);
      } catch { /* malformed entry: ignore */ }
    }
    facts.info = info;
    if (info.Author) findings.push({ id: 'pdf-author', severity: 'medium', cleanable: true, title: 'Author name', detail: `Author: ${info.Author}` });
    const descriptive = ['Title', 'Subject', 'Keywords'].filter((k) => info[k]);
    if (descriptive.length) findings.push({ id: 'pdf-descriptive', severity: 'low', cleanable: true, title: 'Title, subject or keywords', detail: descriptive.map((k) => `${k}: ${info[k]}`).join(' · ') });
    const software = ['Creator', 'Producer'].filter((k) => info[k]);
    if (software.length) findings.push({ id: 'pdf-software', severity: 'low', cleanable: true, title: 'Software that made the PDF', detail: software.map((k) => `${k}: ${info[k]}`).join(' · ') });
    const dates = ['CreationDate', 'ModDate'].filter((k) => info[k]);
    if (dates.length) findings.push({ id: 'pdf-dates', severity: 'low', cleanable: true, title: 'Creation and modification dates', detail: dates.map((k) => `${k}: ${info[k]}`).join(' · ') });

    const catalog = doc.catalog;
    const metadataRef = catalog.get(PDFName.of('Metadata'));
    if (metadataRef) {
      const xmpText = raw.match(/<x:xmpmeta[\s\S]*?<\/x:xmpmeta>/)?.[0] || '';
      findings.push(...xmpFindings(xmpText, 'The PDF').map((f) => ({ ...f, id: 'pdf-xmp' })));
    }

    let comments = 0;
    let otherAnnots = 0;
    const commentTypes = new Set(['Text', 'FreeText', 'Popup', 'Highlight', 'Underline', 'StrikeOut', 'Squiggly', 'Ink', 'Caret', 'Stamp', 'FileAttachment', 'Sound']);
    for (const page of doc.getPages()) {
      const annots = page.node.lookup(PDFName.of('Annots'));
      if (!(annots instanceof PDFArray)) continue;
      for (let i = 0; i < annots.size(); i += 1) {
        const annot = annots.lookup(i);
        if (!(annot instanceof PDFDict)) continue;
        const subtype = String(annot.get(PDFName.of('Subtype')) || '').replace('/', '');
        if (commentTypes.has(subtype)) comments += 1;
        else if (subtype !== 'Link' && subtype !== 'Widget') otherAnnots += 1;
      }
    }
    facts.comments = comments;
    if (comments) findings.push({ id: 'pdf-comments', severity: 'medium', cleanable: true, title: `${comments} comment or markup annotation(s)`, detail: 'Sticky notes, highlights and review marks keep the reviewer\'s name and text, and many viewers hide them by default.' });
    if (otherAnnots) findings.push({ id: 'pdf-other-annots', severity: 'low', cleanable: false, title: `${otherAnnots} other annotation(s)`, detail: 'Shapes or media annotations; check them in a PDF viewer.' });

    const names = catalog.lookup(PDFName.of('Names'));
    const hasEmbedded = names instanceof PDFDict && names.get(PDFName.of('EmbeddedFiles'));
    if (hasEmbedded || /\/EmbeddedFile\b/.test(raw)) {
      findings.push({ id: 'pdf-attachments', severity: 'high', cleanable: true, title: 'Attached files', detail: 'The PDF contains attachments (for example a spreadsheet or the source document). They travel with the PDF even when no page shows them.' });
    }
    const hasJs = (names instanceof PDFDict && names.get(PDFName.of('JavaScript'))) || /\/JavaScript\b|\/JS\s*[(<]/.test(raw);
    if (hasJs) findings.push({ id: 'pdf-javascript', severity: 'medium', cleanable: true, title: 'JavaScript', detail: 'Scripts in a PDF can run when it is opened in some viewers. Recipients\' security tools often flag such files.' });

    try {
      const fields = doc.getForm().getFields();
      if (fields.length) findings.push({ id: 'pdf-form', severity: 'low', cleanable: false, title: `${fields.length} form field(s)`, detail: 'Filled-in form values stay editable and can be read by anyone who opens the file. Flatten or print to PDF if the values should be final.' });
    } catch { /* no form */ }

    facts.pages = doc.getPageCount();
  }

  findings.push({
    id: 'pdf-redaction-hint', severity: 'low', cleanable: false,
    title: 'Hidden text under black boxes is not checked here',
    detail: 'If you blacked out parts of this PDF, open it in the PDF Redact & PII Check tool, which reads the text layer and shows whether the covered text is still there.'
  });

  return { kind: 'pdf', findings: dedupe(findings), facts };
}

/**
 * Rewrites the PDF as a single revision with no document metadata, no XMP,
 * no attachments, no document-level JavaScript and, optionally, no comment
 * annotations. Objects that are no longer reachable from the document — the
 * leftovers of earlier incremental saves — are dropped before saving.
 */
export async function cleanPdf(bytes, pdfLib, { removeComments = true } = {}) {
  const { PDFDocument, PDFName, PDFDict, PDFArray, PDFRef } = pdfLib;
  if (/\/Encrypt\s/.test(latin1(bytes, Math.max(0, bytes.length - 65536)))) {
    throw new Error('Encrypted PDFs cannot be cleaned here. Remove the password first.');
  }
  const doc = await PDFDocument.load(bytes, { updateMetadata: false, throwOnInvalidObject: false });

  const info = doc.getInfoDict();
  for (const key of [...info.keys()]) info.delete(key);

  const catalog = doc.catalog;
  catalog.delete(PDFName.of('Metadata'));
  catalog.delete(PDFName.of('PieceInfo'));
  const names = catalog.lookup(PDFName.of('Names'));
  if (names instanceof PDFDict) {
    names.delete(PDFName.of('EmbeddedFiles'));
    names.delete(PDFName.of('JavaScript'));
  }
  const openAction = catalog.lookup(PDFName.of('OpenAction'));
  if (openAction instanceof PDFDict && String(openAction.get(PDFName.of('S'))) === '/JavaScript') catalog.delete(PDFName.of('OpenAction'));
  catalog.delete(PDFName.of('AA'));

  const commentTypes = new Set(['/Text', '/FreeText', '/Popup', '/Highlight', '/Underline', '/StrikeOut', '/Squiggly', '/Ink', '/Caret', '/Stamp', '/FileAttachment', '/Sound']);
  for (const page of doc.getPages()) {
    page.node.delete(PDFName.of('Metadata'));
    page.node.delete(PDFName.of('PieceInfo'));
    page.node.delete(PDFName.of('AA'));
    const annots = page.node.lookup(PDFName.of('Annots'));
    if (!(annots instanceof PDFArray)) continue;
    const kept = [];
    for (let i = 0; i < annots.size(); i += 1) {
      const entry = annots.get(i);
      const annot = annots.lookup(i);
      const subtype = annot instanceof PDFDict ? String(annot.get(PDFName.of('Subtype'))) : '';
      if (subtype === '/FileAttachment' || (removeComments && commentTypes.has(subtype))) continue;
      kept.push(entry);
    }
    if (kept.length) page.node.set(PDFName.of('Annots'), doc.context.obj(kept));
    else page.node.delete(PDFName.of('Annots'));
  }

  // Drop every indirect object that the trailer can no longer reach.
  const reachable = new Set();
  const stack = [doc.context.trailerInfo.Root, doc.context.trailerInfo.Info].filter(Boolean);
  while (stack.length) {
    const item = stack.pop();
    if (item instanceof PDFRef) {
      const key = item.toString();
      if (reachable.has(key)) continue;
      reachable.add(key);
      const target = doc.context.lookup(item);
      if (target) stack.push(target);
    } else if (item instanceof PDFDict) {
      for (const [, value] of item.entries()) stack.push(value);
    } else if (item instanceof PDFArray) {
      for (const value of item.asArray()) stack.push(value);
    } else if (item && item.dict instanceof PDFDict) {
      stack.push(item.dict);
    }
  }
  for (const [ref] of doc.context.enumerateIndirectObjects()) {
    if (!reachable.has(ref.toString())) doc.context.delete(ref);
  }

  return doc.save({ useObjectStreams: false, addDefaultPage: false, updateFieldAppearances: false });
}

/* ------------------------------------------------------------------ */
/* Office Open XML (docx / xlsx / pptx)                                 */
/* ------------------------------------------------------------------ */

const decodeXml = (s) => String(s || '')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

function xmlValue(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  return match ? decodeXml(match[1].replace(/<[^>]+>/g, '')).trim() : '';
}

const unique = (list) => [...new Set(list.filter(Boolean))];

/**
 * @param {object} zip a loaded JSZip instance
 * @param {string} kind 'docx' | 'xlsx' | 'pptx' | 'zip'
 */
export async function scanOoxml(zip, kind) {
  const findings = [];
  const facts = {};
  const read = async (path) => (zip.file(path) ? zip.file(path).async('string') : '');
  const list = (re) => Object.keys(zip.files).filter((p) => re.test(p) && !zip.files[p].dir);

  const core = await read('docProps/core.xml');
  if (core) {
    const creator = xmlValue(core, 'dc:creator');
    const lastBy = xmlValue(core, 'cp:lastModifiedBy');
    const people = unique([creator, lastBy]);
    if (people.length) findings.push({ id: 'office-people', severity: 'medium', cleanable: true, title: 'Author and last editor', detail: `${creator ? `Created by: ${creator}` : ''}${creator && lastBy ? ' · ' : ''}${lastBy ? `Last saved by: ${lastBy}` : ''}` });
    const revision = xmlValue(core, 'cp:revision');
    const created = xmlValue(core, 'dcterms:created');
    const modified = xmlValue(core, 'dcterms:modified');
    const printed = xmlValue(core, 'cp:lastPrinted');
    const timeline = [created && `created ${created}`, modified && `modified ${modified}`, printed && `printed ${printed}`, revision && `revision ${revision}`].filter(Boolean);
    if (timeline.length) findings.push({ id: 'office-timeline', severity: 'low', cleanable: true, title: 'Editing timeline', detail: timeline.join(' · ') });
  }

  const app = await read('docProps/app.xml');
  if (app) {
    const org = ['Company', 'Manager', 'HyperlinkBase'].map((t) => [t, xmlValue(app, t)]).filter(([, v]) => v);
    if (org.length) findings.push({ id: 'office-org', severity: 'medium', cleanable: true, title: 'Company or manager name', detail: org.map(([k, v]) => `${k}: ${v}`).join(' · ') });
    const template = xmlValue(app, 'Template');
    if (template && !/^Normal(\.dotm)?$/i.test(template)) findings.push({ id: 'office-template', severity: 'low', cleanable: true, title: 'Template name', detail: `Template: ${template}. Template names sometimes reveal an organisation or a file path.` });
    const minutes = Number(xmlValue(app, 'TotalTime'));
    if (minutes > 0) findings.push({ id: 'office-edit-time', severity: 'low', cleanable: true, title: 'Total editing time', detail: `${minutes} minutes recorded.` });
  }

  if (zip.file('docProps/custom.xml')) {
    const custom = await read('docProps/custom.xml');
    const count = (custom.match(/<property\b/g) || []).length;
    if (count) findings.push({ id: 'office-custom', severity: 'medium', cleanable: false, title: `${count} custom document propert${count === 1 ? 'y' : 'ies'}`, detail: 'Organisations often store client names, case numbers or classification labels here. Review them under File → Info → Properties.' });
  }

  const thumbs = list(/^docProps\/thumbnail\./i);
  if (thumbs.length) findings.push({ id: 'office-thumbnail', severity: 'medium', cleanable: false, title: 'Saved preview image', detail: 'A picture of the first page or slide is stored in the file. If that page changed after the preview was saved, the old content is still visible in it.' });

  if (kind === 'docx' || kind === 'zip') {
    const docXml = await read('word/document.xml');
    if (docXml) {
      const deletions = docXml.match(/<w:del\b[\s\S]*?<\/w:del>/g) || [];
      const insertions = (docXml.match(/<w:ins\b/g) || []).length;
      const revisionAuthors = unique([...docXml.matchAll(/<w:(?:ins|del)\b[^>]*w:author="([^"]*)"/g)].map((m) => decodeXml(m[1])));
      if (deletions.length || insertions) {
        const deletedText = deletions.map((d) => [...d.matchAll(/<w:delText[^>]*>([^<]*)<\/w:delText>/g)].map((m) => decodeXml(m[1])).join('')).join(' … ').trim();
        findings.push({
          id: 'docx-tracked', severity: 'high', cleanable: false,
          title: 'Tracked changes are still in the document',
          detail: `${deletions.length} deletion(s) and ${insertions} insertion(s)${revisionAuthors.length ? ` by ${revisionAuthors.join(', ')}` : ''}. Deleted text is still stored in the file${deletedText ? `, for example: “${deletedText.slice(0, 140)}${deletedText.length > 140 ? '…' : ''}”` : ''}. In Word use Review → Accept All Changes (or Reject All), then check again.`
        });
      }
      const hidden = (docXml.match(/<w:vanish\/>/g) || []).length;
      if (hidden) findings.push({ id: 'docx-hidden-text', severity: 'high', cleanable: false, title: 'Hidden text', detail: `${hidden} run(s) of text are formatted as hidden. They do not print but are in the file and appear in other apps.` });
    }
    const commentsXml = await read('word/comments.xml');
    const commentCount = (commentsXml.match(/<w:comment\b/g) || []).length;
    if (commentCount) {
      const authors = unique([...commentsXml.matchAll(/<w:comment\b[^>]*w:author="([^"]*)"/g)].map((m) => decodeXml(m[1])));
      findings.push({ id: 'docx-comments', severity: 'high', cleanable: false, title: `${commentCount} comment(s)`, detail: `Review comments${authors.length ? ` by ${authors.join(', ')}` : ''} are stored in the file. In Word use Review → Delete → Delete All Comments in Document.` });
    }
  }

  if (kind === 'xlsx' || kind === 'zip') {
    const workbook = await read('xl/workbook.xml');
    const hiddenSheets = [...workbook.matchAll(/<sheet\b[^>]*name="([^"]*)"[^>]*state="(hidden|veryHidden)"/g)].map((m) => `${decodeXml(m[1])}${m[2] === 'veryHidden' ? ' (very hidden)' : ''}`);
    if (hiddenSheets.length) findings.push({ id: 'xlsx-hidden-sheets', severity: 'high', cleanable: false, title: `${hiddenSheets.length} hidden sheet(s)`, detail: `${hiddenSheets.join(', ')}. Hidden sheets travel with the workbook and can be unhidden by anyone; "very hidden" ones do not even appear in Excel's Unhide menu. Delete them if they should not be shared.` });
    let hiddenRows = 0;
    let hiddenCols = 0;
    for (const path of list(/^xl\/worksheets\/sheet\d+\.xml$/)) {
      const sheet = await read(path);
      hiddenRows += (sheet.match(/<row\b[^>]*hidden="(?:1|true)"/g) || []).length;
      hiddenCols += (sheet.match(/<col\b[^>]*hidden="(?:1|true)"/g) || []).length;
    }
    if (hiddenRows || hiddenCols) findings.push({ id: 'xlsx-hidden-cells', severity: 'high', cleanable: false, title: 'Hidden rows or columns', detail: `${hiddenRows} hidden row(s) and ${hiddenCols} hidden column group(s). Their values are still in the file.` });
    const xlComments = list(/^xl\/(comments\d*|threadedComments\/[^/]+)\.xml$/).length;
    if (xlComments) findings.push({ id: 'xlsx-comments', severity: 'medium', cleanable: false, title: 'Cell comments or notes', detail: 'Comments keep their author names and text.' });
    const external = list(/^xl\/externalLinks\//).length;
    if (external) findings.push({ id: 'xlsx-external', severity: 'medium', cleanable: false, title: 'Links to other workbooks', detail: 'External links reveal the names and folder paths of other files, and can keep cached values copied from them.' });
    const pivotCaches = list(/^xl\/pivotCache\/pivotCacheRecords\d*\.xml$/).length;
    if (pivotCaches) findings.push({ id: 'xlsx-pivot-cache', severity: 'medium', cleanable: false, title: 'Pivot table source data', detail: 'Pivot caches store a copy of the source rows, even rows that the visible table filters out.' });
  }

  if (kind === 'pptx' || kind === 'zip') {
    const notes = list(/^ppt\/notesSlides\/notesSlide\d+\.xml$/);
    let notesWithText = 0;
    for (const path of notes) {
      const xml = await read(path);
      const text = [...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((m) => m[1]).join('').replace(/\d+/g, '').trim();
      if (text) notesWithText += 1;
    }
    if (notesWithText) findings.push({ id: 'pptx-notes', severity: 'high', cleanable: false, title: `Speaker notes on ${notesWithText} slide(s)`, detail: 'Notes are not shown during a presentation but are part of the file.' });
    let hiddenSlides = 0;
    for (const path of list(/^ppt\/slides\/slide\d+\.xml$/)) {
      if (/<p:sld\b[^>]*show="0"/.test(await read(path))) hiddenSlides += 1;
    }
    if (hiddenSlides) findings.push({ id: 'pptx-hidden-slides', severity: 'high', cleanable: false, title: `${hiddenSlides} hidden slide(s)`, detail: 'Hidden slides are skipped in a slideshow but anyone can view them.' });
    const pptComments = list(/^ppt\/comments\//).length;
    if (pptComments) findings.push({ id: 'pptx-comments', severity: 'medium', cleanable: false, title: 'Slide comments', detail: 'Review comments with author names are stored in the file.' });
  }

  const embedded = list(/^(word|xl|ppt)\/embeddings\//);
  if (embedded.length) findings.push({ id: 'office-embedded', severity: 'high', cleanable: false, title: `${embedded.length} embedded object(s)`, detail: `Other files are packed inside this one (${embedded.slice(0, 4).map((p) => p.split('/').pop()).join(', ')}${embedded.length > 4 ? ', …' : ''}). An embedded chart, for example, can carry its whole source workbook.` });

  const photos = list(/^(word|xl|ppt)\/media\/[^/]+\.(jpe?g)$/i).slice(0, 40);
  let photosWithGps = 0;
  for (const path of photos) {
    const scan = scanJpeg(await zip.file(path).async('uint8array'));
    if (scan.findings.some((f) => f.id === 'exif-gps')) photosWithGps += 1;
  }
  if (photosWithGps) findings.push({ id: 'office-photo-gps', severity: 'high', cleanable: false, title: `${photosWithGps} inserted photo(s) contain GPS location`, detail: 'Photos pasted into the document kept their camera metadata. Re-insert them after cleaning with this tool, or use the app\'s compress-pictures option.' });

  facts.parts = Object.keys(zip.files).length;
  return { kind, findings: dedupe(findings), facts };
}

function setXmlElement(xml, tag, value) {
  const re = new RegExp(`<${tag}(\\s[^>]*)?(?:/>|>[\\s\\S]*?</${tag}>)`);
  if (!re.test(xml)) return xml;
  return xml.replace(re, value === null ? '' : `<${tag}>${value}</${tag}>`);
}

/**
 * Clears the person, organisation and timeline properties. Content changes —
 * comments, tracked changes, hidden sheets, speaker notes — are left for the
 * visitor to resolve in the editing app, because deleting them here could
 * silently change what the document says.
 */
export async function cleanOoxml(zip) {
  const core = zip.file('docProps/core.xml') && await zip.file('docProps/core.xml').async('string');
  if (core) {
    let next = core;
    for (const tag of ['dc:creator', 'cp:lastModifiedBy', 'cp:lastPrinted', 'cp:category', 'cp:contentStatus']) next = setXmlElement(next, tag, null);
    next = setXmlElement(next, 'cp:revision', '1');
    zip.file('docProps/core.xml', next);
  }
  const app = zip.file('docProps/app.xml') && await zip.file('docProps/app.xml').async('string');
  if (app) {
    let next = app;
    for (const tag of ['Company', 'Manager', 'HyperlinkBase']) next = setXmlElement(next, tag, null);
    next = setXmlElement(next, 'Template', 'Normal.dotm');
    next = setXmlElement(next, 'TotalTime', '0');
    zip.file('docProps/app.xml', next);
  }
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', mimeType: 'application/octet-stream' });
}

/* ------------------------------------------------------------------ */
/* Logs, HAR and JSON                                                   */
/* ------------------------------------------------------------------ */

const SECRET_PATTERNS = [
  { id: 'jwt', title: 'JSON Web Token', re: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g },
  { id: 'bearer', title: 'Bearer token', re: /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/g },
  { id: 'private-key', title: 'Private key', re: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z]+ )?PRIVATE KEY-----/g },
  { id: 'aws-key', title: 'AWS access key ID', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { id: 'github-token', title: 'GitHub token', re: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/g },
  { id: 'stripe-key', title: 'Stripe secret key', re: /\b[sr]k_live_[A-Za-z0-9]{16,}\b/g },
  { id: 'slack-token', title: 'Slack token', re: /\bxox[abposr]-[A-Za-z0-9-]{10,}\b/g },
  { id: 'google-key', title: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { id: 'url-secret', title: 'Secret in a URL', re: /([?&#](?:access_token|id_token|refresh_token|token|api_key|apikey|key|secret|password|pwd|code|sig|signature|session|sessionid|auth)=)([^&#\s"'[\]]{6,})/gi }
];

const SENSITIVE_HEADERS = new Set(['authorization', 'proxy-authorization', 'cookie', 'set-cookie', 'x-api-key', 'x-auth-token', 'x-csrf-token', 'x-xsrf-token', 'x-amz-security-token', 'apikey']);
const SENSITIVE_KEY = /^(?:password|passwd|pwd|secret|client_secret|api[_-]?key|apikey|access[_-]?token|refresh[_-]?token|id[_-]?token|token|auth|authorization|session|sessionid|private[_-]?key|cookie)$/i;

const REDACTED = '[REDACTED]';

function maskSecret(value) {
  const s = String(value);
  if (s.length <= 8) return '••••';
  return `${s.slice(0, 4)}…${s.slice(-2)} (${s.length} chars)`;
}

export function scanText(text, kind = 'text') {
  const findings = [];
  for (const pattern of SECRET_PATTERNS) {
    const matches = [...text.matchAll(pattern.re)].map((m) => (pattern.id === 'url-secret' ? `${m[1]}${m[2]}` : m[0]));
    if (matches.length) {
      findings.push({
        id: `secret-${pattern.id}`, severity: 'high', cleanable: true,
        title: `${pattern.title}${matches.length > 1 ? ` ×${matches.length}` : ''}`,
        detail: `For example ${maskSecret(matches[0])}. Anyone with this value may be able to act as you until it expires or is revoked.`
      });
    }
  }
  if (kind === 'json') findings.push(...scanJsonStructure(text));
  return { kind, findings: dedupe(findings), facts: { characters: text.length } };
}

function scanJsonStructure(text) {
  let data;
  try { data = JSON.parse(text); } catch { return []; }
  const findings = [];
  const headerHits = new Map();
  const keyHits = new Map();
  const walk = (node, depth) => {
    if (depth > 40 || node === null || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach((child) => walk(child, depth + 1)); return; }
    if (typeof node.name === 'string' && 'value' in node && SENSITIVE_HEADERS.has(node.name.toLowerCase()) && String(node.value).length && node.value !== REDACTED) {
      headerHits.set(node.name.toLowerCase(), (headerHits.get(node.name.toLowerCase()) || 0) + 1);
    }
    for (const [key, value] of Object.entries(node)) {
      if (SENSITIVE_KEY.test(key) && (typeof value === 'string' || typeof value === 'number') && String(value).length && value !== REDACTED) {
        keyHits.set(key, (keyHits.get(key) || 0) + 1);
      }
      walk(value, depth + 1);
    }
  };
  walk(data, 0);
  const isHar = Boolean(data && data.log && Array.isArray(data.log.entries));
  if (headerHits.size) {
    findings.push({
      id: 'har-headers', severity: 'high', cleanable: true,
      title: isHar ? 'Login headers and cookies in the HAR recording' : 'Login headers or cookies',
      detail: `${[...headerHits].map(([k, n]) => `${k} ×${n}`).join(', ')}. Session cookies and Authorization headers let whoever reads the file sign in as you; this is how attackers used customer HAR files in the 2023 Okta support-system breach.`
    });
  }
  if (keyHits.size) {
    findings.push({ id: 'json-secret-keys', severity: 'high', cleanable: true, title: 'Fields named like passwords or tokens', detail: [...keyHits].map(([k, n]) => `${k} ×${n}`).join(', ') });
  }
  if (isHar) {
    const hosts = unique(data.log.entries.map((e) => { try { return new URL(e.request.url).host; } catch { return ''; } }));
    findings.push({ id: 'har-hosts', severity: 'low', cleanable: false, title: `Requests to ${hosts.length} site(s)`, detail: `${hosts.slice(0, 8).join(', ')}${hosts.length > 8 ? ', …' : ''}. Page contents, request bodies and responses are also recorded; review them before sharing.` });
  }
  return findings;
}

/** Redacts secrets in plain text and, for JSON/HAR, in sensitive headers and fields. */
export function cleanText(text, kind = 'text') {
  if (kind === 'json') {
    try {
      const data = JSON.parse(text);
      const walk = (node, depth) => {
        if (depth > 40 || node === null || typeof node !== 'object') return;
        if (Array.isArray(node)) { node.forEach((child) => walk(child, depth + 1)); return; }
        if (typeof node.name === 'string' && 'value' in node && SENSITIVE_HEADERS.has(node.name.toLowerCase())) node.value = REDACTED;
        for (const [key, value] of Object.entries(node)) {
          if (SENSITIVE_KEY.test(key) && (typeof value === 'string' || typeof value === 'number')) node[key] = REDACTED;
          else walk(value, depth + 1);
        }
      };
      walk(data, 0);
      text = JSON.stringify(data, null, 2);
    } catch { /* not valid JSON: fall back to pattern redaction only */ }
  }
  let out = text;
  for (const pattern of SECRET_PATTERNS) {
    out = out.replace(pattern.re, (...m) => (pattern.id === 'url-secret' ? `${m[1]}${REDACTED}` : pattern.id === 'bearer' ? `Bearer ${REDACTED}` : REDACTED));
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* helpers                                                              */
/* ------------------------------------------------------------------ */

function dedupe(findings) {
  const seen = new Set();
  return findings.filter((f) => {
    const key = `${f.id}|${f.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function concat(parts) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) { out.set(part, offset); offset += part.length; }
  return out;
}
