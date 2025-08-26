import React from 'react';
import Sidebar from './SideBar.jsx';
import MainEditor from './MainEditor.jsx';
import StatusBar from './StatusBar.jsx';
import ErrorBanner from './ErrorBanner.jsx';

const EditorLayout = ({
  // File manager state
  files,
  selectedFile,
  error,
  hasModifiedFiles,
  
  // App settings
  isPreviewMode,
  isDarkMode,
  
  // File manager actions
  onFileSelect,
  onCreateFile,
  onDeleteFile,
  onContentChange,
  onSave,
  onSaveAll,
  onRefreshFiles,
  onClearError,
  
  // App setting actions
  onTogglePreview,
  onToggleDarkMode,
  
  // Editor specific
  onInsert,
  insertRef
}) => {
  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      <Sidebar 
        files={files}
        selectedFile={selectedFile}
        onFileSelect={onFileSelect}
        onCreateFile={onCreateFile}
        onDeleteFile={onDeleteFile}
        isDarkMode={isDarkMode}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ErrorBanner 
          error={error}
          isDarkMode={isDarkMode}
          onRetry={onRefreshFiles}
          onDismiss={onClearError}
        />
        
        <MainEditor 
          selectedFile={selectedFile}
          isPreviewMode={isPreviewMode}
          isDarkMode={isDarkMode}
          hasModifiedFiles={hasModifiedFiles}
          onContentChange={onContentChange}
          onInsert={onInsert}
          onSave={onSave}
          onSaveAll={onSaveAll}
          onTogglePreview={onTogglePreview}
          onToggleDarkMode={onToggleDarkMode}
          insertRef={insertRef}
        />
        
        <StatusBar 
          selectedFile={selectedFile}
          error={error}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

export default EditorLayout;