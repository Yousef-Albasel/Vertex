import React, { useState, useRef, useCallback } from 'react';
import MarkdownEditor from './MarkdownEditor.jsx';
import PreviewPane from './MarkdownPreview.jsx';
import Toolbar from './Toolbar.jsx';
import AIModal from './AIModal.jsx';
import { getSuggestion } from '../services/aiService.js';

const MainEditor = ({ 
  selectedFile,
  isPreviewMode,
  isDarkMode,
  isSidebarVisible,
  hasModifiedFiles,
  onContentChange,
  onInsert,
  onSave,
  onSaveAll,
  onTogglePreview,
  onToggleDarkMode,
  onToggleSidebar,
  insertRef
}) => {
  // Resizable pane state (percentage for left pane)
  const [leftPaneWidth, setLeftPaneWidth] = useState(50);
  const [cursorInfo, setCursorInfo] = useState({ percent: 0, isAtBottom: false });
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  
  // AI Modal state
  const [aiModalOpen, setAIModalOpen] = useState(false);
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState(null);
  const [aiSuggestion, setAISuggestion] = useState('');
  const [aiOriginal, setAIOriginal] = useState('');
  const [aiIsFullDocument, setAIIsFullDocument] = useState(false);
  const [selectionRange, setSelectionRange] = useState(null);

  // Handle text formatting
  const handleFormatText = (format) => {
    if (insertRef.current && insertRef.current.format) {
      insertRef.current.format(format);
    }
  };

  const handleInsert = (text) => {
    if (insertRef.current && insertRef.current.insert) {
      insertRef.current.insert(text);
    }
  };

  const handleCursorPosition = useCallback((info) => {
    setCursorInfo(info);
  }, []);

  // Get selected text from editor
  const getSelectedText = () => {
    if (insertRef.current && insertRef.current.getSelection) {
      return insertRef.current.getSelection();
    }
    return null;
  };

  // Handle AI request
  const handleAIRequest = async (mode) => {
    if (!selectedFile?.content) return;
    
    setAIError(null);
    setAISuggestion('');
    setAIModalOpen(true);
    setAILoading(true);
    
    try {
      let selection = null;
      
      if (mode === 'selection') {
        const selInfo = getSelectedText();
        if (!selInfo || !selInfo.text) {
          setAIError('Please select some text first');
          setAILoading(false);
          return;
        }
        selection = selInfo.text;
        setSelectionRange({ start: selInfo.start, end: selInfo.end });
        setAIIsFullDocument(false);
      } else {
        setAIIsFullDocument(true);
        setSelectionRange(null);
      }
      
      setAIOriginal(selection || selectedFile.content);
      
      const result = await getSuggestion(selectedFile.content, selection);
      setAISuggestion(result.suggestion);
      
    } catch (error) {
      setAIError(error.message);
    } finally {
      setAILoading(false);
    }
  };

  // Accept AI suggestion
  const handleAcceptAI = (suggestion) => {
    if (aiIsFullDocument) {
      // Replace entire content
      onContentChange(suggestion);
    } else if (selectionRange) {
      // Replace only the selected portion
      const content = selectedFile.content;
      const newContent = content.slice(0, selectionRange.start) + suggestion + content.slice(selectionRange.end);
      onContentChange(newContent);
    }
    setAIModalOpen(false);
  };

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Clamp between 20% and 80%
      setLeftPaneWidth(Math.min(80, Math.max(20, newWidth)));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      <Toolbar 
        onInsert={handleInsert}
        onFormatText={handleFormatText}
        onSave={onSave}
        onSaveAll={onSaveAll}
        isPreviewMode={isPreviewMode}
        onTogglePreview={onTogglePreview}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        isSidebarVisible={isSidebarVisible}
        onToggleSidebar={onToggleSidebar}
        selectedFile={selectedFile}
        hasModifiedFiles={hasModifiedFiles}
        onAIRequest={handleAIRequest}
      />
      
      <div ref={containerRef} className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
        {!isPreviewMode ? (
          <>
            {/* Editor Pane */}
            <div 
              className="min-w-0 overflow-hidden" 
              style={{ width: `${leftPaneWidth}%`, flexShrink: 0 }}
            >
              <MarkdownEditor
                value={selectedFile?.content}
                onChange={onContentChange}
                onInsert={insertRef}
                isDarkMode={isDarkMode}
                onCursorPosition={handleCursorPosition}
              />
            </div>
            
            {/* Resizable Divider */}
            <div
              className={`w-1 cursor-col-resize flex-shrink-0 hover:w-1.5 transition-all group ${
                isDarkMode ? 'bg-gray-700 hover:bg-blue-500' : 'bg-gray-300 hover:bg-blue-400'
              }`}
              onMouseDown={handleMouseDown}
              title="Drag to resize"
            >
              <div className={`h-full w-full ${isDraggingRef.current ? 'bg-blue-500' : ''}`} />
            </div>
            
            {/* Preview Pane */}
            <div 
              className={`min-w-0 overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              style={{ width: `${100 - leftPaneWidth}%`, flexShrink: 0 }}
            >
              <PreviewPane 
                markdown={selectedFile?.content} 
                isDarkMode={isDarkMode}
                cursorPercent={cursorInfo.percent}
                isAtBottom={cursorInfo.isAtBottom}
              />
            </div>
          </>
        ) : (
          <div className={`flex-1 min-w-0 overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <PreviewPane 
              markdown={selectedFile?.content} 
              isDarkMode={isDarkMode}
              cursorPercent={0}
              isAtBottom={false}
            />
          </div>
        )}
      </div>
      
      {/* AI Modal */}
      <AIModal
        isOpen={aiModalOpen}
        onClose={() => setAIModalOpen(false)}
        original={aiOriginal}
        suggestion={aiSuggestion}
        isLoading={aiLoading}
        error={aiError}
        onAccept={handleAcceptAI}
        isDarkMode={isDarkMode}
        isFullDocument={aiIsFullDocument}
      />
    </div>
  );
};

export default MainEditor;
