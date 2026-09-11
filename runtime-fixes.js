/* runtime-fixes.js — OTAA_FOLEY
 * Final runtime reliability layer.
 *
 * - Normalizes event layers against library.json before playback.
 * - REPRODUCCIÓN starts the video immediately; WAV preload never blocks transport.
 * - Button and Space use the same playback transport.
 * - During recording, Space remains the Foley trigger handled by final-fixes.js.
 * - Recording is incremental: starting a new recording pass preserves existing events.
 */
'use strict';

(() => {
  if (typeof S === 'undefined') return;

  const video = document.getElementById('video-el');
  const playbackBtn = document.getElementById('btn-preview');
  const btnRecord = document.getElementById('btn-record');
  const btnStop = document.getElementById('btn-stop');
  const recIndicator = document.getElementById('rec-indicator');
  const hintBar = document.getElementById('hint-bar');

  if (!video || !playbackBtn) return;

  function normalizeEvents() {
    const surfaces = S.lib?.surfaces || [];
    S.events.forEach(ev => {
      (ev.layers || []).forEach(layer => {
        if (layer?.surface?.id) {
          const canonical = surfaces.find(s => s.id === layer.surface.id);
          if (canonical) layer.surface = canonical;
        }
        if (!Number.isFinite(Number(layer.rrIdx)) || Number(layer.rrIdx) < 0) layer.rrIdx = 0;
        layer.rrIdx = Math.floor(Number(layer.rrIdx));
      });
    });
  }

  // ── Incremental recording ─────────────────────────────────────────────
  function startIncrementalRecording() {
    if (!S.videoLoaded || S.isRecording) return;

    if (S.isPreviewing && typeof window.stopPreview === 'function') {
      window.stopPreview();
    } else {
      S.isPreviewing = false;
      S.previewTimers?.forEach(clearTimeout);
      S.previewTimers = [];
    }

    AudioEngine.getCtx();
    S.startTimecode = video.currentTime;
    S.isRecording = true;

    btnRecord.style.display = 'none';
    btnStop.style.display = 'inline-block';
    btnStop.disabled = false;
    playbackBtn.disabled = true;
    recIndicator?.classList.remove('hidden');
    hintBar?.classList.remove('hidden');

    if (typeof updateEventCount === 'function') updateEventCount();
    if (typeof updateHint === 'function') updateHint();
    if (typeof hideTooltip === 'function') hideTooltip();
    if (typeof drawWaveform === 'function') drawWaveform();
    if (typeof startRaf === 'function') startRaf();

    const p = video.play();
    if (p?.catch) p.catch(err => console.warn('[record]', err));
  }

  if (btnRecord) {
    btnRecord.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      startIncrementalRecording();
    }, true);
  }

  let wrappedStopRecording = null;
  if (typeof stopRecording === 'function') {
    const originalStopRecording = stopRecording;
    wrappedStopRecording = function (...args) {
      const result = originalStopRecording.apply(this, args);
      S.isPreviewing = false;
      S.previewTimers?.forEach(clearTimeout);
      S.previewTimers = [];
      if (S.videoLoaded && !S.isRecording) playbackBtn.disabled = false;
      if (typeof drawWaveform === 'function') drawWaveform();
      return result;
    };
    stopRecording = wrappedStopRecording;
  }

  if (btnStop && wrappedStopRecording) {
    btnStop.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      wrappedStopRecording();
    }, true);
  }

  // ── Unified playback transport ────────────────────────────────────────
  let starting = false;

  async function startPlayback() {
    if (starting || S.isRecording || !S.videoLoaded) return;
    if (S.isPreviewing) return;

    starting = true;
    normalizeEvents();
    S.isPreviewing = true;
    S.previewTimers?.forEach(clearTimeout);
    S.previewTimers = [];

    const startAt = video.currentTime;
    S.startTimecode = startAt;
    const ctx = AudioEngine.getCtx();

    // Schedule Foley events from the current timecode. This does not await any
    // WAV preload: AudioEngine can use its existing fallback while files load.
    S.events
      .filter(ev => ev.time >= startAt)
      .forEach(ev => {
        const delayMs = Math.max(0, (ev.time - startAt) * 1000);
        S.previewTimers.push(setTimeout(() => {
          if (!S.isPreviewing) return;
          try {
            AudioEngine.scheduleLayers(ev.layers || [], ctx.currentTime + 0.02);
          } catch (err) {
            console.warn('[preview] event scheduling failed', err);
          }
        }, delayMs));
      });

    try {
      // The video transport is the primary action and starts immediately.
      await video.play();
      playbackBtn.textContent = '■ DETENER';
      playbackBtn.disabled = false;
      document.getElementById('play-indicator')?.classList.remove('hidden');
      if (typeof startRaf === 'function') startRaf();

      // Preload in background only. It must never gate playback.
      if (typeof AudioEngine.preloadLayers === 'function') {
        const layers = S.events
          .filter(ev => ev.time >= startAt)
          .flatMap(ev => ev.layers || []);
        AudioEngine.preloadLayers(layers).catch(err =>
          console.warn('[preview] background preload failed', err)
        );
      }
    } catch (err) {
      console.warn('[preview] video.play() failed', err);
      S.isPreviewing = false;
      S.previewTimers?.forEach(clearTimeout);
      S.previewTimers = [];
      playbackBtn.textContent = '▶ REPRODUCCIÓN';
      document.getElementById('play-indicator')?.classList.add('hidden');
    } finally {
      starting = false;
      playbackBtn.disabled = !S.videoLoaded;
    }
  }

  function stopPlayback() {
    starting = false;
    S.isPreviewing = false;
    S.previewTimers?.forEach(clearTimeout);
    S.previewTimers = [];
    video.pause();
    playbackBtn.textContent = '▶ REPRODUCCIÓN';
    playbackBtn.disabled = !S.videoLoaded;
    document.getElementById('play-indicator')?.classList.add('hidden');
    if (typeof drawWaveform === 'function') drawWaveform();
  }

  // Capture the button before app.js's original listener. This removes the
  // previous dependency on legacy/local startPreview implementations.
  playbackBtn.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (S.isPreviewing) stopPlayback();
    else startPlayback();
  }, true);

  window.startPreview = startPlayback;
  window.stopPreview = stopPlayback;

  // Space is the same transport when not recording.
  window.addEventListener('keydown', event => {
    if (event.code !== 'Space' || event.repeat) return;
    const target = event.target;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    if (S.isRecording || !S.videoLoaded) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    if (S.isPreviewing) stopPlayback();
    else startPlayback();
  }, true);

  ['loadedmetadata', 'durationchange', 'canplay'].forEach(type => {
    video.addEventListener(type, () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        S.videoLoaded = true;
        if (!S.videoDuration) S.videoDuration = video.duration;
        playbackBtn.disabled = false;
      }
    }, true);
  });

  normalizeEvents();
})();
