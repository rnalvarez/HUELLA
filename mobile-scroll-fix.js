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

    html.style.setProperty('overflow-y', 'auto', 'important');
    html.style.setProperty('overflow-x', 'hidden', 'important');
    body.style.setProperty('overflow-y', 'auto', 'important');
    body.style.setProperty('overflow-x', 'hidden', 'important');
    body.style.setProperty('height', 'auto', 'important');

    appMain?.style.setProperty('height', 'auto', 'important');
    appMain?.style.setProperty('min-height', '0', 'important');
    appMain?.style.setProperty('overflow', 'visible', 'important');

    videoCol?.style.setProperty('overflow', 'visible', 'important');
    libraryCol?.style.setProperty('height', 'auto', 'important');
    libraryCol?.style.setProperty('max-height', 'none', 'important');
    libraryCol?.style.setProperty('overflow', 'visible', 'important');

    libraryScroll?.style.setProperty('height', 'auto', 'important');
    libraryScroll?.style.setProperty('max-height', 'none', 'important');
    libraryScroll?.style.setProperty('overflow', 'visible', 'important');
    libraryScroll?.style.setProperty('touch-action', 'pan-y', 'important');
  };

  apply();
  window.addEventListener('resize', apply, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(apply, 50), { passive: true });
})();
