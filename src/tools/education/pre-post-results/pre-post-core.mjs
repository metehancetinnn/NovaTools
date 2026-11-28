/**
 * Pre/Post Results Builder: the calculations, with no DOM access.
 *
 * A school counsellor gives the same short survey before and after a lesson
 * unit or small group. This module turns the two answer sheets into the
 * numbers a results report asks for: students who answered both, per-item and
 * per-objective share agreeing/correct, means and the change in percentage
 * points. Everything runs in the browser; nothing here touches the network.
 *
 * It is descriptive only. It does not test statistical significance, and the
 * report text never says the lesson caused a change.
 */

const BOM = new RegExp(`^${String.fromCharCode(0xfeff)}`);
const YES = new Set(['yes', 'y', 'true', '1', 'evet', 'e', 'sí', 'si', 'oui', 'ja']);
const NO = new Set(['no', 'n', 'false', '0', 'hayır', 'hayir', 'h', 'non', 'nein']);

/* ----------------------------------------------------------------------------
 * Parsing
 * ------------------------------------------------------------------------- */

function detectDelimiter(firstLine) {
  const counts = { '\t': 0, ',': 0, ';': 0 };
  let quoted = false;
  for (const char of firstLine) {
    if (char === '"') quoted = !quoted;
    else if (!quoted && char in counts) counts[char] += 1;
  }
  if (counts['\t'] > 0) return '\t';
  return counts[';'] > counts[','] ? ';' : ',';
}

/** Parses pasted spreadsheet cells or a CSV/TSV export into headers and rows. */
export function parseTable(text) {
  const source = String(text || '').replace(BOM, '');
  if (!source.trim()) return { headers: [], rows: [] };
  const delimiter = detectDelimiter(source.split(/\r?\n/, 1)[0]);

  const records = [];
  let record = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"' && field === '') {
      quoted = true;
    } else if (char === delimiter) {
      record.push(field); field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[i + 1] === '\n') i += 1;
      record.push(field); field = '';
      records.push(record); record = [];
    } else {
      field += char;
    }
  }
  record.push(field);
  records.push(record);

  const clean = records
    .map((cells) => cells.map((cell) => cell.trim()))
    .filter((cells) => cells.some((cell) => cell !== ''));
  if (!clean.length) return { headers: [], rows: [] };
  const [headers, ...rows] = clean;
  return { headers, rows: rows.map((row) => headers.map((_, index) => row[index] ?? '')) };
}

/* ----------------------------------------------------------------------------
 * Privacy check
 * ------------------------------------------------------------------------- */

const IDENTIFYING_HEADER = /\b(name|first|last|surname|full ?name|e-?mail|mail|phone|address|birth|dob|ad|soyad|isim|telefon|adres|doğum|okul ?no|tc)\b/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERSON_NAME = /^\p{Lu}[\p{Ll}'’-]+(?:\s+\p{Lu}[\p{Ll}'’-]+)+$/u;
const PHONE = /^\+?[\d\s().-]{9,}$/;

/**
 * Columns that look like names, emails or phone numbers. The tool asks people
 * to use student codes instead; this is the reminder when they forget.
 */
export function findIdentifyingColumns(table) {
  const findings = [];
  table.headers.forEach((header, index) => {
    if (/^time ?stamp$|^zaman damgası$/i.test(header)) return;
    const values = table.rows.map((row) => row[index]).filter(Boolean).slice(0, 50);
    const share = (test) => (values.length ? values.filter((value) => test.test(value)).length / values.length : 0);
    let reason = null;
    if (share(EMAIL) >= 0.5) reason = 'email addresses';
    else if (share(PERSON_NAME) >= 0.5) reason = 'what look like names';
    else if (share(PHONE) >= 0.5 && values.some((value) => /\s|\+|\(/.test(value))) reason = 'phone numbers';
    else if (header.split(/\s+/).length <= 3 && IDENTIFYING_HEADER.test(header)) reason = 'a header that suggests personal details';
    if (reason) findings.push({ column: header, reason });
  });
  return findings;
}

/* ----------------------------------------------------------------------------
 * Item types
 * ------------------------------------------------------------------------- */

/** Suggests how to score a column from its answers. The user can change it. */
export function guessItemType(values) {
  const answers = values.map((value) => String(value ?? '').trim()).filter(Boolean);
  if (!answers.length) return { type: 'likert', scaleMax: 5 };
  const lower = answers.map((value) => value.toLowerCase());
  if (lower.every((value) => YES.has(value) || NO.has(value)) && lower.some((value) => !/^[01]$/.test(value))) {
    return { type: 'yesno' };
  }
  const numbers = answers.map(Number);
  if (numbers.every((n) => Number.isInteger(n) && n >= 0 && n <= 10)) {
    const max = Math.max(...numbers);
    const scaleMax = max <= 3 ? 3 : max <= 4 ? 4 : max <= 5 ? 5 : max <= 7 ? 7 : 10;
    return { type: 'likert', scaleMax };
  }
  return { type: 'knowledge' };
}

function scoreAnswer(item, raw) {
  const value = String(raw ?? '').trim();
  if (value === '') return null; // blank: skipped, not invalid
  if (item.type === 'yesno') {
    const lower = value.toLowerCase();
    if (YES.has(lower)) return { hit: true, value: null };
    if (NO.has(lower)) return { hit: false, value: null };
    return undefined;
  }
  if (item.type === 'knowledge') {
    const key = String(item.answer ?? '').trim().toLowerCase();
    if (!key) return undefined;
    return { hit: value.toLowerCase() === key, value: null };
  }
  const max = Number(item.scaleMax) || 5;
  const min = Number.isInteger(item.scaleMin) ? item.scaleMin : 1;
  const number = Number(value.replace(',', '.'));
  if (!Number.isFinite(number) || number < min || number > max) return undefined;
  const scored = item.reverse ? max + min - number : number;
  const agreeAt = Number(item.agreeAt) || Math.max(min, max - 1);
  return { hit: scored >= agreeAt, value: scored };
}

/* ----------------------------------------------------------------------------
 * Analysis
 * ------------------------------------------------------------------------- */

const round = (n, digits = 0) => {
  if (n === null || !Number.isFinite(n)) return null;
  const f = 10 ** digits;
  return Math.round((n + Number.EPSILON) * f) / f;
};

function summarise(scores) {
  if (!scores.length) return { n: 0, percent: null, mean: null, rawPercent: null };
  const hits = scores.filter((score) => score.hit).length;
  const values = scores.map((score) => score.value).filter((value) => value !== null);
  const rawPercent = (hits / scores.length) * 100;
  return {
    n: scores.length,
    percent: round(rawPercent),
    rawPercent,
    mean: values.length ? round(values.reduce((a, b) => a + b, 0) / values.length, 2) : null
  };
}

function indexRows(table, idIndex) {
  const map = new Map();
  for (const row of table.rows) {
    const id = String(row[idIndex] ?? '').trim();
    if (id) map.set(id.toLowerCase(), { id, row });
  }
  return map;
}

/**
 * @param {{headers: string[], rows: string[][]}} pre
 * @param {{headers: string[], rows: string[][]}} post
 * @param {{idColumn: string, items: object[], objectives?: string[], matchedOnly?: boolean}} config
 */
export function analyze(pre, post, config) {
  const matchedOnly = config.matchedOnly !== false;
  const preId = pre.headers.indexOf(config.idColumn);
  const postId = post.headers.indexOf(config.idColumn);
  if (preId < 0 || postId < 0) {
    throw new Error(`The ID column "${config.idColumn}" must be in both the before and the after answers.`);
  }
  for (const item of config.items) {
    const missing = [pre, post].filter((table) => !table.headers.includes(item.column));
    if (missing.length) {
      throw new Error(`The question "${item.column}" must be in both the before and the after answers.`);
    }
  }

  const preRows = indexRows(pre, preId);
  const postRows = indexRows(post, postId);
  const matchedKeys = [...preRows.keys()].filter((key) => postRows.has(key));
  const preOnly = [...preRows.keys()].filter((key) => !postRows.has(key)).map((key) => preRows.get(key).id);
  const postOnly = [...postRows.keys()].filter((key) => !preRows.has(key)).map((key) => postRows.get(key).id);

  const items = config.items.map((item) => {
    const preCol = pre.headers.indexOf(item.column);
    const postCol = post.headers.indexOf(item.column);
    let invalid = 0;
    const preScores = [];
    const postScores = [];
    if (matchedOnly) {
      for (const key of matchedKeys) {
        const a = scoreAnswer(item, preRows.get(key).row[preCol]);
        const b = scoreAnswer(item, postRows.get(key).row[postCol]);
        if (a === undefined) invalid += 1;
        if (b === undefined) invalid += 1;
        if (a && b) { preScores.push(a); postScores.push(b); }
      }
    } else {
      for (const { row } of preRows.values()) {
        const score = scoreAnswer(item, row[preCol]);
        if (score === undefined) invalid += 1; else if (score) preScores.push(score);
      }
      for (const { row } of postRows.values()) {
        const score = scoreAnswer(item, row[postCol]);
        if (score === undefined) invalid += 1; else if (score) postScores.push(score);
      }
    }
    const before = summarise(preScores);
    const after = summarise(postScores);
    const change = before.rawPercent === null || after.rawPercent === null ? null : round(after.rawPercent - before.rawPercent);
    return {
      column: item.column,
      objective: item.objective || 'Unassigned',
      type: item.type,
      reverse: Boolean(item.reverse),
      n: matchedOnly ? preScores.length : null,
      pre: { n: before.n, percent: before.percent, mean: before.mean },
      post: { n: after.n, percent: after.percent, mean: after.mean },
      change,
      invalid,
      _raw: [before.rawPercent, after.rawPercent]
    };
  });

  const objectiveNames = [...new Set([...(config.objectives || []), ...items.map((item) => item.objective)])];
  const objectives = objectiveNames.map((objective) => {
    const own = items.filter((item) => item.objective === objective && item._raw[0] !== null && item._raw[1] !== null);
    const avg = (index) => (own.length ? own.reduce((sum, item) => sum + item._raw[index], 0) / own.length : null);
    const before = avg(0);
    const after = avg(1);
    return {
      objective,
      items: items.filter((item) => item.objective === objective).length,
      pre: round(before),
      post: round(after),
      change: before === null ? null : round(after - before)
    };
  });

  const warnings = [];
  for (const objective of objectives.filter((o) => o.items === 0)) {
    warnings.push({ code: 'objective-without-items', message: `No question measures the objective "${objective.objective}".` });
  }
  if (matchedOnly && (preOnly.length || postOnly.length)) {
    warnings.push({
      code: 'unmatched-students',
      message: `${preOnly.length} student code(s) appear only before and ${postOnly.length} only after; they are left out. Check for typos in the codes.`
    });
  }
  const invalidTotal = items.reduce((sum, item) => sum + item.invalid, 0);
  if (invalidTotal) {
    warnings.push({ code: 'invalid-answers', message: `${invalidTotal} answer(s) did not fit the question type or scale and were left out.` });
  }
  const groupSize = matchedOnly ? matchedKeys.length : Math.min(preRows.size, postRows.size);
  if (groupSize > 0 && groupSize < 10) {
    warnings.push({ code: 'small-group', message: `Only ${groupSize} students: one student changes a percentage by ${round(100 / groupSize)} points. Report the numbers as a description of this group.` });
  }
  if (groupSize === 0) {
    warnings.push({ code: 'no-matches', message: 'No student code appears in both sheets.' });
  }

  return {
    matchedOnly,
    counts: { pre: preRows.size, post: postRows.size, matched: matchedKeys.length, preOnly, postOnly },
    items: items.map(({ _raw, ...item }) => item),
    objectives,
    warnings
  };
}

/* ----------------------------------------------------------------------------
 * Outputs
 * ------------------------------------------------------------------------- */

const pct = (n) => `${n}%`;

/** A plain-language paragraph for a results report. Descriptive wording only. */
export function summaryText(result, { title = 'This lesson unit' } = {}) {
  const lines = [];
  const who = result.matchedOnly
    ? `${result.counts.matched} students completed both surveys`
    : `${result.counts.pre} students answered before and ${result.counts.post} after`;
  lines.push(`${title}: ${who}.`);
  for (const objective of result.objectives.filter((o) => o.pre !== null)) {
    const direction = objective.change > 0 ? 'rose' : objective.change < 0 ? 'fell' : 'stayed';
    const movement = objective.change === 0
      ? `stayed at ${pct(objective.post)}`
      : `${direction} from ${pct(objective.pre)} to ${pct(objective.post)} (${objective.change > 0 ? '+' : ''}${objective.change} points)`;
    lines.push(`For "${objective.objective}", the share of answers meeting the target ${movement}.`);
  }
  lines.push('These figures describe this group\'s survey answers before and after; they are not a controlled comparison.');
  return lines.join(' ');
}

function csvCell(value) {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text) && !/^-?\d+(\.\d+)?$/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Per-item results as CSV, safe to open in a spreadsheet. */
export function resultsCsv(result) {
  const header = ['Objective', 'Item', 'Type', 'Students', 'Before %', 'After %', 'Change (points)', 'Before mean', 'After mean'];
  const rows = result.items.map((item) => [
    item.objective, item.column, item.reverse ? `${item.type} (reversed)` : item.type,
    item.n ?? `${item.pre.n}/${item.post.n}`, item.pre.percent, item.post.percent, item.change, item.pre.mean, item.post.mean
  ]);
  return `${[header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')  }\n`;
}

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function wrap(text, width) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((`${line  } ${  word}`).trim().length > width && line) { lines.push(line); line = word; }
    else line = (`${line  } ${  word}`).trim();
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

/** Grouped before/after bar chart per objective, as a standalone SVG string. */
export function chartSvg(result, { title = 'Before and after' } = {}) {
  const data = result.objectives.filter((o) => o.pre !== null);
  const groupWidth = 150;
  const width = Math.max(480, 80 + data.length * groupWidth);
  const height = 380;
  const top = 64;
  const bottom = 300;
  const scale = (value) => ((bottom - top) * value) / 100;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)}">`,
    '<style>text{font-family:Arial,Helvetica,sans-serif;fill:#1f2937}.t{font-size:18px;font-weight:700}.s{font-size:12px}.v{font-size:12px;font-weight:700}.bar-pre{fill:#9ca3af}.bar-post{fill:#1d4ed8}</style>',
    `<rect width="${width}" height="${height}" fill="#ffffff"/>`,
    `<text class="t" x="24" y="32">${escapeXml(title)}</text>`,
    `<rect x="24" y="44" width="12" height="12" class="bar-pre"/><text class="s" x="42" y="54">Before</text>`,
    `<rect x="100" y="44" width="12" height="12" class="bar-post"/><text class="s" x="118" y="54">After</text>`
  ];
  for (const tick of [0, 25, 50, 75, 100]) {
    const y = bottom - scale(tick);
    parts.push(`<line x1="56" x2="${width - 16}" y1="${y}" y2="${y}" stroke="#e5e7eb"/><text class="s" x="50" y="${y + 4}" text-anchor="end">${tick}%</text>`);
  }
  data.forEach((objective, index) => {
    const x = 72 + index * groupWidth;
    const preH = scale(objective.pre);
    const postH = scale(objective.post);
    parts.push(`<rect class="bar-pre" x="${x}" y="${bottom - preH}" width="52" height="${preH}"><title>Before: ${objective.pre}%</title></rect>`);
    parts.push(`<rect class="bar-post" x="${x + 60}" y="${bottom - postH}" width="52" height="${postH}"><title>After: ${objective.post}%</title></rect>`);
    parts.push(`<text class="v" x="${x + 26}" y="${bottom - preH - 6}" text-anchor="middle">${objective.pre}%</text>`);
    parts.push(`<text class="v" x="${x + 86}" y="${bottom - postH - 6}" text-anchor="middle">${objective.post}%</text>`);
    wrap(objective.objective, 20).forEach((line, lineIndex) => {
      parts.push(`<text class="s" x="${x + 56}" y="${bottom + 20 + lineIndex * 15}" text-anchor="middle">${escapeXml(line)}</text>`);
    });
  });
  parts.push(`<text class="s" x="24" y="${height - 12}">Share of answers meeting the target. ${result.matchedOnly ? `${result.counts.matched} students answered both surveys.` : ''}</text>`);
  parts.push('</svg>');
  return parts.join('');
}

/* ----------------------------------------------------------------------------
 * Example data (synthetic: invented codes and answers, no real students)
 * ------------------------------------------------------------------------- */

const SAMPLE_ITEMS = 'Student code,I can name three feelings (1-5),I know a calming strategy (yes/no),I worry before tests (1-5),I know who to ask for help at school (yes/no)';
export const SAMPLE_PRE = [
  SAMPLE_ITEMS,
  'S01,2,no,4,yes', 'S02,3,no,5,no', 'S03,2,yes,4,yes', 'S04,4,no,3,no', 'S05,3,no,4,no', 'S06,1,no,5,yes',
  'S07,3,yes,2,yes', 'S08,2,no,4,no', 'S09,4,yes,3,yes', 'S10,2,no,5,no', 'S11,3,no,4,yes', 'S12,2,no,3,no'
].join('\n');
export const SAMPLE_POST = [
  SAMPLE_ITEMS,
  'S01,4,yes,3,yes', 'S02,4,yes,3,yes', 'S03,3,yes,2,yes', 'S04,5,yes,2,yes', 'S05,4,no,4,yes', 'S06,3,yes,4,yes',
  'S07,4,yes,2,yes', 'S08,4,yes,3,no', 'S09,5,yes,2,yes', 'S10,3,no,4,yes', 'S11,4,yes,2,yes', 'S13,4,yes,2,yes'
].join('\n');
