import React, { useState, useEffect, useRef } from 'react';
import bibleIndex from './data/biblia/index.json';

/**
 * MultiBibleCard Component
 * Displays a Bible card with navigation for books, chapters, and verses
 * Uses local JSON files for offline Bible access (Reina Valera 1960)
 */
function MultiBibleCard({ isVisible, darkMode }) {
  // State management for Bible navigation
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState(1);
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentVerseText, setCurrentVerseText] = useState('');
  const [maxChapter, setMaxChapter] = useState(1);
  const [maxVerse, setMaxVerse] = useState(1);
  
  // Ref for verse text container to allow scrolling
  const verseTextRef = useRef(null);
  
  // Refs for pending chapter and verse to set after book data loads
  const pendingChapter = useRef(null);
  const pendingVerse = useRef(null);

  // Load book data when selected book changes
  useEffect(() => {
    if (!selectedBook) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Dynamically import the book JSON file
      import(`./data/biblia/${selectedBook}.json`)
        .then((data) => {
          setBookData(data.default);
          const book = bibleIndex.find(b => b.key === selectedBook);
          setMaxChapter(book?.chapters || 1);
          
          // Reset chapter and verse selection
          setSelectedChapter(1);
          setSelectedVerse(1);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error loading book:', err);
          setError(`Error al cargar el libro ${selectedBook}`);
          setLoading(false);
        });
    } catch (err) {
      console.error('Error in book import:', err);
      setError(`Error al importar el libro ${selectedBook}`);
      setLoading(false);
    }
  }, [selectedBook]);

  // Update max verse count when chapter changes
  useEffect(() => {
    if (!bookData || !selectedChapter) return;
    
    try {
      // Get the verses for the selected chapter
      const verses = bookData[selectedChapter - 1];
      if (verses && verses.length > 0) {
        setMaxVerse(verses.length);
        // Reset verse selection to 1
        setSelectedVerse(1);
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

  // Update displayed verse text when verse selection changes
  useEffect(() => {
    if (!bookData || !selectedChapter || !selectedVerse) {
      setCurrentVerseText('');
      return;
    }
    
    try {
      // Get the verse text
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

  // Scroll to top when verse changes
  useEffect(() => {
    if (verseTextRef.current) {
      verseTextRef.current.scrollTop = 0;
    }
  }, [currentVerseText]);

  // Load saved selection from localStorage on mount
  useEffect(() => {
    const savedSelection = localStorage.getItem('bibleSelection');
    if (savedSelection) {
      try {
        const { book, chapter, verse } = JSON.parse(savedSelection);
        setSelectedBook(book);
        // Save chapter and verse to set after book data loads
        pendingChapter.current = chapter;
        pendingVerse.current = verse;
      } catch (e) {
        console.error('Failed to parse saved bible selection', e);
      }
    }
  }, []);

  // When book data is loaded and there is a pending chapter and verse, set them
  useEffect(() => {
    if (bookData && pendingChapter.current !== null && pendingVerse.current !== null) {
      setSelectedChapter(pendingChapter.current);
      // Wait for the next tick to set the verse, to allow the chapter to be processed
      setTimeout(() => {
        setSelectedVerse(pendingVerse.current);
        pendingChapter.current = null;
        pendingVerse.current = null;
      }, 50);
    }
  }, [bookData]);

  // Save selection to localStorage when it changes
  useEffect(() => {
    if (selectedBook && selectedChapter && selectedVerse) {
      localStorage.setItem('bibleSelection', JSON.stringify({
        book: selectedBook,
        chapter: selectedChapter,
        verse: selectedVerse
      }));
    }
  }, [selectedBook, selectedChapter, selectedVerse]);

  // Handle book selection change
  const handleBookChange = (e) => {
    setSelectedBook(e.target.value);
  };

  // Handle chapter selection change
  const handleChapterChange = (e) => {
    setSelectedChapter(Number(e.target.value));
  };

  // Handle verse selection change
  const handleVerseChange = (e) => {
    setSelectedVerse(Number(e.target.value));
  };
  
  // Navigate to the previous verse, or to the last verse of previous chapter if at first verse
  const goToPreviousVerse = () => {
    if (selectedVerse > 1) {
      setSelectedVerse(selectedVerse - 1);
    } else if (selectedChapter > 1) {
      // Go to the last verse of the previous chapter
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
      // At first verse of first chapter, try to go to previous book
      const bookIndex = bibleIndex.findIndex(b => b.key === selectedBook);
      if (bookIndex > 0) {
        const prevBook = bibleIndex[bookIndex - 1];
        setSelectedBook(prevBook.key);
        // The useEffect will handle loading the book data and setting the chapter
      }
    }
  };
  
  // Navigate to the next verse, or to the first verse of next chapter if at last verse
  const goToNextVerse = () => {
    if (bookData && selectedChapter > 0) {
      const currentChapterVerses = bookData[selectedChapter - 1];
      if (currentChapterVerses && selectedVerse < currentChapterVerses.length) {
        setSelectedVerse(selectedVerse + 1);
      } else if (selectedBook) {
        // At last verse of current chapter
        const book = bibleIndex.find(b => b.key === selectedBook);
        if (book && selectedChapter < book.chapters) {
          // Go to first verse of next chapter
          setSelectedChapter(selectedChapter + 1);
          setSelectedVerse(1);
        } else {
          // At last verse of last chapter, try to go to next book
          const bookIndex = bibleIndex.findIndex(b => b.key === selectedBook);
          if (bookIndex < bibleIndex.length - 1) {
            const nextBook = bibleIndex[bookIndex + 1];
            setSelectedBook(nextBook.key);
            // The useEffect will handle loading the book data and setting the chapter
          }
        }
      }
    }
  };
  
  // Check if we're at the very first verse of the Bible (Genesis 1:1)
  const isFirstVerse = () => {
    if (!selectedBook || !bibleIndex.length) return true;
    const bookIndex = bibleIndex.findIndex(b => b.key === selectedBook);
    return bookIndex === 0 && selectedChapter === 1 && selectedVerse === 1;
  };
  
  // Check if we're at the very last verse of the Bible (Revelation last chapter, last verse)
  const isLastVerse = () => {
    if (!selectedBook || !bookData || !bibleIndex.length) return true;
    
    const bookIndex = bibleIndex.findIndex(b => b.key === selectedBook);
    if (bookIndex !== bibleIndex.length - 1) return false;
    
    const book = bibleIndex[bookIndex];
    if (selectedChapter !== book.chapters) return false;
    
    const currentChapterVerses = bookData[selectedChapter - 1];
    return currentChapterVerses && selectedVerse === currentChapterVerses.length;
  };

  // Render null only if the component should not be visible at all
  if (!isVisible) return null;

  return (
    <div className={`flex flex-col h-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-center font-bold text-2xl pt-8">Santa Biblia</h2>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">Reina-Valera 1960</p>
      <div className="flex-grow overflow-y-auto">
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : !selectedBook ? (
            <div className="text-center p-4 text-gray-500">Selecciona un libro para comenzar</div>
          ) : !currentVerseText ? (
            <div className="text-center p-4 text-gray-500">Selecciona un capítulo y versículo</div>
          ) : (
            <div>
              <p className="font-semibold mb-2">
                {bibleIndex.find(b => b.key === selectedBook)?.shortTitle} {selectedChapter}:{selectedVerse}
              </p>
              <p className="leading-relaxed">{currentVerseText}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-auto p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Book selector */}
          <div>
            <label className="block text-sm font-medium mb-1">Libro</label>
            <select
              className={`w-full p-2 rounded text-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} ${!selectedBook ? 'border-2 border-blue-500 animate-pulse' : ''}`}
              value={selectedBook}
              onChange={handleBookChange}
              disabled={loading}
            >
              <option value="">Seleccionar</option>
              {bibleIndex.map((book) => (
                <option key={book.key} value={book.key}>
                  {book.shortTitle}
                </option>
              ))}
            </select>
          </div>
          
          {/* Chapter selector */}
          <div>
            <label className="block text-sm font-medium mb-1">Capítulo</label>
            <select
              className={`w-full p-2 rounded text-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
              value={selectedChapter}
              onChange={handleChapterChange}
              disabled={!selectedBook || loading}
            >
              {[...Array(maxChapter)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          
          {/* Verse selector */}
          <div>
            <label className="block text-sm font-medium mb-1">Versículo</label>
            <select
              className={`w-full p-2 rounded text-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
              value={selectedVerse}
              onChange={handleVerseChange}
              disabled={!selectedBook || !selectedChapter || loading}
            >
              {[...Array(maxVerse)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-between items-center">
          {/* Left button */}
          <button 
            onClick={goToPreviousVerse}
            disabled={isFirstVerse()}
            className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'} ${isFirstVerse() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span aria-hidden="true" className="font-bold">←</span>
          </button>
          
          {/* Right button */}
          <button 
            onClick={goToNextVerse}
            disabled={isLastVerse()}
            className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'} ${isLastVerse() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span aria-hidden="true" className="font-bold">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MultiBibleCard;
