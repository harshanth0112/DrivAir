import { AppError } from './errorHandler.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const errorDetails = parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Validation failed', 400, errorDetails));
    }
    req.body = parsed.data;
    next();
  } catch (err) {
    next(err);
  }
};
