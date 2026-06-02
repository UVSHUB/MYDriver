import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User';
import { AppError } from '../utils/appError';
import cloudinary from '../config/cloudinary';
import fs from 'fs';

// GET /api/users/profile
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) throw new AppError('User not found.', 404);

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/profile
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, language, darkMode, pushToken } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { fullName, language, darkMode, pushToken },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/upload-image
export const uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) throw new AppError('No image file provided.', 400);

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'driverondemand/avatars',
      width: 300,
      height: 300,
      crop: 'fill',
    });

    // Remove temp file
    fs.unlinkSync(req.file.path);

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { avatar: result.secure_url },
      { new: true }
    );

    res.status(200).json({ success: true, data: { avatar: user!.avatar } });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/wallet
export const getWallet = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id).select('walletBalance');
    res.status(200).json({ success: true, data: { balance: user!.walletBalance } });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/wallet/add
export const addWalletFunds = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) throw new AppError('Invalid amount.', 400);

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $inc: { walletBalance: amount } },
      { new: true }
    ).select('walletBalance');

    res.status(200).json({
      success: true,
      message: 'Funds added to wallet.',
      data: { balance: user!.walletBalance },
    });
  } catch (error) {
    next(error);
  }
};
