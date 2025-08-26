import { useState, useEffect } from 'react';

export const useAppSettings = () => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('vertex-dark-mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('vertex-dark-mode', isDarkMode);
  }, [isDarkMode]);

  const handleTogglePreview = () => {
    setIsPreviewMode(prev => !prev);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return {
    isPreviewMode,
    setIsPreviewMode,
    handleTogglePreview,
    isDarkMode,
    setIsDarkMode,
    handleToggleDarkMode
  };
};