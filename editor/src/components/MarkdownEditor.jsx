import { useState, useRef, useEffect } from "react";

export default function MarkdownEditor({ value, onChange, onInsert, isDarkMode }) {
  const textareaRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleInsert = (text) => {
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
  };

  // Enhanced paste handler for clipboard images
  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    // Check for images in clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        
        const file = item.getAsFile();
        if (!file) continue;

        setUploadStatus('Uploading from clipboard...');
        await uploadImage(file, 'clipboard');
        return;
      }
    }
  };

  const uploadImage = async (file, source = 'file') => {
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
      
      // Insert markdown image syntax at cursor position
      const imageName = file.name || 'Image';
      const markdownImage = `\n![${imageName}](${data.path})\n`;
      handleInsert(markdownImage);

      setUploadStatus(`✓ Uploaded ${data.filename}`);
      console.log(`Image uploaded successfully from ${source}:`, data.filename);

      // Clear status after 3 seconds
      setTimeout(() => setUploadStatus(''), 3000);

    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadStatus(`✗ Failed: ${error.message}`);
      setTimeout(() => setUploadStatus(''), 5000);
    } finally {
      setUploadingImage(false);
    }
  };

  // Enhanced drop handler
  const handleDrop = async (e) => {
    e.preventDefault();
    
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        await uploadImage(file, 'drag-drop');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleFormatText = (format) => {
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
        if (selectedText) {
          newText = `**${selectedText}**`;
          cursorOffset = selectedText.length + 4;
        } else {
          newText = '**text**';
          cursorOffset = 6;
        }
        break;
        
      case 'italic':
        if (selectedText) {
          newText = `*${selectedText}*`;
          cursorOffset = selectedText.length + 2;
        } else {
          newText = '*text*';
          cursorOffset = 5;
        }
        break;
        
      case 'underline':
        if (selectedText) {
          newText = `<u>${selectedText}</u>`;
          cursorOffset = selectedText.length + 7;
        } else {
          newText = '<u>text</u>';
          cursorOffset = 9;
        }
        break;
        
      case 'code':
        if (selectedText) {
          newText = `\`${selectedText}\``;
          cursorOffset = selectedText.length + 2;
        } else {
          newText = '`code`';
          cursorOffset = 5;
        }
        break;
        
      case 'codeblock':
        if (selectedText) {
          newText = `\n\`\`\`\n${selectedText}\n\`\`\`\n`;
        } else {
          newText = '\n```\ncode here\n```\n';
        }
        cursorOffset = newText.length;
        break;
        
      case 'link':
        if (selectedText) {
          newText = `[${selectedText}](url)`;
          cursorOffset = selectedText.length + 3;
        } else {
          newText = '[text](url)';
          cursorOffset = 6;
        }
        break;
        
      case 'quote':
        const lines = selectedText ? selectedText.split('\n') : [''];
        newText = lines.map(line => `> ${line}`).join('\n');
        cursorOffset = newText.length;
        break;
        
      case 'h1':
        newText = selectedText ? `# ${selectedText}` : '# ';
        cursorOffset = newText.length;
        break;
        
      case 'h2':
        newText = selectedText ? `## ${selectedText}` : '## ';
        cursorOffset = newText.length;
        break;
        
      case 'h3':
        newText = selectedText ? `### ${selectedText}` : '### ';
        cursorOffset = newText.length;
        break;
        
      case 'list':
        newText = selectedText ? `\n* ${selectedText}` : '\n* ';
        cursorOffset = newText.length;
        break;
        
      case 'orderedlist':
        newText = selectedText ? `\n1. ${selectedText}` : '\n1. ';
        cursorOffset = newText.length;
        break;
        
      default:
        return;
    }

    const newValue = currentValue.slice(0, start) + newText + currentValue.slice(end);
    onChange(newValue);

    setTimeout(() => {
      const newCursorPos = start + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleIndentList = (isIndent) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentValue = value || '';
    
    const beforeCursor = currentValue.slice(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const lineEnd = currentValue.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? currentValue.length : lineEnd;
    
    const currentLine = currentValue.slice(lineStart, actualLineEnd);
    
    const unorderedMatch = currentLine.match(/^(\s*)([\*\-\+]) (.*)$/);
    const orderedMatch = currentLine.match(/^(\s*)(\d+(?:\.\d+)*)\. (.*)$/);
    
    let newLine = '';
    
    if (unorderedMatch) {
      const [, indent, marker, content] = unorderedMatch;
      
      if (isIndent) {
        const newIndent = indent + '    ';
        const level = Math.floor(newIndent.length / 4);
        const markers = ['*', '-', '+'];
        const newMarker = markers[level % markers.length];
        newLine = `${newIndent}${newMarker} ${content}`;
      } else {
        if (indent.length >= 4) {
          const newIndent = indent.slice(4);
          const level = Math.floor(newIndent.length / 4);
          const markers = ['*', '-', '+'];
          const newMarker = markers[level % markers.length];
          newLine = `${newIndent}${newMarker} ${content}`;
        } else {
          newLine = currentLine;
        }
      }
    } else if (orderedMatch) {
      const [, indent, number, content] = orderedMatch;
      
      if (isIndent) {
        const newIndent = indent + '    ';
        const newNumber = `${number}.1`;
        newLine = `${newIndent}${newNumber}. ${content}`;
      } else {
        if (indent.length >= 4) {
          const newIndent = indent.slice(4);
          const numberParts = number.split('.');
          const newNumber = numberParts.length > 1 
            ? numberParts.slice(0, -1).join('.') 
            : number;
          newLine = `${newIndent}${newNumber}. ${content}`;
        } else {
          newLine = currentLine;
        }
      }
    } else {
      if (isIndent) {
        newLine = '    ' + currentLine;
      } else {
        if (currentLine.startsWith('    ')) {
          newLine = currentLine.slice(4);
        } else {
          newLine = currentLine;
        }
      }
    }

    const newValue = currentValue.slice(0, lineStart) + newLine + currentValue.slice(actualLineEnd);
    onChange(newValue);

    const cursorPositionInLine = start - lineStart;
    const newCursorPos = lineStart + Math.min(cursorPositionInLine, newLine.length);
    
    setTimeout(() => {
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      handleIndentList(!e.shiftKey);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = value || '';
      
      const beforeCursor = currentValue.slice(0, start);
      const lineStart = beforeCursor.lastIndexOf('\n') + 1;
      const currentLine = currentValue.slice(lineStart, start);
      
      const unorderedMatch = currentLine.match(/^(\s*)([\*\-\+]) (.*)$/);
      const orderedMatch = currentLine.match(/^(\s*)(\d+(?:\.\d+)*)\. (.*)$/);
      
      let insertText = '\n';
      
      if (unorderedMatch) {
        const [, indent, marker] = unorderedMatch;
        insertText = `\n${indent}${marker} `;
      } else if (orderedMatch) {
        const [, indent, number] = orderedMatch;
        const numberParts = number.split('.');
        const lastPart = parseInt(numberParts[numberParts.length - 1]);
        numberParts[numberParts.length - 1] = (lastPart + 1).toString();
        const nextNumber = numberParts.join('.');
        insertText = `\n${indent}${nextNumber}. `;
      }
      
      const beforeCursor2 = currentValue.slice(0, start);
      const afterCursor = currentValue.slice(end);
      const newValue = beforeCursor2 + insertText + afterCursor;
      
      onChange(newValue);
      
      setTimeout(() => {
        textarea.setSelectionRange(start + insertText.length, start + insertText.length);
        textarea.focus();
      }, 0);
    }
  };

  useEffect(() => {
    if (onInsert) {
      onInsert.current = {
        insert: handleInsert,
        format: handleFormatText
      };
    }
  }, [value, handleInsert, handleFormatText]);

  return (
    <div className="relative h-full">
      {(uploadingImage || uploadStatus) && (
        <div className={`absolute top-2 right-2 z-10 px-3 py-1 rounded text-sm shadow-lg ${
          uploadStatus.includes('✓') 
            ? 'bg-green-500 text-white' 
            : uploadStatus.includes('✗')
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          {uploadStatus || 'Uploading image...'}
        </div>
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
        placeholder="Start typing your markdown here... (Paste images directly from clipboard!)"
      />
      <style jsx>{`
        .drag-over {
          outline: 2px dashed ${isDarkMode ? '#60a5fa' : '#3b82f6'};
          outline-offset: -4px;
          background-color: ${isDarkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
        }
      `}</style>
    </div>
  );
}