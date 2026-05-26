import { asyncHandler, send } from '../utils/api.js';
import { Notification } from '../models/Notification.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(100);
  send(res, 200, 'Notifications fetched', notifications);
});

export const markRead = asyncHandler(async (req, res) => {
  const ids = req.body.ids?.length ? req.body.ids : [req.params.id];
  await Notification.updateMany({ user: req.user._id, _id: { $in: ids } }, { read: true });
  send(res, 200, 'Notifications marked as read');
});
