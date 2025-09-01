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
    { icon: Heading1, action: () => onInsert('# '), tooltip: 'Heading 1' },
    { icon: Heading2, action: () => onInsert('## '), tooltip: 'Heading 2' },
    { icon: Heading3, action: () => onInsert('### '), tooltip: 'Heading 3' },
    { icon: Bold, action: () => onInsert('**text**'), tooltip: 'Bold' },
    { icon: Italic, action: () => onInsert('*text*'), tooltip: 'Italic' },
    { icon: Underline, action: () => onInsert('<u>text</u>'), tooltip: 'Underline' },
    { icon: List, action: () => onInsert('\n* '), tooltip: 'Bullet List' },
    { icon: ListOrdered, action: () => onInsert('\n1. '), tooltip: 'Numbered List' },
    { icon: Link, action: () => onInsert('[text](url)'), tooltip: 'Link' },
    { icon: Image, action: () => onInsert('![alt](url)'), tooltip: 'Image' },
    { icon: Code, action: () => onInsert('`code`'), tooltip: 'Inline Code' },
    { icon: Quote, action: () => onInsert('\n> '), tooltip: 'Blockquote' },
  ];

  const handleCodeBlock = () => {
    onInsert('\n```\ncode here\n```\n');
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
        title={isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
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
      
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
      
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
          title={isPreviewMode ? 'Show Editor' : 'Show Preview'}
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
            title="Save All Files"
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
          title="Save File"
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