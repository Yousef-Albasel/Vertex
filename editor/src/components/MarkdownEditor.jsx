import { useState, useRef, useCallback, useEffect, memo } from "react";

export default function MarkdownEditor({ value, onChange, onInsert, isDarkMode }) {
  const textareaRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

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

    // Tab = indent
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const currentValue = value || '';
      const before = currentValue.slice(0, start);
      const after = currentValue.slice(start);
      onChange(before + '    ' + after);
      setTimeout(() => {
        textarea.setSelectionRange(start + 4, start + 4);
      }, 0);
    }
  }, [value, onChange]);

  useEffect(() => {
    if (onInsert) {
      onInsert.current = { insert: handleInsert, format: handleFormatText };
    }
  }, [onInsert, handleInsert, handleFormatText]);

  return (
    <div className="relative h-full">
      {(uploadingImage || uploadStatus) && (
        <div className={`absolute top-2 right-2 z-10 px-3 py-1 rounded text-sm shadow-lg ${
          uploadStatus.includes('✓') 
            ? 'bg-green-500 text-white' 
            : uploadStatus.includes('✗') 
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
        }`}>{uploadStatus}</div>
      )}
      <textarea
        ref={textareaRef}
        className={`w-full h-full p-4 border-none outline-none font-mono text-sm resize-none transition-colors ${
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
          boxSizing: 'border-box',
          tabSize: 4
        }}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
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
