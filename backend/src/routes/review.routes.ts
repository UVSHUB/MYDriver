import { Router } from 'express';
import { createReview, getDriverReviews } from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.post('/', createReview);
router.get('/driver/:driverId', getDriverReviews);

export default router;
