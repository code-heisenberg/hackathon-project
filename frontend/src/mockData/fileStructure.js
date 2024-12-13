export const mockFileStructure = [
  {
    name: 'src',
    type: 'dir',
    path: '/src',
    children: [
      {
        name: 'components',
        type: 'dir',
        path: '/src/components',
        children: [
          {
            name: 'FileViewer.jsx',
            type: 'file',
            path: '/src/components/FileViewer.jsx',
            content: `import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

const FileViewer = ({ content }) => {
  return (
    <CodeMirror
      value={content}
      height="100%"
      extensions={[javascript()]}
    />
  );
};

export default FileViewer;`
          },
          {
            name: 'FileTree.jsx',
            type: 'file',
            path: '/src/components/FileTree.jsx',
            content: `import React from 'react';
import { FaFolder, FaFile } from 'react-icons/fa';

const FileTree = ({ files }) => {
  return (
    <div className="file-tree">
      {files.map(file => (
        <div key={file.path}>
          {file.type === 'dir' ? <FaFolder /> : <FaFile />}
          {file.name}
        </div>
      ))}
    </div>
  );
};

export default FileTree;`
          }
        ]
      },
      {
        name: 'styles',
        type: 'dir',
        path: '/src/styles',
        children: [
          {
            name: 'main.css',
            type: 'file',
            path: '/src/styles/main.css',
            content: `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background: #1a1a1a;
  color: white;
  padding: 1rem;
}

.footer {
  margin-top: 2rem;
  text-align: center;
}`
          }
        ]
      },
      {
        name: 'utils',
        type: 'dir',
        path: '/src/utils',
        children: [
          {
            name: 'api.js',
            type: 'file',
            path: '/src/utils/api.js',
            content: `const API_URL = process.env.API_URL || 'http://localhost:3000';

export const fetchData = async (endpoint) => {
  try {
    const response = await fetch(\`\${API_URL}\${endpoint}\`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};`
          },
          {
            name: 'helpers.js',
            type: 'file',
            path: '/src/utils/helpers.js',
            content: `export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};`
          }
        ]
      },
      {
        name: 'App.jsx',
        type: 'file',
        path: '/src/App.jsx',
        content: `import React from 'react';
import FileTree from './components/FileTree';
import FileViewer from './components/FileViewer';
import './styles/main.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Code Explorer</h1>
      </header>
      <main>
        <FileTree />
        <FileViewer />
      </main>
    </div>
  );
}

export default App;`
      }
    ]
  },
  {
    name: 'public',
    type: 'dir',
    path: '/public',
    children: [
      {
        name: 'index.html',
        type: 'file',
        path: '/public/index.html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Code Explorer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
      }
    ]
  }
];
