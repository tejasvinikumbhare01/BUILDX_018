const { PGlite } = require('@electric-sql/pglite');
const { PGLiteSocketServer } = require('@electric-sql/pglite-socket');
const path = require('path');
const fs = require('fs');

const dataDir = path.resolve(__dirname, '../../pgdata');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Remove stale postmaster.pid if present from previous shutdown
const pidFile = path.join(dataDir, 'postmaster.pid');
if (fs.existsSync(pidFile)) {
  try {
    fs.unlinkSync(pidFile);
    console.log('Cleaned up stale postmaster.pid');
  } catch (e) {
    console.warn('Could not remove postmaster.pid:', e.message);
  }
}

async function run() {
  console.log('Starting persistent PostgreSQL engine at:', dataDir);
  const db = new PGlite(dataDir);
  await db.waitReady;

  const port = process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432;
  const host = '127.0.0.1';

  const server = new PGLiteSocketServer({
    db,
    port,
    host,
    maxConnections: 100,
    debug: false,
  });

  await server.start();
  console.log(`✅ Genuine PostgreSQL server listening on ${host}:${port}`);

  const shutdown = async () => {
    console.log('Shutting down PostgreSQL server...');
    await server.stop();
    await db.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

run().catch((err) => {
  console.error('Failed to start PostgreSQL server:', err);
  process.exit(1);
});
