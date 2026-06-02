import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Vehicle } from '../models/Vehicle';
import { AppError } from '../utils/appError';

// GET /api/vehicles
export const getVehicles = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user!._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    next(error);
  }
};

// POST /api/vehicles
export const addVehicle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { brand, model, year, registrationNumber, color, type, isDefault } = req.body;

    if (isDefault) {
      await Vehicle.updateMany({ userId: req.user!._id }, { isDefault: false });
    }

    const vehicle = await Vehicle.create({
      userId: req.user!._id,
      brand,
      model,
      year,
      registrationNumber,
      color,
      type,
      isDefault: isDefault || false,
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

// PUT /api/vehicles/:id
export const updateVehicle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!vehicle) throw new AppError('Vehicle not found.', 404);

    if (req.body.isDefault) {
      await Vehicle.updateMany({ userId: req.user!._id }, { isDefault: false });
    }

    Object.assign(vehicle, req.body);
    await vehicle.save();

    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/vehicles/:id
export const deleteVehicle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!vehicle) throw new AppError('Vehicle not found.', 404);

    res.status(200).json({ success: true, message: 'Vehicle deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
