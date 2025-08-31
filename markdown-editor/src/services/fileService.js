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