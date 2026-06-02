import { Router } from 'express';
import { createPayment, verifyPayment } from '../controllers/payment.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.post('/', createPayment);
router.post('/verify', verifyPayment);

export default router;
