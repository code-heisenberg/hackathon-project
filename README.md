# AI Code Generator Platform

A full-stack application for generating code and building projects using the Qwen/CodeQwen1.5-7B model. Built with React, Vite, and Express.js.

## Features

- Interactive UI for project requirement input
- Technical specification selection
- Code generation using Qwen/CodeQwen1.5-7B
- GitHub integration for saving generated code
- Modern, responsive design

## Prerequisites

- Node.js (v16 or higher)
- npm
- GitHub account and personal access token
- Qwen/CodeQwen1.5-7B API access

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-codebase-generator
```

2. Install dependencies:
```bash
npm run install:all
```

3. Configure environment variables:
- Copy `.env.example` to `.env` in the backend directory
- Add your GitHub token and Model API key

4. Start the development servers:
```bash
npm run dev
```

This will start both the frontend (default: http://localhost:5173) and backend (default: http://localhost:3000) servers.

## Project Structure

```
ai-codebase-generator/
├── frontend/           # React + Vite frontend
├── backend/           # Express.js backend
│   ├── src/
│   │   └── index.js   # Main server file
│   └── .env          # Environment variables
└── package.json      # Root package.json for workspace
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
