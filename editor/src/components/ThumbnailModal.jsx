import React, { useState, useEffect, useRef } from 'react';
import { Search, Upload, X, Check, Image as ImageIcon, Download } from 'lucide-react';

export default function ThumbnailModal({ 
  isOpen, 
  onClose, 
  onSelectThumbnail, 
  isDarkMode 
}) {
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'upload'
  const [searchQuery, setSearchQuery] = useState('nature');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && activeTab === 'search' && searchResults.length === 0) {
      handleSearch();
    }
  }, [isOpen]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/search-images?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAndSelect = async (image) => {
    setIsProcessing(true);
    setError(null);
    try {
      const authorName = image.user?.username || 'unsplash';
      const response = await fetch('http://localhost:3001/api/download-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: image.urls.regular,
          name: `unsplash-${authorName}`
        })
      });

      if (!response.ok) throw new Error('Download failed');
      const data = await response.json();
      onSelectThumbnail(data.path);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:3001/api/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      onSelectThumbnail(data.path);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden transition-all ${
        isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-800' : 'border-gray-100'
        }`}>
          <h2 className={`text-lg font-semibold flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <ImageIcon size={20} className="text-blue-500" />
            Pick Thumbnail
          </h2>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex items-center gap-4 px-4 pt-4 border-b ${
          isDarkMode ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'
        }`}>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Search size={16} /> Web Search
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Upload size={16} /> Upload Local
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[400px]">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-red-100 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="flex flex-col h-full gap-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search high-resolution images..."
                    className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !searchQuery.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Search
                </button>
              </form>

              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {searchResults.map((img) => (
                    <div 
                      key={img.id}
                      onClick={() => handleDownloadAndSelect(img)}
                      className={`relative group cursor-pointer aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage?.id === img.id
                          ? 'border-blue-500 shrink-0'
                          : isDarkMode ? 'border-gray-800 hover:border-gray-600' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={img.urls.small} 
                        alt={img.alt_description}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="text-white text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                          By {img.user.name}
                        </div>
                        <div className="self-end p-2 bg-blue-500 text-white rounded-full translate-y-4 group-hover:translate-y-0 transition-transform">
                          {isProcessing && selectedImage?.id === img.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Download size={14} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchResults.length === 0 && !isLoading && (
                    <div className={`col-span-full py-12 text-center text-sm ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      No results found. Try a different search.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="flex-1 flex items-center justify-center h-full">
              <div 
                className={`w-full max-w-md p-10 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition-colors ${
                  isDarkMode 
                    ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50' 
                    : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                }`}
              >
                <div className="p-4 bg-blue-500/10 text-blue-500 rounded-full">
                  <Upload size={32} />
                </div>
                <div className="text-center">
                  <h3 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Upload local image
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    PNG, JPG, WEBP, GIF up to 5MB
                  </p>
                </div>
                <label className="relative overflow-hidden cursor-pointer mt-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
                  {isProcessing ? 'Uploading...' : 'Choose File'}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                    disabled={isProcessing}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
