// Generated analysis tool: captures scroll "filmstrips" + computed type/color
// for the reference (normalisboring.es) and the local build, for gap auditing.
// Usage: node scripts/audit.mjs <outDir>
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = process.argv[2] || './audit';
mkdirSync(OUT, { recursive: true });
const VIEW = { width: 1440, height: 900 };

async function extractStyles(page) {
  return await page.evaluate(() => {
    const pick = (el) => {
      if (!el) return null;
      const c = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().slice(0, 50),
        fontFamily: c.fontFamily,
        fontSize: c.fontSize,
        fontWeight: c.fontWeight,
        letterSpacing: c.letterSpacing,
        lineHeight: c.lineHeight,
        textTransform: c.textTransform,
        fontStyle: c.fontStyle,
        color: c.color,
      };
    };
    const bodyC = getComputedStyle(document.body);
    const big = [...document.querySelectorAll('h1,h2,h3,h4')]
      .filter((e) => e.offsetParent !== null)
      .slice(0, 16)
      .map(pick);
    const sections = [...document.querySelectorAll('section, main > div, [data-theme]')]
      .slice(0, 24)
      .map((s) => {
        const c = getComputedStyle(s);
        return { bg: c.backgroundColor, color: c.color, h: s.offsetHeight, theme: s.getAttribute('data-theme') || '' };
      });
    const fonts = [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.style} ${f.status}`);
    return {
      title: document.title,
      body: { bg: bodyC.backgroundColor, color: bodyC.color, fontFamily: bodyC.fontFamily },
      fonts: [...new Set(fonts)],
      headings: big,
      sections,
      scrollH: document.documentElement.scrollHeight,
    };
  });
}

async function capture(browser, url, label, { settle = 1600, maxFrames = 15, force = false } = {}) {
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch { /* heavy animated sites never go idle; continue */ }
  await page.waitForTimeout(4000); // intro loader / first paint settle
  // dismiss cookie banner (reject all = privacy-preserving); harmless if absent
  for (const t of ['Rechazar todo', 'Reject all', 'Rechazar', 'Reject']) {
    try { await page.locator(`text=${t}`).first().click({ timeout: 1200 }); break; } catch { /* not present */ }
  }
  await page.waitForTimeout(500);
  let styles = {};
  try { styles = await extractStyles(page); writeFileSync(`${OUT}/${label}.json`, JSON.stringify(styles, null, 2)); } catch (e) { console.log('style extract failed', label, e.message); }
  let prev = -1, i = 0;
  for (; i < maxFrames; i++) {
    await page.screenshot({ path: `${OUT}/${label}-${String(i).padStart(2, '0')}.png` });
    const y = await page.evaluate(() => Math.round(window.scrollY));
    if (!force && y === prev) break; // virtual-scroll sites keep scrollY≈0 -> use force
    prev = y;
    await page.mouse.wheel(0, VIEW.height * 0.92);
    await page.waitForTimeout(settle);
  }
  console.log(`${label}: ${i + 1} frames, scrollH=${styles.scrollH || '?'}`);
  await ctx.close();
}

const browser = await chromium.launch();
const which = process.argv[3] || 'all';
if (which === 'all' || which === 'ref') await capture(browser, 'https://normalisboring.es', 'ref', { force: true, maxFrames: 18, settle: 1800 });
if (which === 'all' || which === 'en') await capture(browser, 'http://localhost:3000/en', 'local-en', { maxFrames: 26, settle: 1200 });
if (which === 'all' || which === 'he') await capture(browser, 'http://localhost:3000/he', 'local-he', { maxFrames: 26, settle: 1200 });
await browser.close();
console.log('done ->', OUT);
