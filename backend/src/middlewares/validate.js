import { validationResult } from 'express-validator';
import { ApiError } from '../utils/api.js';

export const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return next(new ApiError(422, 'Invalid request data', result.array().map((error) => ({ field: error.path, message: error.msg }))));
};
