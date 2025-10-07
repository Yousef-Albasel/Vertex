const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const IMAGES_DIR = path.join('F:', 'Dev', 'Vertex', 'static', 'images');
app.use('/images', express.static(IMAGES_DIR));
console.log(`Serving images from: ${IMAGES_DIR}`);

// Get the project directory (where the server is running from)
const PROJECT_DIR = process.cwd();
const CONTENT_DIR = path.join(PROJECT_DIR, 'content');

// Ensure content directory exists
async function ensureDirectories() {
  await fs.ensureDir(CONTENT_DIR);
  await fs.ensureDir(IMAGES_DIR);
}

// Initialize directories on startup
ensureDirectories();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and BMP are allowed.'));
    }
  }
});

// Upload image endpoint - handles clipboard paste and file uploads
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    
    // Get file extension from mimetype
    let ext = path.extname(req.file.originalname);
    if (!ext) {
      const mimeToExt = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/bmp': '.bmp'
      };
      ext = mimeToExt[req.file.mimetype] || '.png';
    }
    
    const filename = `paste-${timestamp}-${randomString}${ext}`;

    const imagePath = path.join(IMAGES_DIR, filename);
    await fs.writeFile(imagePath, req.file.buffer);
    const markdownPath = `http://localhost:3001/images/${filename}`;

    console.log(`📸 Uploaded image: ${filename} (${(req.file.size / 1024).toFixed(2)} KB)`);

    res.json({
      success: true,
      filename: filename,
      path: markdownPath,
      size: req.file.size,
      fullPath: imagePath
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: `Failed to upload image: ${error.message}` });
  }
});

// List all uploaded images
app.get('/api/images', async (req, res) => {
  try {
    if (!await fs.pathExists(IMAGES_DIR)) {
      return res.json({ images: [] });
    }

    const files = await fs.readdir(IMAGES_DIR);
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file))
      .map(file => ({
        filename: file,
        path: `/images/${file}`,
        fullPath: path.join(IMAGES_DIR, file)
      }));

    res.json({ images });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

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
    files.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    console.log(`📝 Found ${files.length} files:`, files.map(f => f.path));
    res.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Middleware to handle file operations
app.use('/api/file', (req, res, next) => {
  const urlPath = req.url;
  const filePath = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;
  req.filePath = decodeURIComponent(filePath);
  console.log(`File operation: ${req.method} ${req.filePath}`);
  next();
});

// Handle file operations based on HTTP method
app.use('/api/file', async (req, res) => {
  try {
    const filePath = req.filePath;
    const fullPath = path.join(PROJECT_DIR, filePath);
    
    if (!fullPath.startsWith(PROJECT_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (req.method === 'GET') {
      if (!await fs.pathExists(fullPath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      const content = await fs.readFile(fullPath, 'utf-8');
      const stats = await fs.stat(fullPath);
      
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
      const { content } = req.body;
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content || '', 'utf-8');
      const stats = await fs.stat(fullPath);
      console.log(`Saved: ${filePath}`);
      
      res.json({ 
        success: true, 
        lastModified: stats.mtime.toISOString(),
        size: stats.size
      });
      
    } else if (req.method === 'DELETE') {
      if (!await fs.pathExists(fullPath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      await fs.unlink(fullPath);
      console.log(`Deleted: ${filePath}`);
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
    
    if (!fullPath.startsWith(PROJECT_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await fs.ensureDir(fullPath);
    
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
      console.log(`Created series folder: ${folderPath} with _index.md`);
    } else {
      console.log(`Created folder: ${folderPath}`);
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
    
    if (!fullOldPath.startsWith(PROJECT_DIR) || !fullNewPath.startsWith(PROJECT_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!await fs.pathExists(fullOldPath)) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    if (await fs.pathExists(fullNewPath)) {
      return res.status(409).json({ error: 'A folder with that name already exists' });
    }
    
    await fs.move(fullOldPath, fullNewPath);
    console.log(`Renamed folder: ${oldPath} -> ${newPath}`);
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
    imagesDir: IMAGES_DIR,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Vertex Editor API Server running at http://localhost:${PORT}`);
  console.log( `Project directory: ${PROJECT_DIR}`);
  console.log(`Content directory: ${CONTENT_DIR}`);
  console.log(`Images directory: ${IMAGES_DIR}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET    /api/health');
  console.log('  GET    /api/files');
  console.log('  GET    /api/images');
  console.log('  GET    /api/file/{filePath}');
  console.log('  POST   /api/file/{filePath}');
  console.log('  POST   /api/upload-image');
  console.log('  DELETE /api/file/{filePath}');
  console.log('  POST   /api/folders');
  console.log('  PUT    /api/folders');
  console.log('  GET    /images/{filename} (static)');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down Vertex Editor API Server...');
  process.exit(0);
});

module.exports = app;