import React, { useEffect, useRef, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const WebContainerTerminal = () => {
  const terminalRef = useRef(null);
  const [webcontainerInstance, setWebcontainerInstance] = useState(null);
  const [terminal, setTerminal] = useState(null);

  useEffect(() => {
    // Initialize terminal
    const initTerminal = () => {
      const term = new Terminal({
        convertEol: true,
        fontFamily: 'Fira Code, monospace',
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 1.2,
        cursorBlink: true,
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
        }
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      if (terminalRef.current) {
        term.open(terminalRef.current);
        fitAddon.fit();
      }

      setTerminal(term);
      return term;
    };

    // Initialize WebContainer
    const initWebContainer = async () => {
      try {
        const term = initTerminal();
        term.write('Booting WebContainer...\r\n');

        const webcontainerInstance = await WebContainer.boot();
        setWebcontainerInstance(webcontainerInstance);

        // Mount file system
        await webcontainerInstance.mount({
          'package.json': {
            file: {
              contents: JSON.stringify({
                name: 'example-app',
                type: 'module',
                dependencies: {
                  express: '^4.18.2'
                }
              })
            }
          }
        });

        // Install dependencies
        const installProcess = await webcontainerInstance.spawn('npm', ['install']);
        
        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              term.write(data);
            }
          })
        );

        // Wait for install command to exit
        const installExitCode = await installProcess.exit;
        
        if (installExitCode !== 0) {
          throw new Error('Installation failed');
        }

        // Start shell
        const shellProcess = await webcontainerInstance.spawn('jsh', {
          terminal: {
            cols: term.cols,
            rows: term.rows
          }
        });

        shellProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              term.write(data);
            }
          })
        );

        // Write to shell
        const input = shellProcess.input.getWriter();
        term.onData((data) => {
          input.write(data);
        });

        // Handle terminal resize
        term.onResize(({ cols, rows }) => {
          shellProcess.resize({
            cols,
            rows
          });
        });

      } catch (error) {
        console.error('Failed to initialize WebContainer:', error);
        terminal?.write('\r\nFailed to initialize WebContainer. Error: ' + error.message + '\r\n');
      }
    };

    initWebContainer();

    // Cleanup
    return () => {
      if (terminal) {
        terminal.dispose();
      }
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const fitAddon = new FitAddon();
      if (terminal) {
        terminal.loadAddon(fitAddon);
        fitAddon.fit();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [terminal]);

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <span>Terminal (WebContainer)</span>
      </div>
      <div 
        ref={terminalRef} 
        className="terminal-window"
        style={{
          height: '300px',
          backgroundColor: '#1e1e1e',
          padding: '8px',
          borderRadius: '0 0 4px 4px'
        }}
      />
    </div>
  );
};

export default WebContainerTerminal;
