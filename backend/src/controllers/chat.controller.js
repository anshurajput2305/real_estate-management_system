import { ApiError, asyncHandler, send } from '../utils/api.js';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import { emitChatMessage, notifyUser } from '../services/notification.service.js';

export const getOrCreateChat = asyncHandler(async (req, res) => {
  const participants = [req.user._id.toString(), req.body.participant].sort();
  let chat = await Chat.findOne({ participants: { $all: participants, $size: 2 }, property: req.body.property || null });
  if (!chat) chat = await Chat.create({ participants, property: req.body.property });
  send(res, 200, 'Chat ready', chat);
});

export const myChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id }).populate('participants', 'name email avatar role').populate('property', 'title slug images').populate('lastMessage').sort('-updatedAt');
  send(res, 200, 'Chats fetched', chats);
});

export const messages = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat || !chat.participants.some((id) => id.toString() === req.user._id.toString())) throw new ApiError(404, 'Chat not found');
  const items = await Message.find({ chat: chat._id }).populate('sender', 'name avatar role').sort('createdAt');
  send(res, 200, 'Messages fetched', items);
});

export const sendMessage = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat || !chat.participants.some((id) => id.toString() === req.user._id.toString())) throw new ApiError(404, 'Chat not found');
  const message = await Message.create({ chat: chat._id, sender: req.user._id, body: req.body.body, attachments: req.body.attachments || [], readBy: [req.user._id] });
  chat.lastMessage = message._id;
  await chat.save();
  const recipients = chat.participants.filter((id) => id.toString() !== req.user._id.toString());
  await Promise.all(recipients.map((user) => notifyUser({ user, title: 'New message', message: req.body.body.slice(0, 120), type: 'chat', metadata: { chat: chat._id } })));
  emitChatMessage(message, chat.participants);
  send(res, 201, 'Message sent', message);
});
