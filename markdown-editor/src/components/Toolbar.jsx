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
  SidebarOpen
} from 'lucide-react';

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
  hasModifiedFiles
}) {
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
      icon: List, 
      action: () => onFormatText('list'), 
      tooltip: 'Bullet List (Ctrl+Shift+L)',
      shortcut: 'Ctrl+Shift+L'
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
      
      {/* Code block button */}
      <button
        onClick={handleCodeBlock}
        className={`p-2 rounded transition-colors ${
          isDarkMode
            ? 'hover:bg-gray-700 text-gray-300'
            : 'hover:bg-gray-200 text-gray-700'
        }`}
        title="Code Block (Ctrl+Shift+`)"
        disabled={!selectedFile}
      >
        <Code size={16} />
        <span className="text-xs ml-1">{ }</span>
      </button>
      
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
      </div>
    </div>
  );
}