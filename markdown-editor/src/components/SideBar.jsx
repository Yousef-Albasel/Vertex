import { useState } from 'react';
import { FileText, Folder, FolderOpen, Trash2, Plus } from 'lucide-react';

export default function Sidebar({ files, selectedFile, onFileSelect, onCreateFile, onDeleteFile, isDarkMode }) {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['content']));

  const toggleFolder = (folderName) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  const handleDeleteClick = (e, file) => {
    e.stopPropagation(); // Prevent file selection
    onDeleteFile(file);
  };

  // Group files by directory
  const filesByDirectory = files.reduce((acc, file) => {
    const dir = file.directory || 'content';
    if (!acc[dir]) {
      acc[dir] = [];
    }
    acc[dir].push(file);
    return acc;
  }, {});

  // Ensure content and pages directories exist in the structure
  if (!filesByDirectory.content) filesByDirectory.content = [];

  const renderDirectory = (dirName, dirFiles) => {
    const isExpanded = expandedFolders.has(dirName);
    const dirColor = dirName === 'pages' ? 'text-purple-600' : 'text-blue-600';
    
    return (
      <div key={dirName} className="mb-2">
        <button
          onClick={() => toggleFolder(dirName)}
          className={`flex items-center gap-1 w-full text-left p-1 rounded text-sm font-medium transition-colors ${
            isDarkMode
              ? 'hover:bg-gray-700 text-gray-200'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
        >
          {isExpanded ? 
            <FolderOpen size={16} className={dirColor} /> : 
            <Folder size={16} className={dirColor} />
          }
          {dirName}/
          <span className={`ml-1 text-xs px-1 rounded ${
            isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
          }`}>
            {dirFiles.length}
          </span>
        </button>
        
        {isExpanded && (
          <div className="ml-4 mt-1">
            {dirFiles.map((file, index) => (
              <div
                key={`${file.directory}-${file.name}-${index}`}
                className={`group cursor-pointer p-2 rounded text-sm transition-colors flex items-center justify-between ${
                  selectedFile?.path === file.path
                    ? isDarkMode
                      ? dirName === 'pages'
                        ? 'bg-purple-900 text-purple-200 border-l-2 border-purple-400'
                        : 'bg-blue-900 text-blue-200 border-l-2 border-blue-400'
                      : dirName === 'pages'
                        ? 'bg-purple-100 text-purple-800 border-l-2 border-purple-500'
                        : 'bg-blue-100 text-blue-800 border-l-2 border-blue-500'
                    : isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div 
                  className="flex items-center gap-2 flex-1"
                  onClick={() => onFileSelect(file)}
                >
                  <FileText size={14} />
                  <span className="truncate">
                    {file.name}
                    {file.modified && (
                      <span className="text-orange-500 ml-1">●</span>
                    )}
                  </span>
                </div>
                
                {files.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteClick(e, file)}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
                      isDarkMode
                        ? 'hover:bg-red-800 text-red-400'
                        : 'hover:bg-red-100 text-red-600'
                    }`}
                    title={`Delete ${file.name}`}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
            {dirFiles.length === 0 && (
              <div className={`text-sm p-2 italic ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                No {dirName} files
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-64 flex flex-col border-r h-full ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-gray-100 border-gray-200'
    }`}>
      <div className={`p-4 border-b ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <h2 className={`font-semibold flex items-center gap-2 ${
          isDarkMode ? 'text-gray-100' : 'text-gray-800'
        }`}>
          <FileText size={18} />
          Vertex Editor
        </h2>
        <p className={`text-xs mt-1 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Static Site Generator
        </p>
        <button
          onClick={onCreateFile}
          className={`mt-2 text-sm px-3 py-1 rounded transition-colors flex items-center gap-1 w-full justify-center ${
            isDarkMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <Plus size={14} />
          New File
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {/* Render content directory */}
        {renderDirectory('content', filesByDirectory.content)}
        
        {/* Render any other directories that might exist */}
        {Object.entries(filesByDirectory)
          .filter(([dirName]) => !['content'].includes(dirName))
          .map(([dirName, dirFiles]) => renderDirectory(dirName, dirFiles))
        }
      </div>
      
      <div className={`p-3 border-t text-xs ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700 text-gray-400' 
          : 'bg-gray-50 border-gray-200 text-gray-500'
      }`}>
        <div className="grid grid-cols-1 gap-2 mb-2">
          <div className="text-center">
            <div className="font-medium text-blue-500">
              {filesByDirectory.content?.length || 0}
            </div>
            <div className="text-xs">Content</div>
          </div>
          <div className="text-center">
          </div>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span>{files.length} total</span>
          <span className="text-orange-500">
            {files.filter(f => f.modified).length} unsaved
          </span>
        </div>
      </div>
    </div>
  );
}