/**
 * Asset extraction script for abdesigner.co.il
 * Extracts logos, spinning circle animation, and all CSS/JS animations
 */
import { chromium } from 'playwright';

async function extractAssets() {
  const result = {
    logos: [],
    spinningCircle: { found: false, selector: null, cssAnimation: null, implementation: null },
    animations: [],
    errors: []
  };

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    console.log('Navigating to abdesigner.co.il...');
    await page.goto('https://abdesigner.co.il', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('Page loaded, extracting assets...');

    // 1. Extract ALL LOGOS
    console.log('\n--- Extracting Logos ---');

    // Find all img elements that might be logos
    const imgLogos = await page.evaluate(() => {
      const logos = [];
      const imgs = document.querySelectorAll('img');
      imgs.forEach((img, i) => {
        const src = img.src || img.getAttribute('data-src') || '';
        const alt = img.alt || '';
        const classes = img.className || '';
        const parent = img.parentElement?.tagName || '';
        const inHeader = !!img.closest('header, nav, .header, .navbar, #header');
        const inFooter = !!img.closest('footer, .footer, #footer');

        // Check if it's likely a logo
        const isLogo = src.toLowerCase().includes('logo') ||
                       alt.toLowerCase().includes('logo') ||
                       classes.toLowerCase().includes('logo') ||
                       inHeader || inFooter ||
                       (img.width < 300 && img.height < 150);

        if (src && (isLogo || i < 10)) { // Include first 10 images and all likely logos
          logos.push({
            url: src,
            type: src.match(/\.(svg|png|jpg|jpeg|gif|webp)/i)?.[1]?.toUpperCase() || 'UNKNOWN',
            description: `${alt || 'No alt'} | Classes: ${classes || 'none'} | Location: ${inHeader ? 'header' : inFooter ? 'footer' : 'body'} | Parent: ${parent}`,
            width: img.width,
            height: img.height
          });
        }
      });
      return logos;
    });
    result.logos.push(...imgLogos);

    // Find SVG logos
    const svgLogos = await page.evaluate(() => {
      const logos = [];
      const svgs = document.querySelectorAll('svg');
      svgs.forEach((svg) => {
        const classes = svg.className?.baseVal || svg.getAttribute('class') || '';
        const id = svg.id || '';
        const inHeader = !!svg.closest('header, nav, .header, .navbar, #header');
        const inFooter = !!svg.closest('footer, .footer, #footer');
        const viewBox = svg.getAttribute('viewBox') || '';
        const width = svg.getAttribute('width') || svg.clientWidth;
        const height = svg.getAttribute('height') || svg.clientHeight;

        // Check if it looks like a logo
        const isLogo = classes.toLowerCase().includes('logo') ||
                       id.toLowerCase().includes('logo') ||
                       inHeader || inFooter;

        if (isLogo || (width && height && width < 200 && height < 100)) {
          logos.push({
            url: 'inline-svg',
            type: 'SVG',
            description: `ID: ${id || 'none'} | Classes: ${classes || 'none'} | Location: ${inHeader ? 'header' : inFooter ? 'footer' : 'body'} | ViewBox: ${viewBox}`,
            svgContent: svg.outerHTML.slice(0, 500) + (svg.outerHTML.length > 500 ? '...' : '')
          });
        }
      });
      return logos;
    });
    result.logos.push(...svgLogos);

    // Find background-image logos
    const bgLogos = await page.evaluate(() => {
      const logos = [];
      const allElements = document.querySelectorAll('*');
      allElements.forEach((el) => {
        const style = getComputedStyle(el);
        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
          const url = bgImage.match(/url\(["']?([^"')]+)["']?\)/)?.[1] || '';
          const classes = el.className || '';
          const inHeader = !!el.closest('header, nav, .header, .navbar, #header');
          const inFooter = !!el.closest('footer, .footer, #footer');

          if (url.toLowerCase().includes('logo') ||
              classes.toString().toLowerCase().includes('logo') ||
              inHeader || inFooter) {
            logos.push({
              url: url,
              type: url.match(/\.(svg|png|jpg|jpeg|gif|webp)/i)?.[1]?.toUpperCase() || 'CSS-BG',
              description: `Background image | Classes: ${classes || 'none'} | Location: ${inHeader ? 'header' : inFooter ? 'footer' : 'body'}`
            });
          }
        }
      });
      return logos;
    });
    result.logos.push(...bgLogos);

    console.log(`Found ${result.logos.length} potential logos`);

    // 2. Find SPINNING CIRCLE animation
    console.log('\n--- Looking for Spinning Circle ---');

    const spinningCircle = await page.evaluate(() => {
      // Look for elements with rotation animation
      const allElements = document.querySelectorAll('*');
      let spinning = null;

      for (const el of allElements) {
        const style = getComputedStyle(el);
        const animation = style.animation || style.webkitAnimation || '';
        const transform = style.transform || '';
        const classes = el.className?.toString() || '';
        const tag = el.tagName;

        // Check for spinning/rotating keywords
        const isCircular = tag === 'circle' || tag === 'svg' ||
                          classes.includes('circle') || classes.includes('spin') ||
                          classes.includes('rotate') || classes.includes('loader') ||
                          el.closest('svg circle') !== null;

        const hasRotation = animation.includes('rotate') ||
                           animation.includes('spin') ||
                           transform.includes('rotate');

        if (hasRotation || (isCircular && animation)) {
          // Get the selector
          let selector = tag.toLowerCase();
          if (el.id) selector = `#${el.id}`;
          else if (el.className) selector = `.${el.className.toString().split(' ').join('.')}`;

          spinning = {
            found: true,
            selector: selector,
            cssAnimation: animation,
            transform: transform,
            classes: classes,
            tag: tag,
            implementation: animation ? 'CSS Animation' : transform ? 'CSS Transform' : 'Unknown'
          };
          break;
        }
      }

      return spinning || { found: false };
    });

    if (spinningCircle.found) {
      result.spinningCircle = spinningCircle;
    }

    // Look specifically for circular text/elements
    const circularElements = await page.evaluate(() => {
      const elements = [];
      // Look for SVG text on a path (common for circular text)
      const textPaths = document.querySelectorAll('textPath, text');
      textPaths.forEach(el => {
        const parent = el.closest('svg');
        if (parent) {
          const animation = getComputedStyle(parent).animation || '';
          elements.push({
            type: 'SVG text',
            content: el.textContent?.slice(0, 100) || '',
            animation: animation,
            selector: parent.id ? `#${parent.id}` : parent.className ? `.${parent.className.baseVal}` : 'svg'
          });
        }
      });

      // Look for elements with "circle" or "rotate" in class names
      const circleEls = document.querySelectorAll('[class*="circle"], [class*="rotate"], [class*="spin"]');
      circleEls.forEach(el => {
        const style = getComputedStyle(el);
        elements.push({
          type: 'Class-based circle',
          classes: el.className?.toString() || '',
          animation: style.animation || 'none',
          transform: style.transform || 'none',
          selector: el.id ? `#${el.id}` : `.${el.className?.toString().split(' ').join('.')}`
        });
      });

      return elements;
    });

    if (circularElements.length > 0) {
      result.spinningCircle.additionalCircularElements = circularElements;
    }

    console.log(`Spinning circle found: ${result.spinningCircle.found}`);

    // 3. Extract ALL CSS/JS ANIMATIONS
    console.log('\n--- Extracting Animations ---');

    // Get all stylesheets and extract @keyframes
    const keyframes = await page.evaluate(() => {
      const keyframesRules = [];

      for (const sheet of document.styleSheets) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (!rules) continue;

          for (const rule of rules) {
            if (rule.type === CSSRule.KEYFRAMES_RULE) {
              keyframesRules.push({
                name: rule.name,
                type: 'css-keyframes',
                css: rule.cssText.slice(0, 1000) + (rule.cssText.length > 1000 ? '...' : ''),
                source: sheet.href || 'inline'
              });
            }
          }
        } catch (e) {
          // Cross-origin stylesheet, skip
        }
      }

      return keyframesRules;
    });
    result.animations.push(...keyframes);

    // Find all elements with animations/transitions
    const animatedElements = await page.evaluate(() => {
      const animated = [];
      const seen = new Set();

      document.querySelectorAll('*').forEach(el => {
        const style = getComputedStyle(el);
        const animation = style.animation || style.webkitAnimation;
        const transition = style.transition || style.webkitTransition;

        if ((animation && animation !== 'none') ||
            (transition && transition !== 'none' && transition !== 'all 0s ease 0s')) {
          const key = `${el.tagName}-${el.className}-${animation}-${transition}`;
          if (seen.has(key)) return;
          seen.add(key);

          let selector = el.tagName.toLowerCase();
          if (el.id) selector = `#${el.id}`;
          else if (el.className) {
            const classes = el.className.toString().split(' ').filter(c => c).slice(0, 3).join('.');
            if (classes) selector = `.${classes}`;
          }

          animated.push({
            name: animation.split(' ')[0] || transition.split(' ')[0] || 'unnamed',
            type: animation && animation !== 'none' ? 'css-animation' : 'css-transition',
            css: animation && animation !== 'none' ? animation : transition,
            elements: selector
          });
        }
      });

      return animated;
    });
    result.animations.push(...animatedElements);

    // Check for GSAP
    const gsapInfo = await page.evaluate(() => {
      if (typeof gsap !== 'undefined' || window.gsap) {
        return { found: true, version: window.gsap?.version || 'unknown' };
      }
      // Check if GSAP is loaded via script
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const gsapScript = scripts.find(s => s.src.includes('gsap'));
      return { found: !!gsapScript, scriptSrc: gsapScript?.src };
    });

    if (gsapInfo.found) {
      result.animations.push({
        name: 'GSAP',
        type: 'js-library',
        css: null,
        elements: 'global',
        details: gsapInfo
      });
    }

    // Check for anime.js
    const animeInfo = await page.evaluate(() => {
      if (typeof anime !== 'undefined' || window.anime) {
        return { found: true };
      }
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const animeScript = scripts.find(s => s.src.includes('anime'));
      return { found: !!animeScript, scriptSrc: animeScript?.src };
    });

    if (animeInfo.found) {
      result.animations.push({
        name: 'anime.js',
        type: 'js-library',
        css: null,
        elements: 'global',
        details: animeInfo
      });
    }

    // Check for Framer Motion (React)
    const framerInfo = await page.evaluate(() => {
      // Look for data-framer-* attributes
      const framerElements = document.querySelectorAll('[data-framer-appear-id], [data-framer-component-type]');
      return { found: framerElements.length > 0, elementCount: framerElements.length };
    });

    if (framerInfo.found) {
      result.animations.push({
        name: 'Framer Motion',
        type: 'js-library',
        css: null,
        elements: `${framerInfo.elementCount} elements`,
        details: framerInfo
      });
    }

    // Extract hover effects by finding :hover rules
    const hoverEffects = await page.evaluate(() => {
      const hovers = [];

      for (const sheet of document.styleSheets) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (!rules) continue;

          for (const rule of rules) {
            if (rule.selectorText && rule.selectorText.includes(':hover')) {
              hovers.push({
                name: 'hover-effect',
                type: 'css-hover',
                css: rule.cssText.slice(0, 500),
                elements: rule.selectorText
              });
            }
          }
        } catch (e) {
          // Cross-origin stylesheet
        }
      }

      return hovers.slice(0, 20); // Limit to first 20 hover effects
    });
    result.animations.push(...hoverEffects);

    console.log(`Found ${result.animations.length} animations/transitions`);

    // Take a screenshot for reference
    await page.screenshot({ path: 'scripts/abdesigner-screenshot.png', fullPage: false });
    console.log('\nScreenshot saved to scripts/abdesigner-screenshot.png');

  } catch (error) {
    result.errors.push({
      type: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    console.error('Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return result;
}

// Run and output
extractAssets().then(result => {
  console.log('\n\n=== EXTRACTION RESULTS ===\n');
  console.log(JSON.stringify(result, null, 2));
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
