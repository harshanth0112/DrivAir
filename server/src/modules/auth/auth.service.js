import User from '../users/users.model.js';
import { verifyIdToken } from '../../config/firebaseAdmin.js';
import { AppError } from '../../middleware/errorHandler.js';

export const syncUserWithFirebase = async ({ token, role, fullName, phone, profileImage }) => {
  const decodedToken = await verifyIdToken(token);
  const { uid, email, email_verified } = decodedToken;

  // Check if user already exists
  let user = await User.findOne({ firebaseUid: uid });

  if (!user) {
    // P0 FIX: 'admin' role MUST NOT be self-assignable via the public /sync endpoint.
    // Admin accounts must be provisioned directly in the database by an existing admin.
    // Any attempt to claim admin role at registration silently falls back to 'driver'.
    const chosenRole = ['company', 'driver', 'vehicleOwner'].includes(role) ? role : 'driver';

    user = await User.create({
      firebaseUid: uid,
      email: email || '',
      fullName: fullName || decodedToken.name || '',
      phone: phone || '',
      role: chosenRole,
      profileImage: profileImage || decodedToken.picture || '',
      emailVerified: !!email_verified,
      accountStatus: 'active',
      lastLoginAt: new Date(),
    });
  } else {
    // Existing user: Update login timestamp and sync email verification
    user.lastLoginAt = new Date();
    if (email) user.email = email;
    if (email_verified !== undefined) user.emailVerified = email_verified;
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;
    await user.save();
  }

  return user;
};
