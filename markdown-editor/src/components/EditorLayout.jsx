import React from 'react';
import Sidebar from './SideBar.jsx';
import MainEditor from './MainEditor.jsx';
import ErrorBanner from './ErrorBanner.jsx';
import StatusBar from './StatusBar.jsx';

const EditorLayout = ({
  // File manager state
  files,
  selectedFile,
  error,
  hasModifiedFiles,
  
  // App settings state
  isPreviewMode,
  isDarkMode,
  isSidebarVisible,
  
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
  onToggleSidebar,
  
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
        {isSidebarVisible && (
          <div className="flex-shrink-0 transition-all duration-300 ease-in-out">
            <Sidebar
              files={files}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onDeleteFile={onDeleteFile}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
        
        <MainEditor
          selectedFile={selectedFile}
          isPreviewMode={isPreviewMode}
          isDarkMode={isDarkMode}
          isSidebarVisible={isSidebarVisible}
          hasModifiedFiles={hasModifiedFiles}
          onContentChange={onContentChange}
          onInsert={onInsert}
          onSave={onSave}
          onSaveAll={onSaveAll}
          onTogglePreview={onTogglePreview}
          onToggleDarkMode={onToggleDarkMode}
          onToggleSidebar={onToggleSidebar}
          insertRef={insertRef}
        />
      </div>
      
      <StatusBar 
        selectedFile={selectedFile}
        error={error}
        isDarkMode={isDarkMode}
        isSidebarVisible={isSidebarVisible}
        totalFiles={files?.length || 0}
        modifiedFiles={files?.filter(f => f.modified)?.length || 0}
      />
    </div>
  );
};

export default EditorLayout;