import React, { useRef, useState, useCallback, useEffect } from "react";
import { useFileManager } from "./hooks/useFileManager";
import { useAppSettings } from "./hooks/useAppSettings";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import LoadingScreen from "./components/LoadingScreen";
import EditorLayout from "./components/EditorLayout";

export default function App() {
  const insertRef = useRef();
  
  // Custom hooks for state management
  const fileManager = useFileManager();
  const appSettings = useAppSettings();

  // Undo/Redo history state (per file)
  const [historyStack, setHistoryStack] = useState({}); // { [filePath]: { past: [], future: [] } }
  const debounceTimerRef = useRef(null);
  const lastContentRef = useRef(null);

  // Get current file's history
  const getFileHistory = useCallback((filePath) => {
    return historyStack[filePath] || { past: [], future: [] };
  }, [historyStack]);

  // Initialize history when file changes
  useEffect(() => {
    if (fileManager.selectedFile?.path) {
      const filePath = fileManager.selectedFile.path;
      const content = fileManager.selectedFile.content || '';
      
      if (!historyStack[filePath]) {
        setHistoryStack(prev => ({
          ...prev,
          [filePath]: { past: [], future: [] }
        }));
      }
      lastContentRef.current = content;
    }
  }, [fileManager.selectedFile?.path]);

  // Push to history (debounced for typing)
  const pushToHistory = useCallback((oldContent) => {
    if (!fileManager.selectedFile?.path) return;
    const filePath = fileManager.selectedFile.path;
    
    setHistoryStack(prev => {
      const fileHistory = prev[filePath] || { past: [], future: [] };
      const newPast = [...fileHistory.past, oldContent].slice(-100); // Max 100 history entries
      return {
        ...prev,
        [filePath]: { past: newPast, future: [] } // Clear future on new change
      };
    });
  }, [fileManager.selectedFile?.path]);

  // Enhanced content change handler with history
  const handleContentChangeWithHistory = useCallback((newContent) => {
    if (!fileManager.selectedFile) return;
    
    const oldContent = lastContentRef.current;
    
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Debounce history pushes (batch rapid changes like typing)
    debounceTimerRef.current = setTimeout(() => {
      if (oldContent !== null && oldContent !== newContent) {
        pushToHistory(oldContent);
      }
      lastContentRef.current = newContent;
    }, 500);
    
    // Always update content immediately
    fileManager.handleContentChange(newContent);
  }, [fileManager, pushToHistory]);

  // Undo handler
  const handleUndo = useCallback(() => {
    if (!fileManager.selectedFile?.path) return;
    
    const filePath = fileManager.selectedFile.path;
    const fileHistory = getFileHistory(filePath);
    
    if (fileHistory.past.length === 0) return;
    
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    const currentContent = fileManager.selectedFile.content || '';
    const previousContent = fileHistory.past[fileHistory.past.length - 1];
    const newPast = fileHistory.past.slice(0, -1);
    const newFuture = [currentContent, ...fileHistory.future];
    
    setHistoryStack(prev => ({
      ...prev,
      [filePath]: { past: newPast, future: newFuture }
    }));
    
    lastContentRef.current = previousContent;
    fileManager.handleContentChange(previousContent);
  }, [fileManager, getFileHistory]);

  // Redo handler
  const handleRedo = useCallback(() => {
    if (!fileManager.selectedFile?.path) return;
    
    const filePath = fileManager.selectedFile.path;
    const fileHistory = getFileHistory(filePath);
    
    if (fileHistory.future.length === 0) return;
    
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    const currentContent = fileManager.selectedFile.content || '';
    const nextContent = fileHistory.future[0];
    const newFuture = fileHistory.future.slice(1);
    const newPast = [...fileHistory.past, currentContent];
    
    setHistoryStack(prev => ({
      ...prev,
      [filePath]: { past: newPast, future: newFuture }
    }));
    
    lastContentRef.current = nextContent;
    fileManager.handleContentChange(nextContent);
  }, [fileManager, getFileHistory]);

  // Handle text formatting for keyboard shortcuts
  const handleFormatText = (format) => {
    if (insertRef.current && insertRef.current.format) {
      insertRef.current.format(format);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: fileManager.handleSave,
    onSaveAll: fileManager.handleSaveAll,
    onCreateFile: () => fileManager.handleCreateFile(''),
    onTogglePreview: appSettings.handleTogglePreview,
    onToggleSidebar: appSettings.handleToggleSidebar || (() => {}),
    onFormatText: handleFormatText,
    onUndo: handleUndo,
    onRedo: handleRedo,
    disabled: fileManager.loading
  });

  // Handle text insertion into editor
  const handleInsert = (text) => {
    if (insertRef.current) {
      insertRef.current(text);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Show loading screen while files are being loaded
  if (fileManager.loading) {
    return <LoadingScreen isDarkMode={appSettings.isDarkMode} />;
  }

  return (
    <EditorLayout
      // File manager state
      files={fileManager.files}
      selectedFile={fileManager.selectedFile}
      error={fileManager.error}
      hasModifiedFiles={fileManager.hasModifiedFiles}
      
      // App settings state
      isPreviewMode={appSettings.isPreviewMode}
      isDarkMode={appSettings.isDarkMode}
      isSidebarVisible={appSettings.isSidebarVisible}
      
      // File manager actions
      onFileSelect={fileManager.handleFileSelect}
      onCreateFile={fileManager.handleCreateFile}
      onCreateFolder={fileManager.handleCreateFolder}
      onDeleteFile={fileManager.handleDeleteFile}
      onRenameFile={fileManager.handleRenameFile}
      onRenameFolder={fileManager.handleRenameFolder}
      onContentChange={handleContentChangeWithHistory}
      onSave={fileManager.handleSave}
      onSaveAll={fileManager.handleSaveAll}
      onRefreshFiles={fileManager.handleRefreshFiles}
      onClearError={fileManager.clearError}
      
      // App settings actions
      onTogglePreview={appSettings.handleTogglePreview}
      onToggleDarkMode={appSettings.handleToggleDarkMode}
      onToggleSidebar={appSettings.handleToggleSidebar}
      
      // Editor specific props
      onInsert={handleInsert}
      insertRef={insertRef}
    />
  );
}