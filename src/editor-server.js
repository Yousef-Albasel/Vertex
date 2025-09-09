#!/usr/bin/env node
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for the React app
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Get the project directory (where the server is running from)
const PROJECT_DIR = process.cwd();
const CONTENT_DIR = path.join(PROJECT_DIR, 'content');

// Ensure content directory exists
async function ensureDirectories() {
  await fs.ensureDir(CONTENT_DIR);
}

// Initialize directories on startup
ensureDirectories();

// Recursive function to get all markdown files from directories
async function getMarkdownFilesRecursively(dirPath, basePath = '') {
  const files = [];
  
  if (!(await fs.pathExists(dirPath))) {
    return files;
  }
  
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item.name);
    const relativePath = basePath ? `${basePath}/${item.name}` : item.name;
    
    if (item.isDirectory()) {
      // Recursively get files from subdirectories
      const subFiles = await getMarkdownFilesRecursively(itemPath, relativePath);
      files.push(...subFiles);
    } else if (item.name.endsWith('.md')) {
      const stats = await fs.stat(itemPath);
      files.push({
        name: item.name,
        path: relativePath,
        directory: 'content',
        folder: basePath || '',
        lastModified: stats.mtime.toISOString(),
        size: stats.size
      });
    }
  }
  
  return files;
}

// Get all markdown files from content directory
app.get('/api/files', async (req, res) => {
  try {
    const files = await getMarkdownFilesRecursively(CONTENT_DIR, 'content');
    
    // Sort by last modified (newest first)
    files.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    console.log(`📁 Found ${files.length} files:`, files.map(f => f.path));
    
    res.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Middleware to handle file operations without using wildcards
app.use('/api/file', (req, res, next) => {
  // Extract the file path from the URL after /api/file/
  const urlPath = req.url;
  
  // Remove leading slash if present
  const filePath = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;
  
  // Store the file path in the request object
  req.filePath = decodeURIComponent(filePath);
  
  console.log(`File operation: ${req.method} ${req.filePath}`);
  
  next();
});

// Handle file operations based on HTTP method
app.use('/api/file', async (req, res) => {
  try {
    const filePath = req.filePath;
    const fullPath = path.join(PROJECT_DIR, filePath);
    
    // Security check: ensure the path is within our project directory
    if (!fullPath.startsWith(PROJECT_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (req.method === 'GET') {
      // Get file content
      if (!await fs.pathExists(fullPath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      const content = await fs.readFile(fullPath, 'utf-8');
      const stats = await fs.stat(fullPath);
      
      // Parse frontmatter if it exists
      let frontMatter = {};
      let markdownContent = content;
      try {
        const parsed = matter(content);
        frontMatter = parsed.data;
        markdownContent = parsed.content;
      } catch (e) {
        // If parsing fails, treat as plain markdown
      }
      
      res.json({
        content,
        frontMatter,
        markdownContent,
        lastModified: stats.mtime.toISOString(),
        size: stats.size
      });
      
    } else if (req.method === 'POST') {
      // Save/create file
      const { content } = req.body;
      
      // Ensure the directory exists
      await fs.ensureDir(path.dirname(fullPath));
      
      // Write the file
      await fs.writeFile(fullPath, content || '', 'utf-8');
      
      const stats = await fs.stat(fullPath);
      
      console.log(`💾 Saved: ${filePath}`);
      
      res.json({ 
        success: true, 
        lastModified: stats.mtime.toISOString(),
        size: stats.size
      });
      
    } else if (req.method === 'DELETE') {
      // Delete file
      if (!await fs.pathExists(fullPath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      await fs.unlink(fullPath);
      
      console.log(`🗑️ Deleted: ${filePath}`);
      
      res.json({ success: true });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error(`Error handling file operation for ${req.filePath}:`, error);
    res.status(500).json({ error: `Failed to ${req.method.toLowerCase()} file` });
  }
});

// Create new folder
app.post('/api/folders', async (req, res) => {
  try {
    const { folderPath, createIndex = false } = req.body;
    
    if (!folderPath) {
      return res.status(400).json({ error: 'Folder path is required' });
    }
    
    const fullPath = path.join(PROJECT_DIR, folderPath);
    
    // Security check
    if (!fullPath.startsWith(PROJECT_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Create the folder
    await fs.ensureDir(fullPath);
    
    // Create _index.md if requested (for series)
    if (createIndex) {
      const indexPath = path.join(fullPath, '_index.md');
      const folderName = path.basename(folderPath);
      const indexContent = `---
title: "${folderName}"
description: ""
category: ""
date: "${new Date().toISOString().split('T')[0]}"
layout: "series"
---

# ${folderName}

This is a series about ${folderName}.
`;
      
      await fs.writeFile(indexPath, indexContent);
      console.log(`📁 Created series folder: ${folderPath} with _index.md`);
    } else {
      console.log(`📁 Created folder: ${folderPath}`);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Rename folder
app.put('/api/folders', async (req, res) => {
  try {
    const { oldPath, newName } = req.body;
    
    if (!oldPath || !newName) {
      return res.status(400).json({ error: 'Old path and new name are required' });
    }
    
    const fullOldPath = path.join(PROJECT_DIR, oldPath);
    const pathParts = oldPath.split('/');
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join('/');
    const fullNewPath = path.join(PROJECT_DIR, newPath);
    
    // Security checks
    if (!fullOldPath.startsWith(PROJECT_DIR) || !fullNewPath.startsWith(PROJECT_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if old folder exists
    if (!await fs.pathExists(fullOldPath)) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // Check if new folder already exists
    if (await fs.pathExists(fullNewPath)) {
      return res.status(409).json({ error: 'A folder with that name already exists' });
    }
    
    // Rename the folder atomically
    await fs.move(fullOldPath, fullNewPath);
    
    console.log(`📁 Renamed folder: ${oldPath} -> ${newPath}`);
    
    res.json({ success: true, newPath });
  } catch (error) {
    console.error('Error renaming folder:', error);
    res.status(500).json({ error: 'Failed to rename folder' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    projectDir: PROJECT_DIR,
    contentDir: CONTENT_DIR,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Vertex Editor API Server running at http://localhost:${PORT}`);
  console.log(`📂 Project directory: ${PROJECT_DIR}`);
  console.log(`📂 Content directory: ${CONTENT_DIR}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET    /api/health');
  console.log('  GET    /api/files');
  console.log('  GET    /api/file/{filePath}');
  console.log('  POST   /api/file/{filePath}');
  console.log('  DELETE /api/file/{filePath}');
  console.log('  POST   /api/folders');
  console.log('  PUT    /api/folders');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔴 Shutting down Vertex Editor API Server...');
  process.exit(0);
});

module.exports = app;