import { useState, useRef, useEffect } from "react";

export default function MarkdownEditor({ value, onChange, onInsert, isDarkMode }) {
  const textareaRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
          cursorOffset = 6; // Position cursor after 'text'
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
          cursorOffset = selectedText.length + 3; // Position at 'url'
        } else {
          newText = '[text](url)';
          cursorOffset = 6; // Position at 'url'
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

    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };
  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    // Check if any pasted item is an image
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault(); // Prevent default paste behavior
        
        const file = item.getAsFile();
        if (!file) continue;

        await uploadImage(file);
        return;
      }
    }
  };
  const uploadImage = async (file) => {
    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:3001/api/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      // Insert markdown image syntax at cursor position
      const markdownImage = `\n![Image](${data.path})\n`;
      handleInsert(markdownImage);

      console.log('Image uploaded successfully:', data.filename);

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Make sure the server is running.');
    } finally {
      setUploadingImage(false);
    }
  };
 const handleDrop = async (e) => {
    e.preventDefault();
    
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        await uploadImage(file);
      }
    }
  }; 
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleIndentList = (isIndent) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentValue = value || '';
    
    // Find the current line
    const beforeCursor = currentValue.slice(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const lineEnd = currentValue.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? currentValue.length : lineEnd;
    
    const currentLine = currentValue.slice(lineStart, actualLineEnd);
    
    // Check if it's a list item
    const unorderedMatch = currentLine.match(/^(\s*)([\*\-\+]) (.*)$/);
    const orderedMatch = currentLine.match(/^(\s*)(\d+(?:\.\d+)*)\. (.*)$/);
    
    let newLine = '';
    
    if (unorderedMatch) {
      const [, indent, marker, content] = unorderedMatch;
      
      if (isIndent) {
        // Add 4 spaces and change marker based on level
        const newIndent = indent + '    ';
        const level = Math.floor(newIndent.length / 4);
        const markers = ['*', '-', '+'];
        const newMarker = markers[level % markers.length];
        newLine = `${newIndent}${newMarker} ${content}`;
      } else {
        // Remove 4 spaces if possible
        if (indent.length >= 4) {
          const newIndent = indent.slice(4);
          const level = Math.floor(newIndent.length / 4);
          const markers = ['*', '-', '+'];
          const newMarker = markers[level % markers.length];
          newLine = `${newIndent}${newMarker} ${content}`;
        } else {
          newLine = currentLine; // Can't outdent further
        }
      }
    } else if (orderedMatch) {
      const [, indent, number, content] = orderedMatch;
      
      if (isIndent) {
        // Add 4 spaces and create sub-numbering
        const newIndent = indent + '    ';
        const level = Math.floor(newIndent.length / 4);
        
        // For hierarchical numbering: 1. -> 1.1. -> 1.1.1.
        let newNumber;
        if (level === 1) {
          newNumber = `${number}.1`;
        } else {
          newNumber = `${number}.1`;
        }
        
        newLine = `${newIndent}${newNumber}. ${content}`;
      } else {
        // Remove 4 spaces and adjust numbering
        if (indent.length >= 4) {
          const newIndent = indent.slice(4);
          
          // Remove the last level of numbering
          const numberParts = number.split('.');
          let newNumber;
          if (numberParts.length > 1) {
            newNumber = numberParts.slice(0, -1).join('.');
          } else {
            newNumber = number;
          }
          
          newLine = `${newIndent}${newNumber}. ${content}`;
        } else {
          newLine = currentLine; // Can't outdent further
        }
      }
    } else {
      // Not a list item, just add/remove indentation
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

    // Replace the line in the content
    const newValue = currentValue.slice(0, lineStart) + newLine + currentValue.slice(actualLineEnd);
    onChange(newValue);

    // Maintain cursor position relative to the line
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

    // Handle Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      handleIndentList(!e.shiftKey); // Shift+Tab = outdent, Tab = indent
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = value || '';
      
      // Find current line to check for list continuation
      const beforeCursor = currentValue.slice(0, start);
      const lineStart = beforeCursor.lastIndexOf('\n') + 1;
      const currentLine = currentValue.slice(lineStart, start);
      
      // Check if we're in a list
      const unorderedMatch = currentLine.match(/^(\s*)([\*\-\+]) (.*)$/);
      const orderedMatch = currentLine.match(/^(\s*)(\d+(?:\.\d+)*)\. (.*)$/);
      
      let insertText = '\n';
      
      if (unorderedMatch) {
        const [, indent, marker] = unorderedMatch;
        insertText = `\n${indent}${marker} `;
      } else if (orderedMatch) {
        const [, indent, number] = orderedMatch;
        
        // Calculate next number in sequence
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

  // Expose format function to parent component
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
      {uploadingImage && (
        <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white px-3 py-1 rounded text-sm">
          Uploading image...
        </div>
      )}
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
          boxSizing: 'border-box',
          tabSize: 4
        }}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        placeholder="Start typing your markdown here..."
      />
    </div>
  );
}