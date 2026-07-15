// TEMP integration smoke for the new chrome (Preloader/FixedFrame/MenuPill/Cursor).
// Run: node scripts/smoke-chrome.mjs  -- deleted after the run.
import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const SHOTS = process.env.SHOTS_DIR || '.';
const out = [];
const log = (s) => { out.push(s); console.log(s); };

async function testLang(browser, lang) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const errors = [];

  // track the last .pl-amit rect (any + last-visible) at rAF frequency
  await ctx.addInitScript(() => {
    window.__pl = { lastAny: null, lastVisible: null, lastGroup: null, saw: false };
    const rect = (el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, left: r.left, right: r.right, width: r.width, height: r.height };
    };
    const loop = () => {
      const el = document.querySelector('.pl-amit');
      if (el) {
        window.__pl.saw = true;
        const rec = rect(el);
        window.__pl.lastAny = rec;
        const g = document.querySelector('.pl-group');
        if (g) window.__pl.lastGroup = rect(g);
        const root = document.querySelector('.preloader');
        if (root) {
          const cs = getComputedStyle(root);
          if (cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.01) window.__pl.lastVisible = rec;
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });

  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));

  log(`\n=== ${lang} ===`);

  // --- 1. fresh session: preloader plays and lands on the frame -----------
  await page.goto(`${BASE}/${lang}`, { waitUntil: 'domcontentloaded' });
  let sawPreloader = true;
  try {
    await page.waitForSelector('.preloader', { timeout: 5000 });
  } catch {
    sawPreloader = false;
  }
  log(`preloader appeared: ${sawPreloader ? 'PASS' : 'FAIL'}`);
  if (sawPreloader) {
    await page.screenshot({ path: `${SHOTS}/pre-${lang}-mid.png` });
    await page.waitForSelector('.preloader', { state: 'detached', timeout: 25000 });
  }
  const landing = await page.evaluate(() => {
    const f = document.querySelector('.frame-logo')?.getBoundingClientRect();
    const m = document.querySelector('.frame-mark')?.getBoundingClientRect();
    return {
      frame: f ? { top: f.top, left: f.left, right: f.right, width: f.width } : null,
      mark: m ? { top: m.top, left: m.left, right: m.right, width: m.width } : null,
      pl: window.__pl,
    };
  });
  if (landing.frame && landing.pl.lastAny) {
    const dL = Math.abs(landing.frame.left - landing.pl.lastAny.left);
    const dT = Math.abs(landing.frame.top - landing.pl.lastAny.top);
    const dW = Math.abs(landing.frame.width - landing.pl.lastAny.width);
    const v = landing.pl.lastVisible;
    const dLv = v ? Math.abs(landing.frame.left - v.left) : NaN;
    const dTv = v ? Math.abs(landing.frame.top - v.top) : NaN;
    log(`landing (final vs frame-logo): dLeft=${dL.toFixed(2)}px dTop=${dT.toFixed(2)}px dWidth=${dW.toFixed(2)}px -> ${dL < 2 && dT < 2 ? 'PASS' : 'FAIL'}`);
    log(`landing (last-visible vs frame-logo): dLeft=${dLv.toFixed(2)}px dTop=${dTv.toFixed(2)}px`);
    log(`  frame-logo: left=${landing.frame.left.toFixed(1)} top=${landing.frame.top.toFixed(1)} w=${landing.frame.width.toFixed(1)}`);
    log(`  pl-amit(last): left=${landing.pl.lastAny.left.toFixed(1)} top=${landing.pl.lastAny.top.toFixed(1)} w=${landing.pl.lastAny.width.toFixed(1)}`);
  } else {
    log(`landing: FAIL (frame-logo=${!!landing.frame}, pl tracked=${!!landing.pl.lastAny})`);
  }
  if (landing.mark && landing.pl.lastGroup) {
    const g = landing.pl.lastGroup;
    const dL = Math.abs(landing.mark.left - g.left);
    const dT = Math.abs(landing.mark.top - g.top);
    log(`mark landing (pl-group vs frame-mark): dLeft=${dL.toFixed(2)}px dTop=${dT.toFixed(2)}px -> ${dL < 2 && dT < 2 ? 'PASS' : 'FAIL'}`);
  } else {
    log('mark landing: SKIP (missing rects)');
  }
  await page.screenshot({ path: `${SHOTS}/frame-${lang}-top.png` });

  // --- 2a. plain reload: the preloader REPLAYS on every full load ---------
  await page.reload({ waitUntil: 'domcontentloaded' });
  let replayed = true;
  try {
    await page.waitForSelector('.preloader', { timeout: 5000 });
  } catch {
    replayed = false;
  }
  log(`plain reload: preloaderReplays=${replayed ? 'PASS' : 'FAIL'}`);

  // --- 2b. reload with the automation skip flag: no preloader -------------
  await page.evaluate(() => sessionStorage.setItem('ab-intro-shown', '1'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const state2 = await page.evaluate(() => ({
    pre: !!document.querySelector('.preloader'),
    frame: !!document.querySelector('.frame-logo') && !!document.querySelector('.frame-mark'),
    pill: !!document.querySelector('.menu-pill'),
    pillVisible: document.querySelector('.menu-pill')?.classList.contains('is-visible') ?? false,
  }));
  log(`reload w/ flag: noPreloader=${!state2.pre ? 'PASS' : 'FAIL'} frame=${state2.frame ? 'PASS' : 'FAIL'} pillMounted=${state2.pill ? 'PASS' : 'FAIL'} pillHiddenAtTop=${!state2.pillVisible ? 'PASS' : 'FAIL'}`);

  // --- 3. cursor follows the mouse ----------------------------------------
  await page.mouse.move(500, 400);
  await page.waitForTimeout(900);
  const dot = await page.evaluate(() => {
    const d = document.querySelector('.cursor-dot');
    if (!d) return null;
    const r = d.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  const followOk = dot && Math.abs(dot.x - 500) < 4 && Math.abs(dot.y - 400) < 4;
  log(`cursor follow: ${followOk ? 'PASS' : 'FAIL'}${dot ? ` (at ${dot.x.toFixed(1)},${dot.y.toFixed(1)} target 500,400)` : ' (no .cursor-dot)'}`);

  // --- 4. pill appears after scroll ----------------------------------------
  await page.mouse.wheel(0, 1600);
  let pillShown = true;
  try {
    await page.waitForFunction(() => document.querySelector('.menu-pill')?.classList.contains('is-visible'), { timeout: 6000 });
  } catch {
    pillShown = false;
  }
  log(`pill visible after scroll: ${pillShown ? 'PASS' : 'FAIL'}`);

  // pill must not overlap the frame logo (RTL regression guard)
  const overlap = await page.evaluate(() => {
    const a = document.querySelector('.menu-pill')?.getBoundingClientRect();
    const b = document.querySelector('.frame-logo')?.getBoundingClientRect();
    if (!a || !b) return null;
    return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  });
  log(`pill/frame-logo no overlap: ${overlap === false ? 'PASS' : `FAIL (${overlap})`}`);

  // --- 5. menu opens, explore cursor grows, Escape closes, focus returns ---
  await page.click('.menu-pill');
  let overlayOpen = true;
  try {
    await page.waitForSelector('#menu-overlay', { timeout: 4000 });
  } catch {
    overlayOpen = false;
  }
  log(`menu opens: ${overlayOpen ? 'PASS' : 'FAIL'}`);
  let exploreOk = false;
  let shrinkOk = false;
  if (overlayOpen) {
    await page.waitForTimeout(900); // let the wipe finish
    await page.screenshot({ path: `${SHOTS}/menu-${lang}.png` });
    const zone = page.locator('#menu-overlay [data-cursor="explore"]').first();
    if (await zone.count()) {
      await zone.hover();
      try {
        await page.waitForFunction(() => document.querySelector('.cursor-dot')?.classList.contains('is-explore'), { timeout: 3000 });
        exploreOk = true;
      } catch { /* stays false */ }
      await page.mouse.move(30, 500);
      try {
        await page.waitForFunction(() => !document.querySelector('.cursor-dot')?.classList.contains('is-explore'), { timeout: 3000 });
        shrinkOk = true;
      } catch { /* stays false */ }
    }
  }
  log(`cursor explore grow: ${exploreOk ? 'PASS' : 'FAIL'} / shrink on leave: ${shrinkOk ? 'PASS' : 'FAIL'}`);
  await page.keyboard.press('Escape');
  let closed = true;
  try {
    await page.waitForSelector('#menu-overlay', { state: 'detached', timeout: 4000 });
  } catch {
    closed = false;
  }
  const focusOnPill = await page.evaluate(() => document.activeElement?.classList.contains('menu-pill') ?? false);
  log(`Escape closes: ${closed ? 'PASS' : 'FAIL'} / focus returns to pill: ${focusOnPill ? 'PASS' : 'FAIL'}`);

  // --- 6. iron rule: no ancestor of .frame / .cursor-dot with transform etc.
  const bad = await page.evaluate(() => {
    const offenders = [];
    for (const sel of ['.frame', '.cursor-dot']) {
      let el = document.querySelector(sel)?.parentElement ?? null;
      while (el) {
        const cs = getComputedStyle(el);
        if (
          cs.transform !== 'none' ||
          cs.filter !== 'none' ||
          parseFloat(cs.opacity) < 1 ||
          (cs.willChange && cs.willChange !== 'auto')
        ) {
          offenders.push(`${sel} <- <${el.tagName.toLowerCase()} class="${el.className}"> transform=${cs.transform} filter=${cs.filter} opacity=${cs.opacity} willChange=${cs.willChange}`);
        }
        el = el.parentElement;
      }
    }
    return offenders;
  });
  log(`iron rule (no styled ancestors): ${bad.length === 0 ? 'PASS' : 'FAIL'}`);
  bad.forEach((b) => log(`  OFFENDER: ${b}`));

  log(`console errors: ${errors.length === 0 ? 'PASS (0)' : `FAIL (${errors.length})`}`);
  errors.slice(0, 10).forEach((e) => log(`  ERR: ${e}`));

  await ctx.close();
}

const browser = await chromium.launch();
try {
  await testLang(browser, 'he');
  await testLang(browser, 'en');
} finally {
  await browser.close();
}
