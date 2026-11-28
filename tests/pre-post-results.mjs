import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  parseTable,
  findIdentifyingColumns,
  guessItemType,
  analyze,
  summaryText,
  resultsCsv,
  chartSvg,
  SAMPLE_PRE,
  SAMPLE_POST
} from '../src/tools/education/pre-post-results/pre-post-core.mjs';

// --- parsing: what people paste from Google Sheets, Excel or a Forms CSV export ---
{
  const tsv = parseTable('Code\tQ1\tQ2\nA1\t4\tyes\nA2\t2\tno\n');
  assert.deepEqual(tsv.headers, ['Code', 'Q1', 'Q2']);
  assert.deepEqual(tsv.rows, [['A1', '4', 'yes'], ['A2', '2', 'no']]);

  const csv = parseTable('Code,"Q1, I can name a feeling",Q2\r\nA1,"5",Yes\r\n\r\n');
  assert.deepEqual(csv.headers, ['Code', 'Q1, I can name a feeling', 'Q2']);
  assert.deepEqual(csv.rows, [['A1', '5', 'Yes']]);

  const semi = parseTable('Code;Q1\nA1;3');
  assert.deepEqual(semi.rows, [['A1', '3']]);

  const quoted = parseTable('id,q\n1,"He said ""hi"""');
  assert.equal(quoted.rows[0][1], 'He said "hi"');

  assert.deepEqual(parseTable('   ').headers, []);
  // Excel and Forms CSV exports start with a byte-order mark.
  assert.equal(parseTable(String.fromCharCode(0xfeff) + 'Code,Q1\nA1,3').headers[0], 'Code');
}

// --- privacy: warn before anyone analyses a sheet with student names or emails ---
{
  const table = parseTable('Student Name,Email,Code,Q1\nJane Doe,jane@school.org,A1,4\nOmar Ali,omar@school.org,A2,3');
  const flagged = findIdentifyingColumns(table).map((f) => f.column);
  assert.ok(flagged.includes('Student Name'));
  assert.ok(flagged.includes('Email'));
  assert.ok(!flagged.includes('Code'));
  assert.ok(!flagged.includes('Q1'));

  // A column of "First Last" values is flagged even with a neutral header.
  const unnamed = parseTable('Who,Q1\nMaria Lopez,4\nTom Hill,5\nAnna Berg,3');
  assert.deepEqual(findIdentifyingColumns(unnamed).map((f) => f.column), ['Who']);

  // Google Forms adds a Timestamp column; that is not identifying.
  const forms = parseTable('Timestamp,Code,Q1\n2026/09/01 10:00:00,A1,4');
  assert.deepEqual(findIdentifyingColumns(forms), []);
}

// --- item type guess from the answers ---
assert.equal(guessItemType(['1', '4', '5', '3']).type, 'likert');
assert.equal(guessItemType(['1', '4', '5', '3']).scaleMax, 5);
assert.equal(guessItemType(['Yes', 'no', 'YES']).type, 'yesno');
assert.equal(guessItemType(['B', 'C', 'B', 'A']).type, 'knowledge');

// --- analysis ---
const pre = parseTable([
  'Code,Feel,Calm,Worry,Quiz',
  'A1,2,no,4,B',
  'A2,3,no,5,C',
  'A3,4,yes,2,B',
  'A4,1,no,5,A', // no post survey: unmatched
  'A5,x,yes,3,B' // invalid Likert value
].join('\n'));
const post = parseTable([
  'Code,Feel,Calm,Worry,Quiz',
  'a1,4,yes,2,B', // ids match case-insensitively
  'A2,5,yes,2,B',
  'A3,4,yes,1,B',
  'A5,4,no,2,B',
  'A6,5,yes,1,B' // no pre survey: unmatched
].join('\n'));

const config = {
  idColumn: 'Code',
  items: [
    { column: 'Feel', objective: 'Name feelings', type: 'likert', scaleMax: 5, agreeAt: 4 },
    { column: 'Calm', objective: 'Use a calming strategy', type: 'yesno' },
    { column: 'Worry', objective: 'Use a calming strategy', type: 'likert', scaleMax: 5, agreeAt: 4, reverse: true },
    { column: 'Quiz', objective: 'Know who to ask for help', type: 'knowledge', answer: 'b' }
  ],
  objectives: ['Name feelings', 'Use a calming strategy', 'Know who to ask for help', 'Set a goal']
};

const result = analyze(pre, post, config);

assert.equal(result.counts.pre, 5);
assert.equal(result.counts.post, 5);
assert.equal(result.counts.matched, 4); // A1, A2, A3, A5
assert.deepEqual(result.counts.preOnly, ['A4']);
assert.deepEqual(result.counts.postOnly, ['A6']);

const feel = result.items.find((item) => item.column === 'Feel');
// Matched only. A5's pre answer "x" is invalid, so A5 drops out of this item.
assert.equal(feel.n, 3);
assert.equal(feel.pre.mean, 3); // 2, 3, 4
assert.equal(feel.post.mean, 4.33); // 4, 5, 4
assert.equal(feel.pre.percent, 33); // 1 of 3 at 4+
assert.equal(feel.post.percent, 100);
assert.equal(feel.change, 67); // percentage points
assert.equal(feel.invalid, 1);

const calm = result.items.find((item) => item.column === 'Calm');
assert.equal(calm.n, 4);
assert.equal(calm.pre.percent, 50); // A3, A5
assert.equal(calm.post.percent, 75); // A1, A2, A3
assert.equal(calm.pre.mean, null);

const worry = result.items.find((item) => item.column === 'Worry');
// Reverse scored on a 1-5 scale: 4,5,2,3 -> 2,1,4,3 before; 2,2,1,2 -> 4,4,5,4 after.
assert.equal(worry.pre.mean, 2.5);
assert.equal(worry.post.mean, 4.25);
assert.equal(worry.pre.percent, 25);
assert.equal(worry.post.percent, 100);

const quiz = result.items.find((item) => item.column === 'Quiz');
assert.equal(quiz.pre.percent, 75); // B, C, B, B: answer key is case-insensitive
assert.equal(quiz.post.percent, 100);

const byObjective = Object.fromEntries(result.objectives.map((o) => [o.objective, o]));
assert.equal(byObjective['Use a calming strategy'].items, 2);
assert.equal(byObjective['Use a calming strategy'].pre, 38); // mean of 50 and 25, rounded
assert.equal(byObjective['Use a calming strategy'].post, 88);
assert.equal(byObjective['Set a goal'].items, 0);

const warningCodes = result.warnings.map((w) => w.code);
assert.ok(warningCodes.includes('objective-without-items'));
assert.ok(warningCodes.includes('unmatched-students'));
assert.ok(warningCodes.includes('invalid-answers'));
assert.ok(warningCodes.includes('small-group')); // 4 matched students

// Without matching, every valid answer counts on its own side.
const unmatched = analyze(pre, post, { ...config, matchedOnly: false });
assert.equal(unmatched.items.find((item) => item.column === 'Calm').pre.n, 5);

// A missing ID column is reported, not silently ignored.
assert.throws(() => analyze(pre, post, { ...config, idColumn: 'Nope' }), /ID column/);
assert.throws(() => analyze(pre, parseTable('Code,Feel\nA1,3'), config), /Calm/);

// --- report text: descriptive, never a claim of effect ---
const text = summaryText(result, { title: 'Grade 5 feelings unit' });
assert.match(text, /Grade 5 feelings unit/);
assert.match(text, /4 students completed both surveys/);
assert.match(text, /from 33% to 100%/);
assert.doesNotMatch(text, /prove|caused|significant|effective|diagnos|clinical/i);

const csvOut = resultsCsv(result);
assert.match(csvOut.split('\n')[0], /^Objective,Item,Type,Students,Before %,After %,Change \(points\),Before mean,After mean$/);
assert.equal(csvOut.trim().split('\n').length, 1 + config.items.length);

// Spreadsheet formula injection is neutralised in exported text.
const evil = analyze(parseTable('Code,=HYPERLINK("x")\nA1,3'), parseTable('Code,=HYPERLINK("x")\nA1,4'),
  { idColumn: 'Code', items: [{ column: '=HYPERLINK("x")', objective: '+cmd', type: 'likert', scaleMax: 5, agreeAt: 4 }] });
assert.doesNotMatch(resultsCsv(evil), /(^|,)"?[=+\-@]/m);

// --- chart: self-contained SVG with escaped labels ---
const svg = chartSvg(result, { title: 'Unit <1> & "results"' });
assert.match(svg, /^<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/);
assert.match(svg, /Unit &lt;1&gt; &amp; &quot;results&quot;/);
assert.equal((svg.match(/<rect class="bar-pre"/g) || []).length, 3); // objectives with items
assert.equal((svg.match(/<rect class="bar-post"/g) || []).length, 3);
assert.doesNotMatch(svg, /<script|href=|xlink/i);

// --- the bundled example is synthetic and analyses cleanly ---
const sample = analyze(parseTable(SAMPLE_PRE), parseTable(SAMPLE_POST), {
  idColumn: 'Student code',
  items: parseTable(SAMPLE_PRE).headers.slice(1).map((column) => ({ column, objective: 'Example', ...guessItemType(parseTable(SAMPLE_PRE).rows.map((r) => r[parseTable(SAMPLE_PRE).headers.indexOf(column)])) }))
});
assert.ok(sample.counts.matched >= 10);
assert.deepEqual(findIdentifyingColumns(parseTable(SAMPLE_PRE)), []);

// --- the page: local-only, honest scope ---
const page = readFileSync('src/tools/education/pre-post-results/index.html', 'utf8');
const app = readFileSync('src/tools/education/pre-post-results/pre-post-app.mjs', 'utf8');
assert.doesNotMatch(app, /fetch\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage/, 'answers must never leave the page or persist silently');
assert.match(page, /never leave/i);
assert.match(page, /not a (?:diagnostic|clinical)/i);
assert.doesNotMatch(page, /ASCA[- ](?:approved|endorsed|certified)|proves? (?:your|the) program/i);
assert.doesNotMatch(page, /LPC|Licensed Professional Counselor/);

console.log('pre/post results: pass');
