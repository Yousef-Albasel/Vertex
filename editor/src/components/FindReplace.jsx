import React, { useEffect, useRef } from 'react';

const FindReplace = ({
  isDarkMode,
  isOpen,
  onClose,
  isReplaceMode,
  findText,
  replaceText,
  onFindChange,
  onReplaceChange,
  onNext,
  onPrev,
  onReplace,
  onReplaceAll,
  matchCount,
  currentMatch,
  onKeyDown
}) => {
  const findInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && findInputRef.current) {
      findInputRef.current.focus();
    }
  }, [isOpen, isReplaceMode]); // Refocus when modes change too

  if (!isOpen) return null;

  return (
    <div 
      className={`absolute top-4 right-8 z-50 p-2 rounded-lg shadow-lg border text-sm flex flex-col gap-2 transition-all w-80
        ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800'}
      `}
      onKeyDown={onKeyDown}
    >
      {/* Top Row: Find */}
      <div className="flex items-center gap-1">
        <input
          ref={findInputRef}
          type="text"
          value={findText}
          onChange={(e) => onFindChange(e.target.value)}
          placeholder="Find"
          className={`flex-1 px-2 py-1 rounded border outline-none
            ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400'}
            focus:border-blue-500
          `}
        />
        <span className="text-xs text-gray-500 w-12 text-center flex-shrink-0">
          {matchCount > 0 ? `${currentMatch + 1}/${matchCount}` : '0/0'}
        </span>
        <button
          onClick={onPrev}
          title="Previous Match (Shift+Enter)"
          className={`p-1 rounded hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
        </button>
        <button
          onClick={onNext}
          title="Next Match (Enter)"
          className={`p-1 rounded hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        <button
          onClick={onClose}
          title="Close (Esc)"
          className={`p-1 rounded ml-1 text-red-500 hover:${isDarkMode ? 'bg-gray-700 text-red-400' : 'bg-gray-200 text-red-600'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      {/* Bottom Row: Replace (Only if in Replace Mode) */}
      {isReplaceMode && (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={replaceText}
            onChange={(e) => onReplaceChange(e.target.value)}
            placeholder="Replace"
            className={`flex-1 px-2 py-1 rounded border outline-none
              ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400'}
              focus:border-blue-500
            `}
          />
          <button
            onClick={onReplace}
            disabled={matchCount === 0}
            className={`px-2 py-1 text-xs rounded border transition-colors
              ${matchCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}
            `}
          >
            Replace
          </button>
          <button
            onClick={onReplaceAll}
            disabled={matchCount === 0}
            className={`px-2 py-1 text-xs rounded border transition-colors
              ${matchCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}
            `}
          >
            All
          </button>
        </div>
      )}
    </div>
  );
};

export default FindReplace;
