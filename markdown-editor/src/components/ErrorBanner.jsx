import React from 'react';

const ErrorBanner = ({ error, isDarkMode, onRetry, onDismiss }) => {
  if (!error) return null;

  return (
    <div className={`mx-4 mt-2 p-3 rounded border ${
      isDarkMode 
        ? 'bg-red-900 border-red-700 text-red-200' 
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">⚠️ Connection Issue:</span>
          <span className="text-sm">{error}</span>
        </div>
        <div className="flex gap-2">
          {onRetry && (
            <button 
              onClick={onRetry}
              className={`text-sm px-3 py-1 rounded transition-colors ${
                isDarkMode
                  ? 'bg-red-800 hover:bg-red-700 text-red-100'
                  : 'bg-red-100 hover:bg-red-200 text-red-800'
              }`}
            >
              Retry
            </button>
          )}
          <button 
            onClick={onDismiss}
            className={`text-sm px-2 py-1 rounded transition-colors ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;