import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  ['home', '/'],
  ['pricing', '/pricing/'],
  ['pre/post results', '/tools/education/pre-post-results/']
];

for (const [name, route] of routes) {
  test(`${name} has no critical WCAG A/AA violations`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const critical = results.violations.filter((violation) => violation.impact === 'critical');
    const serious = results.violations.filter((violation) => violation.impact === 'serious');

    if (serious.length) {
      const runtime = name === 'home'
        ? await page.evaluate(() => {
            const input = document.getElementById('homeSearchInput');
            if (!input) return { input: null };

            const style = getComputedStyle(input);
            const placeholder = getComputedStyle(input, '::placeholder');
            const matchedRules = [];

            for (const sheet of document.styleSheets) {
              let rules;
              try {
                rules = sheet.cssRules;
              } catch {
                continue;
              }

              for (const rule of rules) {
                if (!(rule instanceof CSSStyleRule)) continue;
                const selector = rule.selectorText || '';
                if (
                  selector.includes('homeSearchInput') ||
                  selector.includes('home-search__input') ||
                  selector.includes("input:not([type='checkbox'])")
                ) {
                  matchedRules.push({
                    href: sheet.href,
                    selector,
                    cssText: rule.style.cssText
                  });
                }
              }
            }

            return {
              theme: document.documentElement.getAttribute('data-theme'),
              inlineStyle: input.getAttribute('style'),
              color: style.color,
              webkitTextFillColor: style.webkitTextFillColor,
              backgroundColor: style.backgroundColor,
              borderColor: style.borderColor,
              padding: style.padding,
              placeholderColor: placeholder.color,
              placeholderOpacity: placeholder.opacity,
              stylesheets: [...document.styleSheets].map((sheet) => sheet.href),
              matchedRules: matchedRules.slice(0, 20)
            };
          })
        : null;

      const details = serious
        .map((violation) => {
          const targets = violation.nodes
            .slice(0, 5)
            .map((node) => {
              const data = node.any
                .map((check) => check.data)
                .filter(Boolean)
                .map((value) => JSON.stringify(value))
                .join(', ');
              const summary = node.failureSummary?.replaceAll('\n', ' ') || '';
              return `${node.target.join(' > ')}${data ? ` data=${data}` : ''}${summary ? ` summary=${summary}` : ''}`;
            })
            .join('; ');
          return `${violation.id}: ${violation.help} (${violation.nodes.length} node(s)) [${targets}]`;
        })
        .join(' | ');

      const diagnostic = `${details}${runtime ? ` runtime=${JSON.stringify(runtime)}` : ''}`
        .replaceAll('%', '%25')
        .replaceAll('\r', '%0D')
        .replaceAll('\n', '%0A');
      console.log(`::warning title=${name} serious axe details::${diagnostic}`);
    }

    expect(
      critical,
      critical.map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.length} node(s))`).join('\n')
    ).toEqual([]);
    expect(
      serious,
      serious.map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.length} node(s))`).join('\n')
    ).toEqual([]);
  });
}

for (const [name, route] of [
  ['home', '/'],
  ['json formatter', '/tools/dev/json-formatter/'],
  ['pre/post results', '/tools/education/pre-post-results/']
]) {
  test(`${name} light theme has no WCAG color contrast failures`, async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('novatools-theme', 'light');
      localStorage.removeItem('theme');
    });

    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const contrast = results.violations.filter((violation) => violation.id === 'color-contrast');
    expect(
      contrast,
      contrast.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' > ')).join('; ')}`).join('\n')
    ).toEqual([]);
  });
}

test('homepage mobile discovery links resolve and search keeps focus inside the modal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await page.locator('.mobile-menu-toggle').click();
  for (const link of await page.locator('#mobileMenu a[href^="#"]').all()) {
    const target = await link.getAttribute('href');
    expect(await page.locator(target).count(), `${target} must resolve on the homepage`).toBe(1);
  }

  await page.locator('#searchToggle').click();
  for (let step = 0; step < 10; step += 1) await page.keyboard.press('Tab');
  expect(await page.locator('#searchModal').evaluate((modal) => modal.contains(document.activeElement))).toBe(true);
});

test('homepage SearchAction query opens the real tool search', async ({ page }) => {
  await page.goto('/?q=Pre%2FPost%20Results', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#searchModal')).toBeVisible();
  await expect(page.locator('#globalSearch')).toHaveValue('Pre/Post Results');
  await expect(page.locator('#searchResults a')).not.toHaveCount(0);
});

test('homepage mobile discovery stays concise without hiding category routes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  // Only categories that have a certified tool are listed; an empty category
  // card is a dead end. Every card that is listed must open a real hub.
  const categoryLinks = page.locator('#categoriesGrid .category-nav-card h3 a');
  const count = await categoryLinks.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    const href = await categoryLinks.nth(i).getAttribute('href');
    const response = await page.request.get(href);
    expect(response.status(), `${href} must exist`).toBe(200);
    // A category with a single tool links straight to it (src/data/categories.js 'href');
    // that target must then be a tool page, not an empty hub.
    const body = await response.text();
    if (href.startsWith('/tools/')) expect(body, `${href} must be a tool page`).toMatch(/data-tool-id="/);
    else expect(body, `${href} must list at least one tool`).toMatch(/guide-tool-card/);
  }
  await expect(page.locator('#categoriesPending')).toBeVisible();

  // The homepage must not grow with the catalogue. It used to render a card for
  // every certified tool (~250px each at 375px), and this budget was raised four
  // times (12161 -> 12653 -> 12900 -> 13150) as tools were certified: the test
  // was being moved to fit the bug. Featured tools are now a fixed shortlist, so
  // the card count is asserted directly and the height budget is back to a fixed
  // number with ~10% headroom over the measured 8.4k (8934 with "Recently used"
  // visible, which it is not in a fresh test browser). Raise it only for a
  // deliberate new section, never for one more tool.
  const featuredCards = await page.locator('#featuredTools .featured-tool-card').count();
  expect(featuredCards).toBeGreaterThan(0);
  expect(featuredCards).toBeLessThanOrEqual(6);
  const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(documentHeight).toBeLessThan(9400);
});

// The PDF, image and file tools were retired on 2026-11-27 (decision D-012) and answer
// 410 Gone in production; no public page may still link to them.
test('public pages do not link to retired tools or hubs', async ({ page }) => {
  for (const route of ['/', '/tools/education/pre-post-results/', '/categories/', '/categories/security-tools']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const hrefs = await page.locator('a[href]').evaluateAll((links) => links.map((link) => new URL(link.href).pathname));
    const retired = hrefs.filter((path) => /^\/(tools\/(pdf|image)\/|tools\/security\/share-safe-check|categories\/(pdf|image)-tools)/.test(path));
    expect(retired, route).toEqual([]);
  }
});
