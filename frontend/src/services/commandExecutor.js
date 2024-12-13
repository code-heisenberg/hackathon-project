class CommandExecutor {
  constructor() {
    this.currentDir = '/';
    this.npmCommands = ['install', 'start', 'build', 'test', 'run'];
    this.nodeCommands = ['--version', '-v', 'run'];
  }

  async execute(command, args) {
    const cmd = command.toLowerCase();
    
    if (cmd === 'npm') {
      return await this.executeNpmCommand(args);
    } else if (cmd === 'node') {
      return await this.executeNodeCommand(args);
    } else if (cmd === 'react-scripts') {
      return await this.executeReactCommand(args);
    }
    
    throw new Error(`Command not supported: ${command}`);
  }

  async executeNpmCommand(args) {
    if (!args || args.length === 0) {
      return 'Usage: npm <command>\n\nAvailable commands: install, start, build, test, run';
    }

    const subCommand = args[0];
    if (!this.npmCommands.includes(subCommand)) {
      return `Unknown npm command: ${subCommand}`;
    }

    try {
      switch (subCommand) {
        case 'install':
          return await this.simulateNpmInstall(args.slice(1));
        case 'start':
          return 'Starting the development server...\nCompiling...\nCompiled successfully!\nYou can now view the app in the browser.';
        case 'build':
          return 'Creating an optimized production build...\nCompiled successfully.\nThe build folder is ready to be deployed.';
        case 'test':
          return 'Running tests...\nPassed all tests!';
        case 'run':
          if (args[1]) {
            return `Running script "${args[1]}"...\nExecuted successfully!`;
          }
          return 'Please specify a script to run';
        default:
          return 'Command not implemented';
      }
    } catch (error) {
      return `Error executing npm command: ${error.message}`;
    }
  }

  async executeNodeCommand(args) {
    if (!args || args.length === 0) {
      return 'Usage: node [options] [ script.js ] [arguments]';
    }

    const subCommand = args[0];
    
    try {
      if (subCommand === '--version' || subCommand === '-v') {
        return 'v16.14.0'; // Simulated Node.js version
      } else if (subCommand.endsWith('.js')) {
        return `Executing ${subCommand}...\nExecution complete!`;
      }
      return `Unknown node command or file: ${subCommand}`;
    } catch (error) {
      return `Error executing node command: ${error.message}`;
    }
  }

  async executeReactCommand(args) {
    if (!args || args.length === 0) {
      return 'Usage: react-scripts <command>';
    }

    const subCommand = args[0];
    
    try {
      switch (subCommand) {
        case 'start':
          return 'Starting the development server...\nCompiled successfully!\nYou can now view the app in the browser.';
        case 'build':
          return 'Creating an optimized production build...\nCompiled successfully.\nThe build folder is ready to be deployed.';
        case 'test':
          return 'Running tests...\nPassed all tests!';
        case 'eject':
          return 'Ejecting...\nNote: this is a one-way operation. Once you eject, you can't go back!\nAre you sure you want to eject? This action is permanent.';
        default:
          return `Unknown react-scripts command: ${subCommand}`;
      }
    } catch (error) {
      return `Error executing react-scripts command: ${error.message}`;
    }
  }

  async simulateNpmInstall(packages) {
    if (packages.length === 0) {
      return 'Installing dependencies from package.json...\nDone!';
    }
    
    const output = [
      'Installing packages...',
      ...packages.map(pkg => `+ ${pkg}@latest`),
      'Done!',
      '',
      'Dependencies installed successfully!'
    ];
    
    return output.join('\n');
  }
}

export const commandExecutor = new CommandExecutor();
