import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for undo/redo functionality
 * @param {string} initialValue - Initial value
 * @param {number} maxHistory - Maximum number of history entries (default: 100)
 */
export const useUndoRedo = (initialValue = '', maxHistory = 100) => {
  const [history, setHistory] = useState([initialValue]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastValueRef = useRef(initialValue);
  const debounceTimerRef = useRef(null);

  // Get current value
  const currentValue = history[currentIndex] || '';

  // Push new value to history (with debouncing to batch rapid changes)
  const pushToHistory = useCallback((newValue, immediate = false) => {
    if (newValue === lastValueRef.current) return;
    
    lastValueRef.current = newValue;

    const addToHistory = () => {
      setHistory(prev => {
        // Remove any future states if we're not at the end
        const newHistory = prev.slice(0, currentIndex + 1);
        
        // Add new value
        newHistory.push(newValue);
        
        // Trim history if it exceeds max
        if (newHistory.length > maxHistory) {
          newHistory.shift();
        }
        
        return newHistory;
      });
      setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1));
    };

    if (immediate) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      addToHistory();
    } else {
      // Debounce to batch rapid changes (like typing)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(addToHistory, 300);
    }
  }, [currentIndex, maxHistory]);

  // Undo
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      // Clear any pending debounced updates
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      lastValueRef.current = history[newIndex];
      return history[newIndex];
    }
    return null;
  }, [currentIndex, history]);

  // Redo
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      // Clear any pending debounced updates
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      lastValueRef.current = history[newIndex];
      return history[newIndex];
    }
    return null;
  }, [currentIndex, history]);

  // Reset history (when switching files)
  const resetHistory = useCallback((newValue = '') => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setHistory([newValue]);
    setCurrentIndex(0);
    lastValueRef.current = newValue;
  }, []);

  // Check if undo/redo is available
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    currentValue,
    pushToHistory,
    undo,
    redo,
    resetHistory,
    canUndo,
    canRedo,
    historyLength: history.length,
    currentIndex
  };
};
