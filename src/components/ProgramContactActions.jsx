/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { WhatsAppIcon, SendIcon, CloseIcon } from './Icons';
import {
  MAX_COMMENT_LENGTH,
  sanitizeCommentInput,
  getProgramContactConfig,
  buildCommentWhatsAppUrl,
  buildSponsorWhatsAppUrl,
} from '../utils/programContact';

const SparkleIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
    <path d="M19 3v3M20.5 4.5h-3M5 18v2M6 19H4" />
  </svg>
);

const ArrowUpRightIcon = ({ className = 'w-3 h-3' }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

/**
 * Dynamic WhatsApp actions for any program in `imageSchedule` that has a contact number.
 * - Comment button: expands a sleek inline text input that sends the listener's exact
 *   comment directly to the program's WhatsApp via `https://wa.me/...`.
 * - Sponsor button: direct WhatsApp CTA with prefilled sponsorship inquiry (automatically
 *   shown for programs without active sponsors).
 */
export default function ProgramContactActions({
  program,
  compact = false,
  enableComment = true,
  enableSponsor = true,
}) {
  const config = getProgramContactConfig(program);
  const [composerOpen, setComposerOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setComposerOpen(false);
    setCommentText('');
  }, [program?.name]);

  useEffect(() => {
    if (composerOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [composerOpen]);

  if (!config) return null;

  const { phone } = config;
  const showCommentCta = enableComment && config.showCommentCta;
  const showSponsorCta = enableSponsor && config.showSponsorCta;

  if (!showCommentCta && !showSponsorCta) return null;

  const commentUrl = buildCommentWhatsAppUrl(phone.e164, program?.name, commentText);
  const sponsorUrl = buildSponsorWhatsAppUrl(phone.e164, program?.name);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentUrl.startsWith('https://wa.me/')) return;
    window.open(commentUrl, '_blank', 'noopener,noreferrer');
    setCommentText('');
    setComposerOpen(false);
  };

  return (
    <div
      className={compact ? 'pt-2 space-y-2 text-left' : 'pt-2 space-y-2 text-center'}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Dual Action Row */}
      <div
        className={`flex flex-wrap items-center gap-2 ${
          compact ? 'justify-start' : 'justify-center'
        }`}
      >
        {showCommentCta && (
          <button
            type="button"
            onClick={() => setComposerOpen((prev) => !prev)}
            aria-expanded={composerOpen}
            title={`Enviar comentario por WhatsApp a ${program?.name || 'este programa'} (${phone.display})`}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 hover:scale-[1.02] active:scale-[0.98] ${
              compact ? 'px-3 py-1.5 text-[11px]' : 'px-3.5 py-1.5 text-xs'
            } ${
              composerOpen
                ? 'bg-emerald-600 text-white shadow-sm border border-emerald-500'
                : 'badge-emerald-live hover:brightness-95'
            }`}
          >
            <WhatsAppIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Comentar</span>
          </button>
        )}

        {showSponsorCta && (
          <a
            href={sponsorUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Contactar por WhatsApp para patrocinar ${program?.name || 'este programa'} (${phone.display})`}
            className={`pill-gold-soft inline-flex items-center justify-center gap-1.5 rounded-full font-bold transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              compact ? 'px-3 py-1.5 text-[11px]' : 'px-3.5 py-1.5 text-xs'
            }`}
          >
            <SparkleIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Patrocinar</span>
            <ArrowUpRightIcon className="w-3 h-3 opacity-80 flex-shrink-0" />
          </a>
        )}
      </div>

      {/* Expandable Inline Comment Composer -> Direct WhatsApp URL */}
      {showCommentCta && composerOpen && (
        <div className="space-y-1">
          <form
            onSubmit={handleSubmitComment}
            className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/85 dark:bg-slate-900/75 border border-emerald-500/35 shadow-sm"
          >
            <input
              ref={inputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(sanitizeCommentInput(e.target.value))}
              maxLength={MAX_COMMENT_LENGTH}
              autoComplete="off"
              placeholder="Escribe tu comentario o saludo..."
              aria-label="Escribe tu comentario para enviar por WhatsApp (máximo 140 caracteres)"
              className="flex-1 min-w-0 bg-transparent px-2.5 py-1.5 text-xs sm:text-[13px] font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
            <a
              href={commentUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!commentUrl.startsWith('https://wa.me/')) {
                  e.preventDefault();
                  return;
                }
                setTimeout(() => {
                  setCommentText('');
                  setComposerOpen(false);
                }, 120);
              }}
              title="Enviar comentario a WhatsApp"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow-sm hover:brightness-105 transition-all flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <SendIcon className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </a>
            <button
              type="button"
              onClick={() => setComposerOpen(false)}
              aria-label="Cerrar caja de comentario"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex-shrink-0"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-end px-2">
            <span
              className={`text-[10px] font-semibold tabular-nums ${
                commentText.length >= MAX_COMMENT_LENGTH
                  ? 'text-rose-500 dark:text-rose-400'
                  : commentText.length >= 120
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {commentText.length}/{MAX_COMMENT_LENGTH}
            </span>
          </div>
        </div>
      )}

      {/* Subtle phone caption so desktop visitors also see the contact line */}
      <div
        className={`text-[11px] font-medium text-slate-500 dark:text-slate-400 ${
          compact ? 'text-left' : 'text-center'
        }`}
      >
        WhatsApp: <span className="font-semibold text-slate-600 dark:text-slate-300">{phone.display}</span>
      </div>
    </div>
  );
}

