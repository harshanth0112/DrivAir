import { verifyIdToken } from '../config/firebaseAdmin.js';
import User from '../modules/users/users.model.js';
import Conversation from '../modules/chat/chat.model.js';
import Message from '../modules/chat/message.model.js';
import Trip from '../modules/trips/trips.model.js';
import Contract from '../modules/contracts/contracts.model.js';
import Company from '../modules/companies/companies.model.js';
import LiveLocation from '../modules/tracking/liveLocation.model.js';

export const registerChatSockets = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }
      const decoded = await verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decoded.uid });
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.user = user;
      next();
    } catch (err) {
      next(new Error(`Socket authentication error: ${err.message}`));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`[Socket] Connected user: ${user.fullName || user.email} (${user._id})`);

    // Auto-join user's private notification channel
    socket.join(`user_${user._id}`);

    // ==========================================
    // 1. CHAT MESSAGING CHANNELS
    // ==========================================
    socket.on('join_conversation', async (data) => {
      try {
        const conversationId = typeof data === 'string' ? data : data?.conversationId;
        if (!conversationId) return;

        const conv = await Conversation.findById(conversationId);
        if (!conv) {
          return socket.emit('error', { message: 'Conversation not found' });
        }

        const isMember = conv.participants.some((p) => {
          const uid = p.userId || p._id || p;
          return uid.toString() === user._id.toString();
        });

        if (!isMember) {
          return socket.emit('error', { message: 'Unauthorized room access' });
        }

        socket.join(`conversation_${conversationId}`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('send_message', async ({ conversationId, content, messageText }) => {
      try {
        const text = content || messageText;
        if (!conversationId || !text) return;

        const conv = await Conversation.findById(conversationId);
        if (!conv) return;

        const isMember = conv.participants.some((p) => {
          const uid = p.userId || p._id || p;
          return uid.toString() === user._id.toString();
        });
        if (!isMember) return;

        const message = await Message.create({
          conversationId: conv._id,
          senderId: user._id,
          messageText: text,
          messageType: 'text',
          readBy: [{ userId: user._id, readAt: new Date() }],
        });

        conv.lastMessageId = message._id;
        conv.lastMessageAt = new Date();
        await conv.save();

        const populatedMsg = await Message.findById(message._id).populate(
          'senderId',
          'fullName role email profileImage'
        );

        io.to(`conversation_${conversationId}`).emit('new_message', {
          _id: populatedMsg._id,
          conversationId: populatedMsg.conversationId,
          senderId: populatedMsg.senderId,
          content: text,
          messageText: text,
          createdAt: populatedMsg.createdAt,
        });
      } catch (err) {
        console.error('[Socket send_message error]:', err);
      }
    });

    // ==========================================
    // 2. SECURE REAL-TIME GPS TRACKING
    // ==========================================

    /**
     * Start Trip event:
     * Validates that the socket user is the assigned driver on an active contract.
     * Persists or updates the active Trip record in MongoDB.
     */
    socket.on('start_trip', async ({ contractId, vehicleNumber, startLocation }) => {
      try {
        if (!contractId) {
          return socket.emit('tracking_error', { message: 'contractId is required' });
        }

        const contract = await Contract.findById(contractId);
        if (!contract) {
          return socket.emit('tracking_error', { message: 'Contract not found' });
        }

        if (contract.status !== 'active') {
          return socket.emit('tracking_error', { message: 'Contract is not in active state' });
        }

        // Enforce provider authorization
        if (contract.providerId.toString() !== user._id.toString()) {
          return socket.emit('tracking_error', { message: 'Forbidden: You are not assigned to this contract' });
        }

        // Find or create active Trip in MongoDB
        let trip = await Trip.findOne({ contractId, status: 'active' });
        if (!trip) {
          trip = await Trip.create({
            contractId: contract._id,
            companyId: contract.companyId,
            driverId: user._id,
            vehicleId: contract.vehicleId,
            status: 'active',
            startedAt: new Date(),
            startLocation,
          });
        }

        // Driver joins the trip-specific tracking room
        socket.join(`trip_${trip._id}`);
        socket.join(`trip_contract_${contractId}`);

        const payload = {
          tripId: trip._id,
          contractId: contract._id,
          driverId: user._id,
          driverName: user.fullName || user.email,
          vehicleNumber: vehicleNumber || contract.title,
          status: 'active',
          startedAt: trip.startedAt,
        };

        // Notify room (both company and driver)
        io.to(`trip_${trip._id}`).emit('trip_started', payload);
        io.to(`trip_contract_${contractId}`).emit('trip_started', payload);
      } catch (err) {
        socket.emit('tracking_error', { message: err.message });
      }
    });

    /**
     * Join Trip Room:
     * Authorizes Companies (must own contract) and Drivers (must be assigned)
     */
    socket.on('join_trip', async ({ tripId, contractId }) => {
      try {
        let trip = null;
        if (tripId) {
          trip = await Trip.findById(tripId);
        } else if (contractId) {
          trip = await Trip.findOne({ contractId, status: 'active' });
        }

        // If trip is found, verify authorization
        if (trip) {
          const isDriver = trip.driverId.toString() === user._id.toString();
          const isAdmin = user.role === 'admin';
          let isCompany = false;

          if (user.role === 'company') {
            const company = await Company.findOne({ userId: user._id });
            if (company && trip.companyId.toString() === company._id.toString()) {
              isCompany = true;
            }
          }

          if (!isDriver && !isCompany && !isAdmin) {
            return socket.emit('tracking_error', { message: 'Access Denied: You do not have permissions for this trip' });
          }

          socket.join(`trip_${trip._id}`);
          socket.join(`trip_contract_${trip.contractId}`);

          // Emit latest known state if available
          if (trip.lastKnownLocation && trip.lastKnownLocation.latitude) {
            socket.emit('location_updated', {
              tripId: trip._id,
              contractId: trip.contractId,
              driverName: user.fullName,
              ...trip.lastKnownLocation.toObject(),
            });
          }
        } else if (contractId) {
          // Verify that user is authorized on this contract before joining room
          const contract = await Contract.findById(contractId);
          if (contract) {
            const isAssignedProvider = contract.providerId?.toString() === user._id.toString();
            const isAdmin = user.role === 'admin';
            let isOwningCompany = false;
            if (user.role === 'company') {
              const company = await Company.findOne({ userId: user._id });
              if (company && contract.companyId?.toString() === company._id.toString()) {
                isOwningCompany = true;
              }
            }
            if (isAssignedProvider || isOwningCompany || isAdmin) {
              socket.join(`trip_contract_${contractId}`);
            } else {
              return socket.emit('tracking_error', { message: 'Access Denied: Not authorized for this contract' });
            }
          }
        }
      } catch (err) {
        socket.emit('tracking_error', { message: err.message });
      }
    });

    /**
     * Location Update:
     * Persists coordinate to MongoDB (Trip + LiveLocation) and broadcasts to tracking room
     */
    socket.on('update_location', async (data) => {
      try {
        const { tripId, contractId, lat, lng, latitude, longitude, accuracy = 0, speed = 0, heading = 0 } = data;
        const currentLat = latitude !== undefined ? latitude : lat;
        const currentLng = longitude !== undefined ? longitude : lng;

        if (currentLat === undefined || currentLng === undefined) return;

        let trip = null;
        if (tripId) {
          trip = await Trip.findById(tripId);
        } else if (contractId) {
          trip = await Trip.findOne({ contractId, status: 'active' });
        }

        if (!trip || trip.status !== 'active') return;

        // Verify that only the assigned driver can stream coordinates
        if (trip.driverId.toString() !== user._id.toString()) {
          return socket.emit('tracking_error', { message: 'Forbidden: You cannot stream coordinates for this trip' });
        }

        // Check stale coordinate updates
        const recordedAt = new Date();
        if (trip.lastKnownLocation && trip.lastKnownLocation.recordedAt) {
          if (recordedAt.getTime() < new Date(trip.lastKnownLocation.recordedAt).getTime()) {
            return; // Ignore out-of-order coordinate packet
          }
        }

        // 1. Update Trip lastKnownLocation in MongoDB
        trip.lastKnownLocation = {
          latitude: currentLat,
          longitude: currentLng,
          accuracy,
          speed,
          heading,
          recordedAt,
        };
        await trip.save();

        // 2. Persist historical breadcrumb in MongoDB
        await LiveLocation.create({
          tripId: trip._id,
          contractId: trip.contractId,
          companyId: trip.companyId,
          driverId: trip.driverId,
          vehicleId: trip.vehicleId,
          latitude: currentLat,
          longitude: currentLng,
          accuracy,
          speed,
          heading,
          recordedAt,
        });

        const updatePayload = {
          tripId: trip._id,
          contractId: trip.contractId,
          driverId: trip.driverId,
          driverName: user.fullName || user.email,
          lat: currentLat,
          lng: currentLng,
          latitude: currentLat,
          longitude: currentLng,
          accuracy,
          speed,
          heading,
          recordedAt,
          updatedAt: recordedAt,
        };

        // Broadcast to both matching room aliases
        io.to(`trip_${trip._id}`).emit('location_updated', updatePayload);
        io.to(`trip_contract_${trip.contractId}`).emit('location_updated', updatePayload);
        // Also emit legacy event alias for backward compatibility
        io.to(`trip_${trip._id}`).emit('vehicle_location', updatePayload);
        io.to(`trip_contract_${trip.contractId}`).emit('vehicle_location', updatePayload);
      } catch (err) {
        console.error('[Socket update_location error]:', err);
      }
    });

    /**
     * End Trip event:
     * Marks trip completed in MongoDB and stops tracking
     */
    socket.on('end_trip', async ({ tripId, contractId, endLocation }) => {
      try {
        let trip = null;
        if (tripId) {
          trip = await Trip.findById(tripId);
        } else if (contractId) {
          trip = await Trip.findOne({ contractId, status: 'active' });
        }

        if (!trip || trip.status !== 'active') return;

        if (trip.driverId.toString() !== user._id.toString() && user.role !== 'admin') {
          return socket.emit('tracking_error', { message: 'Forbidden: You cannot end this trip' });
        }

        trip.status = 'completed';
        trip.endedAt = new Date();
        if (endLocation) {
          trip.endLocation = endLocation;
        }
        await trip.save();

        const endedPayload = {
          tripId: trip._id,
          contractId: trip.contractId,
          status: 'completed',
          endedAt: trip.endedAt,
        };

        io.to(`trip_${trip._id}`).emit('trip_ended', endedPayload);
        io.to(`trip_contract_${trip.contractId}`).emit('trip_ended', endedPayload);
      } catch (err) {
        socket.emit('tracking_error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected user: ${user._id}`);
    });
  });
};
