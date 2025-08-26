import { useState, useRef, useEffect } from "react";

export default function MarkdownEditor({ value, onChange, onInsert, isDarkMode }) {
  const textareaRef = useRef(null);

  const handleInsert = (text) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value || '';
    
    const newValue = currentValue.slice(0, start) + text + currentValue.slice(end);
    onChange(newValue);

    // Set cursor position after inserted text
    setTimeout(() => {
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = value || '';
      
      const beforeCursor = currentValue.slice(0, start);
      const afterCursor = currentValue.slice(end);
      const newValue = beforeCursor + '\n' + afterCursor;
      
      onChange(newValue);
      
      setTimeout(() => {
        textarea.setSelectionRange(start + 1, start + 1);
      }, 0);
    }
  };

  useEffect(() => {
    if (onInsert) {
      onInsert.current = handleInsert;
    }
  }, [value, handleInsert]);

  return (
    <textarea
      ref={textareaRef}
      className={`w-full h-full p-4 border-none outline-none font-mono text-sm resize-none ${
        isDarkMode 
          ? 'bg-gray-900 text-gray-100 placeholder-gray-400' 
          : 'bg-white text-gray-900 placeholder-gray-500'
      }`}
      style={{
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        overflowY: 'auto',
        overflowX: 'hidden',
        minHeight: '100%',
        boxSizing: 'border-box'
      }}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Start typing your markdown here..."
    />
  );
}