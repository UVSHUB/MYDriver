import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Booking } from '../models/Booking';
import { Vehicle } from '../models/Vehicle';
import { User } from '../models/User';
import { AppError } from '../utils/appError';
import { calculateFare } from '../utils/helpers';
import { sendPushNotification } from '../services/notification.service';

// POST /api/bookings
export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      vehicleId,
      serviceType,
      pickupLocation,
      dropLocation,
      estimatedDistance,
      estimatedDuration,
      paymentMethod,
    } = req.body;

    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: req.user!._id });
    if (!vehicle) throw new AppError('Vehicle not found.', 404);

    const { driverFee, platformFee, totalCost } = calculateFare(estimatedDistance, serviceType);

    const booking = await Booking.create({
      customerId: req.user!._id,
      vehicleId,
      serviceType,
      pickupLocation,
      dropLocation,
      estimatedDistance,
      estimatedDuration,
      driverFee,
      platformFee,
      totalCost,
      paymentMethod: paymentMethod || 'wallet',
      status: 'searching',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'fullName avatar phone')
      .populate('vehicleId');

    const io = req.app.get('io');
    if (io) {
      io.to('drivers').emit('booking:new-request', { booking: populatedBooking });
    }

    res.status(201).json({ success: true, data: populatedBooking });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings
export const getBookingHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, period, page = 1, limit = 10 } = req.query;

    const filter: any = { customerId: req.user!._id };
    if (status) filter.status = status;

    if (period === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: today };
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filter.createdAt = { $gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filter.createdAt = { $gte: monthAgo };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('vehicleId', 'brand model registrationNumber color')
        .populate({ path: 'driverId', populate: { path: 'userId', select: 'fullName avatar' } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/:id
export const getBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user!._id })
      .populate('vehicleId')
      .populate({ path: 'driverId', populate: { path: 'userId', select: 'fullName avatar phone' } });

    if (!booking) throw new AppError('Booking not found.', 404);

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id/cancel
export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.user!._id,
    });

    if (!booking) throw new AppError('Booking not found.', 404);

    const cancellableStatuses = ['pending', 'searching', 'matched'];
    if (!cancellableStatuses.includes(booking.status)) {
      throw new AppError('Cannot cancel booking at this stage.', 400);
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by customer';
    await booking.save();

    // Refund to wallet if paid
    if (booking.paymentStatus === 'paid') {
      await User.findByIdAndUpdate(req.user!._id, {
        $inc: { walletBalance: booking.totalCost },
      });
    }

    res.status(200).json({ success: true, message: 'Booking cancelled.', data: booking });
  } catch (error) {
    next(error);
  }
};
