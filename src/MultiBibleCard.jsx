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

  // Render null only if the component should not be visible at all
  if (!isVisible) return null;
  
  return (
    <div 
      className={`w-full p-4 rounded-lg shadow-lg mb-4 transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
    >
      <h2 className="text-xl font-bold mb-3 text-center">Santa Biblia</h2>
      <h3 className="text-sm text-center mb-4">Reina-Valera 1960</h3>
      
      {/* Bible navigation selectors */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* Book selector */}
        <div>
          <label className="block text-sm font-medium mb-1">Libro</label>
          <select
            className={`w-full p-2 rounded text-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
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
            className={`w-full p-2 rounded text-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
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
            className={`w-full p-2 rounded text-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
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

      {/* Bible verse display area */}
      <div 
        ref={verseTextRef}
        className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} overflow-y-auto`}
        style={{ height: '6em', minHeight: '6em' }}
      >
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
  );
}

export default MultiBibleCard;
