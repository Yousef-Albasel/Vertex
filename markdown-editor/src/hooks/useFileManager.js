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
    loadFiles();
    
    // Check URL parameters for specific file to open
    const { file: fileParam, create } = parseUrlParams();
    if (fileParam) {
      // Wait for files to load, then open the specific file
      setTimeout(() => {
        openSpecificFile(fileParam, create);
      }, 1000);
    }
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fileList = await fileService.loadFiles();
      
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
        content: createOfflineContent(API_BASE),
        modified: false,
        lastModified: new Date().toISOString()
      };
      
      setFiles([offlineFile]);
      setSelectedFile(offlineFile);
    } finally {
      setLoading(false);
    }
  };

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

  const handleFileSelect = async (file) => {
    if (file.content !== undefined) {
      // File content already loaded
      setSelectedFile(file);
      return;
    }

    try {
      const fileData = await fileService.loadFileContent(file.directory, file.name);
      const fullFile = { 
        ...file, 
        content: fileData.content,
        frontMatter: fileData.frontMatter,
        lastModified: fileData.lastModified
      };
      
      setSelectedFile(fullFile);
      
      // Update the file in the files array
      setFiles(prev => prev.map(f => f.path === file.path ? fullFile : f));
      
    } catch (err) {
      console.error('Error loading file:', err);
      setError(`Error loading file "${file.name}": ${err.message}`);
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
    
    const validation = validateFileName(fileName);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    // Ask for directory (could be enhanced with a proper dialog)
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
    
    setFiles(prev => [...prev, newFile]);
    setSelectedFile(newFile);
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
      await fileService.deleteFile(fileToDelete.directory, fileToDelete.name);

      const updatedFiles = files.filter(file => file.path !== fileToDelete.path);
      setFiles(updatedFiles);
      
      // If the deleted file was selected, select the first remaining file
      if (selectedFile?.path === fileToDelete.path) {
        setSelectedFile(updatedFiles[0]);
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
      const result = await fileService.saveFile(
        selectedFile.directory, 
        selectedFile.name, 
        selectedFile.content
      );
      
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
    handleDeleteFile,
    handleSave,
    handleSaveAll,
    handleRefreshFiles,
    clearError,
    
    // Computed values
    hasModifiedFiles: files.some(file => file.modified)
  };
};