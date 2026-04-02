import { useState, useRef, useCallback, useEffect, memo } from "react";
import FindReplace from "./FindReplace.jsx";

export default function MarkdownEditor({ value, onChange, onInsert, isDarkMode, onCursorPosition }) {
  const textareaRef = useRef(null);
  const backdropRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Find and Replace State
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [isReplaceMode, setIsReplaceMode] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matches, setMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  // Focus Find UI when opened, handle matches updates
  useEffect(() => {
    if (!findText) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }

    const valueStr = value || '';
    const newMatches = [];
    let startIndex = 0;
    
    // Case-insensitive search by default
    const lowerValueStr = valueStr.toLowerCase();
    const lowerFindText = findText.toLowerCase();

    while ((startIndex = lowerValueStr.indexOf(lowerFindText, startIndex)) > -1) {
      newMatches.push({ start: startIndex, end: startIndex + findText.length });
      startIndex += findText.length;
    }

    setMatches(newMatches);
    if (newMatches.length > 0) {
      setCurrentMatchIndex(prev => prev >= newMatches.length ? 0 : Math.max(0, prev));
    } else {
      setCurrentMatchIndex(-1);
    }
  }, [value, findText]);

  const isHighlighting = showFindReplace && findText && matches.length > 0;

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Find and Replace shortcuts (Global - capture phase to guarantee interception)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        e.stopPropagation();
        if (textareaRef.current) {
          const ta = textareaRef.current;
          const selection = ta.value.substring(ta.selectionStart, ta.selectionEnd);
          if (selection) setFindText(selection);
        }
        setShowFindReplace(true);
        setIsReplaceMode(false);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        e.stopPropagation();
        if (textareaRef.current) {
          const ta = textareaRef.current;
          const selection = ta.value.substring(ta.selectionStart, ta.selectionEnd);
          if (selection) setFindText(selection);
        }
        setShowFindReplace(true);
        setIsReplaceMode(true);
      }
    };
    
    // Attach listener globally on window with capture to guarantee we beat browser native shortcuts
    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
  }, []);

  useEffect(() => {
    if (isHighlighting && currentMatchIndex >= 0 && textareaRef.current) {
      const match = matches[currentMatchIndex];
      if (match) {
        textareaRef.current.setSelectionRange(match.start, match.end);
      }

      const timer = setTimeout(() => {
        const markElement = document.getElementById(`match-${currentMatchIndex}`);
        if (markElement && textareaRef.current) {
          const offsetTop = markElement.offsetTop;
          const ta = textareaRef.current;
          
          if (ta.scrollTop > offsetTop - 20 || ta.scrollTop + ta.clientHeight < offsetTop + 40) {
            ta.scrollTop = Math.max(0, offsetTop - ta.clientHeight / 2);
          }
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [currentMatchIndex, isHighlighting, matches]);

  const handleNextMatch = () => {
    if (matches.length === 0) return;
    setCurrentMatchIndex(prev => (prev + 1) % matches.length);
  };

  const handlePrevMatch = () => {
    if (matches.length === 0) return;
    setCurrentMatchIndex(prev => (prev - 1 + matches.length) % matches.length);
  };

  const handleReplaceCurrent = () => {
    if (matches.length === 0 || currentMatchIndex < 0) return;
    const { start, end } = matches[currentMatchIndex];
    const currentValue = value || '';
    const newValue = currentValue.slice(0, start) + replaceText + currentValue.slice(end);
    onChange(newValue);
    // Since value changes, useEffect will re-calculate matches and adjust indices automatically.
  };

  const handleReplaceAll = () => {
    if (matches.length === 0) return;
    const currentValue = value || '';

    // Replace from the end to the beginning to preserve offsets
    let newValue = currentValue;
    for (let i = matches.length - 1; i >= 0; i--) {
      const { start, end } = matches[i];
      newValue = newValue.slice(0, start) + replaceText + newValue.slice(end);
    }
    onChange(newValue);
  };

  const handleFindReplaceKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowFindReplace(false);
      textareaRef.current?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrevMatch();
      } else {
        handleNextMatch();
      }
    }
  };

  // Detect cursor position when typing
  const handleChange = useCallback((e) => {
    const textarea = e.target;
    const newValue = e.target.value;
    onChange(newValue);
    
    // Send cursor position info
    if (onCursorPosition && textarea) {
      const cursorPos = textarea.selectionStart;
      const totalLength = newValue.length || 1;
      const cursorPercent = cursorPos / totalLength;
      const isAtBottom = cursorPos >= totalLength - 5;
      onCursorPosition({ percent: cursorPercent, isAtBottom });
    }
  }, [onChange, onCursorPosition]);

  // --- Insert / Format Handlers ---
  const handleInsert = useCallback((text) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value || '';
    const newValue = currentValue.slice(0, start) + text + currentValue.slice(end);
    onChange(newValue);

    setTimeout(() => {
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  }, [value, onChange]);

  const handleFormatText = useCallback((format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value || '';
    const selectedText = currentValue.slice(start, end);

    let newText = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        newText = selectedText ? `**${selectedText}**` : '**text**';
        cursorOffset = newText.length;
        break;
      case 'italic':
        newText = selectedText ? `*${selectedText}*` : '*text*';
        cursorOffset = newText.length;
        break;
      case 'code':
        newText = selectedText ? `\`${selectedText}\`` : '`code`';
        cursorOffset = newText.length;
        break;
      case 'codeblock':
        newText = selectedText ? `\n\`\`\`\n${selectedText}\n\`\`\`\n` : '\n```\ncode here\n```\n';
        cursorOffset = newText.length;
        break;
      case 'link':
        newText = selectedText ? `[${selectedText}](url)` : '[text](url)';
        cursorOffset = newText.length;
        break;
      case 'underline':
        // Markdown doesn't have native underline, use HTML
        newText = selectedText ? `<u>${selectedText}</u>` : '<u>text</u>';
        cursorOffset = newText.length;
        break;
      case 'quote':
        newText = selectedText ? `> ${selectedText}` : '> quote';
        cursorOffset = newText.length;
        break;
      case 'h1':
        newText = selectedText ? `# ${selectedText}` : '# Heading 1';
        cursorOffset = newText.length;
        break;
      case 'h2':
        newText = selectedText ? `## ${selectedText}` : '## Heading 2';
        cursorOffset = newText.length;
        break;
      case 'h3':
        newText = selectedText ? `### ${selectedText}` : '### Heading 3';
        cursorOffset = newText.length;
        break;
      case 'list':
      case 'list-dash':
        newText = selectedText ? `- ${selectedText}` : '- item';
        cursorOffset = newText.length;
        break;
      case 'list-asterisk':
        newText = selectedText ? `* ${selectedText}` : '* item';
        cursorOffset = newText.length;
        break;
      case 'list-plus':
        newText = selectedText ? `+ ${selectedText}` : '+ item';
        cursorOffset = newText.length;
        break;
      case 'orderedlist':
        newText = selectedText ? `1. ${selectedText}` : '1. item';
        cursorOffset = newText.length;
        break;
      default:
        return;
    }

    const newValue = currentValue.slice(0, start) + newText + currentValue.slice(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
      textarea.focus();
    }, 0);
  }, [value, onChange]);

  // --- Image Upload ---
  const uploadImage = useCallback(async (file, source = 'file') => {
    try {
      setUploadingImage(true);
      setUploadStatus(`Uploading ${file.name || 'image'}...`);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:3001/api/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      const markdownImage = `\n![${file.name || 'Image'}](${data.path})\n`;
      handleInsert(markdownImage);

      setUploadStatus(`✓ Uploaded ${data.filename}`);
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadStatus(`✗ Failed: ${error.message}`);
      setTimeout(() => setUploadStatus(''), 5000);
    } finally {
      setUploadingImage(false);
    }
  }, [handleInsert]);

  const handlePaste = useCallback(async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.includes('image')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) await uploadImage(file, 'clipboard');
      }
    }
  }, [uploadImage]);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        await uploadImage(files[i], 'drag-drop');
      }
    }
  }, [uploadImage]);

  const handleDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); };
  const handleDragLeave = (e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); };

  // --- Keyboard Handling ---
  const handleKeyDown = useCallback((e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentValue = value || '';
    
    // Get current line info
    const beforeCursor = currentValue.slice(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const currentLine = beforeCursor.slice(lineStart);
    
    // Match list patterns (with leading spaces for nesting)
    const unorderedMatch = currentLine.match(/^(\s*)([-*+])\s(.*)$/);
    const orderedMatch = currentLine.match(/^(\s*)(\d+)\.\s(.*)$/);

    // Tab = indent / create nested list
    if (e.key === 'Tab') {
      e.preventDefault();
      
      if (unorderedMatch || orderedMatch) {
        // If on a list line, indent the current line (make it nested)
        const indent = '    ';
        const newValue = currentValue.slice(0, lineStart) + indent + currentValue.slice(lineStart);
        onChange(newValue);
        setTimeout(() => {
          textarea.setSelectionRange(start + 4, start + 4);
        }, 0);
      } else {
        // Normal tab
        const before = currentValue.slice(0, start);
        const after = currentValue.slice(start);
        onChange(before + '    ' + after);
        setTimeout(() => {
          textarea.setSelectionRange(start + 4, start + 4);
        }, 0);
      }
      return;
    }

    // Shift+Tab = unindent
    if (e.shiftKey && e.key === 'Tab') {
      e.preventDefault();
      
      // Check if line starts with spaces
      if (currentLine.startsWith('    ')) {
        const newValue = currentValue.slice(0, lineStart) + currentValue.slice(lineStart + 4);
        onChange(newValue);
        setTimeout(() => {
          textarea.setSelectionRange(Math.max(lineStart, start - 4), Math.max(lineStart, start - 4));
        }, 0);
      }
      return;
    }

    // Enter = continue list
    if (e.key === 'Enter') {
      // Check for unordered list
      if (unorderedMatch) {
        const [, indent, bullet, content] = unorderedMatch;
        
        // If content is empty, remove the bullet and exit list mode
        if (!content.trim()) {
          e.preventDefault();
          const newValue = currentValue.slice(0, lineStart) + '\n' + currentValue.slice(start);
          onChange(newValue);
          setTimeout(() => {
            textarea.setSelectionRange(lineStart + 1, lineStart + 1);
          }, 0);
          return;
        }
        
        // Continue the list
        e.preventDefault();
        const newLine = `\n${indent}${bullet} `;
        const newValue = currentValue.slice(0, start) + newLine + currentValue.slice(start);
        onChange(newValue);
        setTimeout(() => {
          const newPos = start + newLine.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
        return;
      }
      
      // Check for ordered list
      if (orderedMatch) {
        const [, indent, num, content] = orderedMatch;
        
        // If content is empty, remove the number and exit list mode
        if (!content.trim()) {
          e.preventDefault();
          const newValue = currentValue.slice(0, lineStart) + '\n' + currentValue.slice(start);
          onChange(newValue);
          setTimeout(() => {
            textarea.setSelectionRange(lineStart + 1, lineStart + 1);
          }, 0);
          return;
        }
        
        // Continue with next number
        e.preventDefault();
        const nextNum = parseInt(num) + 1;
        const newLine = `\n${indent}${nextNum}. `;
        const newValue = currentValue.slice(0, start) + newLine + currentValue.slice(start);
        onChange(newValue);
        setTimeout(() => {
          const newPos = start + newLine.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
        return;
      }
    }
  }, [value, onChange]);

  useEffect(() => {
    if (onInsert) {
      onInsert.current = { 
        insert: handleInsert, 
        format: handleFormatText,
        getSelection: () => {
          const textarea = textareaRef.current;
          if (!textarea) return null;
          return {
            text: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd),
            start: textarea.selectionStart,
            end: textarea.selectionEnd
          };
        }
      };
    }
  }, [onInsert, handleInsert, handleFormatText]);

  const renderHighlightedText = () => {
    if (!value) return '';
    if (!isHighlighting) return value;
    
    const parts = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      parts.push(value.slice(lastIndex, match.start));
      const isCurrent = (i === currentMatchIndex);
      parts.push(
        <mark 
          key={i} 
          id={`match-${i}`}
          className={`rounded ${isCurrent ? 'bg-orange-500 text-white' : 'bg-yellow-300 text-black'}`}
        >
          {value.slice(match.start, match.end)}
        </mark>
      );
      lastIndex = match.end;
    });
    parts.push(value.slice(lastIndex));
    
    if (value.endsWith('\n')) {
      parts.push(<br key="br" />);
    }
    return parts;
  };

  const handleScroll = useCallback((e) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.target.scrollTop;
      backdropRef.current.scrollLeft = e.target.scrollLeft;
    }
  }, []);

  return (
    <div className={`relative h-full ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}>
      {(uploadingImage || uploadStatus) && (
        <div className={`absolute top-2 right-2 z-10 px-3 py-1 rounded text-sm shadow-lg ${
          uploadStatus.includes('✓') 
            ? 'bg-green-500 text-white' 
            : uploadStatus.includes('✗') 
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
        }`}>{uploadStatus}</div>
      )}
      
      <FindReplace 
        isDarkMode={isDarkMode}
        isOpen={showFindReplace}
        onClose={() => {
          setShowFindReplace(false);
          textareaRef.current?.focus();
        }}
        isReplaceMode={isReplaceMode}
        findText={findText}
        replaceText={replaceText}
        onFindChange={setFindText}
        onReplaceChange={setReplaceText}
        onNext={handleNextMatch}
        onPrev={handlePrevMatch}
        onReplace={handleReplaceCurrent}
        onReplaceAll={handleReplaceAll}
        matchCount={matches.length}
        currentMatch={currentMatchIndex}
        onKeyDown={handleFindReplaceKeyDown}
      />

      {isHighlighting && (
        <div 
          ref={backdropRef}
          className="absolute inset-0 w-full h-full p-4 border-none font-mono text-sm pointer-events-none break-words whitespace-pre-wrap outline-none resize-none transition-colors"
          style={{
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: '100%',
            boxSizing: 'border-box',
            tabSize: 4,
            color: isDarkMode ? '#f3f4f6' : '#111827',
          }}
          aria-hidden="true"
        >
          {renderHighlightedText()}
        </div>
      )}

      <textarea
        ref={textareaRef}
        className={`absolute inset-0 w-full h-full p-4 border-none outline-none font-mono text-sm resize-none transition-colors ${
          isHighlighting 
            ? 'bg-transparent placeholder-transparent'
            : (isDarkMode ? 'bg-gray-900 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500')
        }`}
        style={{
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word',
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: '100%',
          boxSizing: 'border-box',
          tabSize: 4,
          ...(isHighlighting ? {
             color: 'transparent',
             WebkitTextFillColor: 'transparent',
             caretColor: isDarkMode ? '#f3f4f6' : '#111827'
          } : {})
        }}
        value={value || ''}
        onChange={handleChange}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        placeholder="Start typing your markdown here... (Paste images directly!)"
      />
      <style jsx>{`
        .drag-over {
          outline: 2px dashed ${isDarkMode ? '#60a5fa' : '#3b82f6'};
          outline-offset: -4px;
          background-color: ${isDarkMode ? 'rgba(96,165,250,0.1)' : 'rgba(59,130,246,0.1)'};
        }
      `}</style>
    </div>
  );
}
