import { useState, useEffect, useRef } from 'react'
import './App.css'
import { FiSun, FiMoon, FiFolder, FiFile, FiTerminal, FiChevronRight, FiGithub, FiLogOut } from 'react-icons/fi'
import Editor from '@monaco-editor/react'
import 'xterm/css/xterm.css'
import Login from './components/Login'
import FileTree from './components/FileTree';
import FileViewer from './components/FileViewer';
import './components/FileTree.css';
import './components/FileViewer.css';
import WebContainerTerminal from './components/WebContainerTerminal';
import './components/WebContainerTerminal.css';
import { mockFileStructure } from './mockData/fileStructure';
import IDE from './components/IDE';
import RepoSearchModal from './components/RepoSearchModal';
import { githubService } from './services/githubService';
import { fileSystem } from './services/fileSystem';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Terminal from './components/Terminal';

// Mock data for demonstration

function App() {
  const [theme, setTheme] = useState('dark')
  const [prompt, setPrompt] = useState('')
  const [chatHistory, setChatHistory] = useState([
    { type: 'system', content: 'Welcome! I can help you generate and modify code. What would you like to build?' },
    { type: 'user', content: 'Create a React component for a user profile card' },
    { type: 'assistant', content: 'I\'ve created a ProfileCard component with the following features:\n\n- User avatar\n- Name and title\n- Bio section\n- Social links\n\nThe component is responsive and includes hover effects. Would you like to see the code?' }
  ])
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState(null)
  const terminalRef = useRef(null)
  const terminalInstance = useRef(null)
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [currentRepo, setCurrentRepo] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState({ loading: false, total: 0, loaded: 0 });

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('githubUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (code) {
      handleGitHubCallback(code)
    }
  }, [])

  const handleGitHubCallback = async (code) => {
    setLoading(true)
    setAuthError(null)
    
    try {
      // Exchange code for access token
      const response = await fetch('http://localhost:3000/auth/github/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error('Failed to authenticate with GitHub')
      }

      const authData = await response.json()
      
      if (!authData.access_token) {
        throw new Error('No access token received from GitHub')
      }

      // Get user data from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
        },
      })

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data from GitHub')
      }

      const userData = await userResponse.json()

      // Get user's repositories
      const reposResponse = await fetch('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
        },
      })

      if (!reposResponse.ok) {
        throw new Error('Failed to fetch repositories from GitHub')
      }

      const reposData = await reposResponse.json()
      
      // Store complete user data
      const userInfo = {
        id: userData.id,
        name: userData.name,
        login: userData.login,
        avatar_url: userData.avatar_url,
        email: userData.email,
        bio: userData.bio,
        location: userData.location,
        public_repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        repositories: reposData.map(repo => ({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          private: repo.private,
          description: repo.description,
          url: repo.html_url,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          language: repo.language,
          default_branch: repo.default_branch
        })),
        auth: {
          access_token: authData.access_token,
          token_type: authData.token_type,
          scope: authData.scope
        }
      }
      
      // Only store in localStorage if everything was successful
      localStorage.setItem('githubUser', JSON.stringify(userInfo))
      localStorage.setItem('githubAuth', JSON.stringify({
        access_token: authData.access_token,
        token_type: authData.token_type,
        scope: authData.scope
      }))
      
      // Update state
      setUser(userInfo)
      setAuthError(null)
      
      // Remove code from URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } catch (error) {
      console.error('Error during GitHub authentication:', error)
      setAuthError(error.message || 'Failed to authenticate with GitHub')
      // Clear any existing data on error
      localStorage.removeItem('githubUser')
      localStorage.removeItem('githubAuth')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('githubUser')
    setUser(null)
  }

  const suggestions = [
    'Create a React component',
    'Add API integration',
    'Implement authentication'
  ]

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (terminalRef.current && !terminalInstance.current) {
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Fira Code, monospace',
        theme: {
          background: theme === 'light' ? '#1e293b' : '#000000',
          foreground: theme === 'light' ? '#f8fafc' : '#e2e8f0',
          cursor: '#60a5fa'
        }
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.open(terminalRef.current)
      fitAddon.fit()

      terminalInstance.current = term
      term.writeln('🚀 AI Code Generator Terminal')
      term.writeln('----------------------------')
      term.write('$ ')
    }
  }, [terminalRef.current, theme])

  useEffect(() => {
    if (terminalInstance.current) {
      terminalOutput.forEach(line => {
        terminalInstance.current.writeln(line)
        terminalInstance.current.write('$ ')
      })
    }
  }, [terminalOutput])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const handleFileSelect = (node) => {
    if (node.type === 'file') {
      setSelectedFile(node.path);
      // Load file content using fileSystem
      fileSystem.readFile(node.path).then(content => {
        // Handle file content if needed
        console.log('File loaded:', node.path);
      }).catch(error => {
        console.error('Error loading file:', error);
        toast.error('Failed to load file: ' + error.message);
      });
    }
  };

  const handlePromptSubmit = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setChatHistory(prev => [...prev, { type: 'user', content: prompt }])

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newFile = {
        name: 'ProfileCard.jsx',
        type: 'file',
        content: `import React from 'react';
import './ProfileCard.css';

export default function ProfileCard({ user }) {
  return (
    <div className="profile-card">
      <img src={user.avatar} alt={user.name} className="profile-avatar" />
      <h2 className="profile-name">{user.name}</h2>
      <p className="profile-title">{user.title}</p>
      <p className="profile-bio">{user.bio}</p>
      <div className="profile-social">
        {user.social.map(link => (
          <a key={link.platform} href={link.url}>
            {link.platform}
          </a>
        ))}
      </div>
    </div>
  );
}`
      }

      setChatHistory(prev => [...prev, {
        type: 'assistant',
        content: 'I\'ve created a new ProfileCard component with the following features:\n\n- Responsive design\n- Avatar image\n- Name and title display\n- Bio section\n- Social links integration\n\nThe component has been added to src/components/ProfileCard.jsx. Would you like me to add styling or implement any additional features?'
      }])

      setTerminalOutput(prev => [
        ...prev,
        '> Creating new component...',
        '> Adding ProfileCard.jsx to src/components/',
        '> Running prettier...',
        '✓ Code formatting complete',
        '> Running eslint...',
        '✓ No linting issues found'
      ])

      handleFileSelect('ProfileCard.jsx')
    } catch (error) {
      setChatHistory(prev => [...prev, { type: 'system', content: 'An error occurred while generating the code.' }])
    } finally {
      setLoading(false)
      setPrompt('')
    }
  };

  const convertAndLoadFiles = async (files, basePath = '/') => {
    let totalFiles = 0;
    let loadedFiles = 0;

    // Count total files recursively
    const countFiles = (items) => {
      for (const item of items) {
        if (item.type === 'file') {
          totalFiles++;
        } else if (item.children) {
          countFiles(item.children);
        }
      }
    };
    countFiles(files);
    setLoadingProgress({ loading: true, total: totalFiles, loaded: 0 });

    // Load files with progress
    const loadFilesWithProgress = async (items, currentPath = '/') => {
      for (const file of items) {
        const fullPath = `${currentPath}${file.name}`;
        
        if (file.type === 'dir') {
          await fileSystem.ensureDirectoryExists(fullPath);
          if (file.children) {
            await loadFilesWithProgress(file.children, `${fullPath}/`);
          }
        } else {
          try {
            const content = await githubService.getFileContent(file.repo, file.path);
            await fileSystem.createFile(fullPath, content);
            loadedFiles++;
            setLoadingProgress(prev => ({ ...prev, loaded: loadedFiles }));
          } catch (error) {
            console.error(`Error loading file ${file.path}:`, error);
            continue;
          }
        }
      }
    };

    try {
      await loadFilesWithProgress(files);
    } catch (error) {
      throw error;
    } finally {
      setLoadingProgress({ loading: false, total: 0, loaded: 0 });
    }
  };

  const handleLoadRepo = async (repo) => {
    try {
      const repoFiles = await githubService.loadRepositoryFiles(repo);
      await fileSystem.ensureInitialized();
      await fileSystem.clear();
      await convertAndLoadFiles(repoFiles);
      setFiles(repoFiles);
      setCurrentRepo(repo);
      toast.success('Repository loaded successfully!');
    } catch (error) {
      console.error('Error loading repository:', error);
      toast.error('Failed to load repository: ' + error.message);
      setLoadingProgress({ loading: false, total: 0, loaded: 0 });
    }
  };

  const handleTerminalCommand = async (command) => {
    try {
      setTerminalOutput(prev => [...prev, { type: 'input', content: command }]);
      
      // Execute the command in the current repository context
      if (currentRepo) {
        const result = await executeCommand(command, currentRepo.full_name);
        setTerminalOutput(prev => [...prev, { type: 'output', content: result }]);
      } else {
        setTerminalOutput(prev => [...prev, { 
          type: 'error', 
          content: 'No repository loaded. Please load a repository first.' 
        }]);
      }
    } catch (error) {
      setTerminalOutput(prev => [...prev, { 
        type: 'error', 
        content: error.message 
      }]);
    }
  };

  const executeCommand = async (command, repoFullName) => {
    // Split command into parts
    const parts = command.trim().split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    // Get the current working directory
    const cwd = `c:/Users/JayakrishnanNarayana/works/hackathon-project`;

    try {
      const result = await new Promise((resolve, reject) => {
        run_command({
          Command: cmd,
          ArgsList: args,
          Cwd: cwd,
          Blocking: true
        }).then(response => {
          resolve(response.output || 'Command executed successfully');
        }).catch(error => {
          reject(new Error(error.message || 'Command execution failed'));
        });
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to execute command: ${error.message}`);
    }
  };

  return (
    <div className="app">
      {!user ? (
        <div className="login-container" data-theme={theme}>
          <div className="login-card">
            <h1>Welcome to Code Generator</h1>
            <p>Please sign in with GitHub to continue</p>
            {authError && (
              <div className="error-message">
                <p>{authError}</p>
                <button 
                  className="retry-button"
                  onClick={() => window.location.href = '/'}
                >
                  Try Again
                </button>
              </div>
            )}
            {loading ? (
              <div className="loading-spinner">
                <p>Authenticating...</p>
              </div>
            ) : (
              <Login />
            )}
          </div>
        </div>
      ) : (
        <div className="app-container" data-theme={theme}>
          <header className="header">
            <h1>AI Code Generator</h1>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div className="user-profile">
                <img src={user.avatar_url} alt={user.name} />
                <span>{user.name}</span>
              </div>
              <button className="theme-toggle" onClick={handleLogout}>
                <FiLogOut />
              </button>
              <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? <FiMoon /> : <FiSun />}
              </button>
              <button
                className="load-repo-button"
                onClick={() => setIsRepoModalOpen(true)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load Repository'}
              </button>
            </div>
          </header>

          <section className="prompt-section">
            <div className="prompt-header">
              <h2>Project Generator</h2>
            </div>
            
            <div className="prompt-content">
              <div className="prompt-suggestions">
                {suggestions.map((suggestion, index) => (
                  <button 
                    key={index}
                    className="suggestion-chip"
                    onClick={() => setPrompt(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="prompt-input">
                <label>What would you like to build?</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your project or feature..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey) {
                      handlePromptSubmit()
                    }
                  }}
                />
                <button 
                  className="button primary-button"
                  onClick={handlePromptSubmit}
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Code'}
                </button>
              </div>

              <div className="chat-history">
                {chatHistory.map((message, index) => (
                  <div key={index} className={`chat-message ${message.type}-message`}>
                    {message.content}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="preview-section">
            <div className="content">
              <div className="main-content">
                {loadingProgress.loading ? (
                  <div className="loading-overlay">
                    <div className="loading-content">
                      <div className="loading-spinner"></div>
                      <div className="loading-text">
                        Loading repository files...
                      </div>
                      <div className="loading-progress">
                        <div 
                          className="progress-bar" 
                          style={{ 
                            width: `${(loadingProgress.loaded / loadingProgress.total) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="loading-stats">
                        {loadingProgress.loaded} / {loadingProgress.total} files loaded
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="left-panel">
                      <FileTree
                        files={files}
                        onSelect={handleFileSelect}
                        selectedPath={selectedFile}
                        repoName={currentRepo?.full_name}
                      />
                    </div>
                    <div className="right-panel">
                      <FileViewer selectedFile={selectedFile} />
                      <Terminal
                        output={terminalOutput}
                        onCommand={handleTerminalCommand}
                        repoName={currentRepo?.full_name}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          <RepoSearchModal
            isOpen={isRepoModalOpen}
            onClose={() => setIsRepoModalOpen(false)}
            onSelectRepo={handleLoadRepo}
          />

          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      )}
    </div>
  )
}

export default App
