<img width="1599" height="730" alt="image" src="https://github.com/user-attachments/assets/3d6c2de6-6e72-4ebf-84a9-f1cf6589e1dc" /><center>
<h1> Vertex - Fast and Powerful Static Site Generator </h1>
<img align="center" src="data/graphics/vifm.svg"/>

[![npm version](https://img.shields.io/npm/v/vertex-ssg.svg?style=flat&color=blue)](https://www.npmjs.com/package/vertex-ssg)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Yousef-Albasel/vertex/ci.yml?branch=main&style=flat&color=brightgreen)](https://github.com/Yousef-Albasel/vertex/actions)
[![License](https://img.shields.io/github/license/Yousef-Albasel/vertex?style=flat&color=yellow)](./LICENSE)
[![Issues](https://img.shields.io/github/issues/Yousef-Albasel/vertex?style=flat&color=orange)](https://github.com/Yousef-Albasel/vertex/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](https://github.com/Yousef-Albasel/vertex/pulls)

Vertex is a static site generator originally created to support computer graphics demos inside static sites, and to cover the gaps in other static sites generators, providing a flexible and interactive experience while developing your own static site.

</center>
<features>
- **Built-in Markdown Editor** with API server  
- **Integrated File Manager** for content and pages  
- **Advanced Formatting & Graphics Engine Support**  
- **Fast Development Server** with live reload  
- **Flexible CLI commands** for building, serving, and editing  
</features>

<h2>ScreenShots </h2>

<img width="1599" height="730" alt="image" src="https://github.com/user-attachments/assets/dfa4530d-0a9f-4c22-bd88-e0c2ef9af136" />
<img width="1599" height="730" alt="image" src="https://ibb.co/jZ9BYWgN" />

<h2>Installation</h2>

```bash
# Clone the repository
git clone https://github.com/Yousef-Albasel/Vertex.git
cd Vertex

# Install dependencies
npm install

# Optionally, install globally
npm install -g .
```

<h2>Getting Started</h2>

For now, Vertex comes with a standard theme, defined in the layout folder, which you can change if you wanted, more themes are to come soon. Static folder is used to import your css files, images and custom fonts if needed. Conent folder is where all your content goes.

Vertex provides multiple commands for managing your site:

1. Build the site
`vertex build`

2. Start development server
`vertex serve`
Options:
-p, --port <port> → Port to serve on (default: 3000)
-d, --dir <directory> → Project directory (default: .)

3. Open the editor page
`vertex edit`
Options:
-f, --file <filename> → Open a specific file in the editor
-p, --port <port> → API server port (default: 3001)
-d, --dir <directory> → Project directory (default: .)

4. Create new conent
vertex create <filename>

Options:
-p, --port <port> → API server port (default: 3001)
-d, --dir <directory> → Project directory (default: .)
Example: 
```
# Create a new blog post
vertex create my-first-post
```

Example Workflow:
```
# Build the site
vertex build

# Run dev server
vertex serve

# Open editor for interactive writing
vertex edit

# Create new content
vertex create hello-world
```

The editor has all sorts of functionality for creating files, folders renaming them and deleting.

<h2> Project Structure </h2>

```
my-vertex-project/
├─ content/         # Blog posts (Markdown)
├─ layout/          # Layout templates
├─ static/          # Static assets (CSS, JS, images)
├─ public/           # Generated site output
└─ config.js # Project configuration
```

<h2> Configuration </h2>

A `config.js` file is provided when you first build your page, and it has default parameters. This is how you can set it up:

```
{
  // Basic site metadata
  "name": "Your Name",                // The site owner’s name, shown in headers/footers
  "description": "Short bio here",    // A tagline or about text
  "email": "you@example.com",         // Contact email
  "avatar": "/images/avatar.jpeg",    // Path to profile/avatar image
  "baseURL": "http://localhost:3000", // Base URL of the site (change in production)

  // Navigation links (appear in menus or navbars)
  "links": {
    "About Me": { 
      "href": "/about.html",              // Internal page or external URL
      "icon": "fa-solid fa-user"          // Font Awesome icon class
    },
    "Resume": { 
      "href": "https://example.com/resume.pdf",
      "icon": "fa-solid fa-file-alt"
    },
    "Categories": {
      "href": "/categories.html",
      "icon": "fa-solid fa-list"
    }
  },

  // Social icons (rendered as a row of social links)
  "social": [
    { "url": "mailto:you@example.com",     "icon": "fa-solid fa-envelope" },
    { "url": "https://github.com/yourname","icon": "fa-brands fa-github" },
    { "url": "https://twitter.com/handle", "icon": "fa-brands fa-twitter" }
  ]
}
```
<h2>License</h2>
MIT License © 2025 Yousef Albasel
