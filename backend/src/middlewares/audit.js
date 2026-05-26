import { AuditLog } from '../models/AuditLog.js';

export const audit = (req, res, next) => {
  res.on('finish', () => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return;
    AuditLog.create({
      actor: req.user?._id,
      role: req.user?.role,
      action: `${req.method} ${req.route?.path || req.path}`,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      statusCode: res.statusCode
    }).catch(() => {});
  });
  next();
};
