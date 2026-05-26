import http from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { connectDB } from './config/db.js';
import { assertRequiredEnv, env, isAllowedOrigin } from './config/env.js';
import { registerSockets } from './sockets/index.js';

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: (origin, callback) => callback(null, isAllowedOrigin(origin)), credentials: true }
});

registerSockets(io);

const start = async () => {
  assertRequiredEnv();
  await connectDB();
  server.listen(env.port, () => console.log(`REMS API running on port ${env.port}`));
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
