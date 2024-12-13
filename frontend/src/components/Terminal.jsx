import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { commandExecutor } from '../services/commandExecutor.jsx';
import 'xterm/css/xterm.css';
import './Terminal.css';

const Terminal = ({ repoName }) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const commandBufferRef = useRef('');
  const fitAddonRef = useRef(null);

  useEffect(() => {
    const initTerminal = async () => {
      if (!terminalRef.current) return;

      // Initialize xterm.js
      const term = new XTerm({
        cursorBlink: true,
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
          cursor: '#d4d4d4',
          selection: '#264f78',
          black: '#1e1e1e',
          red: '#f48771',
          green: '#89d185',
          yellow: '#cca700',
          blue: '#569cd6',
          magenta: '#c586c0',
          cyan: '#4dc9b0',
          white: '#d4d4d4',
          brightBlack: '#808080',
          brightRed: '#f48771',
          brightGreen: '#89d185',
          brightYellow: '#cca700',
          brightBlue: '#569cd6',
          brightMagenta: '#c586c0',
          brightCyan: '#4dc9b0',
          brightWhite: '#d4d4d4'
        },
        rows: 24,
        cols: 80,
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: 14,
        rendererType: 'canvas'
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      
      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      // Mount terminal
      term.open(terminalRef.current);
      
      // Ensure the terminal container has dimensions
      terminalRef.current.style.height = '100%';
      terminalRef.current.style.width = '100%';
      
      // Initial fit
      setTimeout(() => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit();
        }
      }, 0);

      // Write welcome message
      term.write('\r\n Welcome to IDE Terminal\r\n');
      term.write(' Type "help" for available commands\r\n');
      writePrompt(term);

      // Handle terminal input
      term.onData((data) => {
        const code = data.charCodeAt(0);
        if (code === 13) { // Enter
          handleCommand(term, commandBufferRef.current);
          commandBufferRef.current = '';
        } else if (code === 127) { // Backspace
          if (commandBufferRef.current.length > 0) {
            commandBufferRef.current = commandBufferRef.current.slice(0, -1);
            term.write('\b \b');
          }
        } else {
          commandBufferRef.current += data;
          term.write(data);
        }
      });
    };

    initTerminal();

    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit();
        } catch (error) {
          console.error('Error fitting terminal:', error);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, []);

  const writePrompt = (term) => {
    term.write('\r\n$ ');
  };

  const handleCommand = async (term, command) => {
    term.write('\r\n');
    
    if (!command.trim()) {
      writePrompt(term);
      return;
    }

    const parts = command.trim().split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case 'ls':
          await handleLs(term, args);
          break;
        case 'cd':
          await handleCd(term, args);
          break;
        case 'cat':
          await handleCat(term, args);
          break;
        case 'pwd':
          await handlePwd(term);
          break;
        case 'clear':
          term.clear();
          break;
        case 'help':
          handleHelp(term);
          break;
        case 'npm':
        case 'node':
        case 'react-scripts':
          const output = await commandExecutor.execute(cmd, args);
          term.write(output + '\r\n');
          break;
        default:
          term.write(`Command not found: ${cmd}\r\n`);
          term.write('Type "help" for available commands\r\n');
      }
    } catch (error) {
      term.write(`Error: ${error.message}\r\n`);
    }

    writePrompt(term);
  };

  const handleLs = async (term, args) => {
    try {
      const path = args[0] || '/';
      const entries = await window.fileSystem.readdir(path);
      for (const entry of entries) {
        const stats = await window.fileSystem.stat(`${path}/${entry}`);
        const prefix = stats.isDirectory() ? 'd ' : '- ';
        term.write(`${prefix}${entry}\r\n`);
      }
    } catch (error) {
      throw new Error(`Failed to list directory: ${error.message}`);
    }
  };

  const handleCd = async (term, args) => {
    if (!args[0]) {
      throw new Error('Please specify a directory');
    }
    try {
      const stats = await window.fileSystem.stat(args[0]);
      if (!stats.isDirectory()) {
        throw new Error('Not a directory');
      }
      term.write(`Changed directory to ${args[0]}\r\n`);
    } catch (error) {
      throw new Error(`Failed to change directory: ${error.message}`);
    }
  };

  const handleCat = async (term, args) => {
    if (!args[0]) {
      throw new Error('Please specify a file');
    }
    try {
      const content = await window.fileSystem.readFile(args[0], 'utf8');
      term.write(`${content}\r\n`);
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  };

  const handlePwd = async (term) => {
    term.write('/\r\n');
  };

  const handleHelp = (term) => {
    term.write('Available commands:\r\n\n');
    term.write('File System Commands:\r\n');
    term.write('  ls [path]     List directory contents\r\n');
    term.write('  cd <path>     Change directory\r\n');
    term.write('  cat <file>    Display file contents\r\n');
    term.write('  pwd           Print working directory\r\n');
    term.write('  clear         Clear terminal screen\r\n\n');
    term.write('Node.js Commands:\r\n');
    term.write('  node <file>   Execute a Node.js script\r\n');
    term.write('  npm <cmd>     Run npm commands (install, start, build, test)\r\n');
    term.write('  react-scripts <cmd>  Run React commands (start, build, test)\r\n');
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        Terminal {repoName ? `(${repoName})` : ''}
      </div>
      <div ref={terminalRef} className="terminal-content" />
    </div>
  );
};

export default Terminal;
