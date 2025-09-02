import { useState } from 'react';
import { FileText, Folder, FolderOpen, Trash2, Plus, FolderPlus } from 'lucide-react';
import React from 'react';

export default function Sidebar({ 
  files, 
  selectedFile, 
  onFileSelect, 
  onCreateFile, 
  onCreateFolder, 
  onDeleteFile,
  onRenameFile,
  onRenameFolder,
  isDarkMode 
}) {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['content']));
  const [renamingItem, setRenamingItem] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const handleDeleteClick = (e, file) => {
    e.stopPropagation();
    onDeleteFile(file);
  };

  const startRename = (item, type) => {
    setRenamingItem({ ...item, type });
    if (type === 'file') {
      // For files, get just the filename without extension for editing
      const nameWithoutExt = item.name.replace(/\.md$/, '');
      setRenameValue(nameWithoutExt);
    } else {
      // For folders, get just the folder name
      setRenameValue(item.name.split('/').pop());
    }
  };

  const handleRenameSubmit = async () => {
    if (!renamingItem || !renameValue.trim()) {
      setRenamingItem(null);
      return;
    }

    try {
      if (renamingItem.type === 'file') {
        // Add .md extension back for files
        const newFileName = renameValue.trim().endsWith('.md') 
          ? renameValue.trim() 
          : renameValue.trim() + '.md';
        await onRenameFile(renamingItem, newFileName);
      } else {
        await onRenameFolder(renamingItem, renameValue.trim());
      }
    } catch (error) {
      console.error('Rename failed:', error);
    }
    
    setRenamingItem(null);
    setRenameValue('');
  };

  const handleRenameCancel = () => {
    setRenamingItem(null);
    setRenameValue('');
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleRenameCancel();
    }
  };

  const handleDoubleClick = (item, type) => {
    startRename(item, type);
  };

  const handleCreateFileInFolder = (folderPath) => {
    // Create a temporary file name
    const tempFileName = 'new-file.md';
    onCreateFile(folderPath, tempFileName);
  };

  const handleCreateFolder = (parentPath) => {
    // Create a temporary folder name
    const tempFolderName = 'new-folder';
    onCreateFolder(parentPath, tempFolderName);
  };

  // Build hierarchical file tree - FIXED VERSION
  const buildFileTree = (files) => {
    if (!files || !Array.isArray(files)) {
      return [];
    }

    // Group files by their parent folder
    const folderGroups = {};
    const folders = new Set();

    files.forEach(file => {
      if (!file || !file.path) return;
      
      const parts = file.path.split('/');
      if (parts.length < 2) return; // Skip files not in any folder
      
      // Register all folder paths
      for (let i = 1; i < parts.length; i++) {
        const folderPath = parts.slice(0, i + 1).join('/');
        folders.add(folderPath);
      }
      
      const folderPath = parts.slice(0, -1).join('/');
      
      if (!folderGroups[folderPath]) {
        folderGroups[folderPath] = [];
      }
      folderGroups[folderPath].push(file);
    });

    // Build tree structure recursively
    const buildNode = (folderPath) => {
      const parts = folderPath.split('/');
      const folderName = parts[parts.length - 1];
      const folderFiles = folderGroups[folderPath] || [];
      
      // Find child folders
      const childFolders = Array.from(folders)
        .filter(path => {
          const childParts = path.split('/');
          return childParts.length === parts.length + 1 && 
                 path.startsWith(folderPath + '/');
        })
        .map(childPath => buildNode(childPath));
      
      return {
        name: folderName,
        path: folderPath,
        type: 'folder',
        files: folderFiles,
        children: childFolders
      };
    };

    // Get root folders (depth 1 from content)
    const rootFolders = [buildNode('content')];


    return rootFolders;
  };

  const renderTree = (nodes, depth = 0) => {
    return nodes.map((node) => {
      if (node.type === 'folder') {
        const isExpanded = expandedFolders.has(node.path);
        const hasFiles = node.files && node.files.length > 0;
        const hasSubfolders = node.children && node.children.length > 0;
        const totalFiles = hasFiles ? node.files.length : 0;
        const isRenaming = renamingItem?.path === node.path && renamingItem?.type === 'folder';
        
        return (
          <div key={node.path} className="mb-1">
            <div className="flex items-center gap-1">
              {isRenaming ? (
                <div className="flex-1 flex items-center gap-1" style={{ paddingLeft: `${depth * 16 + 4}px` }}>
                  {isExpanded ? 
                    <FolderOpen size={16} className="text-blue-600 flex-shrink-0" /> : 
                    <Folder size={16} className="text-blue-600 flex-shrink-0" />
                  }
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={handleRenameSubmit}
                    className={`flex-1 px-2 py-1 text-sm border rounded ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    autoFocus
                    onFocus={(e) => e.target.select()}
                  />
                </div>
              ) : (
                <button
                  onClick={() => toggleFolder(node.path)}
                  onDoubleClick={() => handleDoubleClick(node, 'folder')}
                  className={`flex items-center gap-1 flex-1 text-left p-1 rounded text-sm font-medium transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-200'
                      : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  style={{ paddingLeft: `${depth * 16 + 4}px` }}
                >
                  {isExpanded ? 
                    <FolderOpen size={16} className="text-blue-600 flex-shrink-0" /> : 
                    <Folder size={16} className="text-blue-600 flex-shrink-0" />
                  }
                  <span className="truncate">{node.name}/</span>
                  <span className={`ml-1 text-xs px-1.5 py-0.5 rounded ${
                    isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {totalFiles}
                  </span>
                </button>
              )}
              
              {!isRenaming && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCreateFileInFolder(node.path)}
                    className={`p-1 rounded transition-colors ${
                      isDarkMode
                        ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200'
                        : 'hover:bg-gray-300 text-gray-500 hover:text-gray-700'
                    }`}
                    title="New file"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => handleCreateFolder(node.path)}
                    className={`p-1 rounded transition-colors ${
                      isDarkMode
                        ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200'
                        : 'hover:bg-gray-300 text-gray-500 hover:text-gray-700'
                    }`}
                    title="New folder"
                  >
                    <FolderPlus size={12} />
                  </button>
                </div>
              )}
            </div>
            
            {isExpanded && (
              <div className="mt-1">
                {/* Render files in this folder */}
                {hasFiles && node.files.map((file, index) => {
                  const isRenamingFile = renamingItem?.path === file.path && renamingItem?.type === 'file';
                  
                  return (
                    <div
                      key={`${file.path}-${index}`}
                      className={`group cursor-pointer p-2 rounded text-sm transition-colors flex items-center justify-between ${
                        selectedFile?.path === file.path
                          ? isDarkMode
                            ? 'bg-blue-900 text-blue-200 border-l-2 border-blue-400'
                            : 'bg-blue-100 text-blue-800 border-l-2 border-blue-500'
                          : isDarkMode
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-200 text-gray-700'
                      }`}
                      style={{ paddingLeft: `${(depth + 1) * 16 + 4}px` }}
                    >
                      {isRenamingFile ? (
                        <div className="flex items-center gap-2 flex-1">
                          <FileText size={14} className="flex-shrink-0" />
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={handleRenameKeyDown}
                            onBlur={handleRenameSubmit}
                            className={`flex-1 px-2 py-1 text-sm border rounded ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            autoFocus
                            onFocus={(e) => e.target.select()}
                          />
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-2 flex-1 min-w-0"
                          onClick={() => onFileSelect(file)}
                          onDoubleClick={() => handleDoubleClick(file, 'file')}
                        >
                          <FileText size={14} className="flex-shrink-0" />
                          <span className="truncate">
                            {file.name}
                            {file.modified && (
                              <span className="text-orange-500 ml-1">●</span>
                            )}
                          </span>
                        </div>
                      )}
                      
                      {!isRenamingFile && files && files.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteClick(e, file)}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all flex-shrink-0 ${
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
                  );
                })}
                
                {/* Render subfolders */}
                {hasSubfolders && renderTree(node.children, depth + 1)}
                
                {/* Empty folder message */}
                {!hasFiles && !hasSubfolders && (
                  <div className={`text-sm p-2 italic ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}
                    style={{ paddingLeft: `${(depth + 1) * 16 + 4}px` }}
                  >
                    Empty folder
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
      return null;
    });
  };

  // Handle F2 key for rename
  const handleKeyDown = (e) => {
    if (e.key === 'F2' && selectedFile && !renamingItem) {
      e.preventDefault();
      startRename(selectedFile, 'file');
    }
  };

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, renamingItem]);

  const fileTree = buildFileTree(files);

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
        <div className="flex gap-1 mt-2">
          <button
            onClick={() => onCreateFile('content')}
            className={`text-sm px-2 py-1 rounded transition-colors flex items-center gap-1 flex-1 justify-center ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <Plus size={12} />
            File
          </button>
          <button
            onClick={() => onCreateFolder('content')}
            className={`text-sm px-2 py-1 rounded transition-colors flex items-center gap-1 flex-1 justify-center ${
              isDarkMode
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            <FolderPlus size={12} />
            Folder
          </button>
        </div>
        <div className={`text-xs mt-2 opacity-60 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Double-click or F2 to rename
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 group">
        {files && files.length > 0 ? (
          renderTree(fileTree)
        ) : (
          <div className={`text-sm p-4 text-center italic ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            {files === null || files === undefined ? 'Loading files...' : 'No files found'}
          </div>
        )}
      </div>
      
      <div className={`p-3 border-t text-xs ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700 text-gray-400' 
          : 'bg-gray-50 border-gray-200 text-gray-500'
      }`}>
        <div className="text-center mb-2">
          <div className="font-medium text-blue-500">
            {(files && files.length) || 0}
          </div>
          <div className="text-xs">Content Files</div>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span>{(files && files.length) || 0} total</span>
          <span className="text-orange-500">
            {(files && files.filter(f => f.modified).length) || 0} unsaved
          </span>
        </div>
      </div>
    </div>
  );
}