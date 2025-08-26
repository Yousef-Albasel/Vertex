import { useEffect } from 'react';

export const useKeyboardShortcuts = ({ 
  onSave, 
  onSaveAll, 
  onCreateFile, 
  onTogglePreview,
  disabled = false 
}) => {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event) => {
      // Ctrl+S or Cmd+S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (event.shiftKey) {
          // Ctrl+Shift+S or Cmd+Shift+S to save all
          onSaveAll?.();
        } else {
          // Regular save
          onSave?.();
        }
        return;
      }

      // Ctrl+N or Cmd+N to create new file
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        onCreateFile?.();
        return;
      }

      // Ctrl+P or Cmd+P to toggle preview
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        onTogglePreview?.();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSave, onSaveAll, onCreateFile, onTogglePreview, disabled]);
};