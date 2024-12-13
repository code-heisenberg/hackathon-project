export function generateMockCode(prompt, technicalDetails) {
    // Simulate API delay
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockFileStructure = {
                'src/': {
                    type: 'directory',
                    children: {
                        'components/': {
                            type: 'directory',
                            children: {
                                'App.jsx': {
                                    type: 'file',
                                    content: `import React from 'react';\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;`
                                },
                                'Header.jsx': {
                                    type: 'file',
                                    content: `import React from 'react';\n\nfunction Header() {\n  return <header>Header Component</header>;\n}\n\nexport default Header;`
                                }
                            }
                        },
                        'utils/': {
                            type: 'directory',
                            children: {
                                'api.js': {
                                    type: 'file',
                                    content: `export async function fetchData() {\n  // API implementation\n}`
                                }
                            }
                        },
                        'index.js': {
                            type: 'file',
                            content: `import React from 'react';\nimport ReactDOM from 'react-dom';\nimport App from './components/App';\n\nReactDOM.render(<App />, document.getElementById('root'));`
                        }
                    }
                },
                'package.json': {
                    type: 'file',
                    content: JSON.stringify({
                        name: "generated-project",
                        version: "1.0.0",
                        dependencies: {
                            [technicalDetails.framework]: "latest",
                            [technicalDetails.database]: "latest"
                        }
                    }, null, 2)
                }
            };

            // Mock UI preview data
            const mockUIPreview = {
                html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        .preview-container {
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .header {
            background: #4f46e5;
            color: white;
            padding: 1rem;
            border-radius: 8px;
        }
        .main-content {
            margin-top: 1rem;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="preview-container">
        <div class="header">
            <h1>Generated App Preview</h1>
        </div>
        <div class="main-content">
            <h2>Features</h2>
            <ul>
                <li>Framework: ${technicalDetails.framework}</li>
                <li>Database: ${technicalDetails.database}</li>
                <li>Architecture: ${technicalDetails.architecture}</li>
            </ul>
        </div>
    </div>
</body>
</html>`,
                components: [
                    {
                        name: 'Header',
                        preview: `<header style="background:#4f46e5;color:white;padding:1rem;border-radius:8px;">
                            <h1>Header Component</h1>
                        </header>`
                    },
                    {
                        name: 'MainContent',
                        preview: `<main style="padding:1rem;background:#f8fafc;border-radius:8px;margin-top:1rem;">
                            <h2>Main Content</h2>
                            <p>This is a sample component preview.</p>
                        </main>`
                    }
                ]
            };

            resolve({
                fileStructure: mockFileStructure,
                setupInstructions: `
1. Install dependencies:
   npm install

2. Start the development server:
   npm run dev

3. Open http://localhost:3000 in your browser
                `.trim(),
                uiPreview: mockUIPreview
            });
        }, 1000);
    });
}
