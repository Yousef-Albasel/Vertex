import React from 'react';
import MarkdownEditor from './MarkdownEditor.jsx';
import PreviewPane from './MarkdownPreview.jsx';
import Toolbar from './Toolbar.jsx';

const MainEditor = ({ 
  selectedFile,
  isPreviewMode,
  isDarkMode,
  isSidebarVisible,
  hasModifiedFiles,
  onContentChange,
  onInsert,
  onSave,
  onSaveAll,
  onTogglePreview,
  onToggleDarkMode,
  onToggleSidebar,
  insertRef
}) => {
  // Handle text formatting
  const handleFormatText = (format) => {
    if (insertRef.current && insertRef.current.format) {
      insertRef.current.format(format);
    }
  };

  // Handle regular insert (for non-formatting buttons like Image)
  const handleInsert = (text) => {
    if (insertRef.current && insertRef.current.insert) {
      insertRef.current.insert(text);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Toolbar 
        onInsert={handleInsert}
        onFormatText={handleFormatText}
        onSave={onSave}
        onSaveAll={onSaveAll}
        isPreviewMode={isPreviewMode}
        onTogglePreview={onTogglePreview}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        isSidebarVisible={isSidebarVisible}
        onToggleSidebar={onToggleSidebar}
        selectedFile={selectedFile}
        hasModifiedFiles={hasModifiedFiles}
      />
      
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {!isPreviewMode ? (
          <>
            <div className="flex-1 min-w-0 border-r dark:border-gray-700 overflow-hidden">
              <MarkdownEditor
                value={selectedFile?.content}
                onChange={onContentChange}
                onInsert={insertRef}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className={`flex-1 min-w-0 overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <PreviewPane 
                markdown={selectedFile?.content} 
                isDarkMode={isDarkMode} 
              />
            </div>
          </>
        ) : (
          <div className={`flex-1 min-w-0 overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <PreviewPane 
              markdown={selectedFile?.content} 
              isDarkMode={isDarkMode} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MainEditor;