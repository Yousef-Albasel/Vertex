import React from 'react';

const LoadingScreen = ({ isDarkMode }) => {
  return (
    <div className={`flex items-center justify-center h-screen ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Loading files from Vertex project...</p>
        <p className="text-sm opacity-60 mt-2">Connecting to http://localhost:3001/api</p>
      </div>
    </div>
  );
};

export default LoadingScreen;