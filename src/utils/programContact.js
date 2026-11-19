const GENERIC_SPONSOR_FOOTER = /^¡?\s*comun[ií]cate con nosotros para patrocinarnos!?\s*$/i;
const SPONSOR_MENTION_RE = /\bpatrocinador(?:es|a|as)?\s*:/i;
const VE_PHONE_EXTRACT_RE = /(?:\+?58[\s.-]*0?|0)?(412|414|416|424|426)[\s.-]*(\d{3})[\s.-]*(\d{4})/;
const STRICT_E164_RE = /^\d{10,15}$/;

// Strict allowlist for safe plain-text listener comments (Unicode letters/numbers,
// standard Spanish punctuation, spaces, and emojis). Blocks HTML tags/scripts,
// quotes, SQL/script/template metacharacters, control chars, URLs, and bidi overrides.
const SCRIPT_STYLE_BLOCK_RE = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
const HTML_TAG_RE = /<[^>]*>/g;
const DANGEROUS_SCHEME_RE = /\b(?:javascript|vbscript|data|file|blob|https?|ftp)\s*:\S*/gi;
const URL_WWW_RE = /\bwww\.\S*/gi;
const DISALLOWED_COMMENT_CHARS_RE = /[^\p{L}\p{N}\p{Extended_Pictographic}\uFE0F .,:\-¡!¿?()@#&+/%]/gu;
const MULTI_DASH_RE = /-{2,}/g;
const MULTI_SPACE_RE = /[ \t]{2,}/g;

export const MAX_COMMENT_LENGTH = 140;

/**
 * Truncates a string to at most `maxUnits` UTF-16 code units without splitting
 * emoji surrogate pairs.
 */
function safeTruncate(str, maxUnits) {
  if (str.length <= maxUnits) return str;
  let out = '';
  for (const ch of str) {
    if (out.length + ch.length > maxUnits) break;
    out += ch;
  }
  return out;
}

/**
 * Sanitizes listener comment input against HTML/XSS, script/URL scheme injection,
 * SQL/command metacharacters, control characters, and bidi spoofing, while
 * enforcing the strict 140-character limit.
 */
export function sanitizeCommentInput(raw, { finalize = false } = {}) {
  if (typeof raw !== 'string') return '';
  let clean = raw
    .normalize('NFC')
    .replace(SCRIPT_STYLE_BLOCK_RE, '')
    .replace(HTML_TAG_RE, '')
    .replace(DANGEROUS_SCHEME_RE, '')
    .replace(URL_WWW_RE, '')
    .replace(DISALLOWED_COMMENT_CHARS_RE, '')
    .replace(MULTI_DASH_RE, '-')
    .replace(MULTI_SPACE_RE, ' ');

  if (finalize) {
    clean = clean.trim();
  }

  return safeTruncate(clean, MAX_COMMENT_LENGTH);
}

/**
 * Normalizes any Venezuelan mobile phone string (e.g. `0416-1114425`,
 * `+58 424-329-3508`, `+5804243293508`) into E.164 digits (`584161114425`)
 * and display format (`+58 416-111-4425`). Returns `null` if invalid.
 */
export function parseVenezuelanWhatsApp(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const match = raw.match(VE_PHONE_EXTRACT_RE);
  if (!match) return null;
  const [, prefix, mid, tail] = match;
  return {
    e164: `58${prefix}${mid}${tail}`,
    display: `+58 ${prefix}-${mid}-${tail}`,
  };
}

/**
 * Resolves a program's WhatsApp contact phone automatically from either:
 * 1) explicit `program.whatsapp` / `program.contactPhone`, or
 * 2) any Venezuelan mobile number embedded inside `program.footer`.
 */
export function resolveProgramWhatsApp(program) {
  if (!program || typeof program !== 'object') return null;
  const explicit = parseVenezuelanWhatsApp(program.whatsapp || program.contactPhone);
  if (explicit) return explicit;
  return parseVenezuelanWhatsApp(program.footer);
}

/**
 * Detects whether a program already has active sponsors (via `ads`, explicit
 * `hasSponsors`, or a `Patrocinadores:` list in `footer`).
 */
export function hasProgramSponsors(program) {
  if (!program || typeof program !== 'object') return false;
  if (typeof program.hasSponsors === 'boolean') return program.hasSponsors;
  if (Array.isArray(program.ads) && program.ads.length > 0) return true;
  if (typeof program.footer === 'string' && SPONSOR_MENTION_RE.test(program.footer)) return true;
  return false;
}

/**
 * Returns `true` when `footer` is solely the generic sponsorship invitation
 * placeholder (so UI can avoid duplicating plain text when the sponsor CTA is shown).
 */
export function isGenericSponsorFooter(footer) {
  return typeof footer === 'string' && GENERIC_SPONSOR_FOOTER.test(footer.trim());
}

/**
 * Builds the prefilled WhatsApp URL for listener comments / greetings.
 */
export function buildCommentWhatsAppUrl(e164, programName, userComment = '') {
  if (!STRICT_E164_RE.test(String(e164 || ''))) return '#';
  const safeProgram = sanitizeCommentInput(programName || '', { finalize: true });
  const cleanComment = sanitizeCommentInput(userComment, { finalize: true });
  const base = safeProgram
    ? `Estoy en sintonía de ${safeProgram}, mi comentario:`
    : 'Estoy en sintonía de Radio Hermón 95.3 FM, mi comentario:';
  const text = cleanComment ? `${base} ${cleanComment}` : `${base} `;
  return `https://wa.me/${e164}?text=${encodeURIComponent(text)}`;
}

/**
 * Builds the prefilled WhatsApp URL for sponsorship inquiries.
 */
export function buildSponsorWhatsAppUrl(e164, programName) {
  if (!STRICT_E164_RE.test(String(e164 || ''))) return '#';
  const safeProgram = sanitizeCommentInput(programName || '', { finalize: true });
  const text = safeProgram
    ? `Hola, escucho Radio Hermón 95.3 FM y me gustaría recibir información para patrocinar el programa "${safeProgram}".`
    : 'Hola, escucho Radio Hermón 95.3 FM y me gustaría recibir información sobre patrocinio.';
  return `https://wa.me/${e164}?text=${encodeURIComponent(text)}`;
}

/**
 * Unified auto-applicable contact descriptor for any item in `imageSchedule`.
 */
export function getProgramContactConfig(program) {
  const phone = resolveProgramWhatsApp(program);
  if (!phone) return null;

  const sponsored = hasProgramSponsors(program);
  const showSponsorCta =
    typeof program?.allowSponsorship === 'boolean' ? program.allowSponsorship : !sponsored;
  const hideRedundantFooter = showSponsorCta && isGenericSponsorFooter(program?.footer);

  return {
    phone,
    showCommentCta: program?.allowComments !== false,
    showSponsorCta,
    hideRedundantFooter,
  };
}

