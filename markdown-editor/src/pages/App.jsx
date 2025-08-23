import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/SideBar.jsx";
import MarkdownEditor from "../components/MarkdownEditor.jsx";
import PreviewPane from "../components/MarkdownPreview.jsx";
import Toolbar from "../components/Toolbar.jsx";

const API_BASE = 'http://localhost:3001/api';

export default function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved dark mode preference
    return localStorage.getItem('vertex-dark-mode') === 'true';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const insertRef = useRef();

  // Load files from server on component mount
  useEffect(() => {
    loadFiles();
    
    // Check URL parameters for specific file to open
    const urlParams = new URLSearchParams(window.location.search);
    const fileParam = urlParams.get('file');
    if (fileParam) {
      // Wait for files to loa, then open the specific file
      setTimeout(() => {
        openSpecificFile(fileParam, urlParams.get('create') === 'true');
      }, 1000);
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('vertex-dark-mode', isDarkMode);
  }, [isDarkMode]);

  const openSpecificFile = async (filePath, createIfNotExists = false) => {
    const file = files.find(f => f.path === filePath || f.name === filePath.split('/').pop());
    
    if (file) {
      await handleFileSelect(file);
    } else if (createIfNotExists) {
      // Create new file if it doesn't exist
      const fileName = filePath.split('/').pop();
      const directory = filePath.startsWith('pages/') ? 'pages' : 'content';
      
      const newFile = {
        name: fileName,
        path: filePath,
        directory: directory,
        content: createDefaultContent(fileName, directory),
        modified: true,
        lastModified: new Date().toISOString()
      };
      
      setFiles(prev => [...prev, newFile]);
      setSelectedFile(newFile);
    }
  };

  const createDefaultContent = (fileName, directory) => {
    const now = new Date().toISOString().split('T')[0];
    const title = fileName.replace('.md', '').replace(/[-_]/g, ' ');
    
    if (directory === 'pages') {
      return `---
title: "${title}"
layout: "page"
---

# ${title}

Start writing your page content here...
`;
    } else {
      return `---
title: "${title}"
date: "${now}"
category: ""
description: ""
---

# ${title}

Start writing your post content here...
`;
    }
  };

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+S or Cmd+S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
      
      // Ctrl+Shift+S or Cmd+Shift+S to save all
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        handleSaveAll();
      }

      // Ctrl+N or Cmd+N to create new file
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        handleCreateFile();
      }

      // Ctrl+P or Cmd+P to toggle preview
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        handleTogglePreview();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedFile, files]);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/files`);
      
      if (!response.ok) {
        throw new Error(`Failed to load files: ${response.status} ${response.statusText}`);
      }
      
      const fileList = await response.json();
      
      if (fileList.length === 0) {
        // Create a default welcome file
        const welcomeFile = {
          name: 'welcome.md',
          path: 'content/welcome.md',
          directory: 'content',
          content: createWelcomeContent(),
          modified: true,
          lastModified: new Date().toISOString()
        };
        
        setFiles([welcomeFile]);
        setSelectedFile(welcomeFile);
      } else {
        setFiles(fileList);
        if (fileList.length > 0 && !selectedFile) {
          setSelectedFile(fileList[0]);
        }
      }
    } catch (err) {
      console.error('Error loading files:', err);
      setError(`Cannot connect to API server. Make sure the server is running on ${API_BASE}`);
      
      // Fallback: Create offline mode file
      const offlineFile = {
        name: 'offline.md',
        path: 'content/offline.md',
        directory: 'content',
        content: createOfflineContent(),
        modified: false,
        lastModified: new Date().toISOString()
      };
      
      setFiles([offlineFile]);
      setSelectedFile(offlineFile);
    } finally {
      setLoading(false);
    }
  };

  const createWelcomeContent = () => `# Welcome to Vertex Markdown Editor

This is your web-based markdown editor integrated with your Vertex Static Site Generator!

## Getting Started

1. **Edit files**: Click on files in the sidebar to edit them
2. **Save files**: Use Ctrl+S or click the Save button
3. **Create files**: Click "New File" or use Ctrl+N
4. **Live preview**: Toggle with Ctrl+P or the Preview button

## Features

- 🚀 **Fast & Responsive** - React-powered editor
- 💾 **Auto-save** - Files saved to your Vertex project
- 🌙 **Dark Mode** - Easy on the eyes
- ⌨️ **Keyboard Shortcuts** - Boost your productivity
- 👁️ **Live Preview** - See changes instantly
- 📁 **Multi-directory** - Edit content/ and pages/ files

## Keyboard Shortcuts

- \`Ctrl+S\` - Save current file
- \`Ctrl+Shift+S\` - Save all files
- \`Ctrl+N\` - New file  
- \`Ctrl+P\` - Toggle preview

## CLI Integration

You can also use the Vertex CLI:

\`\`\`bash
# Open editor
vertex edit

# Open specific file
vertex edit -f mypost.md

# Create new content file
vertex create "My New Post"

# Create new page
vertex create "About Me" -t page
\`\`\`

Happy writing! ✨`;

  const createOfflineContent = () => `# Editor in Offline Mode

Cannot connect to the API server at \`${API_BASE}\`

## To fix this:

1. Make sure your Vertex project has the editor server running:
   \`\`\`bash
   vertex edit
   \`\`\`

2. Or run the server directly:
   \`\`\`bash
   node editor-server.js
   \`\`\`

3. Check that it's listening on the correct port (3001 by default)

## Expected API Endpoints:

- \`GET /api/files\` - List all markdown files
- \`GET /api/files/<path>\` - Get file content
- \`POST /api/files/<path>\` - Save/create file
- \`DELETE /api/files/<path>\` - Delete file

## Keyboard Shortcuts Still Work:

- \`Ctrl+S\` - Save (will retry API call)
- \`Ctrl+N\` - New file
- \`Ctrl+P\` - Toggle preview

Start your API server and refresh to reconnect!`;

  const handleFileSelect = async (file) => {
    if (file.content !== undefined) {
      // File content already loaded
      setSelectedFile(file);
      setIsPreviewMode(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/files/${file.directory}/${file.name}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
      }
      
      const fileData = await response.json();
      const fullFile = { 
        ...file, 
        content: fileData.content,
        frontMatter: fileData.frontMatter,
        lastModified: fileData.lastModified
      };
      
      setSelectedFile(fullFile);
      setIsPreviewMode(false);
      
      // Update the file in the files array
      setFiles(files.map(f => f.path === file.path ? fullFile : f));
      
    } catch (err) {
      console.error('Error loading file:', err);
      alert(`Error loading file "${file.name}": ${err.message}`);
    }
  };

  const handleContentChange = (newContent) => {
    if (!selectedFile) return;
    
    const updatedFiles = files.map(file => 
      file.path === selectedFile.path 
        ? { ...file, content: newContent, modified: true }
        : file
    );
    
    setFiles(updatedFiles);
    setSelectedFile({ ...selectedFile, content: newContent, modified: true });
  };

  const handleCreateFile = () => {
    const fileName = prompt('Enter file name (with .md extension):');
    if (!fileName) return;
    
    if (!fileName.endsWith('.md')) {
      alert('File name must end with .md');
      return;
    }
    
    // Ask for directory
    const directory = 'content';
    const filePath = `${directory}/${fileName}`;
    
    // Check if file already exists
    if (files.some(file => file.path === filePath)) {
      alert('A file with this name already exists!');
      return;
    }

    const newFile = { 
      name: fileName,
      path: filePath,
      directory: directory,
      content: createDefaultContent(fileName, directory),
      modified: true,
      lastModified: new Date().toISOString()
    };
    
    setFiles([...files, newFile]);
    setSelectedFile(newFile);
    setIsPreviewMode(false);
  };

  const handleDeleteFile = async (fileToDelete) => {
    if (files.length === 1) {
      alert('Cannot delete the last file!');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${fileToDelete.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/files/${fileToDelete.directory}/${fileToDelete.name}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.status} ${response.statusText}`);
      }

      const updatedFiles = files.filter(file => file.path !== fileToDelete.path);
      setFiles(updatedFiles);
      
      // If the deleted file was selected, select the first remaining file
      if (selectedFile?.path === fileToDelete.path) {
        setSelectedFile(updatedFiles[0]);
      }
      
      console.log(`Successfully deleted file: ${fileToDelete.name}`);
      
    } catch (err) {
      console.error('Error deleting file:', err);
      alert(`Error deleting file "${fileToDelete.name}": ${err.message}`);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    try {
      const response = await fetch(`${API_BASE}/files/${selectedFile.directory}/${selectedFile.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: selectedFile.content
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save file: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update the file to mark it as saved
      const updatedFiles = files.map(file => 
        file.path === selectedFile.path 
          ? { ...file, modified: false, lastModified: result.lastModified || new Date().toISOString() }
          : file
      );
      
      setFiles(updatedFiles);
      setSelectedFile({ ...selectedFile, modified: false, lastModified: result.lastModified || new Date().toISOString() });
      
      console.log(`Successfully saved file: ${selectedFile.name}`);
      
      // Clear any previous errors since save worked
      if (error) {
        setError(null);
      }
      
    } catch (err) {
      console.error('Error saving file:', err);
      setError(`Failed to save: ${err.message}`);
    }
  };

  const handleSaveAll = async () => {
    const modifiedFiles = files.filter(file => file.modified);
    
    if (modifiedFiles.length === 0) {
      return;
    }

    try {
      // Save all modified files concurrently
      const savePromises = modifiedFiles.map(async (file) => {
        const response = await fetch(`${API_BASE}/files/${file.directory}/${file.name}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: file.content
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to save ${file.name}: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        return { ...file, modified: false, lastModified: result.lastModified || new Date().toISOString() };
      });
      
      const savedFiles = await Promise.all(savePromises);
      
      // Update all files to mark them as saved
      const updatedFiles = files.map(file => {
        const savedFile = savedFiles.find(sf => sf.path === file.path);
        return savedFile || file;
      });
      
      setFiles(updatedFiles);
      
      if (selectedFile && selectedFile.modified) {
        const savedSelectedFile = savedFiles.find(sf => sf.path === selectedFile.path);
        if (savedSelectedFile) {
          setSelectedFile(savedSelectedFile);
        }
      }
      
      console.log(`Successfully saved ${modifiedFiles.length} file(s)`);
      
      // Clear any previous errors since save worked
      if (error) {
        setError(null);
      }
      
    } catch (err) {
      console.error('Error saving files:', err);
      setError(`Failed to save files: ${err.message}`);
    }
  };

  const handleInsert = (text) => {
    if (insertRef.current) {
      insertRef.current(text);
    }
  };

  const handleTogglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleRefreshFiles = async () => {
    await loadFiles();
  };

  const getConnectionStatus = () => {
    if (error) {
      return { status: 'offline', color: 'red', text: 'Offline' };
    }
    return { status: 'online', color: 'green', text: 'Connected' };
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading files from Vertex project...</p>
          <p className="text-sm opacity-60 mt-2">Connecting to {API_BASE}</p>
        </div>
      </div>
    );
  }

  const connectionStatus = getConnectionStatus();

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      <Sidebar 
        files={files}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onCreateFile={handleCreateFile}
        onDeleteFile={handleDeleteFile}
        isDarkMode={isDarkMode}
      />
      
      <div className="flex-1 flex flex-col">
        <Toolbar 
          onInsert={handleInsert}
          onSave={handleSave}
          onSaveAll={handleSaveAll}
          isPreviewMode={isPreviewMode}
          onTogglePreview={handleTogglePreview}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          selectedFile={selectedFile}
          hasModifiedFiles={files.some(file => file.modified)}
        />
        
        {error && (
          <div className={`mx-4 mt-2 p-3 rounded border ${
            isDarkMode 
              ? 'bg-red-900 border-red-700 text-red-200' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">⚠️ Connection Issue:</span>
                <span className="text-sm">{error}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleRefreshFiles}
                  className={`text-sm px-3 py-1 rounded transition-colors ${
                    isDarkMode
                      ? 'bg-red-800 hover:bg-red-700 text-red-100'
                      : 'bg-red-100 hover:bg-red-200 text-red-800'
                  }`}
                >
                  Retry
                </button>
                <button 
                  onClick={() => setError(null)}
                  className={`text-sm px-2 py-1 rounded transition-colors ${
                    isDarkMode
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 flex">
          {!isPreviewMode ? (
            <>
              <div className="flex-1 border-r dark:border-gray-700">
                <MarkdownEditor
                  value={selectedFile?.content}
                  onChange={handleContentChange}
                  onInsert={insertRef}
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className={`flex-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <PreviewPane markdown={selectedFile?.content} isDarkMode={isDarkMode} />
              </div>
            </>
          ) : (
            <div className={`flex-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <PreviewPane markdown={selectedFile?.content} isDarkMode={isDarkMode} />
            </div>
          )}
        </div>
        
        {selectedFile && (
          <div className={`px-4 py-2 text-sm border-t ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-gray-300' 
              : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
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
                {selectedFile.lastModified && (
                  <span className="text-xs opacity-60">
                    Modified: {new Date(selectedFile.lastModified).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="hidden sm:inline">Ctrl+S: Save</span>
                <span className="hidden sm:inline">Ctrl+P: Preview</span>
                <span className="hidden sm:inline">Ctrl+N: New</span>
                <span>{selectedFile.content?.length || 0} chars</span>
                <span className={`flex items-center gap-1 ${
                  connectionStatus.status === 'offline' ? 'text-red-500' : 'text-green-500'
                }`}>
                  ● {connectionStatus.text}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}