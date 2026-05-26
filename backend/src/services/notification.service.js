import { Notification } from '../models/Notification.js';

let ioRef = null;

export const bindSocketServer = (io) => {
  ioRef = io;
};

export const notifyUser = async ({ user, title, message, type = 'system', link, metadata }) => {
  const notification = await Notification.create({ user, title, message, type, link, metadata });
  if (ioRef) ioRef.to(`user:${user.toString()}`).emit('notification:new', notification);
  return notification;
};

export const emitBookingUpdate = (booking) => {
  if (!ioRef) return;
  ioRef.to(`user:${booking.customer.toString()}`).emit('booking:update', booking);
  ioRef.to(`user:${booking.agent.toString()}`).emit('booking:update', booking);
};

export const emitChatMessage = (message, participantIds) => {
  if (!ioRef) return;
  for (const id of participantIds) ioRef.to(`user:${id.toString()}`).emit('chat:message', message);
};
