import React from 'react';
import { getConnectionStatus } from '../utils/fileUtils';

const StatusBar = ({ selectedFile, error, isDarkMode, isSidebarVisible, totalFiles, modifiedFiles }) => {
  const connectionStatus = getConnectionStatus(error);

  return (
    <div className={`px-4 py-2 text-sm border-t ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700 text-gray-300' 
        : 'bg-gray-50 border-gray-200 text-gray-600'
    }`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Show file info when sidebar is hidden */}
          {!isSidebarVisible && (
            <span className="text-xs opacity-60">
              {totalFiles || 0} files • {modifiedFiles || 0} unsaved • Ctrl+B: Show sidebar
            </span>
          )}
          
          {selectedFile && (
            <span>
              <span className={`px-2 py-1 text-xs rounded ${
                selectedFile.directory === 'pages'
                  ? isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                  : isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
              }`}>
                {selectedFile.directory || 'content'}
              </span>
              <span className="ml-2">{selectedFile.name}</span>
              {selectedFile.modified && <span className="text-orange-500 ml-1">●</span>}
            </span>
          )}
          
          {selectedFile?.lastModified && (
            <span className="text-xs opacity-60">
              Modified: {new Date(selectedFile.lastModified).toLocaleString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <span className="hidden sm:inline">Ctrl+S: Save</span>
          <span className="hidden sm:inline">Ctrl+P: Preview</span>
          <span className="hidden sm:inline">Ctrl+N: New</span>
          {!isSidebarVisible && <span className="hidden sm:inline">Ctrl+B: Sidebar</span>}
          <span>{selectedFile?.content?.length || 0} chars</span>
          <span className={`flex items-center gap-1 ${
            connectionStatus.status === 'offline' ? 'text-red-500' : 'text-green-500'
          }`}>
            ● {connectionStatus.text}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;