/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import bibleIndex from './data/biblia/index.json';
import {
  BookIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShareIcon,
  CopyIcon,
  CheckIcon,
  WhatsAppIcon,
  TelegramIcon,
} from './components/Icons';
import { copyTextSafe } from './utils/clipboard';

const RADIO_SHARE_URL = 'https://www.radiohermonfm.com';
const MAX_PASSAGE_VERSES = 5;

function buildPassageShareData({ bookMeta, chapter, startVerse, requestedCount, chapterVerses, fallbackText }) {
  const bookLabel = bookMeta?.shortTitle || '';
  const verses = Array.isArray(chapterVerses) ? chapterVerses : [];
  const available =
    verses.length > 0 && startVerse <= verses.length ? Math.max(1, verses.length - startVerse + 1) : 1;
  const maxCount = Math.min(MAX_PASSAGE_VERSES, available);
  const count = Math.min(Math.max(1, requestedCount), maxCount);
  const endVerse = startVerse + count - 1;
  const refLabel = count > 1 ? `${bookLabel} ${chapter}:${startVerse}-${endVerse}` : `${bookLabel} ${chapter}:${startVerse}`;

  const slice = count > 1 && verses.length >= endVerse ? verses.slice(startVerse - 1, endVerse) : [fallbackText];
  const displayItems = slice.map((text, idx) => ({
    verseNumber: startVerse + idx,
    text,
  }));

  const plainQuote =
    count > 1 ? `"${displayItems.map((v) => `${v.verseNumber}. ${v.text}`).join(' ')}"` : `"${slice[0]}"`;
  const shareBody = `${refLabel} (RVR1960)\n${plainQuote}\n\n— Radio Hermón 95.3 FM`;
  const shareMessage = `${shareBody}\n${RADIO_SHARE_URL}`;

  return {
    refLabel,
    count,
    maxCount,
    displayItems,
    shareBody,
    shareMessage,
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
    telegramUrl: `https://t.me/share/url?url=${encodeURIComponent(RADIO_SHARE_URL)}&text=${encodeURIComponent(shareBody)}`,
  };
}

/**
 * MultiBibleCard Component
 * Displays a Bible card with navigation for books, chapters, and verses
 * Uses local JSON files for offline Bible access (Reina Valera 1960)
 */
function MultiBibleCard({ isVisible, darkMode, onClose, initialSelection = null }) {
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState(1);
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentVerseText, setCurrentVerseText] = useState('');
  const [maxChapter, setMaxChapter] = useState(1);
  const [maxVerse, setMaxVerse] = useState(1);
  const [verseCount, setVerseCount] = useState(1);
  const [copiedVerse, setCopiedVerse] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');

  const verseTextRef = useRef(null);
  const pendingChapter = useRef(null);
  const pendingVerse = useRef(null);
  const copyTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    },
    []
  );

  useEffect(() => {
    if (!selectedBook) return undefined;

    let cancelled = false;
    setLoading(true);
    setError(null);

    try {
      import(`./data/biblia/${selectedBook}.json`)
        .then((data) => {
          if (cancelled) return;
          const loadedChapters = Array.isArray(data.default) ? data.default : [];
          const book = bibleIndex.find((b) => b.key === selectedBook);
          const totalChapters = book?.chapters || loadedChapters.length || 1;
          const targetChapter = Math.min(
            Math.max(Number(pendingChapter.current) || 1, 1),
            totalChapters
          );
          const chapterVerses = Array.isArray(loadedChapters[targetChapter - 1])
            ? loadedChapters[targetChapter - 1]
            : [];
          const targetVerse = Math.min(
            Math.max(Number(pendingVerse.current) || 1, 1),
            Math.max(chapterVerses.length, 1)
          );
          pendingChapter.current = null;
          pendingVerse.current = null;

          setBookData(loadedChapters);
          setMaxChapter(totalChapters);
          setMaxVerse(Math.max(chapterVerses.length, 1));
          setSelectedChapter(targetChapter);
          setSelectedVerse(targetVerse);
          setLoading(false);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error('Error loading book:', err);
          setError(`Error al cargar el libro ${selectedBook}`);
          setLoading(false);
        });
    } catch (err) {
      console.error('Error in book import:', err);
      setError(`Error al importar el libro ${selectedBook}`);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [selectedBook]);

  useEffect(() => {
    if (!bookData || !selectedChapter) return;

    try {
      const verses = bookData[selectedChapter - 1];
      if (verses && verses.length > 0) {
        setMaxVerse(verses.length);
        setSelectedVerse((prev) => (prev >= 1 && prev <= verses.length ? prev : 1));
      } else {
        setMaxVerse(1);
        setSelectedVerse(1);
        setCurrentVerseText('No hay versos disponibles para este capítulo.');
      }
    } catch (err) {
      console.error('Error updating max verse:', err);
      setError('Error al cargar los versículos');
    }
  }, [bookData, selectedChapter]);

  useEffect(() => {
    if (!bookData || !selectedChapter || !selectedVerse) {
      setCurrentVerseText('');
      return;
    }

    try {
      const verses = bookData[selectedChapter - 1];
      if (verses && selectedVerse <= verses.length) {
        setCurrentVerseText(verses[selectedVerse - 1]);
      } else {
        setCurrentVerseText('Verso no disponible.');
      }
    } catch (err) {
      console.error('Error getting verse text:', err);
      setCurrentVerseText('Error al cargar el texto del versículo.');
    }
  }, [bookData, selectedChapter, selectedVerse]);

  useEffect(() => {
    setVerseCount(1);
    setCopiedVerse(false);
    setShareFeedback('');
    if (verseTextRef.current) {
      verseTextRef.current.scrollTop = 0;
    }
  }, [currentVerseText, selectedBook, selectedChapter, selectedVerse]);

  useEffect(() => {
    if (initialSelection?.book) {
      pendingChapter.current = initialSelection.chapter || 1;
      pendingVerse.current = initialSelection.verse || 1;
      setSelectedBook(initialSelection.book);
      return;
    }
    const savedSelection = localStorage.getItem('bibleSelection');
    if (savedSelection) {
      try {
        const { book, chapter, verse } = JSON.parse(savedSelection);
        pendingChapter.current = chapter || 1;
        pendingVerse.current = verse || 1;
        setSelectedBook(book);
      } catch (e) {
        console.error('Failed to parse saved bible selection', e);
      }
    }
  }, [initialSelection]);

  useEffect(() => {
    if (selectedBook && selectedChapter && selectedVerse) {
      localStorage.setItem(
        'bibleSelection',
        JSON.stringify({
          book: selectedBook,
          chapter: selectedChapter,
          verse: selectedVerse,
        })
      );
    }
  }, [selectedBook, selectedChapter, selectedVerse]);

  const handleBookChange = (e) => setSelectedBook(e.target.value);
  const handleChapterChange = (e) => {
    setSelectedChapter(Number(e.target.value));
    setSelectedVerse(1);
  };
  const handleVerseChange = (e) => setSelectedVerse(Number(e.target.value));

  const goToPreviousVerse = () => {
    if (selectedVerse > 1) {
      setSelectedVerse(selectedVerse - 1);
    } else if (selectedChapter > 1) {
      const prevChapter = selectedChapter - 1;
      setSelectedChapter(prevChapter);
      try {
        const prevChapterVerses = bookData[prevChapter - 1];
        if (prevChapterVerses && prevChapterVerses.length > 0) {
          setSelectedVerse(prevChapterVerses.length);
        }
      } catch (err) {
        console.error('Error navigating to previous chapter:', err);
      }
    } else if (selectedBook) {
      const bookIndex = bibleIndex.findIndex((b) => b.key === selectedBook);
      if (bookIndex > 0) {
        setSelectedBook(bibleIndex[bookIndex - 1].key);
      }
    }
  };

  const goToNextVerse = () => {
    if (bookData && selectedChapter > 0) {
      const currentChapterVerses = bookData[selectedChapter - 1];
      if (currentChapterVerses && selectedVerse < currentChapterVerses.length) {
        setSelectedVerse(selectedVerse + 1);
      } else if (selectedBook) {
        const book = bibleIndex.find((b) => b.key === selectedBook);
        if (book && selectedChapter < book.chapters) {
          setSelectedChapter(selectedChapter + 1);
          setSelectedVerse(1);
        } else {
          const bookIndex = bibleIndex.findIndex((b) => b.key === selectedBook);
          if (bookIndex < bibleIndex.length - 1) {
            setSelectedBook(bibleIndex[bookIndex + 1].key);
          }
        }
      }
    }
  };

  const isFirstVerse = () => {
    if (!selectedBook || !bibleIndex.length) return true;
    const bookIndex = bibleIndex.findIndex((b) => b.key === selectedBook);
    return bookIndex === 0 && selectedChapter === 1 && selectedVerse === 1;
  };

  const isLastVerse = () => {
    if (!selectedBook || !bookData || !bibleIndex.length) return true;
    const bookIndex = bibleIndex.findIndex((b) => b.key === selectedBook);
    if (bookIndex !== bibleIndex.length - 1) return false;
    const book = bibleIndex[bookIndex];
    if (selectedChapter !== book.chapters) return false;
    const currentChapterVerses = bookData[selectedChapter - 1];
    return currentChapterVerses && selectedVerse === currentChapterVerses.length;
  };

  if (!isVisible) return null;

  const selectedBookMeta = bibleIndex.find((b) => b.key === selectedBook);
  const currentChapterVerses =
    bookData && selectedChapter > 0 && Array.isArray(bookData[selectedChapter - 1])
      ? bookData[selectedChapter - 1]
      : null;
  const hasShareableVerse = Boolean(selectedBook && selectedBookMeta && currentVerseText && !loading && !error);
  const passage = hasShareableVerse
    ? buildPassageShareData({
        bookMeta: selectedBookMeta,
        chapter: selectedChapter,
        startVerse: selectedVerse,
        requestedCount: verseCount,
        chapterVerses: currentChapterVerses,
        fallbackText: currentVerseText,
      })
    : null;
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleCopyVerse = async () => {
    if (!passage) return;
    const ok = await copyTextSafe(passage.shareMessage);
    if (ok) {
      setCopiedVerse(true);
      setShareFeedback('');
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedVerse(false), 1800);
    } else {
      setShareFeedback('No se pudo copiar automáticamente.');
    }
  };

  const handleNativeShare = async () => {
    if (!passage || !canNativeShare) return;
    setShareFeedback('');
    try {
      await navigator.share({
        title: `${passage.refLabel} · Santa Biblia`,
        text: passage.shareBody,
        url: RADIO_SHARE_URL,
      });
    } catch (err) {
      if (err?.name !== 'AbortError') {
        handleCopyVerse();
      }
    }
  };

  return (
    <div className={`flex flex-col h-full text-left ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      {/* Unified Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl pill-gold-soft flex items-center justify-center flex-shrink-0">
            <BookIcon />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">
              Santa Biblia
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
              Reina-Valera 1960
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar"
            className="w-10 h-10 rounded-full glass-pill text-slate-600 dark:text-slate-300 flex items-center justify-center hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Central Reading Pane (Mobile-First Responsive Serif Typography + Share Bar) */}
      <div
        ref={verseTextRef}
        className={`flex-1 min-h-0 my-3 sm:my-4 glass-inner rounded-3xl p-4 sm:p-6 flex flex-col overflow-y-auto ${
          passage ? 'justify-between gap-4' : 'justify-center'
        }`}
      >
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <div
              className="w-9 h-9 rounded-full border-2 border-slate-300/60 dark:border-slate-600/60 animate-spin"
              style={{ borderTopColor: 'var(--hermon-to, #BD8F2A)' }}
            />
          </div>
        ) : error ? (
          <div className="text-red-600 dark:text-red-400 text-center font-semibold text-base p-4">
            {error}
          </div>
        ) : !selectedBook ? (
          <div className="text-center space-y-2 p-4">
            <p className="font-scripture text-2xl text-slate-700 dark:text-slate-200">
              Selecciona un libro abajo para comenzar tu lectura
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Disponible sin conexión a internet
            </p>
          </div>
        ) : !currentVerseText || !passage ? (
          <div className="text-center p-4 text-slate-500 dark:text-slate-400 text-base">
            Selecciona un capítulo y versículo
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4">
              {/* Top Row: Reference Pill + Multi-Verse Range Stepper */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <span className="inline-flex items-center pill-gold-soft px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-base sm:text-xl font-extrabold tracking-wide shadow-sm">
                  {passage.refLabel}
                </span>

                <div
                  className="inline-flex items-center gap-2"
                  role="group"
                  aria-label="Rango de versículos a compartir"
                >
                  {passage.count > 1 && (
                    <button
                      type="button"
                      onClick={() => setVerseCount((c) => Math.max(1, c - 1))}
                      aria-label="Quitar último versículo"
                      title="Reducir pasaje"
                      className="glass-pill min-w-[54px] h-10 sm:h-11 px-3.5 sm:px-4 rounded-full text-sm sm:text-base font-extrabold text-slate-700 dark:text-slate-100 flex items-center justify-center active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      -1 v.
                    </button>
                  )}
                  {passage.count < passage.maxCount && (
                    <button
                      type="button"
                      onClick={() => setVerseCount((c) => Math.min(passage.maxCount, c + 1))}
                      aria-label="Añadir siguiente versículo"
                      title="Incluir siguiente versículo"
                      className="glass-pill min-w-[54px] h-10 sm:h-11 px-3.5 sm:px-4 rounded-full text-sm sm:text-base font-extrabold text-slate-700 dark:text-slate-100 flex items-center justify-center active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      +1 v.
                    </button>
                  )}
                </div>
              </div>

              {passage.count === 1 ? (
                <p className="font-scripture text-xl sm:text-3xl leading-[1.6] text-slate-800 dark:text-slate-100 font-medium">
                  {passage.displayItems[0]?.text}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {passage.displayItems.map((item) => (
                    <p
                      key={item.verseNumber}
                      className="font-scripture text-lg sm:text-2xl leading-[1.55] text-slate-800 dark:text-slate-100 font-medium"
                    >
                      <sup className="accent-icon font-sans text-sm sm:text-base font-extrabold mr-2 select-none">
                        {item.verseNumber}
                      </sup>
                      {item.text}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile-First Share Action Bar (Thumb-Reachable Bottom of Verse Card) */}
            <div className="pt-3 border-t border-slate-200/70 dark:border-white/10 space-y-2">
              <div
                className={`grid gap-2 ${
                  canNativeShare ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'
                }`}
              >
                {canNativeShare && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    aria-label={`Compartir ${passage.refLabel}`}
                    className="btn-opal-gold min-h-[42px] px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <ShareIcon className="w-4 h-4 flex-shrink-0" />
                    <span>Compartir</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyVerse}
                  aria-label={`Copiar ${passage.refLabel}`}
                  className={`glass-pill min-h-[42px] px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    copiedVerse
                      ? 'text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/40'
                      : 'text-slate-700 dark:text-slate-100 hover-accent-icon'
                  }`}
                >
                  {copiedVerse ? (
                    <CheckIcon className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <CopyIcon className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{copiedVerse ? 'Copiado' : 'Copiar'}</span>
                </button>

                <a
                  href={passage.whatsappUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Compartir ${passage.refLabel} en WhatsApp`}
                  className="glass-pill min-h-[42px] px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-100 flex items-center justify-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <WhatsAppIcon className="w-4 h-4 flex-shrink-0" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={passage.telegramUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Compartir ${passage.refLabel} en Telegram`}
                  className="glass-pill min-h-[42px] px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-100 flex items-center justify-center gap-1.5 hover:text-sky-600 dark:hover:text-sky-400 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <TelegramIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Telegram</span>
                </a>
              </div>

              {shareFeedback && (
                <p role="status" className="text-xs font-semibold text-amber-700 dark:text-amber-300 text-center">
                  {shareFeedback}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls: 3 Selectors + Previous/Next Step Buttons */}
      <div className="space-y-3 sm:space-y-4 pt-1 flex-shrink-0">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* Book Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Libro
            </label>
            <div className="relative">
              <select
                className={`w-full glass-inner py-3 sm:py-3.5 pl-3.5 sm:pl-4 pr-9 rounded-2xl text-base sm:text-lg font-extrabold text-slate-800 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer ${
                  !selectedBook ? 'accent-ring' : ''
                }`}
                value={selectedBook}
                onChange={handleBookChange}
                disabled={loading}
              >
                <option value="" className="text-slate-800 bg-white dark:bg-slate-800 dark:text-white">
                  Seleccionar
                </option>
                {bibleIndex.map((book) => (
                  <option
                    key={book.key}
                    value={book.key}
                    className="text-slate-800 bg-white dark:bg-slate-800 dark:text-white"
                  >
                    {book.shortTitle}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          {/* Chapter Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Capítulo
            </label>
            <div className="relative">
              <select
                className="w-full glass-inner py-3 sm:py-3.5 pl-3.5 sm:pl-4 pr-9 rounded-2xl text-base sm:text-lg font-extrabold text-slate-800 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer disabled:opacity-50"
                value={selectedChapter}
                onChange={handleChapterChange}
                disabled={!selectedBook || loading}
              >
                {[...Array(maxChapter)].map((_, i) => (
                  <option
                    key={i + 1}
                    value={i + 1}
                    className="text-slate-800 bg-white dark:bg-slate-800 dark:text-white"
                  >
                    {i + 1}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          {/* Verse Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Versículo
            </label>
            <div className="relative">
              <select
                className="w-full glass-inner py-3 sm:py-3.5 pl-3.5 sm:pl-4 pr-9 rounded-2xl text-base sm:text-lg font-extrabold text-slate-800 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer disabled:opacity-50"
                value={selectedVerse}
                onChange={handleVerseChange}
                disabled={!selectedBook || !selectedChapter || loading}
              >
                {[...Array(maxVerse)].map((_, i) => (
                  <option
                    key={i + 1}
                    value={i + 1}
                    className="text-slate-800 bg-white dark:bg-slate-800 dark:text-white"
                  >
                    {i + 1}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={goToPreviousVerse}
            disabled={isFirstVerse()}
            className={`glass-pill px-5 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              isFirstVerse() ? 'opacity-45 cursor-not-allowed' : 'hover:scale-[1.02]'
            }`}
          >
            <ChevronLeftIcon /> Anterior
          </button>

          <button
            type="button"
            onClick={goToNextVerse}
            disabled={isLastVerse()}
            className={`btn-opal-gold px-5 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-base sm:text-lg font-bold flex items-center gap-2 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              isLastVerse() ? 'opacity-45 cursor-not-allowed' : 'hover:scale-[1.02]'
            }`}
          >
            Siguiente <ChevronRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MultiBibleCard;
