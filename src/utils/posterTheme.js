/**
 * Adaptive poster colorimetria extractor with WCAG contrast enforcement and
 * exact fallback to Radio Hermón's default Opal Gold palette.
 */

export const DEFAULT_POSTER_THEME = {
  isDefault: true,
  from: '#DFBC58',
  to: '#BD8F2A',
  heroStop: '#168A65',
  softBg: 'rgba(202, 158, 52, 0.13)',
  softText: '#8A6512',
  softBorder: 'rgba(202, 158, 52, 0.28)',
  darkSoftBg: 'rgba(223, 188, 88, 0.16)',
  darkSoftText: '#F3D478',
  darkSoftBorder: 'rgba(223, 188, 88, 0.30)',
  glow: 'rgba(189, 143, 42, 0.48)',
  darkGlow: 'rgba(189, 143, 42, 0.42)',
  ring: '#DFBC58',
  auraLight: 'rgba(223, 188, 88, 0.0)',
  auraDark: 'rgba(223, 188, 88, 0.0)',
  thumb: 'rgba(189, 143, 42, 0.35)',
  thumbHover: 'rgba(189, 143, 42, 0.65)',
  spectre: ['#10B981', '#DFBC58', '#BD8F2A'],
};

/**
 * Shared live color state consumed cleanly inside 30fps canvas loops without React re-renders.
 */
export const activePosterThemeState = { ...DEFAULT_POSTER_THEME };

const themeCache = new Map();

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h *= 60;
  }

  return { h, s, l };
}

function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let rn = 0;
  let gn = 0;
  let bn = 0;

  if (hue < 60) {
    [rn, gn, bn] = [c, x, 0];
  } else if (hue < 120) {
    [rn, gn, bn] = [x, c, 0];
  } else if (hue < 180) {
    [rn, gn, bn] = [0, c, x];
  } else if (hue < 240) {
    [rn, gn, bn] = [0, x, c];
  } else if (hue < 300) {
    [rn, gn, bn] = [x, 0, c];
  } else {
    [rn, gn, bn] = [c, 0, x];
  }

  return [
    Math.round((rn + m) * 255),
    Math.round((gn + m) * 255),
    Math.round((bn + m) * 255),
  ];
}

function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function relativeLuminance([r, g, b]) {
  const linearize = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(rgbA, rgbB) {
  const l1 = relativeLuminance(rgbA);
  const l2 = relativeLuminance(rgbB);
  const bright = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (bright + 0.05) / (dark + 0.05);
}

/**
 * Ensures white `#FFFFFF` text over a solid/gradient stop meets accessible contrast (~4.5:1).
 */
function clampForWhiteText(h, s, startL) {
  let l = startL;
  let rgb = hslToRgb(h, s, l);
  while (contrastRatio([255, 255, 255], rgb) < 4.5 && l > 0.18) {
    l -= 0.03;
    rgb = hslToRgb(h, s, l);
  }
  return { l, rgb };
}

/**
 * Builds a complete, harmonious UI palette around a dominant hue + saturation.
 */
export function buildThemeFromHsl(hue, rawSat) {
  const sat = Math.max(0.42, Math.min(0.76, rawSat));
  const { l: baseL, rgb: toRgb } = clampForWhiteText(hue, sat, 0.42);
  const fromRgb = hslToRgb(hue, Math.min(0.82, sat + 0.04), Math.min(0.62, baseL + 0.16));
  const softTextRgb = hslToRgb(hue, Math.min(0.84, sat + 0.08), Math.min(0.27, baseL - 0.12));
  const darkTextRgb = hslToRgb(hue, Math.min(0.86, sat + 0.08), 0.75);
  const companionHue = (hue + 26) % 360;
  const heroStopRgb = hslToRgb(companionHue, Math.min(0.72, sat), 0.34);

  const [rT, gT, bT] = toRgb;
  const [rF, gF, bF] = fromRgb;
  const [rH, gH, bH] = heroStopRgb;

  return {
    isDefault: false,
    from: rgbToHex(fromRgb),
    to: rgbToHex(toRgb),
    heroStop: rgbToHex(heroStopRgb),
    softBg: `rgba(${rT}, ${gT}, ${bT}, 0.13)`,
    softText: rgbToHex(softTextRgb),
    softBorder: `rgba(${rT}, ${gT}, ${bT}, 0.28)`,
    darkSoftBg: `rgba(${rF}, ${gF}, ${bF}, 0.18)`,
    darkSoftText: rgbToHex(darkTextRgb),
    darkSoftBorder: `rgba(${rF}, ${gF}, ${bF}, 0.34)`,
    glow: `rgba(${rT}, ${gT}, ${bT}, 0.46)`,
    darkGlow: `rgba(${rT}, ${gT}, ${bT}, 0.40)`,
    ring: rgbToHex(fromRgb),
    auraLight: `rgba(${rF}, ${gF}, ${bF}, 0.16)`,
    auraDark: `rgba(${rH}, ${gH}, ${bH}, 0.20)`,
    thumb: `rgba(${rT}, ${gT}, ${bT}, 0.36)`,
    thumbHover: `rgba(${rT}, ${gT}, ${bT}, 0.68)`,
    spectre: [rgbToHex(heroStopRgb), rgbToHex(fromRgb), rgbToHex(toRgb)],
  };
}

/**
 * Samples an image on a 32x32 offscreen canvas to pick the most prominent chromatic hue.
 * Automatically returns DEFAULT_POSTER_THEME when monochrome, opaque-blocked, or invalid.
 */
export function extractPosterTheme(imageUrl) {
  if (!imageUrl) return Promise.resolve(DEFAULT_POSTER_THEME);
  if (themeCache.has(imageUrl)) return Promise.resolve(themeCache.get(imageUrl));

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';

    img.onload = () => {
      try {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(DEFAULT_POSTER_THEME);
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        // 24 hue buckets (15 deg each) weighting chromatic, non-extreme pixels
        const bins = Array.from({ length: 24 }, () => ({ weight: 0, sinSum: 0, cosSum: 0, satSum: 0 }));
        let totalChromaticWeight = 0;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          const { h, s, l } = rgbToHsl(data[i], data[i + 1], data[i + 2]);
          if (s < 0.2 || l < 0.14 || l > 0.88) continue;

          // Center weight slightly favors central poster art over corner margins
          const pixelIdx = i / 4;
          const px = (pixelIdx % size) / size - 0.5;
          const py = Math.floor(pixelIdx / size) / size - 0.5;
          const centerWeight = 1.25 - Math.hypot(px, py);

          const w = s * s * centerWeight * (1 - Math.abs(l - 0.5) * 0.9);
          const binIdx = Math.floor((h % 360) / 15) % 24;
          const rad = (h * Math.PI) / 180;

          bins[binIdx].weight += w;
          bins[binIdx].sinSum += Math.sin(rad) * w;
          bins[binIdx].cosSum += Math.cos(rad) * w;
          bins[binIdx].satSum += s * w;
          totalChromaticWeight += w;
        }

        if (totalChromaticWeight < 1.8) {
          themeCache.set(imageUrl, DEFAULT_POSTER_THEME);
          resolve(DEFAULT_POSTER_THEME);
          return;
        }

        let bestBin = bins[0];
        for (const bin of bins) {
          if (bin.weight > bestBin.weight) bestBin = bin;
        }

        const avgAngle = (Math.atan2(bestBin.sinSum, bestBin.cosSum) * 180) / Math.PI;
        const dominantHue = (avgAngle + 360) % 360;
        const dominantSat = bestBin.satSum / Math.max(bestBin.weight, 0.001);

        const theme = buildThemeFromHsl(dominantHue, dominantSat);
        themeCache.set(imageUrl, theme);
        resolve(theme);
      } catch {
        resolve(DEFAULT_POSTER_THEME);
      }
    };

    img.onerror = () => resolve(DEFAULT_POSTER_THEME);
    img.src = imageUrl;
  });
}

/**
 * Pushes the resolved theme tokens into CSS custom properties on `:root` and shared canvas state.
 */
export function applyPosterTheme(theme = DEFAULT_POSTER_THEME) {
  const t = theme || DEFAULT_POSTER_THEME;
  Object.assign(activePosterThemeState, t);

  if (typeof document === 'undefined') return;
  const s = document.documentElement.style;
  s.setProperty('--hermon-from', t.from);
  s.setProperty('--hermon-to', t.to);
  s.setProperty('--hermon-hero-stop', t.heroStop);
  s.setProperty('--hermon-soft-bg', t.softBg);
  s.setProperty('--hermon-soft-text', t.softText);
  s.setProperty('--hermon-soft-border', t.softBorder);
  s.setProperty('--hermon-dark-soft-bg', t.darkSoftBg);
  s.setProperty('--hermon-dark-soft-text', t.darkSoftText);
  s.setProperty('--hermon-dark-soft-border', t.darkSoftBorder);
  s.setProperty('--hermon-glow', t.glow);
  s.setProperty('--hermon-dark-glow', t.darkGlow);
  s.setProperty('--hermon-ring', t.ring);
  s.setProperty('--hermon-aura-light', t.auraLight);
  s.setProperty('--hermon-aura-dark', t.auraDark);
  s.setProperty('--hermon-thumb', t.thumb);
  s.setProperty('--hermon-thumb-hover', t.thumbHover);
}

