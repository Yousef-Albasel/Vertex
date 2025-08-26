import React, { useRef } from "react";
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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: fileManager.handleSave,
    onSaveAll: fileManager.handleSaveAll,
    onCreateFile: fileManager.handleCreateFile,
    onTogglePreview: appSettings.handleTogglePreview,
    disabled: fileManager.loading
  });

  // Handle text insertion into editor
  const handleInsert = (text) => {
    if (insertRef.current) {
      insertRef.current(text);
    }
  };

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
      
      // File manager actions
      onFileSelect={fileManager.handleFileSelect}
      onCreateFile={fileManager.handleCreateFile}
      onDeleteFile={fileManager.handleDeleteFile}
      onContentChange={fileManager.handleContentChange}
      onSave={fileManager.handleSave}
      onSaveAll={fileManager.handleSaveAll}
      onRefreshFiles={fileManager.handleRefreshFiles}
      onClearError={fileManager.clearError}
      
      // App settings actions
      onTogglePreview={appSettings.handleTogglePreview}
      onToggleDarkMode={appSettings.handleToggleDarkMode}
      
      // Editor specific props
      onInsert={handleInsert}
      insertRef={insertRef}
    />
  );
}