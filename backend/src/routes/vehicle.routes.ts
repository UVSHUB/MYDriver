import { Router } from 'express';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicle.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.get('/', getVehicles);
router.post('/', addVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;
