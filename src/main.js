/**
 * MC NovaTools - Main Application Script
 * Homepage rendering and interactions
 */

import categories from './data/categories.js';
import { setupThemeToggle } from './theme-toggle.mjs';
import { initConsentManager } from './core/consent-manager.mjs';
import { initAnalytics } from './js/analytics.js';
import { applySeo, buildHomeSchema, upsertJsonLd } from './js/seo.js';
import { initHomeSearch } from './js/home-search.js';
import { initHeroMotion } from './js/hero-motion.js';
import { buildIndex, recentItems, rememberTool, forgetRecentTools } from './js/tool-search.js';
import blogPostsForSearch from './i18n/blog/en.json';
import { getPopularThisWeek } from './components/engagement-widgets.mjs';
import manifest from '../tools-manifest.json';
import { canonicalToolPath, publicCertifiedTools, publicToolsByCategory } from './data/public-tools.mjs';

const certifiedPublicTools = publicCertifiedTools(manifest.tools);
const certifiedPaths = new Set(certifiedPublicTools.map(canonicalToolPath));
const certifiedByCategory = publicToolsByCategory(certifiedPublicTools);

// ============================================
// I18N HELPERS
// ============================================
function t(key, fallback) {
  if (window.i18n && typeof window.i18n.t === 'function') {
    return window.i18n.t(key, fallback);
  }
  return fallback;
}

function getCategoryLabel(categoryName) {
  const map = {
    'PDF Tools': t('nav.pdf', 'PDF Tools'),
    'Image Tools': t('nav.image', 'Image Tools'),
    'Finance Tools': t('nav.finance', 'Finance Tools'),
    'Developer Tools': t('nav.developer', 'Developer Tools'),
    'Text & Writing': t('nav.text', 'Text & Writing'),
    Converters: t('nav.converters', 'Converters'),
    'Security Tools': t('nav.security', 'Security Tools'),
    Productivity: t('home.productivity', 'Productivity'),
    'Data Tools': t('home.dataTools', 'Data Tools'),
    'Design Tools': t('home.designTools', 'Design Tools'),
    Calculators: t('home.calculators', 'Calculators'),
    'Social Media': t('home.socialMedia', 'Social Media')
  };

  const rawKeys = {
    pdf: 'PDF Tools', image: 'Image Tools', finance: 'Finance Tools', dev: 'Developer Tools',
    text: 'Text & Writing', converters: 'Converters', security: 'Security Tools',
    productivity: 'Productivity', data: 'Data Tools', design: 'Design Tools',
    calculators: 'Calculators', social: 'Social Media'
  };
  const resolved = rawKeys[categoryName] || categoryName;
  return map[resolved] || resolved;
}

function getCategoryName(category) {
  return t(`home.categories.${category.slug}.name`, getCategoryLabel(category.name));
}

function getCategoryDescription(category) {
  return t(
    `home.categories.${category.slug}.description`,
    category.shortDescription || category.description || ''
  );
}

function getCategoryHref(category) {
  return `/categories/${category.slug}.html`;
}

function getToolHref(slug) {
  return `/tools/${slug}/`;
}

// ============================================
// DESIGN SYSTEM INTERACTIONS
// ============================================
function initDesignSystemInteractions() {
  setupThemeToggle('themeToggle');

  const header = document.querySelector('.app-header');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    if (!header) return;
    const currentScrollY = window.scrollY;
    const shouldHide = currentScrollY > lastScrollY && currentScrollY > 96;
    header.classList.toggle('is-hidden', shouldHide);
    lastScrollY = currentScrollY;
  }, { passive: true });
}

// ============================================
// MOBILE MENU
// ============================================
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const trigger = document.querySelector('.mobile-menu-toggle');
  if (!menu || !trigger) return;
  const opening = menu.hidden;
  menu.hidden = !opening;
  menu.classList.toggle('active', opening);
  trigger.setAttribute('aria-expanded', String(opening));
  if (opening) menu.querySelector('a')?.focus();
  else trigger.focus();
}

window.toggleMobileMenu = toggleMobileMenu;

// ============================================
// SEARCH MODAL
// ============================================
let previouslyFocusedElement = null;

function toggleSearch(forceOpen) {
  const modal = document.getElementById('searchModal');
  const trigger = document.getElementById('searchToggle');
  if (!modal) return;
  const opening = typeof forceOpen === 'boolean' ? forceOpen : modal.hidden;
  if (opening) previouslyFocusedElement = document.activeElement;
  modal.hidden = !opening;
  modal.classList.toggle('active', opening);
  trigger?.setAttribute('aria-expanded', String(opening));

  if (opening) {
    document.getElementById('globalSearch')?.focus();
  } else if (previouslyFocusedElement instanceof HTMLElement) {
    previouslyFocusedElement.focus();
  }
}

window.toggleSearch = toggleSearch;

document.addEventListener('keydown', (event) => {
  const searchModal = document.getElementById('searchModal');
  if (event.key === 'Tab' && searchModal && !searchModal.hidden) {
    const focusable = [...searchModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.hidden && !element.hasAttribute('disabled'));
    const first = focusable[0];
    const last = focusable.at(-1);
    if (first && last && (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  }
  if (event.key === 'Escape') {
    if (!searchModal?.hidden) toggleSearch(false);
    const menu = document.getElementById('mobileMenu');
    if (menu && !menu.hidden) toggleMobileMenu();
  }
});

const popularTasks = [
  { key: 'mergePdf', label: 'Merge PDF', slug: 'pdf/merge', icon: 'file-text' },
  { key: 'compressPdf', label: 'Compress PDF', slug: 'pdf/compress', icon: 'file-text' },
  { key: 'compressImage', label: 'Compress Image', slug: 'image/compress', icon: 'image' },
  { key: 'jsonFormatter', label: 'JSON Formatter', slug: 'dev/json-formatter', icon: 'code' },
  { key: 'liveExchange', label: 'Live Exchange', slug: 'finance/live-exchange', icon: 'repeat' },
  { key: 'textAnalysis', label: 'Text Analysis', slug: 'text/text-analysis', icon: 'type' },
  { key: 'mortgageCalculator', label: 'Mortgage Calculator', slug: 'finance/mortgage-refinance', icon: 'trending-up' },
  { key: 'passwordGenerator', label: 'Password Generator', slug: 'security/password-generator', icon: 'shield' }
];

// The homepage leads with one job: getting a file ready to send. This is a fixed,
// ordered shortlist, not "every certified tool": listing the whole catalogue made
// the page ~250px taller on mobile with every tool that passed certification.
// The full catalogue lives in the category hubs. Keys are new (not in the
// locale files), so the English text below is what every language shows.
const FEATURED_TOOL_LIMIT = 6;
const featuredTools = [
  {
    key: 'shareSafeCheck',
    slug: 'security/share-safe-check',
    name: 'Share-Safe File Check',
    description: 'See the location, names, earlier revisions, comments and tokens a photo, PDF, Office file or HAR log carries, then download a cleaned copy that is re-checked.',
    category: 'security',
    icon: 'shield'
  },
  {
    key: 'pdfRedactShare',
    slug: 'pdf/redact',
    name: 'PDF Redact & PII Check',
    description: 'Find emails, phone numbers and IBAN-like strings in a PDF and black out what should not leave with it.',
    category: 'pdf',
    icon: 'file-text'
  },
  {
    key: 'pdfSplitShare',
    slug: 'pdf/split',
    name: 'PDF Splitter',
    description: 'Send only the pages the recipient needs instead of the whole document.',
    category: 'pdf',
    icon: 'file-text'
  },
  {
    key: 'pdfCompressShare',
    slug: 'pdf/compress',
    name: 'PDF Compressor',
    description: 'Get a PDF under an email or upload size limit, with the before and after size shown.',
    category: 'pdf',
    icon: 'file-text'
  },
  {
    key: 'imageCompressShare',
    slug: 'image/compress',
    name: 'Image Compressor',
    description: 'Shrink photos and screenshots before attaching or uploading them.',
    category: 'image',
    icon: 'image'
  },
  {
    key: 'pdfMergeShare',
    slug: 'pdf/merge',
    name: 'PDF Merger',
    description: 'Combine scans and attachments into one file in the order you choose.',
    category: 'pdf',
    icon: 'file-text'
  }
];

const categoryPopularTools = {
  'pdf-tools': [
    { key: 'pdfMerge', label: 'PDF Merge', slug: 'pdf/merge' },
    { key: 'pdfCompress', label: 'Compress PDF', slug: 'pdf/compress' },
    { key: 'pdfToJpg', label: 'PDF to JPG', slug: 'pdf/pdf-to-jpg' }
  ],
  'image-tools': [
    { key: 'imageCompress', label: 'Image Compress', slug: 'image/compress' },
    { key: 'imageResize', label: 'Image Resize', slug: 'image/image-resizer' },
    { key: 'imageToWebp', label: 'Image to WebP', slug: 'image/image-to-webp' }
  ],
  'finance-tools': [
    { key: 'liveExchange', label: 'Live Exchange', slug: 'finance/live-exchange' },
    { key: 'cryptoPrices', label: 'Crypto Prices', slug: 'finance/crypto-prices' },
    { key: 'stockLookup', label: 'Stock Lookup', slug: 'finance/stock-lookup' }
  ],
  'text-writing': [
    { key: 'textAnalysis', label: 'Text Analysis', slug: 'text/text-analysis' },
    { key: 'textSummarizer', label: 'Text Summarizer', slug: 'text/text-summarizer' },
    { key: 'simpleTranslator', label: 'Simple Translator', slug: 'text/simple-translator' }
  ],
  'developer-tools': [
    { key: 'jsonFormatter', label: 'JSON Formatter', slug: 'dev/json-formatter' },
    { key: 'regexTester', label: 'Regex Tester', slug: 'dev/regex-tester' },
    { key: 'base64Converter', label: 'Base64 Converter', slug: 'dev/base64-converter' }
  ],
  converters: [
    { key: 'unitConverter', label: 'Unit Converter', slug: 'converters/unit-converter' },
    { key: 'currencyConverter', label: 'Currency Converter', slug: 'converters/currency-converter' },
    { key: 'timezone', label: 'Time Zone', slug: 'converters/timezone-converter' }
  ],
  'calculator-tools': [
    { key: 'scientific', label: 'Scientific', slug: 'converters/scientific-calculator' },
    { key: 'bmi', label: 'BMI', slug: 'converters/bmi-calculator' },
    { key: 'percentage', label: 'Percentage', slug: 'converters/percentage-calculator' }
  ],
  'security-tools': [
    { key: 'passwordGenerator', label: 'Password Generator', slug: 'security/password-generator' },
    { key: 'hashGenerator', label: 'Hash Generator', slug: 'security/hash-generator' },
    { key: 'uuidGenerator', label: 'UUID Generator', slug: 'security/uuid-generator' }
  ],
  'social-media-tools': [
    { key: 'utmBuilder', label: 'UTM Builder', slug: 'social/utm-builder' },
    { key: 'hashtagGenerator', label: 'Hashtag Generator', slug: 'social/hashtag-generator' },
    { key: 'thumbnail', label: 'Thumbnail', slug: 'social/youtube-thumbnail' }
  ],
  'productivity-tools': [
    { key: 'pomodoro', label: 'Pomodoro', slug: 'productivity/pomodoro-timer' },
    { key: 'todoList', label: 'Todo List', slug: 'productivity/todo-list' },
    { key: 'notes', label: 'Notes', slug: 'productivity/notes' }
  ],
  'data-tools': [
    { key: 'csvJsonSummary', label: 'CSV/JSON Summary', slug: 'data/csv-json-summarizer' },
    { key: 'chartBuilder', label: 'Chart Builder', slug: 'data/chart-builder' },
    { key: 'weatherLookup', label: 'Weather Lookup', slug: 'data/weather-lookup' }
  ],
  'design-tools': [
    { key: 'logoMaker', label: 'Logo Maker', slug: 'design/logo-maker' },
    { key: 'invoice', label: 'Invoice', slug: 'design/invoice-generator' },
    { key: 'qrDesigner', label: 'QR Designer', slug: 'design/qr-code-designer' }
  ]
};

// Each card names the article it actually opens. The previous three cards had
// three different titles ("Tool selection map", "Compress images checklist",
// "Base64 use cases") and all linked to the same article.
const blogPosts = [
  {
    key: 'browserVsDesktopPrivacy',
    title: 'Browser-based tools vs desktop software: a privacy comparison',
    excerpt: 'When a browser tool keeps a file on your device, when it does not, and when desktop software is the safer choice.',
    category: 'Privacy',
    href: '/blog/articles/browser-based-tools-vs-desktop-software-privacy-comparison.html',
    image: '/images/blog-covers/workflow-planning.svg',
    minutes: '5 min'
  },
  {
    key: 'editPdfWithoutAcrobat',
    title: 'How to edit a PDF without Adobe Acrobat',
    excerpt: 'Pick a free method by the change you need, from page organisation to annotation, and check the file before you hand it off.',
    category: 'PDF',
    href: '/blog/articles/edit-pdf-without-adobe-acrobat-free-methods.html',
    image: '/images/blog-covers/image-workflow.svg',
    minutes: '6 min'
  },
  {
    key: 'jwtStructure',
    title: 'Understanding JSON Web Tokens',
    excerpt: 'Anyone can decode a JWT payload. What the three parts contain, where tokens get exposed, and how to debug them safely.',
    category: 'Developer',
    href: '/blog/articles/understanding-json-web-tokens-structure-security.html',
    image: '/images/blog-covers/developer-utilities.svg',
    minutes: '4 min'
  }
];

// Tasks people do before a file leaves their hands. Each step opens a different,
// working page: the check, the follow-up tool, then the hub with the rest.
const workflowCards = [
  {
    key: 'contractPdf',
    title: 'Send a contract or CV as a PDF',
    description: 'Check it for author names, earlier revisions and comments, black out personal numbers, then send a cleaned copy.',
    tool: ['Share-Safe File Check', 'security/share-safe-check'],
    guide: ['Redact personal data', '/tools/pdf/redact/'],
    category: ['PDF tools', '/categories/pdf-tools.html']
  },
  {
    key: 'photoLocation',
    title: 'Post or send a photo without its location',
    description: 'See whether the photo carries GPS coordinates or a camera serial, remove them without recompressing, then shrink it for upload.',
    tool: ['Share-Safe File Check', 'security/share-safe-check'],
    guide: ['Compress the image', '/tools/image/compress/'],
    category: ['Image tools', '/categories/image-tools.html']
  },
  {
    key: 'supportHar',
    title: 'Attach a HAR file or log to a support ticket',
    description: 'Replace cookies, bearer tokens, JWTs and API keys with [REDACTED] before the file reaches a vendor.',
    tool: ['Share-Safe File Check', 'security/share-safe-check'],
    guide: ['What a JWT exposes', '/blog/articles/understanding-json-web-tokens-structure-security.html'],
    category: ['Security tools', '/categories/security-tools.html']
  }
];

// ============================================
// RENDER HOMEPAGE SECTIONS
// ============================================



function iconForCategory(category) {
  const icons = {
    pdf: 'file-text', image: 'image', finance: 'trending-up', converters: 'repeat',
    dev: 'code', text: 'type', data: 'database', design: 'palette',
    security: 'shield', productivity: 'zap', calculators: 'calculator', social: 'zap'
  };
  return icons[category] || 'tool';
}

// The homepage grids are server-rendered at build time (scripts/prerender-home.mjs).
// Assigning identical markup would still replace every node, which repaints and
// shifts the section for no reason, so only write when the markup differs.
function setGridMarkup(container, markup) {
  if (!container) return;
  if (container.innerHTML.trim() === markup.trim()) return;
  container.innerHTML = markup;
}

function renderFeaturedTools() {
  const container = document.getElementById('featuredTools');
  if (!container) return;

  // The curated shortlist, minus anything that lost certification. If fewer than
  // the limit survive, top up from other certified tools so the section never
  // shows a near-empty grid; it never grows past the limit, whatever the catalogue
  // size (tests/e2e/accessibility.spec.mjs holds that line).
  const curated = featuredTools.filter((tool) => certifiedPaths.has(getToolHref(tool.slug)));
  const curatedPaths = new Set(curated.map((tool) => getToolHref(tool.slug)));
  const topUp = certifiedPublicTools
    .filter((tool) => !curatedPaths.has(canonicalToolPath(tool)))
    .slice(0, Math.max(0, FEATURED_TOOL_LIMIT - curated.length))
    .map((tool) => ({
      key: tool.id,
      slug: canonicalToolPath(tool).replace(/^\/tools\//, '').replace(/\/$/, ''),
      name: tool.nameEn || tool.name || tool.id,
      description: (typeof tool.description === 'string' ? tool.description : tool.description?.en || tool.description?.tr) || '',
      category: tool.category,
      icon: iconForCategory(tool.category)
    }));

  setGridMarkup(container, [...curated, ...topUp].slice(0, FEATURED_TOOL_LIMIT).map((tool) => `
    <article class="featured-tool-card">
      <div class="featured-tool-card__icon">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          ${getIconPath(tool.icon)}
        </svg>
      </div>
      <span class="featured-tool-card__category">${getCategoryLabel(tool.category)}</span>
      <h3>${t(`home.featuredCards.${tool.key}.name`, tool.name)}</h3>
      <p>${t(`home.featuredCards.${tool.key}.description`, tool.description)}</p>
      <a href="${getToolHref(tool.slug)}">${t('home.featured.open', 'Open →')}</a>
    </article>
  `).join(''));
}

function categoryToolKey(category) {
  return category.slug.replace(/-tools$/, '').replace('developer', 'dev').replace('text-writing', 'text');
}

function renderCategories() {
  const container = document.getElementById('categoriesGrid');
  if (!container) return;

  // A category with no certified tool is a dead end: the card, its description
  // and its link all promise something the hub cannot deliver. Show only
  // categories that have something to open, and say how many are still coming.
  const live = categories.filter((category) => (certifiedByCategory[categoryToolKey(category)] || []).length > 0);
  const withheld = categories.length - live.length;

  const note = document.getElementById('categoriesPending');
  if (note) {
    note.textContent = withheld
      ? `${withheld} more categories are in development and are not listed until their tools pass certification.`
      : '';
    note.hidden = !withheld;
  }

  setGridMarkup(container, live.map((category) => {
    const categoryKey = categoryToolKey(category);
    const toolCount = (certifiedByCategory[categoryKey] || []).length;
    const curatedLinks = categoryPopularTools[category.slug] || [];
    const popularLinks = curatedLinks
      .filter((tool) => certifiedPaths.has(getToolHref(tool.slug)))
      .slice(0, 3);
    if (!popularLinks.length) {
      for (const tool of (certifiedByCategory[categoryKey] || []).slice(0, 3)) {
        popularLinks.push({ key: tool.id, label: tool.name || tool.nameEn || tool.id, slug: canonicalToolPath(tool).replace(/^\/tools\//, '').replace(/\/$/, '') });
      }
    }

    return `
      <article class="category-nav-card">
        <div
          class="category-nav-card__icon"
          style="background: linear-gradient(135deg, ${category.color}22, ${category.color}0f); color: ${category.color}"
          aria-hidden="true"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${getIconPath(category.icon)}
          </svg>
        </div>
        <h3><a href="${getCategoryHref(category)}">${getCategoryName(category)}</a></h3>
        <p>${getCategoryDescription(category)}</p>
        <p class="category-nav-card__count">${toolCount} ${toolCount === 1 ? 'tool' : 'tools'}</p>
        <div class="category-nav-card__links" role="group" aria-label="${getCategoryName(category)} ${t('home.popularToolsAriaSuffix', 'popular tools')}">
          ${popularLinks.map((tool) => `<a href="${getToolHref(tool.slug)}">${t(`home.categoryPopularTools.${tool.key}`, tool.label)}</a>`).join('')}
        </div>
      </article>
    `;
  }).join(''));
}

function renderBlogCards() {
  const container = document.getElementById('homeBlogCards');
  if (!container) return;

  setGridMarkup(container, blogPosts.map((post) => {
    const baseKey = `home.blogCards.${post.key}`;
    const title = t(`${baseKey}.title`, post.title);
    const excerpt = t(`${baseKey}.excerpt`, post.excerpt);
    const category = t(`${baseKey}.category`, post.category);
    const readSuffix = t('home.blogCards.readSuffix', 'read');

    return `
      <article class="home-blog-card">
        <a href="${post.href}" class="home-blog-card__image" aria-label="${title}">
          <img src="${post.image}" alt="" width="640" height="360" loading="lazy" decoding="async">
        </a>
        <div class="home-blog-card__body">
          <div class="home-blog-card__meta">
            <span>${category}</span>
            <span>${post.minutes} ${readSuffix}</span>
          </div>
          <h3><a href="${post.href}">${title}</a></h3>
          <p>${excerpt}</p>
        </div>
      </article>
    `;
  }).join(''));
}

function renderWorkflowCards() {
  const container = document.getElementById('workflowCards');
  if (!container) return;

  container.innerHTML = workflowCards
    .filter((workflow) => certifiedPaths.has(getToolHref(workflow.tool[1])))
    .map((workflow) => {
    const baseKey = `home.workflows.cards.${workflow.key}`;
    const title = t(`${baseKey}.title`, workflow.title);
    const description = t(`${baseKey}.description`, workflow.description);
    const toolLabel = t(`${baseKey}.tool`, workflow.tool[0]);
    const guideLabel = t(`${baseKey}.guide`, workflow.guide[0]);
    const categoryLabel = t(`${baseKey}.category`, workflow.category[0]);

    return `
      <article class="workflow-card">
        <span class="workflow-card__label">${t('home.workflows.label', 'Guided workflow')}</span>
        <h3>${title}</h3>
        <p>${description}</p>
        <div class="workflow-card__steps">
          <a href="${getToolHref(workflow.tool[1])}"><strong>${t('home.workflows.steps.check', 'Check')}</strong>${toolLabel}</a>
          <a href="${workflow.guide[1]}"><strong>${t('home.workflows.steps.next', 'Then')}</strong>${guideLabel}</a>
          <a href="${workflow.category[1]}"><strong>${t('home.workflows.steps.browse', 'Browse')}</strong>${categoryLabel}</a>
        </div>
      </article>
    `;
  }).join('');
}

// ============================================
// ICON HELPER
// ============================================
function getIconPath(name) {
  const icons = {
    'file-text': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    'trending-up': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    repeat: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="18" x2="12" y2="18"/><line x1="8" y1="18" x2="8" y2="18"/><line x1="16" y1="18" x2="16" y2="18"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    'share-2': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.01 17.461 2 12 2z"/>'
  };

  return icons[name] || icons['file-text'];
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
function initSearch() {
  const searchInput = document.getElementById('globalSearch');
  const searchResults = document.getElementById('searchResults');

  if (!searchInput || !searchResults) return;

  const allTools = certifiedPublicTools.map((tool) => ({
    name: tool.name || tool.nameEn || tool.id,
    aliases: [tool.name, tool.nameEn, tool.id].filter(Boolean).map((value) => String(value).toLowerCase()),
    href: canonicalToolPath(tool),
    category: tool.category || 'Tools'
  }));

  searchInput.oninput = (event) => {
    const query = event.target.value.toLowerCase().trim();

    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }

    const results = allTools.filter((tool) =>
      tool.aliases.some((alias) => alias.includes(query)) ||
      tool.category.toLowerCase().includes(query)
    ).slice(0, 5);

    searchResults.innerHTML = results.map((tool) => `
      <a href="${tool.href}" class="search-result-item">
        <span class="search-result-name">${tool.name}</span>
        <span class="search-result-category">${tool.category}</span>
      </a>
    `).join('') || `<div class="search-no-results">${t('home.noResults', 'No tools found')}</div>`;
  };

  const requestedQuery = new URLSearchParams(window.location.search).get('q')?.trim();
  if (requestedQuery) {
    searchInput.value = requestedQuery;
    toggleSearch(true);
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

// ============================================
// RECENTLY USED TOOLS (local to this browser)
// ============================================
function renderRecentTools() {
  const section = document.getElementById('recent-tools');
  const grid = document.getElementById('homeRecentGrid');
  if (!section || !grid) return;

  const index = buildIndex({ tools: manifest.tools, posts: blogPostsForSearch, getToolHref });
  const recents = recentItems(index);

  grid.replaceChildren();
  if (!recents.length) {
    section.hidden = true;
    return;
  }

  for (const item of recents) {
    const card = document.createElement('a');
    card.className = 'home-recent__card';
    card.href = item.href;
    const name = document.createElement('strong');
    name.textContent = item.name;
    const group = document.createElement('span');
    group.textContent = item.group;
    card.append(name, group);
    card.addEventListener('click', () => rememberTool(item.id));
    grid.append(card);
  }
  section.hidden = false;
}

function initRecentTools() {
  const clear = document.getElementById('clearRecentTools');
  if (clear && clear.dataset.ready !== 'true') {
    clear.dataset.ready = 'true';
    clear.addEventListener('click', () => {
      forgetRecentTools();
      renderRecentTools();
    });
  }
  renderRecentTools();
}

// ============================================
// RERENDER ON LANGUAGE CHANGE
// ============================================
// The hero badge counts what the site can actually open right now. It is filled
// from the manifest rather than typed into the markup, so it cannot drift away
// from certification the way a hand-written number would, and it stays hidden
// while there is nothing true to say.
function renderHeroBadge() {
  const badge = document.getElementById('homeHeroBadge');
  if (!badge) return;
  const toolCount = certifiedPublicTools.length;
  const categoryCount = Object.keys(certifiedByCategory)
    .filter((key) => (certifiedByCategory[key] || []).length > 0).length;
  if (!toolCount || !categoryCount) {
    badge.textContent = '';
    badge.hidden = true;
    return;
  }
  const text = t('home.hero.badge', '{{tools}} verified tools across {{categories}} categories')
    .replace('{{tools}}', String(toolCount))
    .replace('{{categories}}', String(categoryCount));
  if (badge.textContent !== text) badge.textContent = text;
  badge.hidden = false;
}

function rerenderHomepageDynamicParts() {
  renderHeroBadge();
  renderFeaturedTools();
  renderCategories();
  renderBlogCards();
  renderWorkflowCards();
  initSearch();
  initHomeSearch({ getToolHref });
  initRecentTools();
}

window.addEventListener('languageChanged', () => {
  rerenderHomepageDynamicParts();
});

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  applySeo({ type: 'home', path: '/' });
  upsertJsonLd('homepage-seo-jsonld', buildHomeSchema());
  initConsentManager();
  initAnalytics();
  initDesignSystemInteractions();
  rerenderHomepageDynamicParts();
  initHeroMotion();
});
