const { spawn } = require('child_process');
const net = require('net');

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Function to find an available port
async function findAvailablePort(startPort, maxAttempts = 10) {
  // For user, we want to stick to port 3002 if possible
  if (startPort !== 3002) {
    startPort = 3002;
  }
  
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available ports found between ${startPort} and ${startPort + maxAttempts - 1}`);
}

// Start the React development server
async function startServer() {
  try {
    const port = await findAvailablePort(3002);
    
    const reactScriptsStart = spawn('react-scripts', ['start'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, PORT: port }
    });

    reactScriptsStart.on('error', (err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to find available port:', error.message);
    process.exit(1);
  }
}

startServer(); 