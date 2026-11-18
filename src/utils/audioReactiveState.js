/**
 * Lightweight shared reactive audio telemetry used by CustomPlayer spectrogram
 * and AnimatedBackground golden wave lines without triggering React re-renders.
 */

const elementGraphMap = new WeakMap();

export const audioReactiveState = {
  playing: false,
  hasSignal: false,
  energy: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  bands: new Float32Array(14),
};

/**
 * Safely attaches an AudioContext + AnalyserNode (fftSize 64) to an existing
 * media element once. Reuses cached graph cleanly under React StrictMode.
 */
export function ensureAudioAnalyser(mediaEl) {
  if (!mediaEl || typeof window === 'undefined') return null;

  const existing = elementGraphMap.get(mediaEl);
  if (existing) {
    if (existing.ctx.state === 'suspended') {
      existing.ctx.resume().catch(() => {});
    }
    return existing;
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  try {
    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128; // 64 bins (~375 Hz step at 48 kHz): ultra-lightweight yet covers vocal/music bands
    analyser.smoothingTimeConstant = 0.8;

    const source = ctx.createMediaElementSource(mediaEl);
    source.connect(analyser);
    analyser.connect(ctx.destination);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const graph = { ctx, analyser, source, dataArray };
    elementGraphMap.set(mediaEl, graph);

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return graph;
  } catch {
    return null;
  }
}

/**
 * Samples the active analyser into audioReactiveState (~30fps caller).
 * Falls back gracefully to gentle organic motion if CORS taints frequency bins.
 */
export function sampleAudioTelemetry(graph, isPlaying, timeSec) {
  audioReactiveState.playing = isPlaying;

  if (!isPlaying) {
    audioReactiveState.energy *= 0.82;
    audioReactiveState.bass *= 0.82;
    audioReactiveState.mid *= 0.82;
    audioReactiveState.treble *= 0.82;
    for (let i = 0; i < audioReactiveState.bands.length; i++) {
      audioReactiveState.bands[i] *= 0.8;
    }
    return;
  }

  let sum = 0;
  if (graph && graph.analyser && graph.ctx?.state === 'running') {
    graph.analyser.getByteFrequencyData(graph.dataArray);
    for (let i = 0; i < graph.dataArray.length; i++) {
      sum += graph.dataArray[i];
    }
  }

  if (sum > 8 && graph) {
    audioReactiveState.hasSignal = true;
    const bins = graph.dataArray;
    const count = audioReactiveState.bands.length;

    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;

    // Focus 14 bars across 0–6.4 kHz (bins 0..16) with gentle vocal brilliance boost
    const bandBinMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16];
    for (let i = 0; i < count; i++) {
      const binIdx = Math.min(bins.length - 1, bandBinMap[i]);
      const brillianceGain = 1 + i * 0.07;
      const norm = Math.min(1, (bins[binIdx] / 255) * brillianceGain);
      const prev = audioReactiveState.bands[i];
      const next = norm > prev ? prev + (norm - prev) * 0.55 : prev + (norm - prev) * 0.25;
      audioReactiveState.bands[i] = next;

      if (i < 4) bassSum += next;
      else if (i < 9) midSum += next;
      else trebleSum += next;
    }

    audioReactiveState.bass = bassSum / 4;
    audioReactiveState.mid = midSum / 5;
    audioReactiveState.treble = trebleSum / 5;
    audioReactiveState.energy = (bassSum + midSum + trebleSum) / count;
  } else {
    // Organic gentle fallback when playing without un-tainted WebAudio bins (e.g. old iOS Safari)
    audioReactiveState.hasSignal = false;
    const count = audioReactiveState.bands.length;
    let eSum = 0;
    for (let i = 0; i < count; i++) {
      const wave =
        0.28 +
        0.22 * Math.sin(timeSec * 3.4 + i * 0.65) +
        0.14 * Math.cos(timeSec * 5.1 - i * 0.45);
      const val = Math.max(0.08, Math.min(0.85, wave));
      audioReactiveState.bands[i] += (val - audioReactiveState.bands[i]) * 0.25;
      eSum += audioReactiveState.bands[i];
    }
    audioReactiveState.energy = eSum / count;
    audioReactiveState.bass = audioReactiveState.energy * 1.1;
    audioReactiveState.mid = audioReactiveState.energy;
    audioReactiveState.treble = audioReactiveState.energy * 0.85;
  }
}
