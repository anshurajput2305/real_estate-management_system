import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants/config.js';

let socket;

export const connectSocket = (token) => {
  if (!token) return null;
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, { auth: { token }, withCredentials: true });
  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
