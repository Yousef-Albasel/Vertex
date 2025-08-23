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

  // Pass handleInsert to parent component
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
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start typing your markdown here..."
    />
  );
}