import { useState } from 'react';
import { X, Loader2, Check, RotateCcw } from 'lucide-react';

export default function AIModal({ 
  isOpen, 
  onClose, 
  original, 
  suggestion, 
  isLoading, 
  error, 
  onAccept,
  isDarkMode,
  isFullDocument 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-4xl max-h-[80vh] mx-4 rounded-lg shadow-2xl flex flex-col ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {isLoading ? 'AI is thinking...' : 'AI Suggestion'}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded hover:bg-gray-200 ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Analyzing your content...
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-red-500 text-center">
                <p className="font-semibold mb-2">Error</p>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {error}
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && suggestion && (
            <div className="space-y-4">
              <div>
                <h3 className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {isFullDocument ? 'Improved Document:' : 'Suggested Improvement:'}
                </h3>
                <div className={`p-4 rounded-lg border font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[50vh] ${
                  isDarkMode 
                    ? 'bg-gray-900 border-gray-700 text-gray-100' 
                    : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}>
                  {suggestion}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !error && suggestion && (
          <div className={`flex justify-end gap-3 p-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <RotateCcw size={16} />
              Reject
            </button>
            <button
              onClick={() => onAccept(suggestion)}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Check size={16} />
              Accept Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
