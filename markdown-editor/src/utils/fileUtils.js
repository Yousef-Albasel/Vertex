export const createDefaultContent = (fileName, directory) => {
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

export const createWelcomeContent = () => `# Welcome to Vertex Markdown Editor

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

export const createOfflineContent = (apiBase) => `# Editor in Offline Mode

Cannot connect to the API server at \`${apiBase}\`

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

export const validateFileName = (fileName) => {
  if (!fileName) {
    return { valid: false, error: 'File name is required' };
  }
  
  if (!fileName.endsWith('.md')) {
    return { valid: false, error: 'File name must end with .md' };
  }
  
  if (fileName.includes('/') || fileName.includes('\\')) {
    return { valid: false, error: 'File name cannot contain path separators' };
  }
  
  return { valid: true };
};

export const getConnectionStatus = (error) => {
  if (error) {
    return { status: 'offline', color: 'red', text: 'Offline' };
  }
  return { status: 'online', color: 'green', text: 'Connected' };
};

export const parseUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    file: urlParams.get('file'),
    create: urlParams.get('create') === 'true'
  };
};