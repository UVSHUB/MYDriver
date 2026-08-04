import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string, role?: string): string => {
  return jwt.sign({ id: userId, userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

export const generateOTP = (): string => {
  if (process.env.NODE_ENV === 'development' && (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID.startsWith('ACxxxxxxxxxx'))) {
    return '123456';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getOTPExpiry = (): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10); // 10 minute OTP expiry
  return expiry;
};

export const calculateFare = (
  distanceKm: number,
  serviceType: string
): { driverFee: number; platformFee: number; totalCost: number } => {
  const BASE_RATES: Record<string, number> = {
    drive_me_home: 150,
    hire_driver: 200,
    emergency: 250,
    airport: 180,
  };

  const baseRate = BASE_RATES[serviceType] || 150;
  const perKmRate = 50;
  const driverFee = Math.round(baseRate + distanceKm * perKmRate);
  const platformFee = Math.round(driverFee * 0.1);
  const totalCost = driverFee + platformFee;

  return { driverFee, platformFee, totalCost };
};
