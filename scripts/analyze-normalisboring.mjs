/**
 * Analyze normalisboring.es for cursor blob, frames animation, hover states, and other features
 */

import { chromium } from 'playwright';

async function analyzeNormalisBoring() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const findings = {
    cursorBlob: { exists: false, behavior: '', colorInversion: false, size: '', implementation: '' },
    framesAnimation: { exists: false, layerCount: 0, triggerType: '', implementation: '' },
    hoverStates: [],
    otherFeatures: []
  };

  try {
    console.log('Navigating to normalisboring.es...');
    await page.goto('https://normalisboring.es', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // Wait for page to fully load
    await page.waitForTimeout(3000);

    console.log('Analyzing cursor blob...');
    // Check for custom cursor elements
    const cursorAnalysis = await page.evaluate(() => {
      const results = {
        customCursorElements: [],
        canvasElements: [],
        svgCursors: [],
        mixBlendModeElements: [],
        cssVariables: [],
        bodyStyles: {}
      };

      // Look for common cursor blob implementations
      const allElements = document.querySelectorAll('*');

      for (const el of allElements) {
        const styles = window.getComputedStyle(el);
        const className = el.className?.toString() || '';
        const id = el.id || '';

        // Check for cursor-related class names
        if (className.match(/cursor|blob|follower|dot|pointer|trail/i) ||
            id.match(/cursor|blob|follower|dot|pointer|trail/i)) {
          results.customCursorElements.push({
            tag: el.tagName,
            id: id,
            className: className,
            styles: {
              position: styles.position,
              width: styles.width,
              height: styles.height,
              borderRadius: styles.borderRadius,
              mixBlendMode: styles.mixBlendMode,
              pointerEvents: styles.pointerEvents,
              zIndex: styles.zIndex,
              transform: styles.transform,
              backgroundColor: styles.backgroundColor,
              transition: styles.transition
            }
          });
        }

        // Check for mix-blend-mode
        if (styles.mixBlendMode && styles.mixBlendMode !== 'normal') {
          results.mixBlendModeElements.push({
            tag: el.tagName,
            id: id,
            className: className.slice(0, 100),
            mixBlendMode: styles.mixBlendMode
          });
        }
      }

      // Check for canvas elements
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach(c => {
        results.canvasElements.push({
          id: c.id,
          className: c.className,
          width: c.width,
          height: c.height
        });
      });

      // Check body cursor style
      results.bodyStyles = {
        cursor: window.getComputedStyle(document.body).cursor
      };

      return results;
    });

    // Analyze cursor findings
    if (cursorAnalysis.customCursorElements.length > 0) {
      findings.cursorBlob.exists = true;
      const cursorEl = cursorAnalysis.customCursorElements[0];
      findings.cursorBlob.behavior = `Custom cursor element found: ${cursorEl.tag}#${cursorEl.id}.${cursorEl.className}`;
      findings.cursorBlob.size = `${cursorEl.styles.width} x ${cursorEl.styles.height}`;
      findings.cursorBlob.colorInversion = cursorEl.styles.mixBlendMode !== 'normal';
      findings.cursorBlob.implementation = 'CSS positioned element with JS transform updates';
    }

    if (cursorAnalysis.mixBlendModeElements.length > 0) {
      findings.cursorBlob.colorInversion = true;
      findings.otherFeatures.push({
        name: 'Mix Blend Mode Elements',
        description: `${cursorAnalysis.mixBlendModeElements.length} elements with mix-blend-mode`,
        implementation: JSON.stringify(cursorAnalysis.mixBlendModeElements.slice(0, 5))
      });
    }

    console.log('Analyzing scroll/frames animations...');
    // Check for scroll-based animations and layered frames
    const scrollAnimationAnalysis = await page.evaluate(() => {
      const results = {
        scrollTriggerElements: [],
        animatedElements: [],
        gsapDetected: false,
        locomotiveDetected: false,
        lenisDetected: false,
        framerMotionDetected: false,
        layeredSections: []
      };

      // Check for common animation libraries
      results.gsapDetected = !!(window.gsap || window.ScrollTrigger);
      results.locomotiveDetected = !!(window.LocomotiveScroll);
      results.lenisDetected = !!(window.Lenis);

      // Look for elements with data attributes commonly used for scroll animations
      const scrollElements = document.querySelectorAll('[data-scroll], [data-scroll-section], [data-speed], [data-lag], [data-direction]');
      scrollElements.forEach(el => {
        results.scrollTriggerElements.push({
          tag: el.tagName,
          className: el.className?.toString().slice(0, 100) || '',
          dataAttributes: Array.from(el.attributes)
            .filter(a => a.name.startsWith('data-'))
            .map(a => `${a.name}="${a.value}"`)
        });
      });

      // Look for layered/stacked elements (frames effect)
      const sections = document.querySelectorAll('section, [class*="section"], [class*="layer"], [class*="frame"]');
      sections.forEach((section, i) => {
        const styles = window.getComputedStyle(section);
        if (styles.position === 'fixed' || styles.position === 'sticky') {
          results.layeredSections.push({
            index: i,
            tag: section.tagName,
            className: section.className?.toString().slice(0, 100) || '',
            position: styles.position,
            zIndex: styles.zIndex
          });
        }
      });

      // Check for CSS animations/transitions
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        const styles = window.getComputedStyle(el);
        if (styles.animation && styles.animation !== 'none') {
          results.animatedElements.push({
            tag: el.tagName,
            className: el.className?.toString().slice(0, 50) || '',
            animation: styles.animation
          });
        }
      }

      return results;
    });

    // Process scroll animation findings
    if (scrollAnimationAnalysis.layeredSections.length > 0) {
      findings.framesAnimation.exists = true;
      findings.framesAnimation.layerCount = scrollAnimationAnalysis.layeredSections.length;
      findings.framesAnimation.triggerType = 'scroll';
      findings.framesAnimation.implementation = JSON.stringify(scrollAnimationAnalysis.layeredSections);
    }

    const libraries = [];
    if (scrollAnimationAnalysis.gsapDetected) libraries.push('GSAP/ScrollTrigger');
    if (scrollAnimationAnalysis.locomotiveDetected) libraries.push('Locomotive Scroll');
    if (scrollAnimationAnalysis.lenisDetected) libraries.push('Lenis');
    if (libraries.length > 0) {
      findings.otherFeatures.push({
        name: 'Animation Libraries',
        description: libraries.join(', '),
        implementation: 'JavaScript scroll animation libraries'
      });
    }

    console.log('Analyzing hover states...');
    // Find interactive elements and their hover states
    const hoverAnalysis = await page.evaluate(() => {
      const results = [];

      // Check links
      const links = document.querySelectorAll('a');
      links.forEach(link => {
        const styles = window.getComputedStyle(link);
        if (link.textContent?.trim()) {
          results.push({
            element: `a: "${link.textContent.slice(0, 30)}"`,
            baseStyles: {
              color: styles.color,
              textDecoration: styles.textDecoration,
              transform: styles.transform,
              opacity: styles.opacity,
              transition: styles.transition
            }
          });
        }
      });

      // Check buttons
      const buttons = document.querySelectorAll('button, [role="button"], .btn, .button');
      buttons.forEach(btn => {
        const styles = window.getComputedStyle(btn);
        results.push({
          element: `button: "${btn.textContent?.slice(0, 30) || btn.className}"`,
          baseStyles: {
            backgroundColor: styles.backgroundColor,
            transform: styles.transform,
            transition: styles.transition,
            boxShadow: styles.boxShadow
          }
        });
      });

      // Check images
      const images = document.querySelectorAll('img, picture, [class*="image"]');
      images.forEach(img => {
        const styles = window.getComputedStyle(img);
        if (styles.transition && styles.transition !== 'all 0s ease 0s') {
          results.push({
            element: `image: ${img.className?.toString().slice(0, 30) || 'img'}`,
            baseStyles: {
              transform: styles.transform,
              filter: styles.filter,
              transition: styles.transition,
              opacity: styles.opacity
            }
          });
        }
      });

      return results.slice(0, 20); // Limit results
    });

    // Test hover effects by moving mouse
    console.log('Testing hover interactions...');
    const interactiveElements = await page.$$('a, button, [role="button"]');
    for (let i = 0; i < Math.min(5, interactiveElements.length); i++) {
      try {
        const el = interactiveElements[i];
        const box = await el.boundingBox();
        if (box) {
          // Get styles before hover
          const beforeStyles = await el.evaluate(e => {
            const s = window.getComputedStyle(e);
            return {
              transform: s.transform,
              color: s.color,
              backgroundColor: s.backgroundColor,
              opacity: s.opacity
            };
          });

          // Hover
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.waitForTimeout(300);

          // Get styles after hover
          const afterStyles = await el.evaluate(e => {
            const s = window.getComputedStyle(e);
            return {
              transform: s.transform,
              color: s.color,
              backgroundColor: s.backgroundColor,
              opacity: s.opacity,
              textContent: e.textContent?.slice(0, 30)
            };
          });

          // Check for changes
          if (beforeStyles.transform !== afterStyles.transform ||
              beforeStyles.color !== afterStyles.color ||
              beforeStyles.backgroundColor !== afterStyles.backgroundColor ||
              beforeStyles.opacity !== afterStyles.opacity) {
            findings.hoverStates.push({
              element: afterStyles.textContent || 'interactive element',
              effect: 'Style change on hover',
              css: `transform: ${beforeStyles.transform} -> ${afterStyles.transform}; color: ${beforeStyles.color} -> ${afterStyles.color}`
            });
          }
        }
      } catch (e) {
        // Skip elements that can't be measured
      }
    }

    // Add base hover analysis
    hoverAnalysis.forEach(h => {
      if (h.baseStyles.transition && h.baseStyles.transition !== 'all 0s ease 0s') {
        findings.hoverStates.push({
          element: h.element,
          effect: 'CSS transition defined',
          css: `transition: ${h.baseStyles.transition}`
        });
      }
    });

    console.log('Analyzing other features...');
    // Check for smooth scroll
    const smoothScrollCheck = await page.evaluate(() => {
      const html = document.documentElement;
      const body = document.body;
      return {
        htmlScrollBehavior: window.getComputedStyle(html).scrollBehavior,
        bodyScrollBehavior: window.getComputedStyle(body).scrollBehavior,
        hasOverflowHidden: window.getComputedStyle(html).overflow === 'hidden' ||
                          window.getComputedStyle(body).overflow === 'hidden'
      };
    });

    if (smoothScrollCheck.htmlScrollBehavior === 'smooth' ||
        smoothScrollCheck.bodyScrollBehavior === 'smooth' ||
        scrollAnimationAnalysis.lenisDetected) {
      findings.otherFeatures.push({
        name: 'Smooth Scroll',
        description: scrollAnimationAnalysis.lenisDetected ? 'Lenis smooth scroll library' : 'CSS smooth scroll',
        implementation: JSON.stringify(smoothScrollCheck)
      });
    }

    // Check for loading/intro animations
    const introCheck = await page.evaluate(() => {
      const loaders = document.querySelectorAll('[class*="loader"], [class*="loading"], [class*="intro"], [class*="preload"]');
      return Array.from(loaders).map(l => ({
        tag: l.tagName,
        className: l.className?.toString().slice(0, 100) || '',
        display: window.getComputedStyle(l).display
      }));
    });

    if (introCheck.length > 0) {
      findings.otherFeatures.push({
        name: 'Loading/Intro Animation',
        description: `${introCheck.length} loader/intro elements found`,
        implementation: JSON.stringify(introCheck)
      });
    }

    // Check typography
    const typographyCheck = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3');
      const fonts = new Set();
      const sizes = [];

      headings.forEach(h => {
        const s = window.getComputedStyle(h);
        fonts.add(s.fontFamily);
        sizes.push({
          tag: h.tagName,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          letterSpacing: s.letterSpacing,
          textTransform: s.textTransform
        });
      });

      return {
        fonts: Array.from(fonts),
        headingSizes: sizes.slice(0, 5)
      };
    });

    findings.otherFeatures.push({
      name: 'Typography',
      description: `Fonts: ${typographyCheck.fonts.join(', ').slice(0, 100)}`,
      implementation: JSON.stringify(typographyCheck.headingSizes)
    });

    // Check for page transitions (data attributes, barba.js, etc)
    const transitionCheck = await page.evaluate(() => {
      const barbaDetected = !!window.barba;
      const swupDetected = !!window.Swup;
      const transitionElements = document.querySelectorAll('[data-barba], [data-swup], [class*="transition"], [class*="page-"]');

      return {
        barbaDetected,
        swupDetected,
        transitionElements: Array.from(transitionElements).map(e => e.className?.toString().slice(0, 50)).slice(0, 5)
      };
    });

    if (transitionCheck.barbaDetected || transitionCheck.swupDetected || transitionCheck.transitionElements.length > 0) {
      findings.otherFeatures.push({
        name: 'Page Transitions',
        description: transitionCheck.barbaDetected ? 'Barba.js' : (transitionCheck.swupDetected ? 'Swup' : 'Custom transitions'),
        implementation: JSON.stringify(transitionCheck)
      });
    }

    // Get actual CSS from stylesheets for cursor
    console.log('Extracting relevant CSS...');
    const cssExtraction = await page.evaluate(() => {
      const results = {
        cursorCSS: [],
        hoverCSS: [],
        animationCSS: []
      };

      try {
        const sheets = document.styleSheets;
        for (const sheet of sheets) {
          try {
            const rules = sheet.cssRules || sheet.rules;
            for (const rule of rules) {
              const cssText = rule.cssText || '';

              // Look for cursor-related rules
              if (cssText.match(/cursor|blob|follower/i)) {
                results.cursorCSS.push(cssText.slice(0, 500));
              }

              // Look for hover rules
              if (cssText.includes(':hover')) {
                results.hoverCSS.push(cssText.slice(0, 300));
              }

              // Look for keyframes
              if (cssText.includes('@keyframes')) {
                results.animationCSS.push(cssText.slice(0, 500));
              }
            }
          } catch (e) {
            // CORS blocked stylesheet
          }
        }
      } catch (e) {
        // Error accessing stylesheets
      }

      return results;
    });

    if (cssExtraction.cursorCSS.length > 0) {
      findings.cursorBlob.implementation += ` | CSS: ${cssExtraction.cursorCSS.slice(0, 3).join(' ')}`;
    }

    if (cssExtraction.hoverCSS.length > 0) {
      findings.hoverStates.push({
        element: 'CSS hover rules found',
        effect: `${cssExtraction.hoverCSS.length} hover rules in stylesheets`,
        css: cssExtraction.hoverCSS.slice(0, 5).join('\n')
      });
    }

    // Take screenshots for reference
    console.log('Taking screenshots...');
    await page.screenshot({ path: 'D:/משה פרוייקטים/AMIT-SITE/scripts/normalisboring-homepage.png', fullPage: false });

    // Scroll to check for scroll animations
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'D:/משה פרוייקטים/AMIT-SITE/scripts/normalisboring-scrolled.png', fullPage: false });

    // Final deep analysis of cursor
    console.log('Deep cursor analysis...');
    const deepCursorAnalysis = await page.evaluate(() => {
      // Check if cursor is hidden on body
      const bodyCursor = window.getComputedStyle(document.body).cursor;
      const htmlCursor = window.getComputedStyle(document.documentElement).cursor;

      // Look for absolutely/fixed positioned small circular elements
      const potentialCursors = [];
      document.querySelectorAll('*').forEach(el => {
        const s = window.getComputedStyle(el);
        if ((s.position === 'fixed' || s.position === 'absolute') &&
            s.pointerEvents === 'none' &&
            (parseInt(s.width) < 100 || parseInt(s.height) < 100)) {
          const rect = el.getBoundingClientRect();
          potentialCursors.push({
            tag: el.tagName,
            className: el.className?.toString().slice(0, 100) || '',
            id: el.id,
            width: s.width,
            height: s.height,
            borderRadius: s.borderRadius,
            backgroundColor: s.backgroundColor,
            mixBlendMode: s.mixBlendMode,
            zIndex: s.zIndex
          });
        }
      });

      return {
        bodyCursor,
        htmlCursor,
        potentialCursors
      };
    });

    if (deepCursorAnalysis.potentialCursors.length > 0) {
      findings.cursorBlob.exists = true;
      const cursor = deepCursorAnalysis.potentialCursors[0];
      findings.cursorBlob.behavior = 'Fixed position element following mouse with pointer-events: none';
      findings.cursorBlob.size = `${cursor.width} x ${cursor.height}`;
      findings.cursorBlob.colorInversion = cursor.mixBlendMode === 'difference' || cursor.mixBlendMode === 'exclusion';
      findings.cursorBlob.implementation = `${cursor.tag}#${cursor.id}.${cursor.className} - borderRadius: ${cursor.borderRadius}, bg: ${cursor.backgroundColor}, mixBlend: ${cursor.mixBlendMode}`;
    }

    // Check native cursor is hidden
    if (deepCursorAnalysis.bodyCursor === 'none' || deepCursorAnalysis.htmlCursor === 'none') {
      findings.cursorBlob.behavior = (findings.cursorBlob.behavior || '') + ' | Native cursor hidden';
    }

    console.log('\n=== ANALYSIS RESULTS ===\n');
    console.log(JSON.stringify(findings, null, 2));

  } catch (error) {
    console.error('Error during analysis:', error);
    findings.error = error.message;
  } finally {
    await browser.close();
  }

  return findings;
}

analyzeNormalisBoring().catch(console.error);
