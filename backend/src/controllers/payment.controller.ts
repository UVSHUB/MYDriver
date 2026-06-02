import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Payment } from '../models/Payment';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { AppError } from '../utils/appError';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// POST /api/payments
export const createPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId, method } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, customerId: req.user!._id });
    if (!booking) throw new AppError('Booking not found.', 404);
    if (booking.paymentStatus === 'paid') throw new AppError('Booking already paid.', 400);

    if (method === 'wallet') {
      const user = await User.findById(req.user!._id);
      if (!user || user.walletBalance < booking.totalCost) {
        throw new AppError('Insufficient wallet balance.', 400);
      }

      await User.findByIdAndUpdate(req.user!._id, {
        $inc: { walletBalance: -booking.totalCost },
      });

      const payment = await Payment.create({
        bookingId,
        userId: req.user!._id,
        amount: booking.totalCost,
        method: 'wallet',
        status: 'completed',
        transactionId: uuidv4(),
      });

      booking.paymentStatus = 'paid';
      await booking.save();

      res.status(201).json({ success: true, data: payment });
    } else if (method === 'payhere') {
      // PayHere payment initiation
      const orderId = uuidv4();
      const merchantId = process.env.PAYHERE_MERCHANT_ID!;
      const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;
      const amount = booking.totalCost.toFixed(2);
      const currency = 'LKR';

      const hashedSecret = crypto
        .createHash('md5')
        .update(merchantSecret)
        .digest('hex')
        .toUpperCase();

      const hash = crypto
        .createHash('md5')
        .update(`${merchantId}${orderId}${amount}${currency}${hashedSecret}`)
        .digest('hex')
        .toUpperCase();

      const payment = await Payment.create({
        bookingId,
        userId: req.user!._id,
        amount: booking.totalCost,
        method: 'payhere',
        status: 'pending',
        payhereOrderId: orderId,
      });

      res.status(201).json({
        success: true,
        data: {
          paymentId: payment._id,
          orderId,
          merchantId,
          amount,
          currency,
          hash,
          sandbox: process.env.PAYHERE_SANDBOX === 'true',
        },
      });
    } else {
      throw new AppError('Unsupported payment method.', 400);
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/verify
export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { paymentId, orderId, status } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) throw new AppError('Payment not found.', 404);

    if (status === 'success' || status === '2') {
      payment.status = 'completed';
      payment.transactionId = orderId;
      await payment.save();

      await Booking.findByIdAndUpdate(payment.bookingId, { paymentStatus: 'paid' });
    } else {
      payment.status = 'failed';
      await payment.save();
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};
