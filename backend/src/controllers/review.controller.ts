import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Review } from '../models/Review';
import { Driver } from '../models/Driver';
import { Booking } from '../models/Booking';
import { AppError } from '../utils/appError';

// POST /api/reviews
export const createReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId, rating, categories, comment } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.user!._id,
      status: 'completed',
    });
    if (!booking) throw new AppError('Completed booking not found.', 404);
    if (!booking.driverId) throw new AppError('No driver assigned to this booking.', 400);

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) throw new AppError('Review already submitted for this booking.', 400);

    const review = await Review.create({
      bookingId,
      customerId: req.user!._id,
      driverId: booking.driverId,
      rating,
      categories,
      comment,
    });

    // Update driver's average rating
    const reviews = await Review.find({ driverId: booking.driverId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Driver.findByIdAndUpdate(booking.driverId, {
      rating: Math.round(avgRating * 10) / 10,
      totalRatings: reviews.length,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/driver/:driverId
export const getDriverReviews = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviews = await Review.find({ driverId: req.params.driverId })
      .populate('customerId', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};
