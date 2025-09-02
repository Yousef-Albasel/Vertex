const API_BASE = 'http://localhost:3001/api';

export const fileService = {
  // Load all files
  async loadFiles() {
    const response = await fetch(`${API_BASE}/files`);
    if (!response.ok) {
      throw new Error(`Failed to load files: ${response.statusText}`);
    }
    return response.json();
  },

  // Load content of a specific file
  async loadFileContent(filePath) {
    const response = await fetch(`${API_BASE}/file/${filePath}`);
    if (!response.ok) {
      throw new Error(`Failed to load file: ${response.statusText}`);
    }
    return response.json();
  },

  // Save a file
  async saveFile(filePath, content) {
    const response = await fetch(`${API_BASE}/file/${filePath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save file: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Save multiple files
  async saveMultipleFiles(files) {
    const savePromises = files.map(file => 
      this.saveFile(file.path, file.content).then(result => ({
        ...file,
        modified: false,
        lastModified: result.lastModified || new Date().toISOString()
      }))
    );
    
    return Promise.all(savePromises);
  },

  // Delete a file
  async deleteFile(filePath) {
    const response = await fetch(`${API_BASE}/file/${filePath}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Rename a file
  async renameFile(oldPath, newName) {
    try {
      // First, get the file content
      const fileData = await this.loadFileContent(oldPath);
      
      // Determine new path
      const pathParts = oldPath.split('/');
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join('/');
      
      // Save file with new name
      await this.saveFile(newPath, fileData.content);
      
      // Delete old file
      await this.deleteFile(oldPath);
      
      return { success: true, newPath };
    } catch (error) {
      throw new Error(`Failed to rename file: ${error.message}`);
    }
  },

  // Rename a folder (client-side implementation)
  async renameFolder(oldPath, newName) {
    try {
      // Get all files in the folder
      const allFiles = await this.loadFiles();
      const folderFiles = allFiles.filter(file => file.path.startsWith(oldPath + '/'));
      
      if (folderFiles.length === 0) {
        // Empty folder - just create the new folder
        const pathParts = oldPath.split('/');
        pathParts[pathParts.length - 1] = newName;
        const newPath = pathParts.join('/');
        
        await this.createFolder(newPath, false);
        return { success: true, newPath };
      }
      
      // For folders with files, we need to move each file
      const pathParts = oldPath.split('/');
      pathParts[pathParts.length - 1] = newName;
      const newFolderPath = pathParts.join('/');
      
      // Create new folder
      await this.createFolder(newFolderPath, false);
      
      // Move all files to the new folder
      for (const file of folderFiles) {
        const fileData = await this.loadFileContent(file.path);
        const newFilePath = file.path.replace(oldPath, newFolderPath);
        
        await this.saveFile(newFilePath, fileData.content);
        await this.deleteFile(file.path);
      }
      
      return { success: true, newPath: newFolderPath };
    } catch (error) {
      throw new Error(`Failed to rename folder: ${error.message}`);
    }
  },

  // Create a folder
  async createFolder(folderPath, createIndex = false) {
    const response = await fetch(`${API_BASE}/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ folderPath, createIndex })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create folder: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Check server health
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      throw new Error(`Cannot connect to API server: ${error.message}`);
    }
  }
};