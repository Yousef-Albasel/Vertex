import { useState, useEffect } from 'react';

export const useAppSettings = () => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('vertex-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isSidebarVisible, setIsSidebarVisible] = useState(() => {
    const saved = localStorage.getItem('vertex-sidebar-visible');
    return saved ? JSON.parse(saved) : true;
  });

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem('vertex-dark-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Persist sidebar visibility preference
  useEffect(() => {
    localStorage.setItem('vertex-sidebar-visible', JSON.stringify(isSidebarVisible));
  }, [isSidebarVisible]);

  const handleTogglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleToggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return {
    // State
    isPreviewMode,
    isDarkMode,
    isSidebarVisible,
    
    // Actions
    handleTogglePreview,
    handleToggleDarkMode,
    handleToggleSidebar
  };
};