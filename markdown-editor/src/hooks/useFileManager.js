// hooks/useFileManager.js
export const useFileManager = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFiles = async () => { /* ... */ };
  const handleFileSelect = async (file) => { /* ... */ };
  const handleCreateFile = () => { /* ... */ };
  const handleDeleteFile = async (file) => { /* ... */ };
  const handleContentChange = (content) => { /* ... */ };

  return {
    files,
    selectedFile,
    loading,
    error,
    loadFiles,
    handleFileSelect,
    handleCreateFile,
    handleDeleteFile,
    handleContentChange
  };
};