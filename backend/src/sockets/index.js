import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { bindSocketServer } from '../services/notification.service.js';

export const registerSockets = (io) => {
  bindSocketServer(io);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('Authentication required'));
      const payload = jwt.verify(token, env.jwtAccessSecret);
      const user = await User.findById(payload.sub).select('_id role name');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      return next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user._id.toString()}`);
    socket.on('chat:typing', ({ chatId, to }) => {
      if (to) socket.to(`user:${to}`).emit('chat:typing', { chatId, from: socket.user._id });
    });
    socket.on('disconnect', () => {});
  });
};
