import { Router } from 'express';
import { getNearbyDrivers, getDriverDetails } from '../controllers/driver.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.get('/nearby', getNearbyDrivers);
router.get('/:id', getDriverDetails);

export default router;
