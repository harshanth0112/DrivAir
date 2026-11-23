import * as authService from './auth.service.js';
import { AppError } from '../../middleware/errorHandler.js';

export const sync = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Firebase ID token required in Bearer header', 401));
    }
    const token = authHeader.split(' ')[1];

    const { role, fullName, phone, profileImage } = req.body || {};

    const user = await authService.syncUserWithFirebase({
      token,
      role,
      fullName,
      phone,
      profileImage,
    });

    res.status(200).json({
      status: 'success',
      message: 'User synchronized successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
