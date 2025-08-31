import React from 'react';
import Sidebar from './SideBar.jsx';
import MainEditor from './MainEditor.jsx';
import ErrorBanner from './ErrorBanner.jsx';

const EditorLayout = ({
  // File manager state
  files,
  selectedFile,
  error,
  hasModifiedFiles,
  
  // App settings state
  isPreviewMode,
  isDarkMode,
  
  // File manager actions
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onContentChange,
  onSave,
  onSaveAll,
  onRefreshFiles,
  onClearError,
  
  // App settings actions
  onTogglePreview,
  onToggleDarkMode,
  
  // Editor specific props
  onInsert,
  insertRef
}) => {
  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      {error && (
        <ErrorBanner 
          message={error} 
          onClose={onClearError}
          onRefresh={onRefreshFiles}
          isDarkMode={isDarkMode}
        />
      )}
      
      <div className="flex flex-1 min-h-0">
        <Sidebar
          files={files}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
          onDeleteFile={onDeleteFile}
          isDarkMode={isDarkMode}
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
      </div>
    </div>
  );
};

export default EditorLayout;