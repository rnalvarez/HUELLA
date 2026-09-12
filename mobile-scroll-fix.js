/* mobile-scroll-fix.js — HUELLA
 * Final smartphone scrolling layer.
 * Keeps desktop untouched and restores native page scrolling on phones.
 */
'use strict';

(() => {
  const apply = () => {
    if (window.innerWidth > 700) return;

    const html = document.documentElement;
    const body = document.body;
    const appMain = document.getElementById('app-main');
    const videoCol = document.getElementById('video-col');
    const libraryCol = document.getElementById('library-col');
    const libraryScroll = document.getElementById('library-scroll');
    const creatorCredit = document.getElementById('creator-credit');

    html.style.setProperty('overflow-y', 'auto', 'important');
    html.style.setProperty('overflow-x', 'hidden', 'important');
    body.style.setProperty('overflow-y', 'auto', 'important');
    body.style.setProperty('overflow-x', 'hidden', 'important');
    body.style.setProperty('height', 'auto', 'important');
    body.style.setProperty('display', 'flex', 'important');
    body.style.setProperty('flex-direction', 'column', 'important');

    appMain?.style.setProperty('height', 'auto', 'important');
    appMain?.style.setProperty('min-height', '0', 'important');
    appMain?.style.setProperty('overflow', 'visible', 'important');
    appMain?.style.setProperty('flex', '0 0 auto', 'important');

    videoCol?.style.setProperty('overflow', 'visible', 'important');
    libraryCol?.style.setProperty('height', 'auto', 'important');
    libraryCol?.style.setProperty('max-height', 'none', 'important');
    libraryCol?.style.setProperty('overflow', 'visible', 'important');
    libraryCol?.style.setProperty('flex', '0 0 auto', 'important');

    libraryScroll?.style.setProperty('height', 'auto', 'important');
    libraryScroll?.style.setProperty('max-height', 'none', 'important');
    libraryScroll?.style.setProperty('overflow', 'visible', 'important');
    libraryScroll?.style.setProperty('touch-action', 'pan-y', 'important');

    // Final safeguard: the creator credit is always a normal-flow child
    // after #app-main. Inline !important styles here win over any stale or
    // conflicting mobile CSS that might still be cached by the browser.
    if (creatorCredit) {
      creatorCredit.style.setProperty('position', 'static', 'important');
      creatorCredit.style.setProperty('top', 'auto', 'important');
      creatorCredit.style.setProperty('right', 'auto', 'important');
      creatorCredit.style.setProperty('bottom', 'auto', 'important');
      creatorCredit.style.setProperty('left', 'auto', 'important');
      creatorCredit.style.setProperty('transform', 'none', 'important');
      creatorCredit.style.setProperty('float', 'none', 'important');
      creatorCredit.style.setProperty('clear', 'both', 'important');
      creatorCredit.style.setProperty('order', '9999', 'important');
      creatorCredit.style.setProperty('width', '100%', 'important');
      creatorCredit.style.setProperty('height', 'auto', 'important');
      creatorCredit.style.setProperty('min-height', '22px', 'important');
      creatorCredit.style.setProperty('margin', '0', 'important');
      creatorCredit.style.setProperty('padding', '5px 10px calc(5px + env(safe-area-inset-bottom,0px))', 'important');
      creatorCredit.style.setProperty('display', 'flex', 'important');
      creatorCredit.style.setProperty('align-items', 'center', 'important');
      creatorCredit.style.setProperty('justify-content', 'center', 'important');
      creatorCredit.style.setProperty('background', 'var(--bg)', 'important');
      creatorCredit.style.setProperty('z-index', 'auto', 'important');
    }
  };

  apply();
  window.addEventListener('resize', apply, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(apply, 50), { passive: true });
})();
