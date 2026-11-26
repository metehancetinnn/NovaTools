import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as pdfLib from 'pdf-lib';
import JSZip from 'jszip';
import {
  detectFileType, parseTiff, scanJpeg, cleanJpeg, scanPng, cleanPng, scanWebp, cleanWebp,
  scanPdf, cleanPdf, scanOoxml, cleanOoxml, scanText, cleanText, summarize
} from '../src/tools/security/share-safe-check/share-safe-core.mjs';

const ids = (scan) => scan.findings.map((f) => f.id);
const bytes = (arr) => Uint8Array.from(arr);
const ascii = (s) => [...s].map((c) => c.charCodeAt(0));

/* ---------- TIFF writer for fixtures (big-endian) ---------- */
function tiffWithGps() {
  // IFD0: Make, Model, ExifIFD ptr, GPS ptr ; ExifIFD: BodySerialNumber ; GPS: lat/lon
  const out = [];
  const u16 = (v) => out.push((v >> 8) & 255, v & 255);
  const u32 = (v) => out.push((v >>> 24) & 255, (v >> 16) & 255, (v >> 8) & 255, v & 255);
  const make = 'Pixel\0'; const model = 'Pixel 8\0'; const serial = 'SN-4815162342\0';
  // layout offsets
  const ifd0 = 8; const ifd0Size = 2 + 4 * 12 + 4;
  const exif = ifd0 + ifd0Size; const exifSize = 2 + 1 * 12 + 4;
  const gps = exif + exifSize; const gpsSize = 2 + 4 * 12 + 4;
  let data = gps + gpsSize;
  const makeAt = data; data += make.length;
  const modelAt = data; data += model.length;
  const serialAt = data; data += serial.length;
  const latAt = data; data += 24;
  const lonAt = data; data += 24;
  out.push(0x4d, 0x4d); u16(42); u32(ifd0);
  u16(4);
  u16(0x010f); u16(2); u32(make.length); u32(makeAt);
  u16(0x0110); u16(2); u32(model.length); u32(modelAt);
  u16(0x8769); u16(4); u32(1); u32(exif);
  u16(0x8825); u16(4); u32(1); u32(gps);
  u32(0);
  u16(1);
  u16(0xa431); u16(2); u32(serial.length); u32(serialAt);
  u32(0);
  u16(4);
  u16(0x0001); u16(2); u32(2); out.push(0x4e, 0, 0, 0); // 'N'
  u16(0x0002); u16(5); u32(3); u32(latAt);
  u16(0x0003); u16(2); u32(2); out.push(0x45, 0, 0, 0); // 'E'
  u16(0x0004); u16(5); u32(3); u32(lonAt);
  u32(0);
  out.push(...ascii(make), ...ascii(model), ...ascii(serial));
  for (const [num, den] of [[41, 1], [0, 1], [0, 1]]) { u32(num); u32(den); }
  for (const [num, den] of [[29, 1], [0, 1], [0, 1]]) { u32(num); u32(den); }
  return bytes(out);
}

function jpegFixture({ orientationExif = false } = {}) {
  const tiff = tiffWithGps();
  const exifBody = [...ascii('Exif\0\0'), ...tiff];
  const app1 = [0xff, 0xe1, (exifBody.length + 2) >> 8, (exifBody.length + 2) & 255, ...exifBody];
  const jfif = [0xff, 0xe0, 0x00, 0x10, ...ascii('JFIF\0'), 1, 1, 0, 0, 1, 0, 1, 0, 0];
  const comment = ascii('Shot at home');
  const com = [0xff, 0xfe, 0, comment.length + 2, ...comment];
  const sos = [0xff, 0xda, 0x00, 0x08, 1, 1, 0, 0, 63, 0, 0x12, 0x34, 0xff, 0xd9];
  let orient = [];
  if (orientationExif) {
    const body = [...ascii('Exif\0\0'), 0x4d, 0x4d, 0, 42, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, 6, 0, 0, 0, 0, 0, 0];
    orient = [0xff, 0xe1, 0, body.length + 2, ...body];
  }
  return bytes([0xff, 0xd8, ...jfif, ...(orientationExif ? orient : app1), ...com, ...sos]);
}

/* ---------- type detection ---------- */
assert.equal(detectFileType(jpegFixture(), 'a.jpg'), 'jpeg');
assert.equal(detectFileType(bytes(ascii('%PDF-1.7\n')), 'x.pdf'), 'pdf');
assert.equal(detectFileType(bytes([0x50, 0x4b, 3, 4]), 'report.xlsx'), 'xlsx');
assert.equal(detectFileType(bytes(ascii('{"log":{}}')), 'capture.har'), 'json');
assert.equal(detectFileType(bytes(ascii('hello')), 'notes.txt'), 'text');

/* ---------- EXIF / JPEG ---------- */
const tiff = parseTiff(tiffWithGps());
assert.equal(tiff.tags.Make, 'Pixel');
assert.equal(tiff.tags.BodySerialNumber, 'SN-4815162342');
assert.deepEqual(tiff.tags.GPSLatitude, [41, 0, 0]);

const jpeg = jpegFixture();
const jpegScan = scanJpeg(jpeg);
assert.ok(ids(jpegScan).includes('exif-gps'), 'GPS must be reported');
assert.ok(ids(jpegScan).includes('exif-serial'), 'serial must be reported');
assert.ok(ids(jpegScan).includes('jpeg-comment'), 'comment must be reported');
assert.match(jpegScan.findings.find((f) => f.id === 'exif-gps').detail, /41\.00000, 29\.00000/);
assert.equal(summarize(jpegScan.findings).high, 1);

const cleanedJpeg = cleanJpeg(jpeg);
assert.deepEqual(scanJpeg(cleanedJpeg).findings, [], 'cleaned JPEG must have no findings');
assert.ok(cleanedJpeg.length < jpeg.length);
assert.deepEqual([...cleanedJpeg.slice(-14)], [...jpeg.slice(-14)], 'scan data from SOS onward must be byte-identical');
assert.ok(Buffer.from(cleanedJpeg).includes(Buffer.from('JFIF')), 'JFIF header must be kept');

// A rotated photo keeps only its orientation tag.
const rotated = jpegFixture({ orientationExif: true });
const rotatedClean = cleanJpeg(rotated);
assert.equal(scanJpeg(rotatedClean).facts.orientation, 6, 'orientation must survive cleaning');
assert.deepEqual(scanJpeg(rotatedClean).findings, []);

/* ---------- PNG ---------- */
function pngChunk(type, data) {
  const len = data.length;
  return [(len >>> 24) & 255, (len >> 16) & 255, (len >> 8) & 255, len & 255, ...ascii(type), ...data, 0, 0, 0, 0];
}
const png = bytes([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ...pngChunk('IHDR', [0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]),
  ...pngChunk('tEXt', [...ascii('Author'), 0, ...ascii('Ayse Yilmaz')]),
  ...pngChunk('IDAT', [1, 2, 3]),
  ...pngChunk('IEND', [])
]);
const pngScan = scanPng(png);
assert.ok(pngScan.findings.some((f) => /Ayse Yilmaz/.test(f.detail)));
const pngClean = cleanPng(png);
assert.deepEqual(scanPng(pngClean).findings, []);
assert.ok(Buffer.from(pngClean).includes(Buffer.from('IDAT')));

/* ---------- WebP ---------- */
function riffChunk(type, data) {
  const len = data.length;
  return [...ascii(type), len & 255, (len >> 8) & 255, (len >> 16) & 255, (len >>> 24) & 255, ...data, ...(len % 2 ? [0] : [])];
}
const webpBody = [
  ...ascii('WEBP'),
  ...riffChunk('VP8X', [0x0c, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  ...riffChunk('VP8 ', [9, 9, 9, 9]),
  ...riffChunk('EXIF', [...tiffWithGps()])
];
const webp = bytes([...ascii('RIFF'), webpBody.length & 255, (webpBody.length >> 8) & 255, 0, 0, ...webpBody]);
assert.ok(ids(scanWebp(webp)).includes('exif-gps'));
const webpClean = cleanWebp(webp);
assert.deepEqual(scanWebp(webpClean).findings, []);
const webpView = new DataView(webpClean.buffer);
assert.equal(webpView.getUint32(4, true), webpClean.length - 8, 'RIFF size must be rewritten');
assert.equal(webpClean[20] & 0x0c, 0, 'VP8X EXIF/XMP flags must be cleared');

/* ---------- PDF ---------- */
const { PDFDocument, PDFName, PDFString } = pdfLib;
const doc = await PDFDocument.create();
doc.addPage([200, 200]);
doc.setAuthor('Ayse Yilmaz');
doc.setProducer('Word for Office 365');
// An object no longer referenced by the document: what an earlier revision leaves behind.
doc.context.register(doc.context.obj({ Leftover: PDFString.of('SECRET-OLD-TEXT') }));
const page = doc.getPage(0);
const note = doc.context.register(doc.context.obj({ Type: 'Annot', Subtype: 'Text', Rect: [0, 0, 10, 10], Contents: PDFString.of('Ask legal first'), T: PDFString.of('Reviewer') }));
page.node.set(PDFName.of('Annots'), doc.context.obj([note]));
let pdfBytes = await doc.save({ useObjectStreams: false });
// Simulate an incremental save by appending a second trailer section.
pdfBytes = Buffer.concat([Buffer.from(pdfBytes), Buffer.from('\n%comment appended by an editor\n%%EOF\n')]);

const pdfScan = await scanPdf(new Uint8Array(pdfBytes), pdfLib);
assert.ok(ids(pdfScan).includes('pdf-revisions'), 'incremental saves must be reported');
assert.ok(ids(pdfScan).includes('pdf-author'));
assert.ok(ids(pdfScan).includes('pdf-comments'));
assert.ok(Buffer.from(pdfBytes).includes(Buffer.from('SECRET-OLD-TEXT')));

const pdfClean = await cleanPdf(new Uint8Array(pdfBytes), pdfLib);
const pdfAfter = await scanPdf(pdfClean, pdfLib);
for (const id of ['pdf-revisions', 'pdf-author', 'pdf-software', 'pdf-comments', 'pdf-xmp']) {
  assert.ok(!ids(pdfAfter).includes(id), `${id} must be gone after cleaning`);
}
assert.ok(!Buffer.from(pdfClean).includes(Buffer.from('SECRET-OLD-TEXT')), 'unreachable leftovers must be dropped');
assert.ok(!Buffer.from(pdfClean).includes(Buffer.from('Ayse')), 'author must not survive anywhere in the file');
assert.equal((await PDFDocument.load(pdfClean)).getPageCount(), 1, 'pages must survive');

/* ---------- Office ---------- */
const docx = new JSZip();
docx.file('docProps/core.xml', '<cp:coreProperties xmlns:cp="c" xmlns:dc="d" xmlns:dcterms="t"><dc:creator>Ayse Yilmaz</dc:creator><cp:lastModifiedBy>Mehmet Kaya</cp:lastModifiedBy><cp:revision>14</cp:revision><dcterms:created>2026-01-02T10:00:00Z</dcterms:created></cp:coreProperties>');
docx.file('docProps/app.xml', '<Properties><Template>Normal.dotm</Template><TotalTime>95</TotalTime><Company>Acme Hukuk Bürosu</Company></Properties>');
docx.file('word/document.xml', '<w:document><w:body><w:p><w:del w:author="Mehmet Kaya"><w:r><w:delText>settlement up to 2 million</w:delText></w:r></w:del><w:ins w:author="Mehmet Kaya"><w:r><w:t>see annex</w:t></w:r></w:ins></w:p></w:body></w:document>');
docx.file('word/comments.xml', '<w:comments><w:comment w:id="0" w:author="Mehmet Kaya"><w:p><w:r><w:t>Do not send to client</w:t></w:r></w:p></w:comment></w:comments>');
docx.file('word/media/image1.jpeg', jpegFixture());
const docxZip = await JSZip.loadAsync(await docx.generateAsync({ type: 'uint8array' }));
const docxScan = await scanOoxml(docxZip, 'docx');
for (const id of ['office-people', 'office-org', 'docx-tracked', 'docx-comments', 'office-photo-gps', 'office-edit-time']) {
  assert.ok(ids(docxScan).includes(id), `${id} must be reported`);
}
assert.match(docxScan.findings.find((f) => f.id === 'docx-tracked').detail, /settlement up to 2 million/);
const docxClean = await JSZip.loadAsync(await cleanOoxml(docxZip));
const docxAfter = await scanOoxml(docxClean, 'docx');
for (const id of ['office-people', 'office-org', 'office-edit-time']) assert.ok(!ids(docxAfter).includes(id), `${id} must be cleaned`);
assert.ok(ids(docxAfter).includes('docx-tracked'), 'content issues are reported, not silently changed');

const xlsx = new JSZip();
xlsx.file('xl/workbook.xml', '<workbook><sheets><sheet name="Summary" sheetId="1"/><sheet name="Salaries" sheetId="2" state="veryHidden"/></sheets></workbook>');
xlsx.file('xl/worksheets/sheet1.xml', '<worksheet><cols><col min="3" max="3" hidden="1"/></cols><sheetData><row r="4" hidden="1"/></sheetData></worksheet>');
const xlsxScan = await scanOoxml(await JSZip.loadAsync(await xlsx.generateAsync({ type: 'uint8array' })), 'xlsx');
assert.match(xlsxScan.findings.find((f) => f.id === 'xlsx-hidden-sheets').detail, /Salaries \(very hidden\)/);
assert.ok(ids(xlsxScan).includes('xlsx-hidden-cells'));

/* ---------- HAR / logs ---------- */
const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.c2lnbmF0dXJlLXZhbHVlLWhlcmU';
const har = JSON.stringify({ log: { entries: [{
  request: { url: 'https://app.example.com/api?access_token=abcdef123456', headers: [{ name: 'Authorization', value: `Bearer ${jwt}` }, { name: 'Accept', value: '*/*' }], cookies: [] },
  response: { headers: [{ name: 'Set-Cookie', value: 'session=s3cr3tvalue; HttpOnly' }] }
}] } });
const harScan = scanText(har, 'json');
for (const id of ['har-headers', 'secret-jwt', 'secret-url-secret', 'har-hosts']) assert.ok(ids(harScan).includes(id), `${id} must be reported`);
const harClean = cleanText(har, 'json');
assert.ok(!harClean.includes(jwt) && !harClean.includes('s3cr3tvalue') && !harClean.includes('abcdef123456'));
assert.ok(harClean.includes('"Accept"'), 'harmless headers must be kept');
const harAfter = scanText(harClean, 'json');
assert.ok(harAfter.findings.every((f) => f.severity !== 'high'), 'no high-severity secret may remain');

const log = 'deploy ok\nAWS_ACCESS_KEY_ID=AKIAABCDEFGHIJKLMNOP\ntoken ghp_abcdefghijklmnopqrstuvwxyz0123456789AB\n';
assert.ok(ids(scanText(log)).includes('secret-aws-key'));
assert.ok(ids(scanText(log)).includes('secret-github-token'));
assert.deepEqual(scanText(cleanText(log)).findings, []);

/* ---------- page contract ---------- */
const page$ = readFileSync('src/tools/security/share-safe-check/index.html', 'utf8');
assert.match(page$, /<link rel="canonical" href="https:\/\/mc-novatools\.com\/tools\/security\/share-safe-check\/">/);
assert.doesNotMatch(page$, /LPC|psk\.dan/, 'the page must not carry the retired licence claim or address');
assert.match(page$, /not uploaded/i, 'the privacy promise must be stated');
const appSource = readFileSync('src/tools/security/share-safe-check/share-safe-app.mjs', 'utf8');
assert.doesNotMatch(appSource, /\bfetch\(|XMLHttpRequest|sendBeacon/, 'the tool must not send file data anywhere');

console.log('share-safe-check: all assertions passed');
