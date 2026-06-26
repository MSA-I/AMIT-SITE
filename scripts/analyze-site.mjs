/**
 * Analyze normalisboring.es for cursor, animations, and hover effects
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const URL = 'https://normalisboring.es';
const OUT = 'D:/משה פרוייקטים/AMIT-SITE/scripts/analysis-results.json';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

console.log('Navigating to', URL);
await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3000);

const findings = await page.evaluate(() => {
  const result = {
    cursorBlob: { exists: false, behavior: '', colorInversion: false, size: '', implementation: '' },
    framesAnimation: { exists: false, layerCount: 0, triggerType: '', implementation: '' },
    hoverStates: [],
    otherFeatures: [],
    rawData: {}
  };

  // 1. CURSOR ANALYSIS - look for custom cursor elements
  const allEls = document.querySelectorAll('*');
  const cursorCandidates = [];

  for (const el of allEls) {
    const s = window.getComputedStyle(el);
    const cn = el.className?.toString() || '';
    const id = el.id || '';

    // Check for cursor-related classes or fixed/absolute small elements with pointer-events:none
    const isCursorLike = cn.match(/cursor|blob|follower|dot|pointer|circle|ball/i) ||
                         id.match(/cursor|blob|follower|dot|pointer|circle|ball/i);
    const isSmallFixed = (s.position === 'fixed' || s.position === 'absolute') &&
                         s.pointerEvents === 'none' &&
                         parseInt(s.width) < 150 && parseInt(s.height) < 150 &&
                         parseInt(s.width) > 0;

    if (isCursorLike || isSmallFixed) {
      cursorCandidates.push({
        tag: el.tagName,
        id: id,
        className: cn.slice(0, 200),
        width: s.width,
        height: s.height,
        borderRadius: s.borderRadius,
        backgroundColor: s.backgroundColor,
        mixBlendMode: s.mixBlendMode,
        position: s.position,
        pointerEvents: s.pointerEvents,
        zIndex: s.zIndex,
        transform: s.transform
      });
    }

    // Check for mix-blend-mode elements (color inversion)
    if (s.mixBlendMode && s.mixBlendMode !== 'normal') {
      result.rawData.mixBlendElements = result.rawData.mixBlendElements || [];
      result.rawData.mixBlendElements.push({
        tag: el.tagName,
        className: cn.slice(0, 100),
        mixBlendMode: s.mixBlendMode
      });
    }
  }

  if (cursorCandidates.length > 0) {
    result.cursorBlob.exists = true;
    const c = cursorCandidates[0];
    result.cursorBlob.size = `${c.width} x ${c.height}`;
    result.cursorBlob.colorInversion = c.mixBlendMode === 'difference' || c.mixBlendMode === 'exclusion';
    result.cursorBlob.behavior = `${c.tag}#${c.id}.${c.className} - position:${c.position}, pointerEvents:${c.pointerEvents}`;
    result.cursorBlob.implementation = `borderRadius:${c.borderRadius}, bg:${c.backgroundColor}, mixBlend:${c.mixBlendMode}`;
    result.rawData.cursorCandidates = cursorCandidates;
  }

  // Check if native cursor is hidden
  const bodyCursor = window.getComputedStyle(document.body).cursor;
  const htmlCursor = window.getComputedStyle(document.documentElement).cursor;
  result.rawData.nativeCursor = { body: bodyCursor, html: htmlCursor };

  // 2. ANIMATION LIBRARIES
  result.rawData.libraries = {
    gsap: !!window.gsap,
    ScrollTrigger: !!window.ScrollTrigger,
    Lenis: !!window.Lenis,
    LocomotiveScroll: !!window.LocomotiveScroll,
    barba: !!window.barba,
    Swup: !!window.Swup
  };

  // 3. SCROLL/FRAMES ANIMATION - look for fixed/sticky sections
  const sections = document.querySelectorAll('section, [class*="section"], [class*="panel"], [class*="slide"]');
  const fixedSections = [];
  sections.forEach((sec, i) => {
    const s = window.getComputedStyle(sec);
    if (s.position === 'fixed' || s.position === 'sticky') {
      fixedSections.push({
        index: i,
        tag: sec.tagName,
        className: sec.className?.toString().slice(0, 100),
        position: s.position,
        zIndex: s.zIndex,
        height: s.height
      });
    }
  });

  if (fixedSections.length > 0) {
    result.framesAnimation.exists = true;
    result.framesAnimation.layerCount = fixedSections.length;
    result.framesAnimation.triggerType = 'scroll';
    result.framesAnimation.implementation = JSON.stringify(fixedSections);
  }

  // 4. HOVER STATES - find elements with transitions
  const links = document.querySelectorAll('a');
  const buttons = document.querySelectorAll('button, [role="button"]');
  const images = document.querySelectorAll('img, picture, [class*="image"]');

  links.forEach(el => {
    const s = window.getComputedStyle(el);
    if (s.transition && s.transition !== 'all 0s ease 0s' && el.textContent?.trim()) {
      result.hoverStates.push({
        element: `link: "${el.textContent.slice(0, 40)}"`,
        effect: 'transition',
        css: `transition: ${s.transition}; transform: ${s.transform}`
      });
    }
  });

  buttons.forEach(el => {
    const s = window.getComputedStyle(el);
    if (s.transition && s.transition !== 'all 0s ease 0s') {
      result.hoverStates.push({
        element: `button: "${el.textContent?.slice(0, 30) || el.className}"`,
        effect: 'transition',
        css: `transition: ${s.transition}`
      });
    }
  });

  // Limit hover states
  result.hoverStates = result.hoverStates.slice(0, 15);

  // 5. OTHER FEATURES
  // Smooth scroll
  const htmlScroll = window.getComputedStyle(document.documentElement).scrollBehavior;
  if (htmlScroll === 'smooth' || result.rawData.libraries.Lenis || result.rawData.libraries.LocomotiveScroll) {
    result.otherFeatures.push({
      name: 'Smooth Scroll',
      description: result.rawData.libraries.Lenis ? 'Lenis' : (result.rawData.libraries.LocomotiveScroll ? 'Locomotive' : 'CSS'),
      implementation: `scrollBehavior: ${htmlScroll}`
    });
  }

  // Typography
  const h1 = document.querySelector('h1');
  if (h1) {
    const s = window.getComputedStyle(h1);
    result.otherFeatures.push({
      name: 'Typography',
      description: `H1: ${s.fontFamily.slice(0, 80)}`,
      implementation: `fontSize: ${s.fontSize}, fontWeight: ${s.fontWeight}, letterSpacing: ${s.letterSpacing}, textTransform: ${s.textTransform}`
    });
  }

  // Loading elements
  const loaders = document.querySelectorAll('[class*="loader"], [class*="loading"], [class*="intro"], [class*="preload"]');
  if (loaders.length > 0) {
    result.otherFeatures.push({
      name: 'Loading Animation',
      description: `${loaders.length} loader elements found`,
      implementation: Array.from(loaders).map(l => l.className?.toString().slice(0, 50)).join(', ')
    });
  }

  // Page transition elements
  const transitions = document.querySelectorAll('[data-barba], [class*="transition"], [class*="page-wrap"]');
  if (transitions.length > 0) {
    result.otherFeatures.push({
      name: 'Page Transitions',
      description: result.rawData.libraries.barba ? 'Barba.js' : 'Custom',
      implementation: Array.from(transitions).map(t => t.className?.toString().slice(0, 50)).join(', ')
    });
  }

  return result;
});

// Take screenshot
await page.screenshot({ path: 'D:/משה פרוייקטים/AMIT-SITE/scripts/normalisboring-capture.png', fullPage: false });

// Scroll and check for scroll-triggered animations
await page.evaluate(() => window.scrollTo(0, window.innerHeight));
await page.waitForTimeout(1000);

// Check if elements changed after scroll
const afterScroll = await page.evaluate(() => {
  const panels = document.querySelectorAll('[class*="panel"], [class*="slide"], section');
  return Array.from(panels).slice(0, 5).map(p => ({
    className: p.className?.toString().slice(0, 80),
    transform: window.getComputedStyle(p).transform,
    opacity: window.getComputedStyle(p).opacity
  }));
});

findings.rawData.afterScrollPanels = afterScroll;

await browser.close();

// Output results
console.log('\n========== ANALYSIS RESULTS ==========\n');
console.log(JSON.stringify(findings, null, 2));

// Save to file
writeFileSync(OUT, JSON.stringify(findings, null, 2));
console.log('\nResults saved to:', OUT);
