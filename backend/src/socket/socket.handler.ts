import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Driver } from '../models/Driver';
import { Booking } from '../models/Booking';
import { sendPushNotification } from '../services/notification.service';
import { logger } from '../utils/logger';

interface SocketUser {
  userId: string;
  role: string;
}

export const initializeSocket = (io: SocketServer): void => {
  // Auth middleware for sockets
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error('No token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as SocketUser;
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user as SocketUser;
    logger.info(`Socket connected: ${user.userId} (${user.role})`);

    // Join personal room
    socket.join(`user:${user.userId}`);

    // Join drivers room if driver
    if (user.role === 'driver') {
      socket.join('drivers');
      logger.info(`Driver ${user.userId} joined drivers room`);
    }

    // ─── DRIVER EVENTS ─────────────────────────────────────────

    // Driver updates their location
    socket.on('driver:update-location', async (data: {
      latitude: number;
      longitude: number;
      heading?: number;
      speed?: number;
    }) => {
      try {
        const driver = await Driver.findOneAndUpdate(
          { userId: user.userId },
          {
            currentLocation: {
              type: 'Point',
              coordinates: [data.longitude, data.latitude],
              heading: data.heading,
              speed: data.speed,
              updatedAt: new Date(),
            },
          },
          { new: true }
        );

        if (driver) {
          // Find active booking and notify customer
          const booking = await Booking.findOne({
            driverId: driver._id,
            status: { $in: ['matched', 'driver_arrived', 'trip_started'] },
          });

          if (booking) {
            io.to(`user:${booking.customerId}`).emit('driver:location', {
              latitude: data.latitude,
              longitude: data.longitude,
              heading: data.heading,
              bookingId: booking._id,
            });
          }
        }
      } catch (error) {
        logger.error('Error updating driver location:', error);
      }
    });

    // Driver accepts booking
    socket.on('driver:accept-booking', async (data: { bookingId: string; driverId: string }) => {
      try {
        const booking = await Booking.findByIdAndUpdate(
          data.bookingId,
          { driverId: data.driverId, status: 'matched' },
          { new: true }
        ).populate({ path: 'driverId', populate: { path: 'userId', select: 'fullName avatar phone' } });

        if (booking) {
          // Notify customer
          io.to(`user:${booking.customerId}`).emit('booking:matched', { booking });

          await sendPushNotification({
            userId: booking.customerId.toString(),
            title: '🚗 Driver Found!',
            body: 'A driver has been assigned to your booking.',
            type: 'driver_assigned',
            data: { bookingId: booking._id.toString() },
          });
        }
      } catch (error) {
        logger.error('Error accepting booking:', error);
      }
    });

    // Driver arrived at pickup
    socket.on('driver:arrived', async (data: { bookingId: string }) => {
      try {
        const booking = await Booking.findByIdAndUpdate(
          data.bookingId,
          { status: 'driver_arrived' },
          { new: true }
        );

        if (booking) {
          io.to(`user:${booking.customerId}`).emit('driver:arrived', { bookingId: booking._id });

          await sendPushNotification({
            userId: booking.customerId.toString(),
            title: '📍 Driver Arrived',
            body: 'Your driver has arrived at the pickup location.',
            type: 'driver_arrived',
            data: { bookingId: booking._id.toString() },
          });
        }
      } catch (error) {
        logger.error('Error updating driver arrived:', error);
      }
    });

    // Trip started
    socket.on('trip:start', async (data: { bookingId: string }) => {
      try {
        const booking = await Booking.findByIdAndUpdate(
          data.bookingId,
          { status: 'trip_started', startedAt: new Date() },
          { new: true }
        );

        if (booking) {
          io.to(`user:${booking.customerId}`).emit('trip:started', { bookingId: booking._id });

          await sendPushNotification({
            userId: booking.customerId.toString(),
            title: '🚀 Trip Started',
            body: 'Your trip has started. Have a safe journey!',
            type: 'trip_started',
            data: { bookingId: booking._id.toString() },
          });
        }
      } catch (error) {
        logger.error('Error starting trip:', error);
      }
    });

    // Trip completed
    socket.on('trip:complete', async (data: { bookingId: string; actualDistance?: number; actualDuration?: number }) => {
      try {
        const booking = await Booking.findByIdAndUpdate(
          data.bookingId,
          {
            status: 'completed',
            completedAt: new Date(),
            actualDistance: data.actualDistance,
            actualDuration: data.actualDuration,
          },
          { new: true }
        );

        if (booking) {
          await Driver.findByIdAndUpdate(booking.driverId, {
            $inc: { totalTrips: 1, totalEarnings: booking.driverFee },
            isOnTrip: false,
            isAvailable: true,
          });

          io.to(`user:${booking.customerId}`).emit('trip:completed', { booking });

          await sendPushNotification({
            userId: booking.customerId.toString(),
            title: '✅ Trip Completed',
            body: `Your trip is complete. Total: LKR ${booking.totalCost}`,
            type: 'trip_completed',
            data: { bookingId: booking._id.toString() },
          });
        }
      } catch (error) {
        logger.error('Error completing trip:', error);
      }
    });

    // ─── CUSTOMER EVENTS ────────────────────────────────────────

    // Customer SOS
    socket.on('sos:trigger', async (data: { bookingId: string; location: { lat: number; lng: number } }) => {
      logger.warn(`SOS triggered by user ${user.userId} for booking ${data.bookingId}`);
      // Emit to admin room
      io.to('admin').emit('sos:alert', {
        userId: user.userId,
        bookingId: data.bookingId,
        location: data.location,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${user.userId}`);
    });
  });
};
