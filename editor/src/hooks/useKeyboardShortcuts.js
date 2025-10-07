import { useEffect } from 'react';

export const useKeyboardShortcuts = ({
  onSave,
  onSaveAll,
  onCreateFile,
  onTogglePreview,
  onToggleSidebar,
  onFormatText,
  disabled = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled) return;

      // Ctrl+S - Save current file
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        onSave();
      }
      
      // Ctrl+Shift+S - Save all files
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        onSaveAll();
      }
      
      // Ctrl+N - New file
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        onCreateFile();
      }
      
      // Ctrl+P - Toggle preview
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        onTogglePreview();
      }
      
      // Ctrl+Shift+B - Toggle sidebar (changed from Ctrl+B)
      if (e.ctrlKey && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        onToggleSidebar();
      }

      // Text formatting shortcuts
      if (onFormatText) {
        // Ctrl+B - Bold (moved from sidebar)
        if (e.ctrlKey && e.key === 'b' && !e.shiftKey) {
          e.preventDefault();
          onFormatText('bold');
        }
        
        // Ctrl+I - Italic
        if (e.ctrlKey && e.key === 'i') {
          e.preventDefault();
          onFormatText('italic');
        }
        
        // Ctrl+U - Underline
        if (e.ctrlKey && e.key === 'u') {
          e.preventDefault();
          onFormatText('underline');
        }
        
        // Ctrl+K - Link
        if (e.ctrlKey && e.key === 'k') {
          e.preventDefault();
          onFormatText('link');
        }
        
        // Ctrl+` - Inline code
        if (e.ctrlKey && e.key === '`') {
          e.preventDefault();
          onFormatText('code');
        }
        
        // Ctrl+Shift+` - Code block
        if (e.ctrlKey && e.shiftKey && e.key === '~') {
          e.preventDefault();
          onFormatText('codeblock');
        }
        
        // Ctrl+Shift+. - Blockquote
        if (e.ctrlKey && e.shiftKey && e.key === '>') {
          e.preventDefault();
          onFormatText('quote');
        }
        
        // Ctrl+1, Ctrl+2, Ctrl+3 - Headers
        if (e.ctrlKey && ['1', '2', '3'].includes(e.key)) {
          e.preventDefault();
          onFormatText(`h${e.key}`);
        }
        
        // Ctrl+Shift+L - Unordered list
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
          e.preventDefault();
          onFormatText('list');
        }
        
        // Ctrl+Shift+O - Ordered list
        if (e.ctrlKey && e.shiftKey && e.key === 'O') {
          e.preventDefault();
          onFormatText('orderedlist');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onSaveAll, onCreateFile, onTogglePreview, onToggleSidebar, onFormatText, disabled]);
};