/* group-delete.js — HUELLA
 * Keyboard deletion for the active multi-selection.
 *
 * Group selection is owned by group-edit.js and mirrored to
 * window.__otaaGroupSelection. This layer only supplies the missing
 * Delete/Backspace transport without changing selection behavior.
 */
'use strict';

(() => {
  if (typeof S === 'undefined') return;

  function isTextInput(target) {
    if (!target) return false;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return true;
    return target.isContentEditable === true;
  }

  function deleteGroupSelection() {
    const selected = window.__otaaGroupSelection;
    if (!(selected instanceof Set) || selected.size === 0) return false;
    if (S.isRecording || S.isPreviewing) return false;

    const ids = new Set(selected);
    const before = S.events.length;
    S.events = S.events.filter(ev => !ids.has(ev.id));
    if (S.events.length === before) return false;

    if (ids.has(S.selectedEvId)) S.selectedEvId = null;
    window.__otaaGroupSelection = new Set();

    if (typeof updateEventCount === 'function') updateEventCount();
    if (typeof rebuildLog === 'function') rebuildLog();
    if (typeof saveState === 'function') saveState();
    if (typeof hideTooltip === 'function') hideTooltip();
    if (typeof drawWaveform === 'function') drawWaveform();
    if (typeof updateScrollbar === 'function') updateScrollbar();

    const clearButton = document.getElementById('group-edit-clear');
    if (clearButton) clearButton.click();

    return true;
  }

  document.addEventListener('keydown', event => {
    if ((event.key !== 'Delete' && event.key !== 'Backspace') || event.repeat) return;
    if (isTextInput(event.target)) return;
    if (deleteGroupSelection()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
})();
