import { useState, useEffect, useRef } from 'react'
import './App.css'
import { FiSun, FiMoon, FiFolder, FiFile, FiTerminal, FiChevronRight, FiGithub, FiLogOut } from 'react-icons/fi'
import Editor from '@monaco-editor/react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import Login from './components/Login'

// Mock data for demonstration
const mockFileStructure = [
  {
    name: 'src',
    type: 'folder',
    children: [
      {
        name: 'components',
        type: 'folder',
        children: [
          { name: 'Header.jsx', type: 'file', content: 'import React from "react";\n\nexport default function Header() {\n  return (\n    <header>\n      <h1>My App</h1>\n    </header>\n  );\n}' },
          { name: 'Button.jsx', type: 'file', content: 'import React from "react";\n\nexport default function Button({ children }) {\n  return (\n    <button className="button">{children}</button>\n  );\n}' }
        ]
      },
      {
        name: 'styles',
        type: 'folder',
        children: [
          { name: 'main.css', type: 'file', content: '.button {\n  padding: 8px 16px;\n  border-radius: 4px;\n  background-color: #3b82f6;\n  color: white;\n}' }
        ]
      },
      { name: 'App.jsx', type: 'file', content: 'import React from "react";\nimport Header from "./components/Header";\nimport Button from "./components/Button";\n\nexport default function App() {\n  return (\n    <div>\n      <Header />\n      <Button>Click me</Button>\n    </div>\n  );\n}' }
    ]
  },
  {
    name: 'public',
    type: 'folder',
    children: [
      { name: 'index.html', type: 'file', content: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>My App</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>' }
    ]
  },
  { name: 'package.json', type: 'file', content: '{\n  "name": "my-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}' }
]

function App() {
  const [theme, setTheme] = useState('dark')
  const [prompt, setPrompt] = useState('')
  const [chatHistory, setChatHistory] = useState([
    { type: 'system', content: 'Welcome! I can help you generate and modify code. What would you like to build?' },
    { type: 'user', content: 'Create a React component for a user profile card' },
    { type: 'assistant', content: 'I\'ve created a ProfileCard component with the following features:\n\n- User avatar\n- Name and title\n- Bio section\n- Social links\n\nThe component is responsive and includes hover effects. Would you like to see the code?' }
  ])
  const [fileStructure, setFileStructure] = useState(mockFileStructure)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedFileContent, setSelectedFileContent] = useState('')
  const [terminalOutput, setTerminalOutput] = useState([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState(null)
  const terminalRef = useRef(null)
  const terminalInstance = useRef(null)

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

  const findFileContent = (items, path) => {
    for (const item of items) {
      if (item.type === 'file' && item.name === path) {
        return item.content
      }
      if (item.type === 'folder' && item.children) {
        const content = findFileContent(item.children, path)
        if (content) return content
      }
    }
    return null
  }

  const handleFileSelect = (path) => {
    setSelectedFile(path)
    const content = findFileContent(fileStructure, path)
    setSelectedFileContent(content || '// File content not found')
  }

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

      setFileStructure(prev => {
        const newStructure = [...prev]
        const components = newStructure[0].children.find(f => f.name === 'components')
        components.children.push(newFile)
        return newStructure
      })

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
  }

  const FileTree = ({ items, level = 0 }) => (
    <ul className="file-tree" style={{ paddingLeft: level * 16 }}>
      {items.map((item, index) => (
        <li key={index} className="file-tree-item">
          {item.type === 'folder' ? (
            <>
              <FiFolder />
              <span>{item.name}</span>
              {item.children && <FileTree items={item.children} level={level + 1} />}
            </>
          ) : (
            <>
              <FiFile />
              <span onClick={() => handleFileSelect(item.name)}>{item.name}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  )

  return (
    <>
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
            <div className="file-structure">
              <h2>File Structure</h2>
              <FileTree items={fileStructure} />
            </div>

            <div className="sandbox">
              <div className="code-editor">
                {selectedFile ? (
                  <Editor
                    height="100%"
                    theme={theme === 'light' ? 'light' : 'vs-dark'}
                    language="javascript"
                    value={selectedFileContent}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      readOnly: true,
                      lineNumbers: 'on',
                      renderWhitespace: 'selection',
                      scrollBeyondLastLine: false
                    }}
                  />
                ) : (
                  <div style={{ padding: '16px', color: 'var(--text)' }}>
                    <p>Select a file to view code</p>
                  </div>
                )}
              </div>

              <div className="terminal-container">
                <div className="terminal-header">
                  <FiTerminal /> Terminal
                </div>
                <div ref={terminalRef} style={{ height: 'calc(100% - 28px)' }} />
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default App
