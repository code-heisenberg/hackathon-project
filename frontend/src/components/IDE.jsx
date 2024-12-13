import React, { useState } from 'react';
import FileTree from './FileTree';
import FileViewer from './FileViewer';
import Terminal from './Terminal';
import './IDE.css';

const IDE = ({ files, currentRepo, terminalOutput, onCommand }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (node) => {
    if (node.type === 'file') {
      setSelectedFile(node.path);
    }
  };

  return (
    <div className="ide-container">
      <div className="ide-sidebar">
        <FileTree
          files={files}
          onSelect={handleFileSelect}
          selectedPath={selectedFile}
          repoName={currentRepo?.full_name}
        />
      </div>
      <div className="ide-main">
        <div className="ide-editor">
          <FileViewer selectedFile={selectedFile} />
        </div>
        <div className="ide-terminal">
          <Terminal
            output={terminalOutput}
            onCommand={onCommand}
            repoName={currentRepo?.full_name}
          />
        </div>
      </div>
    </div>
  );
};

export default IDE;
