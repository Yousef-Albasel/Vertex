import { useState, useEffect } from 'react';
import { fileService } from '../services/fileService';
import { 
  createDefaultContent, 
  createWelcomeContent, 
  createOfflineContent,
  validateFileName,
  parseUrlParams 
} from '../utils/fileUtils';

const API_BASE = 'http://localhost:3001/api';

export const useFileManager = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load files from server on mount
  useEffect(() => {
    console.log('useFileManager: Loading files...');
    loadFiles();
    
    // Check URL parameters for specific file to open
    const { file: fileParam, create } = parseUrlParams();
    if (fileParam) {
      console.log('URL param file:', fileParam, 'create:', create);
      // Wait for files to load, then open the specific file
      setTimeout(() => {
        openSpecificFile(fileParam, create);
      }, 1000);
    }
  }, []);

  const loadFiles = async () => {
    console.log('loadFiles: Starting...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('loadFiles: Calling fileService.loadFiles()...');
      const fileList = await fileService.loadFiles();
      console.log('loadFiles: Received files:', fileList);
      
      if (fileList.length === 0) {
        console.log('loadFiles: No files found, creating welcome file...');
        // Create a default welcome file
        const welcomeFile = {
          name: 'welcome.md',
          path: 'content/welcome.md',
          directory: 'content',
          folder: '',
          content: createWelcomeContent(),
          modified: true,
          lastModified: new Date().toISOString()
        };
        
        setFiles([welcomeFile]);
        setSelectedFile(welcomeFile);
        console.log('loadFiles: Set welcome file');
      } else {
        console.log('loadFiles: Setting files to state:', fileList);
        setFiles(fileList);
        
        // Auto-select and load content for the first file if no file is currently selected
        if (fileList.length > 0 && !selectedFile) {
          console.log('loadFiles: Loading content for first file:', fileList[0]);
          try {
            const firstFile = fileList[0];
            const fileData = await fileService.loadFileContent(firstFile.path);
            console.log('loadFiles: Received content for first file:', fileData);
            
            const fullFile = { 
              ...firstFile, 
              content: fileData.content,
              frontMatter: fileData.frontMatter,
              lastModified: fileData.lastModified
            };
            
            console.log('loadFiles: Setting first file as selected with content');
            setSelectedFile(fullFile);
            
          } catch (err) {
            console.error('loadFiles: Error loading first file content:', err);
            // Just select the file without content - user can click to load it
            setSelectedFile(fileList[0]);
          }
        }
      }
    } catch (err) {
      console.error('loadFiles: Error loading files:', err);
      setError(`Cannot connect to API server. Make sure the server is running on ${API_BASE}`);
      
      // Fallback: Create offline mode file
      const offlineFile = {
        name: 'offline.md',
        path: 'content/offline.md',
        directory: 'content',
        folder: '',
        content: createOfflineContent(API_BASE),
        modified: false,
        lastModified: new Date().toISOString()
      };
      
      console.log('loadFiles: Setting offline file');
      setFiles([offlineFile]);
      setSelectedFile(offlineFile);
    } finally {
      setLoading(false);
      console.log('loadFiles: Loading complete');
    }
  };

  const openSpecificFile = async (filePath, createIfNotExists = false) => {
    console.log('openSpecificFile:', filePath, 'create:', createIfNotExists);
    const file = files.find(f => f.path === filePath || f.name === filePath.split('/').pop());
    
    if (file) {
      await handleFileSelect(file);
    } else if (createIfNotExists) {
      // Create new file if it doesn't exist
      const fileName = filePath.split('/').pop();
      const pathParts = filePath.split('/');
      const directory = pathParts[0] === 'content' ? 'content' : 'content';
      const folder = pathParts.slice(1, -1).join('/');
      
      await handleCreateFile(folder, fileName);
    }
  };

  const handleFileSelect = async (file) => {
    console.log('handleFileSelect:', file);
    if (file.content !== undefined) {
      // File content already loaded
      console.log('handleFileSelect: Content already loaded');
      setSelectedFile(file);
      return;
    }

    try {
      console.log('handleFileSelect: Loading content for', file.path);
      const fileData = await fileService.loadFileContent(file.path);
      console.log('handleFileSelect: Received file data:', fileData);
      
      const fullFile = { 
        ...file, 
        content: fileData.content,
        frontMatter: fileData.frontMatter,
        lastModified: fileData.lastModified
      };
      
      console.log('handleFileSelect: Setting selected file:', fullFile);
      setSelectedFile(fullFile);
      
      // Update the file in the files array
      setFiles(prev => prev.map(f => f.path === file.path ? fullFile : f));
      
    } catch (err) {
      console.error('handleFileSelect: Error loading file:', err);
      setError(`Error loading file "${file.name}": ${err.message}`);
    }
  };

  const handleContentChange = (newContent) => {
    console.log('handleContentChange: New content length:', newContent?.length);
    if (!selectedFile) return;
    
    const updatedFiles = files.map(file => 
      file.path === selectedFile.path 
        ? { ...file, content: newContent, modified: true }
        : file
    );
    
    setFiles(updatedFiles);
    setSelectedFile({ ...selectedFile, content: newContent, modified: true });
  };

  const handleCreateFile = async (folderPath = '', fileName = null) => {
    console.log('handleCreateFile: folderPath:', folderPath, 'fileName:', fileName);

    // Get filename from user if not provided
    const finalFileName = fileName || prompt('Enter file name (with .md extension):');
    if (!finalFileName) return;

    const validation = validateFileName(finalFileName);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Normalize folderPath so it’s always relative to "content"
    let cleanFolderPath = folderPath.replace(/^content\//, '');

    // Build the full file path
    const filePath = cleanFolderPath
      ? `content/${cleanFolderPath}/${finalFileName}`
      : `content/${finalFileName}`;

    // Check if file already exists
    if (files.some(file => file.path === filePath)) {
      alert('A file with this name already exists!');
      return;
    }

    try {
      console.log('handleCreateFile: Creating file on server:', filePath);

      const defaultContent = createDefaultContent(finalFileName, 'content');

      await fileService.saveFile(filePath, defaultContent);

      console.log('handleCreateFile: File created on server, refreshing file list...');
      await loadFiles();

      const newFile = files.find(f => f.path === filePath);
      if (newFile) {
        await handleFileSelect(newFile);
      }

    } catch (err) {
      console.error('handleCreateFile: Error creating file:', err);
      setError(`Error creating file "${finalFileName}": ${err.message}`);
    }
  };

  const handleCreateFolder = async (parentPath = 'content') => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;
    
    const cleanFolderName = folderName.toLowerCase().replace(/\s+/g, '-');
    const folderPath = `${parentPath}/${cleanFolderName}`;
    const isSeries = confirm('Create as a series? (This will add an _index.md file)');
    
    try {
      console.log('handleCreateFolder: Creating folder:', folderPath, 'isSeries:', isSeries);
      await fileService.createFolder(folderPath, isSeries);
      console.log('handleCreateFolder: Folder created, refreshing files...');
      await loadFiles();
      console.log(`Successfully created folder: ${folderPath}`);
    } catch (err) {
      console.error('Error creating folder:', err);
      setError(`Error creating folder "${folderName}": ${err.message}`);
    }
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
      await fileService.deleteFile(fileToDelete.path);

      const updatedFiles = files.filter(file => file.path !== fileToDelete.path);
      setFiles(updatedFiles);
      
      // If the deleted file was selected, select the first remaining file
      if (selectedFile?.path === fileToDelete.path) {
        if (updatedFiles.length > 0) {
          await handleFileSelect(updatedFiles[0]);
        } else {
          setSelectedFile(null);
        }
      }
      
      console.log(`Successfully deleted file: ${fileToDelete.name}`);
      
    } catch (err) {
      console.error('Error deleting file:', err);
      setError(`Error deleting file "${fileToDelete.name}": ${err.message}`);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    try {
      const result = await fileService.saveFile(selectedFile.path, selectedFile.content);
      
      // Update the file to mark it as saved
      const updatedFiles = files.map(file => 
        file.path === selectedFile.path 
          ? { ...file, modified: false, lastModified: result.lastModified || new Date().toISOString() }
          : file
      );
      
      setFiles(updatedFiles);
      setSelectedFile({ 
        ...selectedFile, 
        modified: false, 
        lastModified: result.lastModified || new Date().toISOString() 
      });
      
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
      const savedFiles = await fileService.saveMultipleFiles(modifiedFiles);
      
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

  const handleRefreshFiles = async () => {
    await loadFiles();
  };

  const clearError = () => {
    setError(null);
  };

  // Debug: Log state changes
  useEffect(() => {
    console.log('useFileManager state update:');
    console.log('- files:', files);
    console.log('- files length:', files.length);
    console.log('- selectedFile:', selectedFile);
    console.log('- selectedFile name:', selectedFile?.name);
    console.log('- selectedFile path:', selectedFile?.path);
    console.log('- selectedFile content length:', selectedFile?.content?.length);
    console.log('- loading:', loading);
    console.log('- error:', error);
  }, [files, selectedFile, loading, error]);

  return {
    // State
    files,
    selectedFile,
    loading,
    error,
    
    // Actions
    handleFileSelect,
    handleContentChange,
    handleCreateFile,
    handleCreateFolder,
    handleDeleteFile,
    handleSave,
    handleSaveAll,
    handleRefreshFiles,
    clearError,
    
    // Computed values
    hasModifiedFiles: files.some(file => file.modified)
  };
};