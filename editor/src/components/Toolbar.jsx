import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Eye,
  EyeOff,
  Save,
  SaveAll,
  Moon,
  Sun,
  Sidebar,
  Upload,
  SidebarOpen,
  ChevronDown,
  FileDown,
  Sparkles,
  Monitor
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Toolbar({ 
  onInsert, 
  onFormatText,
  onSave, 
  onSaveAll, 
  isPreviewMode, 
  onTogglePreview, 
  isDarkMode, 
  onToggleDarkMode,
  isSidebarVisible,
  onToggleSidebar,
  selectedFile,
  hasModifiedFiles,
  onAIRequest
}) {
  const [bulletDropdownOpen, setBulletDropdownOpen] = useState(false);
  const [aiDropdownOpen, setAIDropdownOpen] = useState(false);
  const bulletDropdownRef = useRef(null);
  const aiDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bulletDropdownRef.current && !bulletDropdownRef.current.contains(e.target)) {
        setBulletDropdownOpen(false);
      }
      if (aiDropdownRef.current && !aiDropdownRef.current.contains(e.target)) {
        setAIDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const bulletStyles = [
    { label: 'Dash (-)', char: '-', format: 'list-dash' },
    { label: 'Asterisk (*)', char: '*', format: 'list-asterisk' },
    { label: 'Plus (+)', char: '+', format: 'list-plus' },
  ];

  const handleBulletStyle = (style) => {
    onFormatText(style.format);
    setBulletDropdownOpen(false);
  };

  const handleAIOption = (mode) => {
    setAIDropdownOpen(false);
    if (onAIRequest) {
      onAIRequest(mode);
    }
  };

  // Export to PDF using browser print
  const handleExportPDF = () => {
    if (!selectedFile) return;
    
    // Get the preview content
    const previewElement = document.querySelector('.prose');
    if (!previewElement) {
      alert('Please switch to preview mode or split view to export PDF');
      return;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export PDF');
      return;
    }
    
    const fileName = selectedFile.name?.replace('.md', '') || 'document';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fileName}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            color: #333;
          }
          h1 { font-size: 2em; margin-top: 0; }
          h2 { font-size: 1.5em; }
          h3 { font-size: 1.25em; }
          pre {
            background: #f5f5f5;
            padding: 1em;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 0.9em;
          }
          code {
            background: #f5f5f5;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-size: 0.9em;
          }
          pre code { background: none; padding: 0; }
          blockquote {
            border-left: 4px solid #ddd;
            margin-left: 0;
            padding-left: 1em;
            color: #666;
          }
          img { max-width: 100%; height: auto; }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        ${previewElement.innerHTML}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
  
  const handleImageUpload = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  
  input.onchange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:3001/api/upload-image', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        const markdownImage = `\n![${file.name}](${data.path})\n`;
        onInsert(markdownImage);

      } catch (error) {
        console.error('Error uploading image:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }
  };
  
  input.click();
};

  const toolbarItems = [
    { 
      icon: Heading1, 
      action: () => onFormatText('h1'), 
      tooltip: 'Heading 1 (Ctrl+1)',
      shortcut: 'Ctrl+1'
    },
    { 
      icon: Heading2, 
      action: () => onFormatText('h2'), 
      tooltip: 'Heading 2 (Ctrl+2)',
      shortcut: 'Ctrl+2'
    },
    { 
      icon: Heading3, 
      action: () => onFormatText('h3'), 
      tooltip: 'Heading 3 (Ctrl+3)',
      shortcut: 'Ctrl+3'
    },
    { 
      icon: Bold, 
      action: () => onFormatText('bold'), 
      tooltip: 'Bold (Ctrl+B)',
      shortcut: 'Ctrl+B'
    },
    { 
      icon: Italic, 
      action: () => onFormatText('italic'), 
      tooltip: 'Italic (Ctrl+I)',
      shortcut: 'Ctrl+I'
    },
    { 
      icon: Underline, 
      action: () => onFormatText('underline'), 
      tooltip: 'Underline (Ctrl+U)',
      shortcut: 'Ctrl+U'
    },
    { 
      icon: ListOrdered, 
      action: () => onFormatText('orderedlist'), 
      tooltip: 'Numbered List (Ctrl+Shift+O)',
      shortcut: 'Ctrl+Shift+O'
    },
    { 
      icon: Link, 
      action: () => onFormatText('link'), 
      tooltip: 'Link (Ctrl+K)',
      shortcut: 'Ctrl+K'
    },
    { 
      icon: Image, 
      action: () => onInsert('![alt](url)'), 
      tooltip: 'Image',
      shortcut: null
    },
    {
    icon: Image,
    action: handleImageUpload,
    tooltip: 'Upload Image (or paste from clipboard)',
    shortcut: null
    },
    { 
      icon: Code, 
      action: () => onFormatText('code'), 
      tooltip: 'Inline Code (Ctrl+`)',
      shortcut: 'Ctrl+`'
    },
    { 
      icon: Quote, 
      action: () => onFormatText('quote'), 
      tooltip: 'Blockquote (Ctrl+Shift+>)',
      shortcut: 'Ctrl+Shift+>'
    },
  ];

  const handleCodeBlock = () => {
    onFormatText('codeblock');
  };

  const handleInsertShader = () => {
    const template = '\n```glsl-canvas\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n    vec2 uv = gl_FragCoord.xy / u_resolution;\n    vec3 col = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0, 2, 4));\n    gl_FragColor = vec4(col, 1.0);\n}\n```\n';
    onInsert(template);
  };
  
  return (
    <div className={`flex items-center gap-1 p-2 border-b flex-wrap ${
      isDarkMode 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      {/* Sidebar toggle - leftmost */}
      <button
        onClick={onToggleSidebar}
        className={`p-2 rounded transition-colors ${
          isDarkMode
            ? 'hover:bg-gray-700 text-gray-300'
            : 'hover:bg-gray-200 text-gray-700'
        }`}
        title={isSidebarVisible ? 'Hide Sidebar (Ctrl+Shift+B)' : 'Show Sidebar (Ctrl+Shift+B)'}
      >
        {isSidebarVisible ? <SidebarOpen size={16} /> : <Sidebar size={16} />}
      </button>
      
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
      
      {toolbarItems.map((item, index) => (
        <button
          key={index}
          onClick={item.action}
          className={`p-2 rounded transition-colors ${
            isDarkMode
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title={item.tooltip}
          disabled={!selectedFile}
        >
          <item.icon size={16} />
        </button>
      ))}

      {/* Shader Insert Button */}
      <button
        onClick={handleInsertShader}
        className={`p-2 rounded transition-colors ${
          isDarkMode
            ? 'hover:bg-gray-700 text-emerald-400'
            : 'hover:bg-gray-200 text-emerald-600'
        }`}
        title="Insert GLSL Shader Canvas"
        disabled={!selectedFile}
      >
        <Monitor size={16} />
      </button>
      
      {/* Bullet Style Dropdown */}
      <div className="relative" ref={bulletDropdownRef}>
        <button
          onClick={() => setBulletDropdownOpen(!bulletDropdownOpen)}
          className={`p-2 rounded transition-colors flex items-center gap-0.5 ${
            isDarkMode
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="Bullet List Styles"
          disabled={!selectedFile}
        >
          <List size={16} />
          <ChevronDown size={12} />
        </button>
        
        {bulletDropdownOpen && (
          <div className={`absolute top-full left-0 mt-1 py-1 rounded shadow-lg border z-50 min-w-[120px] ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            {bulletStyles.map((style) => (
              <button
                key={style.format}
                onClick={() => handleBulletStyle(style)}
                className={`w-full text-left px-3 py-1.5 text-sm ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* AI Dropdown */}
      <div className="relative" ref={aiDropdownRef}>
        <button
          onClick={() => setAIDropdownOpen(!aiDropdownOpen)}
          className={`p-2 rounded transition-colors flex items-center gap-0.5 ${
            isDarkMode
              ? 'hover:bg-gray-700 text-purple-400'
              : 'hover:bg-gray-200 text-purple-600'
          }`}
          title="AI Assistant"
          disabled={!selectedFile}
        >
          <Sparkles size={16} />
          <ChevronDown size={12} />
        </button>
        
        {aiDropdownOpen && (
          <div className={`absolute top-full left-0 mt-1 py-1 rounded shadow-lg border z-50 min-w-[160px] ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={() => handleAIOption('document')}
              className={`w-full text-left px-3 py-1.5 text-sm ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Review Document
            </button>
            <button
              onClick={() => handleAIOption('selection')}
              className={`w-full text-left px-3 py-1.5 text-sm ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
            Improve Selection
            </button>
          </div>
        )}
      </div>
            
      <div className="ml-auto flex gap-2">
        <button
          onClick={onToggleDarkMode}
          className={`p-2 rounded transition-colors flex items-center gap-1 ${
            isDarkMode
              ? 'hover:bg-gray-700 text-yellow-400'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        
        <button
          onClick={onTogglePreview}
          className={`p-2 rounded transition-colors flex items-center gap-1 ${
            isDarkMode
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title={isPreviewMode ? 'Show Editor (Ctrl+P)' : 'Show Preview (Ctrl+P)'}
          disabled={!selectedFile}
        >
          {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
          <span className="hidden sm:inline">
            {isPreviewMode ? 'Edit' : 'Preview'}
          </span>
        </button>
        
        {hasModifiedFiles && (
          <button
            onClick={onSaveAll}
            className={`p-2 rounded transition-colors flex items-center gap-1 ${
              isDarkMode
                ? 'hover:bg-gray-700 text-blue-400'
                : 'hover:bg-gray-200 text-blue-600'
            }`}
            title="Save All Files (Ctrl+Shift+S)"
          >
            <SaveAll size={16} />
            <span className="hidden sm:inline">Save All</span>
          </button>
        )}
        
        <button
          onClick={onSave}
          className={`p-2 rounded transition-colors flex items-center gap-1 ${
            selectedFile?.modified
              ? isDarkMode
                ? 'hover:bg-gray-700 text-green-400'
                : 'hover:bg-gray-200 text-green-600'
              : isDarkMode
                ? 'hover:bg-gray-700 text-gray-500'
                : 'hover:bg-gray-200 text-gray-400'
          }`}
          title="Save File (Ctrl+S)"
          disabled={!selectedFile}
        >
          <Save size={16} />
          <span className="hidden sm:inline">Save</span>
          {selectedFile?.modified && (
            <span className="w-2 h-2 bg-orange-500 rounded-full ml-1"></span>
          )}
        </button>
        
        <button
          onClick={handleExportPDF}
          className={`p-2 rounded transition-colors flex items-center gap-1 ${
            isDarkMode
              ? 'hover:bg-gray-700 text-purple-400'
              : 'hover:bg-gray-200 text-purple-600'
          }`}
          title="Export as PDF"
          disabled={!selectedFile}
        >
          <FileDown size={16} />
          <span className="hidden sm:inline">PDF</span>
        </button>
      </div>
    </div>
  );
}