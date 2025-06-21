const { spawn } = require('child_process');

console.log('🚀 Starting Vite development server...');

const server = spawn('npm', ['run', 'dev'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

let serverReady = false;
let outputBuffer = '';

server.stdout.on('data', (data) => {
  const output = data.toString();
  outputBuffer += output;
  console.log(output);
  
  if (output.includes('ready in') && output.includes('localhost')) {
    serverReady = true;
    console.log('✅ Server appears to be ready!');
    
    // Test the connection after a brief delay
    setTimeout(testConnection, 2000);
  }
});

server.stderr.on('data', (data) => {
  const error = data.toString();
  console.error('❌ Server Error:', error);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
});

function testConnection() {
  console.log('🔍 Testing connection...');
  
  const http = require('http');
  
  const req = http.get('http://localhost:5173/', (res) => {
    console.log(`✅ Connection successful! Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (data.includes('<div id="root">') || data.includes('<!doctype html>')) {
        console.log('✅ Website is rendering correctly!');
        console.log(`📄 Page content length: ${data.length} bytes`);
        console.log('🌐 Access your application at: http://localhost:5173');
      } else {
        console.log('⚠️  Server responding but content might be incomplete');
        console.log('First 200 chars:', data.substring(0, 200));
      }
    });
  });
  
  req.on('error', (err) => {
    console.error('❌ Connection failed:', err.message);
    console.log('🔧 Server might still be starting up or there might be a binding issue');
  });
  
  req.setTimeout(5000, () => {
    req.destroy();
    console.error('❌ Connection timeout');
  });
}

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill();
  process.exit(0);
});

console.log('⏳ Waiting for server to start... (Press Ctrl+C to stop)');