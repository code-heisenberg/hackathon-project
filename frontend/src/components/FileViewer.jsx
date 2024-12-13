import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

const FileViewer = ({ content, language, filename }) => {
  // Determine file extension
  const ext = filename?.split('.').pop()?.toLowerCase();

  // Basic language detection based on file extension
  const getLanguageExtension = () => {
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return javascript();
      case 'html':
      case 'htm':
        return html();
      case 'css':
      case 'scss':
      case 'less':
        return css();
      case 'json':
        return json();
      default:
        return javascript();
    }
  };

  return (
    <div className="file-viewer">
      <div className="file-header">
        <span className="filename">{filename}</span>
      </div>
      <CodeMirror
        value={content}
        height="100%"
        theme={oneDark}
        extensions={[
          getLanguageExtension(),
          EditorView.lineWrapping,
          EditorView.theme({
            '&': {
              fontSize: '14px',
              height: '100%'
            }
          })
        ]}
        readOnly={true}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          syntaxHighlighting: true
        }}
      />
    </div>
  );
};

export default FileViewer;
