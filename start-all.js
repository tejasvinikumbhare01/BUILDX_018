const { spawn } = require('child_process');
const path = require('path');

console.log(`
===============================================================
🛰️  ResQGrid AI – Full-Stack Disaster Management Platform
    Starting all 4 microservices & engines...
===============================================================
`);

const children = [];

function startProcess(name, command, args, cwd) {
  console.log(`▶ Starting ${name}...`);
  const proc = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
  });

  proc.on('error', (err) => {
    console.error(`❌ [${name}] error:`, err);
  });

  proc.on('exit', (code) => {
    console.log(`⏹ [${name}] exited with code ${code}`);
  });

  children.push({ name, proc });
  return proc;
}

// 1. Start PostgreSQL Engine
const rootDir = __dirname;
startProcess('🐘 PostgreSQL Engine', 'node', ['src/db/startPg.js'], path.join(rootDir, 'backend'));

// 2. Wait 2 seconds, then start Python AI Microservice & Express Backend
setTimeout(() => {
  startProcess('🐍 Python FastAPI AI Service', 'python', ['main.py'], path.join(rootDir, 'ai-service'));
  startProcess('🚀 Express Backend (Socket.IO + Prisma)', 'node', ['dist/server.js'], path.join(rootDir, 'backend'));
}, 2500);

// 3. Start Vite Frontend
setTimeout(() => {
  startProcess('⚛️  React Vite Frontend', 'npm.cmd', ['run', 'dev', '--', '--host'], path.join(rootDir, 'frontend'));
}, 4500);

function cleanup() {
  console.log('\nGracefully terminating all ResQGrid services...');
  for (const { name, proc } of children) {
    try {
      proc.kill();
    } catch (e) {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
