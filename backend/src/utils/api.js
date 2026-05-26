export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const send = (res, statusCode, message, data = null, meta = null) => {
  res.status(statusCode).json({ success: statusCode < 400, message, data, meta });
};

export const getPagination = (query) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 12), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
