/**
 * Pre/Post Results Builder: page wiring. All work happens in this tab.
 * Answers are never sent anywhere and never written to browser storage; a
 * project is kept only if the user saves it as a file.
 */
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
} from './pre-post-core.mjs';

const $ = (id) => document.getElementById(id);
const els = {
  title: $('reportTitle'), pre: $('preInput'), post: $('postInput'), preFile: $('preFile'), postFile: $('postFile'),
  sample: $('loadSample'), clear: $('clearAll'), privacy: $('privacyWarning'), setup: $('setupSection'),
  idColumn: $('idColumn'), matchedOnly: $('matchedOnly'), objectives: $('objectiveList'), items: $('itemRows'),
  objectiveOptions: $('objectiveOptions'), analyzeBtn: $('analyzeBtn'), status: $('status'), results: $('resultsSection'),
  warnings: $('warnings'), counts: $('counts'), chart: $('chart'), table: $('resultsTable'), summary: $('summary'),
  dlSvg: $('downloadSvg'), dlPng: $('downloadPng'), dlCsv: $('downloadCsv'), copy: $('copySummary'), print: $('printReport'),
  save: $('saveProject'), open: $('openProject'), reportTitleOut: $('reportTitleOut')
};

let lastResult = null;
let itemState = new Map(); // column -> settings chosen by the user

/** Consent-gated, count-only usage event. Never includes answers, codes, titles or questions. */
function track(name, params) {
  if (typeof window.gtag === 'function') window.gtag('event', name, { tool_slug: 'education/pre-post-results', ...params });
}

function setStatus(message, isError = false) {
  els.status.textContent = message;
  els.status.dataset.error = String(isError);
}

function tables() {
  return { pre: parseTable(els.pre.value), post: parseTable(els.post.value) };
}

function columnValues(table, column) {
  const index = table.headers.indexOf(column);
  return index < 0 ? [] : table.rows.map((row) => row[index]);
}

function guessIdColumn(headers) {
  return headers.find((h) => /code|id\b|kod|no\b|number|numara/i.test(h)) || headers.find((h) => !/time ?stamp/i.test(h)) || headers[0];
}

function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'checked' || key === 'selected') node[key] = Boolean(value);
    else if (value !== undefined && value !== null) node.setAttribute(key, value);
  }
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderPrivacy({ pre, post }) {
  const findings = [...findIdentifyingColumns(pre), ...findIdentifyingColumns(post)];
  const unique = [...new Map(findings.map((f) => [f.column, f])).values()];
  els.privacy.replaceChildren();
  els.privacy.hidden = unique.length === 0;
  if (!unique.length) return;
  els.privacy.append(el('strong', {}, 'Check before you continue: '));
  els.privacy.append(document.createTextNode(`${unique.map((f) => `"${f.column}" contains ${f.reason}`).join('; ') 
    }. Nothing is uploaded, but a report should use student codes, not names. Delete these columns, or replace names with codes, before you share any output.`));
}

function renderSetup() {
  const { pre, post } = tables();
  renderPrivacy({ pre, post });
  if (!pre.headers.length || !post.headers.length) {
    els.setup.hidden = true;
    return;
  }
  els.setup.hidden = false;

  const previousId = els.idColumn.value;
  els.idColumn.replaceChildren(...pre.headers.map((h) => el('option', { value: h }, h)));
  els.idColumn.value = pre.headers.includes(previousId) ? previousId : guessIdColumn(pre.headers);

  const shared = pre.headers.filter((h) => h !== els.idColumn.value && post.headers.includes(h) && !/^time ?stamp$/i.test(h));
  const objectives = objectiveList();
  els.objectiveOptions.replaceChildren(...objectives.map((o) => el('option', { value: o })));
  els.items.replaceChildren();
  for (const column of shared) {
    if (!itemState.has(column)) {
      const guess = guessItemType([...columnValues(pre, column), ...columnValues(post, column)]);
      itemState.set(column, { include: true, objective: objectives[0] || '', reverse: false, answer: '', ...guess, agreeAt: guess.scaleMax ? guess.scaleMax - 1 : undefined });
    }
    els.items.append(itemRow(column, itemState.get(column)));
  }
  const onlyOneSide = [...pre.headers.filter((h) => !post.headers.includes(h)), ...post.headers.filter((h) => !pre.headers.includes(h))];
  setStatus(onlyOneSide.length ? `Not analysed because the column is missing on one side: ${onlyOneSide.join(', ')}.` : '');
}

function itemRow(column, state) {
  const row = el('tr');
  const include = el('input', { type: 'checkbox', checked: state.include, 'aria-label': `Include ${column}` });
  const objective = el('input', { type: 'text', value: state.objective, list: 'objectiveOptions', 'aria-label': `Objective for ${column}`, placeholder: 'Objective' });
  const type = el('select', { 'aria-label': `Answer type for ${column}` });
  for (const [value, label] of [['likert', 'Scale (1 to N)'], ['yesno', 'Yes / no'], ['knowledge', 'Right answer']]) {
    type.append(el('option', { value, selected: state.type === value }, label));
  }
  const scale = el('input', { type: 'number', min: 2, max: 10, value: state.scaleMax ?? 5, 'aria-label': `Highest scale value for ${column}` });
  const agree = el('input', { type: 'number', min: 1, max: 10, value: state.agreeAt ?? 4, 'aria-label': `Target value for ${column}` });
  const reverse = el('input', { type: 'checkbox', checked: state.reverse, 'aria-label': `Reverse score ${column}` });
  const answer = el('input', { type: 'text', value: state.answer || '', 'aria-label': `Right answer for ${column}`, placeholder: 'e.g. B' });

  const sync = () => {
    const next = {
      include: include.checked, objective: objective.value.trim(), type: type.value,
      scaleMax: Number(scale.value) || 5, agreeAt: Number(agree.value) || undefined, reverse: reverse.checked, answer: answer.value
    };
    itemState.set(column, next);
    const isScale = next.type === 'likert';
    scale.disabled = !isScale; agree.disabled = !isScale; reverse.disabled = !isScale;
    answer.disabled = next.type !== 'knowledge';
  };
  for (const input of [include, objective, type, scale, agree, reverse, answer]) input.addEventListener('input', sync);
  sync();

  const cell = (...children) => { const td = el('td'); td.append(...children); return td; };
  const name = el('td', { class: 'item-name' }, column);
  row.append(cell(include), name, cell(objective), cell(type), cell(scale), cell(agree), cell(reverse), cell(answer));
  return row;
}

function objectiveList() {
  return els.objectives.value.split('\n').map((line) => line.trim()).filter(Boolean);
}

function config() {
  const items = [...itemState.entries()]
    .filter(([column, state]) => state.include && [...els.items.querySelectorAll('.item-name')].some((td) => td.textContent === column))
    .map(([column, state]) => ({ column, objective: state.objective || 'Unassigned', type: state.type, scaleMax: state.scaleMax, agreeAt: state.agreeAt, reverse: state.reverse, answer: state.answer }));
  return { idColumn: els.idColumn.value, items, objectives: objectiveList(), matchedOnly: els.matchedOnly.checked };
}

function renderResults(result) {
  const title = els.title.value.trim() || 'Before and after results';
  els.results.hidden = false;
  els.reportTitleOut.textContent = title;

  els.warnings.replaceChildren(...result.warnings.map((w) => el('li', {}, w.message)));
  els.warnings.hidden = result.warnings.length === 0;

  const c = result.counts;
  els.counts.textContent = result.matchedOnly
    ? `${c.matched} students answered both surveys (${c.pre} before, ${c.post} after).`
    : `${c.pre} students answered before and ${c.post} after (not matched by code).`;

  els.chart.innerHTML = chartSvg(result, { title }); // every label is escaped inside chartSvg

  const head = el('tr');
  for (const label of ['Objective', 'Question', 'Students', 'Before', 'After', 'Change', 'Mean before', 'Mean after']) head.append(el('th', { scope: 'col' }, label));
  const body = result.items.map((item) => {
    const tr = el('tr');
    const values = [item.objective, item.column, item.n ?? `${item.pre.n} / ${item.post.n}`,
      item.pre.percent === null ? 'n/a' : `${item.pre.percent}%`, item.post.percent === null ? 'n/a' : `${item.post.percent}%`,
      item.change === null ? 'n/a' : `${item.change > 0 ? '+' : ''}${item.change} pts`, item.pre.mean ?? '', item.post.mean ?? ''];
    values.forEach((value) => tr.append(el('td', {}, String(value))));
    return tr;
  });
  const thead = el('thead'); thead.append(head);
  const tbody = el('tbody'); tbody.append(...body);
  els.table.replaceChildren(thead, tbody);

  els.summary.value = summaryText(result, { title });
}

function download(name, type, content) {
  const url = URL.createObjectURL(content instanceof Blob ? content : new Blob([content], { type }));
  const link = el('a', { href: url, download: name });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fileBase() {
  return (els.title.value.trim() || 'pre-post-results').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60) || 'pre-post-results';
}

function readFileInto(input, target) {
  const file = input.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { setStatus('That file is larger than 5 MB. Export only the survey answers.', true); return; }
  file.text().then((text) => { target.value = text; renderSetup(); });
  input.value = '';
}

els.preFile.addEventListener('change', () => readFileInto(els.preFile, els.pre));
els.postFile.addEventListener('change', () => readFileInto(els.postFile, els.post));
for (const input of [els.pre, els.post]) input.addEventListener('change', renderSetup);
for (const input of [els.pre, els.post]) input.addEventListener('paste', () => setTimeout(renderSetup, 0));
els.idColumn.addEventListener('change', renderSetup);
els.objectives.addEventListener('change', () => {
  els.objectiveOptions.replaceChildren(...objectiveList().map((o) => el('option', { value: o })));
});

els.sample.addEventListener('click', () => {
  els.title.value = 'Example: Grade 5 feelings and coping unit';
  els.pre.value = SAMPLE_PRE;
  els.post.value = SAMPLE_POST;
  els.objectives.value = 'Students can name and describe feelings\nStudents can use a calming strategy\nStudents know where to get help at school';
  itemState = new Map();
  renderSetup();
  const objectiveFor = ['Students can name and describe feelings', 'Students can use a calming strategy', 'Students can use a calming strategy', 'Students know where to get help at school'];
  [...itemState.keys()].forEach((column, index) => {
    const state = { ...itemState.get(column), objective: objectiveFor[index] || '', reverse: /worry/i.test(column) };
    itemState.set(column, state);
  });
  renderSetup();
  setStatus('Example data loaded. The codes and answers are invented.');
});

els.clear.addEventListener('click', () => {
  for (const field of [els.title, els.pre, els.post, els.objectives, els.summary]) field.value = '';
  itemState = new Map();
  lastResult = null;
  els.results.hidden = true;
  renderSetup();
  setStatus('Cleared.');
});

els.analyzeBtn.addEventListener('click', () => {
  const { pre, post } = tables();
  try {
    const cfg = config();
    if (!cfg.items.length) throw new Error('Choose at least one question to include.');
    for (const item of cfg.items) {
      if (item.type === 'knowledge' && !String(item.answer || '').trim()) throw new Error(`Enter the right answer for "${item.column}".`);
    }
    lastResult = analyze(pre, post, cfg);
    renderResults(lastResult);
    setStatus('Results are ready below.');
    track('tool_success', { mode: 'analyze', success: lastResult.counts.matched > 0 || !cfg.matchedOnly });
    els.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    setStatus(error.message, true);
  }
});

els.dlSvg.addEventListener('click', () => {
  if (!lastResult) return;
  download(`${fileBase()}-chart.svg`, 'image/svg+xml', chartSvg(lastResult, { title: els.title.value.trim() || 'Before and after results' }));
  track('result_download', { output_format: 'svg' });
});

els.dlPng.addEventListener('click', () => {
  if (!lastResult) return;
  const svg = chartSvg(lastResult, { title: els.title.value.trim() || 'Before and after results' });
  const image = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width * 2; canvas.height = image.height * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    ctx.drawImage(image, 0, 0);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => { if (blob) download(`${fileBase()}-chart.png`, 'image/png', blob); }, 'image/png');
    track('result_download', { output_format: 'png' });
  };
  image.onerror = () => { URL.revokeObjectURL(url); setStatus('This browser could not draw the PNG. Download the SVG instead.', true); };
  image.src = url;
});

els.dlCsv.addEventListener('click', () => {
  if (!lastResult) return;
  download(`${fileBase()}-results.csv`, 'text/csv;charset=utf-8', String.fromCharCode(0xfeff) + resultsCsv(lastResult));
  track('result_download', { output_format: 'csv' });
});

els.copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(els.summary.value);
    setStatus('Summary copied.');
  } catch {
    els.summary.select();
    setStatus('Select the text and copy it with Ctrl+C (Cmd+C on a Mac).');
  }
});

els.print.addEventListener('click', () => window.print());

els.save.addEventListener('click', () => {
  const project = {
    format: 'mc-novatools/pre-post-results', version: 1,
    title: els.title.value, pre: els.pre.value, post: els.post.value, objectives: els.objectives.value,
    idColumn: els.idColumn.value, matchedOnly: els.matchedOnly.checked, items: Object.fromEntries(itemState)
  };
  download(`${fileBase()}.prepost.json`, 'application/json', JSON.stringify(project, null, 2));
  setStatus('Project saved as a file on this device. It contains the answers, so store it as you would the survey itself.');
});

els.open.addEventListener('change', async () => {
  const file = els.open.files?.[0];
  els.open.value = '';
  if (!file) return;
  try {
    const project = JSON.parse(await file.text());
    if (project.format !== 'mc-novatools/pre-post-results') throw new Error('This is not a saved Pre/Post Results project.');
    els.title.value = String(project.title || '');
    els.pre.value = String(project.pre || '');
    els.post.value = String(project.post || '');
    els.objectives.value = String(project.objectives || '');
    els.matchedOnly.checked = project.matchedOnly !== false;
    itemState = new Map(Object.entries(project.items || {}));
    renderSetup();
    if (project.idColumn) { els.idColumn.value = project.idColumn; renderSetup(); }
    setStatus('Project opened.');
  } catch (error) {
    setStatus(error.message || 'Could not open that file.', true);
  }
});

renderSetup();
