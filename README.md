<img width="1920" height="648" alt="a gradient white and purplish background with some icons and modern design on it to act as a background for designing a poster for a github repo, it needs not to have any text one it with a _V_ shaped ab (2)" src="https://github.com/user-attachments/assets/9a160921-49dc-4fd2-936a-07831b39d789" />

<h1> Vertex - Fast and Powerful Static Site Generator </h1>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Issues](https://img.shields.io/github/issues/Yousef-Albasel/vertex?style=flat&color=orange)](https://github.com/Yousef-Albasel/vertex/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](https://github.com/Yousef-Albasel/vertex/pulls)

Vertex is a static site generator originally created to support computer graphics demos inside static sites, and to cover the gaps in other static site generators, providing a flexible and interactive experience while developing your own static site.

---

##  Features

### Static Site Generator
- **Markdown-based content** with frontmatter support (title, description, date, category, series, images)
- **Syntax highlighting** for code blocks via highlight.js with Catppuccin-inspired color themes
- **Series support** — group related posts into ordered series with auto-generated index pages and prev/next navigation
- **Categories** — auto-generated category pages with post counts
- **Client-side pagination** — posts listing and home page paginate with smooth in-page navigation (6 posts per page)
- **Theming system** — switch between themes via `config.json`; each theme has its own templates and styles
- **Fast development server** with live reload

### Built-in Markdown Editor
- **Rich toolbar** with formatting buttons: bold, italic, underline, headers (H1–H3), lists (ordered/unordered with multiple bullet styles), blockquote, inline code, code blocks, links, and images
- **Live preview** — side-by-side markdown editing and rendered preview, togglable with a shortcut
- **Undo / Redo** — full history with debounced batching (up to 100 states), works via toolbar or keyboard shortcuts
- **Image upload** — drag-and-drop or click to upload images directly into posts
- **PDF export** — export the current post preview to PDF from the toolbar
- **AI-powered writing assistance** (optional, requires OpenAI API key):
  - *Improve Selection* — AI rewrites highlighted text
  - *Improve Full Document* — AI rewrites entire post
  - Accept or reject AI suggestions via a diff-style modal
- **Integrated file manager** — create, rename, delete files and folders; sidebar with file tree
- **Dark mode** — toggle between light and dark editor UI

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+S` | Save current file |
| `Ctrl+Shift+S` | Save all files |
| `Ctrl+N` | New file |
| `Ctrl+P` | Toggle preview |
| `Ctrl+Shift+B` | Toggle sidebar |
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+U` | Underline |
| `Ctrl+K` | Insert link |
| `` Ctrl+` `` | Inline code |
| `Ctrl+Shift+~` | Code block |
| `Ctrl+Shift+>` | Blockquote |
| `Ctrl+1/2/3` | H1 / H2 / H3 |
| `Ctrl+Shift+L` | Unordered list |
| `Ctrl+Shift+O` | Ordered list |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |

---

## 📸 Screenshots

<img width="1599" height="730" alt="image" src="https://github.com/user-attachments/assets/dfa4530d-0a9f-4c22-bd88-e0c2ef9af136" />

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/Yousef-Albasel/Vertex.git
cd Vertex

# Install dependencies
npm install

# Optionally, install globally
npm install -g .
```

---

## 📖 Getting Started

Vertex provides multiple commands for managing your site:

### CLI Commands

**Build the site**
```bash
vertex build
```

**Start development server**
```bash
vertex serve
```
| Option | Description | Default |
|---|---|---|
| `-p, --port <port>` | Port to serve on | `3000` |
| `-d, --dir <directory>` | Project directory | `.` |

**Open the editor**
```bash
vertex edit
```
| Option | Description | Default |
|---|---|---|
| `-f, --file <filename>` | Open a specific file | — |
| `-p, --port <port>` | API server port | `3001` |
| `-d, --dir <directory>` | Project directory | `.` |

**Create new content**
```bash
vertex create <filename>
```

**Theme management**
```bash
# Create a new theme
vertex theme create my-awesome-theme

# Set active theme
vertex theme set my-awesome-theme

# List all themes
vertex theme list
```

### Example Workflow

```bash
vertex build        # Build the site
vertex serve        # Run dev server at localhost:3000
vertex edit         # Open editor at localhost:3001
vertex create hello-world   # Create a new post
```

---

## 📁 Project Structure

```
my-vertex-project/
├── content/           # Blog posts (Markdown with frontmatter)
├── themes/            # Theme templates and styles
│   ├── minimal/       # Sidebar-based theme
│   │   ├── templates/ # Nunjucks HTML templates
│   │   └── static/    # CSS, images, fonts
│   └── clean/         # Top-nav modern theme
│       ├── templates/
│       └── static/
├── editor/            # Built-in React markdown editor
│   └── src/
│       ├── components/  # Editor UI (Toolbar, Sidebar, AIModal, etc.)
│       ├── hooks/       # useUndoRedo, useKeyboardShortcuts, useFileManager
│       └── services/    # AI service, file service
├── src/               # Core build engine
│   ├── build.js       # Static site builder
│   ├── cli.js         # CLI entry point
│   └── editor-server.js  # Editor API server
├── public/            # Generated site output (gitignored)
└── config.json        # Site configuration
```

---

## 🎨 Themes

Vertex ships with two built-in themes:

| Theme | Description |
|---|---|
| **minimal** | Fixed left sidebar, classic blog layout |
| **clean** | Top navigation bar, centered content, card-based with hover animations, Inter font |

Both themes include:
- Light and dark mode with smooth toggle
- Responsive mobile design
- Syntax-highlighted code blocks
- Series navigation
- Pagination
- Categories grid

### Switching Themes

Set the `theme` field in `config.json`:

```json
{
  "theme": "clean"
}
```

Then rebuild: `vertex build`

---

## ⚙️ Configuration

The `config.json` file in your project root controls site metadata, navigation, and theming:

```jsonc
{
  "name": "Your Name",                // Site name, shown in headers
  "description": "Short bio here",    // Tagline or about text
  "email": "you@example.com",         // Contact email
  "avatar": "/images/avatar.jpeg",    // Path to profile image
  "baseURL": "http://localhost:3000", // Base URL (change for production)
  "theme": "clean",                   // Active theme (minimal | clean)

  // Navigation links
  "links": {
    "About Me": { "href": "/aboutme.html", "icon": "fa-solid fa-user" },
    "Resume":   { "href": "https://example.com/resume.pdf", "icon": "fa-solid fa-file-alt" },
    "Categories": { "href": "/categories.html", "icon": "fa-solid fa-list" }
  },

  // Social icons
  "social": [
    { "url": "mailto:you@example.com",      "icon": "fa-solid fa-envelope" },
    { "url": "https://github.com/yourname", "icon": "fa-brands fa-github" },
    { "url": "https://twitter.com/handle",  "icon": "fa-brands fa-twitter" }
  ]
}
```

---

## AI Integration (Optional)

Vertex's editor supports AI-powered writing assistance via OpenAI. To enable:

1. Set the `OPENAI_API_KEY` environment variable
2. Launch the editor: `vertex edit`
3. Use the **✨ AI** dropdown in the toolbar to:
   - **Improve Selection** — rewrites highlighted text
   - **Improve Full Document** — rewrites the entire post

AI suggestions appear in a modal where you can accept or reject the changes.

---

## Deployment

Vertex generates a fully static `public/` directory that can be deployed to any static hosting:

**Netlify** — set the build command in `netlify.toml`:
```toml
[build]
  command = "node src/cli.js build"
  publish = "public"
```

> **Note:** Use `node src/cli.js build` instead of `npx vertex build` to avoid permission issues on Linux hosts.

---

## License

MIT License © 2025 Yousef Albasel
