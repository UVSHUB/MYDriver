import { Router } from 'express';
import {
  getNearbyDrivers,
  getDriverDetails,
  registerDriver,
  updateAvailability,
} from '../controllers/driver.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.post('/register', registerDriver);
router.put('/availability', updateAvailability);
router.get('/nearby', getNearbyDrivers);
router.get('/:id', getDriverDetails);

export default router;
