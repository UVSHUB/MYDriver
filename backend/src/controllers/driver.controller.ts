import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Driver } from '../models/Driver';
import { AppError } from '../utils/appError';

// GET /api/drivers/nearby
export const getNearbyDrivers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) throw new AppError('Latitude and longitude are required.', 400);

    const drivers = await Driver.find({
      isAvailable: true,
      isOnTrip: false,
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)],
          },
          $maxDistance: parseFloat(radius as string) * 1000, // convert km to meters
        },
      },
    })
      .populate('userId', 'fullName avatar')
      .limit(20);

    res.status(200).json({ success: true, data: drivers });
  } catch (error) {
    next(error);
  }
};

// GET /api/drivers/:id
export const getDriverDetails = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const driver = await Driver.findById(req.params.id).populate('userId', 'fullName avatar phone');
    if (!driver) throw new AppError('Driver not found.', 404);

    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};
