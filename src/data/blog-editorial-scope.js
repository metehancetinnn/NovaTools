/**
 * Editorial scope for the blog.
 *
 * MC NovaTools publishes guides about the files people prepare and share in a
 * browser: what a PDF, image or office file carries, how to check and clean
 * it, and how the site's own tools work. The articles below are original but
 * sit outside that scope: they give US-specific personal-finance, insurance
 * and tax guidance that the site has no expertise or tool to back up. Google
 * holds "your money or your life" topics to a higher bar of demonstrated
 * expertise, and a run of high-CPC finance explainers on a utility site reads
 * as content made for ads rather than for the site's readers.
 *
 * They are withheld (no route, no sitemap, feed or listing entry) rather than
 * deleted, so the decision is reversible: remove a slug from this list and
 * rerun `node scripts/audit-blog-originality.mjs --write`.
 *
 * scripts/audit-blog-originality.mjs reads this list; its --check mode fails
 * if any slug here is marked PUBLISHED.
 */
export const OUT_OF_SCOPE_REASON =
  'Outside the editorial scope (personal-finance, insurance, tax or vendor-pricing guidance that the site has no expertise or tool to support).';

export default [
  '401k-rollover-guide',
  'auto-insurance-savings',
  'best-credit-cards-2026',
  'cloud-cost-comparison',
  'credit-score-hacks',
  'crypto-tax-guide',
  'debt-consolidation-guide',
  'emergency-fund-guide',
  'first-time-home-buyer',
  'halal-mortgage-usa',
  'health-insurance-marketplace',
  'high-yield-savings-guide',
  'index-funds-vs-etfs',
  'islamic-finance-investing',
  'life-insurance-coverage-guide',
  'mortgage-refinancing-guide',
  'nft-tax-guide',
  'personal-loan-vs-credit-card',
  'pmi-removal-guide',
  'retirement-planning-millennials',
  'student-loan-repayment',
  'tax-deductions-homeowners',
  'term-vs-whole-life',
  'zakat-investments-guide'
];
