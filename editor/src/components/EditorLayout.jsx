import React from 'react';
import Sidebar from './SideBar';
import MainEditor from './MainEditor';
import StatusBar from './StatusBar';

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
  onRenameFile,
  onRenameFolder,
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
      <div className="flex-1 flex overflow-hidden">
        {isSidebarVisible && (
          <Sidebar
            files={files}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            onCreateFile={onCreateFile}
            onCreateFolder={onCreateFolder}
            onDeleteFile={onDeleteFile}
            onRenameFile={onRenameFile}
            onRenameFolder={onRenameFolder}
            isDarkMode={isDarkMode}
          />
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
      
      {error && (
        <div className={`p-3 text-sm border-t ${
          isDarkMode 
            ? 'bg-red-900 border-red-700 text-red-200' 
            : 'bg-red-100 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <div className="flex gap-2">
              <button 
                onClick={onRefreshFiles}
                className={`px-2 py-1 rounded text-xs ${
                  isDarkMode 
                    ? 'bg-red-800 hover:bg-red-700' 
                    : 'bg-red-200 hover:bg-red-300'
                }`}
              >
                Retry
              </button>
              <button 
                onClick={onClearError}
                className={`px-2 py-1 rounded text-xs ${
                  isDarkMode 
                    ? 'bg-red-800 hover:bg-red-700' 
                    : 'bg-red-200 hover:bg-red-300'
                }`}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorLayout;