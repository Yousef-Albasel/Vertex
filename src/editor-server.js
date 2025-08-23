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
const PAGES_DIR = path.join(PROJECT_DIR, 'pages');

// Ensure content directory exists
async function ensureDirectories() {
  await fs.ensureDir(CONTENT_DIR);
  await fs.ensureDir(PAGES_DIR);
}

// Initialize directories on startup
ensureDirectories();

// Get all markdown files from both content and pages directories
app.get('/api/files', async (req, res) => {
  try {
    const files = [];
    
    // Get files from content directory
    if (await fs.pathExists(CONTENT_DIR)) {
      const contentFiles = await fs.readdir(CONTENT_DIR);
      const contentMarkdownFiles = contentFiles.filter(f => f.endsWith('.md'));
      
      for (const file of contentMarkdownFiles) {
        const filePath = path.join(CONTENT_DIR, file);
        const stats = await fs.stat(filePath);
        files.push({
          name: file,
          path: `content/${file}`,
          directory: 'content',
          lastModified: stats.mtime.toISOString(),
          size: stats.size
        });
      }
    }
    
    // Get files from pages directory
    if (await fs.pathExists(PAGES_DIR)) {
      const pageFiles = await fs.readdir(PAGES_DIR);
      const pageMarkdownFiles = pageFiles.filter(f => f.endsWith('.md'));
      
      for (const file of pageMarkdownFiles) {
        const filePath = path.join(PAGES_DIR, file);
        const stats = await fs.stat(filePath);
        files.push({
          name: file,
          path: `pages/${file}`,
          directory: 'pages',
          lastModified: stats.mtime.toISOString(),
          size: stats.size
        });
      }
    }
    
    // Sort by last modified (newest first)
    files.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    res.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Get single file content
app.get('/api/files/:directory/:filename', async (req, res) => {
  try {
    const { directory, filename } = req.params;
    const filePath = `${directory}/${filename}`;
    const fullPath = path.join(PROJECT_DIR, filePath);
    
    // Security check: ensure the path is within our project directory
    if (!fullPath.startsWith(PROJECT_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
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
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Save/create file
app.post('/api/files/:directory/:filename', async (req, res) => {
  try {
    const { directory, filename } = req.params;
    const filePath = `${directory}/${filename}`;
    const fullPath = path.join(PROJECT_DIR, filePath);
    const { content } = req.body;
    
    // Security check
    if (!fullPath.startsWith(PROJECT_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Validate directory
    if (!['content', 'pages'].includes(directory)) {
      return res.status(400).json({ error: 'Invalid directory. Must be "content" or "pages"' });
    }
    
    // Ensure the directory exists
    await fs.ensureDir(path.dirname(fullPath));
    
    // Write the file
    await fs.writeFile(fullPath, content || '', 'utf-8');
    
    const stats = await fs.stat(fullPath);
    
    console.log(`📝 Saved: ${filePath}`);
    
    res.json({ 
      success: true, 
      lastModified: stats.mtime.toISOString(),
      size: stats.size
    });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ error: 'Failed to save file' });
  }
});

// Delete file
app.delete('/api/files/:directory/:filename', async (req, res) => {
  try {
    const { directory, filename } = req.params;
    const filePath = `${directory}/${filename}`;
    const fullPath = path.join(PROJECT_DIR, filePath);
    
    // Security check
    if (!fullPath.startsWith(PROJECT_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!await fs.pathExists(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    await fs.unlink(fullPath);
    
    console.log(`🗑️  Deleted: ${filePath}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    projectDir: PROJECT_DIR,
    contentDir: CONTENT_DIR,
    pagesDir: PAGES_DIR,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Vertex Editor API Server running at http://localhost:${PORT}`);
  console.log(`📁 Project directory: ${PROJECT_DIR}`);
  console.log(`📝 Content directory: ${CONTENT_DIR}`);
  console.log(`📄 Pages directory: ${PAGES_DIR}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET    /api/health');
  console.log('  GET    /api/files');
  console.log('  GET    /api/files/:directory/:filename');
  console.log('  POST   /api/files/:directory/:filename');
  console.log('  DELETE /api/files/:directory/:filename');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📴 Shutting down Vertex Editor API Server...');
  process.exit(0);
});

module.exports = app;