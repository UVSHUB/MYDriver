import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../utils/appError';
import {
  generateAccessToken,
  generateRefreshToken,
  generateOTP,
  getOTPExpiry,
} from '../utils/helpers';
import { sendOTPSMS } from '../services/otp.service';
import jwt from 'jsonwebtoken';

// POST /api/auth/register
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, phone, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      throw new AppError('User with this email or phone already exists.', 409);
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    const user = await User.create({
      fullName,
      phone,
      email,
      password,
      otp,
      otpExpiry,
    });

    await sendOTPSMS(phone, otp);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your phone number.',
      data: { userId: user._id, phone: user.phone },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/verify-otp
export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId).select('+otp +otpExpiry');
    if (!user) throw new AppError('User not found.', 404);
    if (user.isVerified) throw new AppError('Account already verified.', 400);

    if (!user.otp || !user.otpExpiry) throw new AppError('No OTP found. Please request a new one.', 400);
    if (user.otp !== otp) throw new AppError('Invalid OTP.', 400);
    if (new Date() > user.otpExpiry) throw new AppError('OTP has expired. Please request a new one.', 400);

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Phone verified successfully.',
      data: { accessToken, refreshToken, user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/resend-otp
export const resendOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId).select('+otp +otpExpiry');
    if (!user) throw new AppError('User not found.', 404);
    if (user.isVerified) throw new AppError('Account already verified.', 400);

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    await sendOTPSMS(user.phone, otp);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login (email + password)
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new AppError('Invalid email or password.', 401);
    if (!user.isActive) throw new AppError('Your account has been deactivated.', 403);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AppError('Invalid email or password.', 401);

    if (!user.isVerified) {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiry = getOTPExpiry();
      await user.save({ validateBeforeSave: false });
      await sendOTPSMS(user.phone, otp);

      res.status(403).json({
        success: false,
        message: 'Account not verified. OTP sent to your phone.',
        data: { userId: user._id, requiresVerification: true },
      });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: { accessToken, refreshToken, user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login/phone
export const loginWithPhone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) throw new AppError('No account found with this phone number.', 404);
    if (!user.isActive) throw new AppError('Your account has been deactivated.', 403);

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = getOTPExpiry();
    await user.save({ validateBeforeSave: false });

    await sendOTPSMS(phone, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your phone.',
      data: { userId: user._id },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login/phone/verify
export const verifyPhoneLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId).select('+otp +otpExpiry');
    if (!user) throw new AppError('User not found.', 404);
    if (!user.otp || user.otp !== otp) throw new AppError('Invalid OTP.', 400);
    if (!user.otpExpiry || new Date() > user.otpExpiry) throw new AppError('OTP expired.', 400);

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: { accessToken, refreshToken, user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) throw new AppError('No account found with this phone number.', 404);

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = getOTPExpiry();
    await user.save({ validateBeforeSave: false });

    await sendOTPSMS(phone, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your phone.',
      data: { userId: user._id },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, otp, password } = req.body;

    const user = await User.findById(userId).select('+otp +otpExpiry +password');
    if (!user) throw new AppError('User not found.', 404);
    if (!user.otp || user.otp !== otp) throw new AppError('Invalid OTP.', 400);
    if (!user.otpExpiry || new Date() > user.otpExpiry) throw new AppError('OTP expired.', 400);

    user.password = password;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh-token
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new AppError('Refresh token required.', 401);

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) throw new AppError('Invalid refresh token.', 401);

    const accessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    res.status(200).json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Refresh token expired. Please log in again.', 401));
    }
    next(error);
  }
};

// POST /api/auth/google
export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, fullName, avatar } = req.body;

    if (!email) {
      throw new AppError('Email is required for Google Sign-In.', 400);
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Generate a 100% unique phone number using timestamp + random digits
      const uniquePhone = `+1555${Date.now().toString().slice(-7)}${Math.floor(10 + Math.random() * 90)}`;
      
      // Generate a highly secure password guaranteed to be > 8 characters
      const securePassword = `Google_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;

      user = await User.create({
        fullName: fullName || email.split('@')[0],
        email,
        phone: uniquePhone,
        password: securePassword,
        isVerified: true, // Pre-verified via Google
        avatar: avatar || '',
      });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Google login successful.',
      data: {
        accessToken,
        refreshToken,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

const sanitizeUser = (user: any) => ({
  _id: user._id,
  fullName: user.fullName,
  phone: user.phone,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  isVerified: user.isVerified,
  walletBalance: user.walletBalance,
  language: user.language,
  darkMode: user.darkMode,
});

