import { AppError } from './errorHandler.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User authentication required before authorization', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(`Access denied: Requires role [${allowedRoles.join(', ')}], current role is [${req.user.role}]`, 403)
      );
    }

    next();
  };
};
