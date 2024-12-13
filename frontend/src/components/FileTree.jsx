import React, { useState } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaChevronRight, FaChevronDown } from 'react-icons/fa';

const FileTree = ({ files, onFileSelect, selectedFile }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderItem = (item, depth = 0) => {
    const isFolder = item.type === 'dir';
    const isExpanded = expandedFolders.has(item.path);
    const isSelected = selectedFile === item.path;

    return (
      <div key={item.path}>
        <div
          className={`file-tree-item ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${depth * 20}px` }}
          onClick={() => isFolder ? toggleFolder(item.path) : onFileSelect(item.path)}
        >
          <span className="file-tree-icon">
            {isFolder ? (
              <>
                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                {isExpanded ? <FaFolderOpen /> : <FaFolder />}
              </>
            ) : (
              <FaFile />
            )}
          </span>
          <span className="file-tree-name">{item.name}</span>
        </div>
        {isFolder && isExpanded && item.children && (
          <div className="file-tree-children">
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="file-tree">
      {files.map(file => renderItem(file))}
    </div>
  );
};

export default FileTree;
