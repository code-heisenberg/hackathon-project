import React, { useState, useEffect } from 'react';
import { fileSystem } from '../services/fileSystem';
import './FileViewer.css';

const FileViewer = ({ selectedFile }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!selectedFile) {
        setContent('');
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fileContent = await fileSystem.readFile(selectedFile);
        setContent(fileContent);
      } catch (error) {
        console.error('Error loading file content:', error);
        setError('Error loading file content: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [selectedFile]);

  if (!selectedFile) {
    return (
      <div className="file-viewer empty">
        <div className="empty-message">
          Select a file to view its contents
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="file-viewer loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading file content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="file-viewer error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="file-viewer">
      <div className="file-viewer-header">
        <span className="file-name">{selectedFile}</span>
      </div>
      <div className="file-content">
        <pre>
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
};

export default FileViewer;
