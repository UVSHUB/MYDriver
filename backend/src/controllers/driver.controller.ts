import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Driver } from '../models/Driver';
import { User } from '../models/User';
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

// POST /api/drivers/register
export const registerDriver = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { licenseNumber, experience, vehicleClasses } = req.body;
    if (!licenseNumber || !experience) {
      throw new AppError('License number and experience are required.', 400);
    }

    let driver = await Driver.findOne({ userId: req.user!._id });
    if (driver) {
      throw new AppError('User is already registered as a driver.', 400);
    }

    driver = await Driver.create({
      userId: req.user!._id,
      licenseNumber,
      experience,
      vehicleClasses: vehicleClasses || ['sedan', 'suv', 'van'],
      isAvailable: false,
    });

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { role: 'driver' },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Driver registration successful.',
      data: { driver, user },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/drivers/availability
export const updateAvailability = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { isAvailable } = req.body;
    if (isAvailable === undefined) {
      throw new AppError('Availability status is required.', 400);
    }

    const driver = await Driver.findOneAndUpdate(
      { userId: req.user!._id },
      { isAvailable },
      { new: true }
    );

    if (!driver) throw new AppError('Driver profile not found.', 404);

    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};
