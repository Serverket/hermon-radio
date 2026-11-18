const VIDEO_EXTENSION_RE = /\.(mp4|webm|ogg|m4v|mov)(\?.*)?$/i;
const SAFE_EXTERNAL_URL_RE = /^(https?:\/\/|mailto:|tel:)/i;
const SPONSOR_FOOTER_PREFIX_RE = /^Patrocinadores:\s*(.+)$/i;
const SPONSOR_CONTACT_RE = /^(escríbenos|contáctanos|contacto|comunícate)\b/i;

/**
 * Determines whether a static program ad uses a video or image asset.
 */
export function resolveAdMediaType(ad) {
  if (!ad?.src) return null;
  if (ad.type === 'video' || ad.type === 'image') return ad.type;
  return VIDEO_EXTENSION_RE.test(ad.src) ? 'video' : 'image';
}

export function sanitizeAdUrl(url) {
  const trimmed = typeof url === 'string' ? url.trim() : '';
  return SAFE_EXTERNAL_URL_RE.test(trimmed) ? trimmed : '';
}

function normalizeAdEntry(item, idx, prefix = 'ad') {
  const src = typeof item.src === 'string' ? item.src.trim() : '';
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  return {
    id: item.id || `${prefix}-${src || title}-${idx}`,
    mediaType: resolveAdMediaType({ ...item, src }),
    src,
    poster: typeof item.poster === 'string' ? item.poster.trim() : '',
    alt: typeof item.alt === 'string' ? item.alt.trim() : '',
    title,
    subtitle: typeof item.subtitle === 'string' ? item.subtitle.trim() : '',
    badge: typeof item.badge === 'string' ? item.badge.trim() : '',
    url: sanitizeAdUrl(item.url),
    linkLabel: typeof item.linkLabel === 'string' && item.linkLabel.trim() ? item.linkLabel.trim() : 'Visitar ↗',
    hasAudio: item.hasAudio !== false,
    isContactNote: Boolean(item.isContactNote) || (!src && SPONSOR_CONTACT_RE.test(title)),
  };
}

/**
 * Extracts structured text-only sponsor entries from a `Patrocinadores: ...` program footer.
 */
export function extractFooterSponsorAds(footer) {
  if (typeof footer !== 'string') return [];
  const match = footer.trim().match(SPONSOR_FOOTER_PREFIX_RE);
  if (!match) return [];

  return match[1]
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((title, idx) => normalizeAdEntry({ title }, idx, 'footer-sponsor'));
}

/**
 * Normalizes `program.ads` (or `program.ad`) combined with any text sponsors
 * auto-extracted from `program.footer` (`Patrocinadores: ...`), deduplicated by title.
 */
export function normalizeProgramAds(program) {
  if (!program) return [];
  const rawList = Array.isArray(program.ads)
    ? program.ads
    : program.ad
      ? [program.ad]
      : [];

  const explicitAds = rawList
    .filter((item) => item && (item.src || item.title))
    .map((item, idx) => normalizeAdEntry(item, idx));

  const footerSponsors = extractFooterSponsorAds(program.footer);
  if (!footerSponsors.length) return explicitAds;

  const seenTitles = new Set(
    explicitAds.map((ad) => ad.title.toLowerCase()).filter(Boolean)
  );
  const merged = [...explicitAds];
  for (const sponsor of footerSponsors) {
    const key = sponsor.title.toLowerCase();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      merged.push(sponsor);
    }
  }
  return merged;
}

