import React, { useState } from 'react';
import './FileTree.css';

const FileTreeNode = ({ node, onSelect, selectedPath }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDirectory = node.type === 'dir';
  const isSelected = selectedPath === node.path;

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    }
    if (typeof onSelect === 'function') {
      onSelect(node);
    }
  };

  return (
    <div className="file-tree-node">
      <div 
        className={`file-tree-item ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
      >
        <span className="file-icon">
          {isDirectory ? (isExpanded ? '📂' : '📁') : '📄'}
        </span>
        <span className="file-name">{node.name}</span>
      </div>
      {isDirectory && isExpanded && node.children && (
        <div className="file-tree-children">
          {node.children.map((child, index) => (
            <FileTreeNode
              key={`${child.path}-${index}`}
              node={child}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree = ({ files, onSelect, selectedPath, repoName }) => {
  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <div className="repo-name">
          <span className="repo-icon">📦</span>
          {repoName || 'Project Files'}
        </div>
      </div>
      <div className="file-tree-content">
        {files && files.map((file, index) => (
          <FileTreeNode
            key={`${file.path}-${index}`}
            node={file}
            onSelect={onSelect}
            selectedPath={selectedPath}
          />
        ))}
      </div>
    </div>
  );
};

export default FileTree;
