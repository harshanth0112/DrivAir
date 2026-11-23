import { AppError } from './errorHandler.js';
import { verifyIdToken } from '../config/firebaseAdmin.js';
import User from '../modules/users/users.model.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No token provided or invalid format. Must be Bearer <token>', 401));
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(token);
    } catch (err) {
      return next(new AppError(`Authentication failed: ${err.message}`, 401));
    }

    // Load corresponding MongoDB user
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      return next(new AppError('User account not registered or synchronized yet', 401));
    }

    if (user.accountStatus === 'suspended' || user.accountStatus === 'blocked') {
      return next(new AppError(`Account is ${user.accountStatus}. Please contact support.`, 403));
    }

    // Attach to request
    req.user = user;
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    next(error);
  }
};
