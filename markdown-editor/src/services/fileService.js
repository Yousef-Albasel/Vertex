const API_BASE = 'http://localhost:3001/api';

export const fileService = {
  async loadFiles() {
    const response = await fetch(`${API_BASE}/files`);
    if (!response.ok) {
      throw new Error(`Failed to load files: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async loadFileContent(directory, filename) {
    const response = await fetch(`${API_BASE}/files/${directory}/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async saveFile(directory, filename, content) {
    const response = await fetch(`${API_BASE}/files/${directory}/${filename}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save file: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },

  async deleteFile(directory, filename) {
    const response = await fetch(`${API_BASE}/files/${directory}/${filename}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },

  async saveMultipleFiles(files) {
    const savePromises = files.map(async (file) => {
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
    
    return Promise.all(savePromises);
  }
};