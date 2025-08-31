import { useState } from 'react';
import { FileText, Folder, FolderOpen, Trash2, Plus, FolderPlus } from 'lucide-react';

export default function Sidebar({ 
  files, 
  selectedFile, 
  onFileSelect, 
  onCreateFile, 
  onCreateFolder, 
  onDeleteFile, 
  isDarkMode 
}) {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['content']));

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

  const handleCreateFileInFolder = (folderPath) => {
    onCreateFile(folderPath);
  };

  const handleCreateFolder = (parentPath) => {
    onCreateFolder(parentPath);
  };

  // Extremely simple file tree - just show files grouped by immediate parent
  const buildFileTree = (files) => {
    const tree = {};
    
    if (!files || !Array.isArray(files)) {
      return tree;
    }
    
    // Group files by their immediate parent folder
    const folderGroups = {};
    
    files.forEach(file => {
      if (!file || !file.path) return;
      
      const parts = file.path.split('/');
      if (parts.length < 2) return; // Skip files without folders
      
      const folderPath = parts.slice(0, -1).join('/');
      
      if (!folderGroups[folderPath]) {
        folderGroups[folderPath] = [];
      }
      folderGroups[folderPath].push(file);
    });
    
    // Convert to tree structure
    Object.keys(folderGroups).forEach(folderPath => {
      const parts = folderPath.split('/');
      let current = tree;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {
            type: 'folder',
            files: i === parts.length - 1 ? folderGroups[folderPath] : [],
            children: {},
            path: parts.slice(0, i + 1).join('/')
          };
        }
        
        // If this is the final part, assign the files
        if (i === parts.length - 1) {
          current[part].files = folderGroups[folderPath];
        }
        
        current = current[part].children;
      }
    });
    
    return tree;
  };

  const renderTree = (tree, depth = 0) => {
    return Object.entries(tree).map(([name, node]) => {
      if (node.type === 'folder') {
        const isExpanded = expandedFolders.has(node.path);
        const hasFiles = node.files && Array.isArray(node.files) && node.files.length > 0;
        const hasSubfolders = Object.keys(node.children || {}).length > 0;
        const totalFiles = (node.files && Array.isArray(node.files)) ? node.files.length : 0;
        
        return (
          <div key={node.path} className="mb-1">
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleFolder(node.path)}
                className={`flex items-center gap-1 flex-1 text-left p-1 rounded text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
                style={{ paddingLeft: `${depth * 8 + 4}px` }}
              >
                {isExpanded ? 
                  <FolderOpen size={16} className="text-blue-600" /> : 
                  <Folder size={16} className="text-blue-600" />
                }
                {name}/
                <span className={`ml-1 text-xs px-1 rounded ${
                  isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                }`}>
                  {totalFiles}
                </span>
              </button>
              
              <div className="flex gap-1">
                <button
                  onClick={() => handleCreateFileInFolder(node.path)}
                  className={`p-1 rounded transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                      : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                  }`}
                  title="New file in folder"
                >
                  <Plus size={12} />
                </button>
                <button
                  onClick={() => handleCreateFolder(node.path)}
                  className={`p-1 rounded transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                      : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                  }`}
                  title="New subfolder"
                >
                  <FolderPlus size={12} />
                </button>
              </div>
            </div>
            
            {isExpanded && (
              <div className="mt-1">
                {hasFiles && node.files.map((file, index) => (
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
                    
                    {(files && files.length > 1) && (
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
                
                {hasSubfolders && renderTree(node.children || {}, depth + 1)}
                
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
            onClick={() => onCreateFile('')}
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
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
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