import { Router } from 'express';
import { createBooking, getBookingHistory, getBooking, cancelBooking, validateCoupon } from '../controllers/booking.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.post('/', createBooking);
router.post('/validate-coupon', validateCoupon);
router.get('/', getBookingHistory);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);

export default router;
