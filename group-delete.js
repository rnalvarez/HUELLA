/* group-delete.js — HUELLA
 * Reliable keyboard deletion for timeline multi-selection.
 */
'use strict';

(() => {
  if (typeof S === 'undefined') return;

  const isTextInput = target => {
    if (!target) return false;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return true;
    return target.isContentEditable === true;
  };

  const getSelection = () => {
    const mirrored = window.__otaaGroupSelection;
    if (mirrored instanceof Set && mirrored.size) return new Set(mirrored);
    if (S.selectedEvId) return new Set([S.selectedEvId]);
    return new Set();
  };

  function deleteSelection() {
    if (S.isRecording || S.isPreviewing) return false;
    const ids = getSelection();
    if (!ids.size) return false;

    const remaining = S.events.filter(ev => !ids.has(ev.id));
    if (remaining.length === S.events.length) return false;

    S.events = remaining;
    S.selectedEvId = null;
    window.__otaaGroupSelection = new Set();

    if (typeof updateEventCount === 'function') updateEventCount();
    if (typeof rebuildLog === 'function') rebuildLog();
    if (typeof drawWaveform === 'function') drawWaveform();
    if (typeof updateScrollbar === 'function') updateScrollbar();
    if (typeof hideTooltip === 'function') hideTooltip();

    return true;
  }

  const isDeleteKey = event =>
    event.key === 'Delete' ||
    event.key === 'Backspace' ||
    event.code === 'Delete' ||
    event.code === 'NumpadDecimal' ||
    event.keyCode === 46;

  window.addEventListener('keydown', event => {
    if (event.repeat || !isDeleteKey(event) || isTextInput(event.target)) return;
    if (!deleteSelection()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
})();
