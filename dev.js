const { spawn } = require('child_process');
const path = require('path');

// Function to start a process
function startProcess(command, args, cwd, name) {
    const process = spawn(command, args, {
        cwd,
        shell: true,
        stdio: 'pipe'
    });

    process.stdout.on('data', (data) => {
        console.log(`[${name}] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`[${name}] ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
        console.log(`[${name}] Process exited with code ${code}`);
    });

    return process;
}

// Start frontend
const frontendPath = path.join(__dirname, 'frontend');
const frontendProcess = startProcess('npm', ['run', 'dev'], frontendPath, 'Frontend');

// Start backend
const backendPath = path.join(__dirname, 'backend');
const backendProcess = startProcess('npm', ['run', 'dev'], backendPath, 'Backend');

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nGracefully shutting down...');
    frontendProcess.kill();
    backendProcess.kill();
    process.exit(0);
});
