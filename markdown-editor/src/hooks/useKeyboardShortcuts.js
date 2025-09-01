import { useEffect } from 'react';

export const useKeyboardShortcuts = ({
  onSave,
  onSaveAll,
  onCreateFile,
  onTogglePreview,
  onToggleSidebar,
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
      
      // Ctrl+B - Toggle sidebar
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        onToggleSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onSaveAll, onCreateFile, onTogglePreview, onToggleSidebar, disabled]);
};