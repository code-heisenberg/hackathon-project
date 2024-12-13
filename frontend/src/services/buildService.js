class BuildService {
  constructor() {
    this.initialized = true;
  }

  getLoader(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js':
        return 'js';
      case 'jsx':
        return 'jsx';
      case 'ts':
        return 'ts';
      case 'tsx':
        return 'tsx';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      default:
        return 'text';
    }
  }

  async executeCode(code) {
    try {
      // Create a new Function from the code and execute it in a controlled environment
      const executionContext = {
        console: {
          log: (...args) => {
            // Capture console.log output
            this.output = (this.output || '') + args.join(' ') + '\n';
          },
          error: (...args) => {
            // Capture console.error output
            this.output = (this.output || '') + 'Error: ' + args.join(' ') + '\n';
          }
        },
        // Add any other safe globals here
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
      };

      // Reset output before each execution
      this.output = '';

      // Create a function with controlled context
      const fn = new Function('context', `
        with (context) {
          ${code}
        }
      `);

      // Execute the code with the controlled context
      await fn(executionContext);

      return {
        output: this.output || 'Code executed successfully (no output)',
        error: null
      };
    } catch (error) {
      return {
        output: null,
        error: error.message
      };
    }
  }

  async buildAndRun(filePath, content) {
    try {
      // Simple validation
      if (!content.trim()) {
        return {
          output: null,
          error: 'Empty code'
        };
      }

      // Execute the code directly
      return await this.executeCode(content);
    } catch (error) {
      return {
        output: null,
        error: error.message
      };
    }
  }
}

export const buildService = new BuildService();
