import { calculateFare, generateAccessToken, generateOTP } from '../utils/helpers';
import jwt from 'jsonwebtoken';

describe('Backend Helpers & Logic Unit Tests', () => {
  it('should generate a 6-digit numeric OTP', () => {
    const otp = generateOTP();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it('should calculate correct trip fare breakdown', () => {
    const fare = calculateFare(10, 'drive_me_home');
    expect(fare.driverFee).toBe(150 + 10 * 50); // 650
    expect(fare.platformFee).toBe(65);
    expect(fare.totalCost).toBe(715);
  });

  it('should sign access token containing id and role', () => {
    process.env.JWT_SECRET = 'testsecret123';
    const token = generateAccessToken('user123', 'driver');
    const decoded = jwt.verify(token, 'testsecret123') as any;
    expect(decoded.id).toBe('user123');
    expect(decoded.userId).toBe('user123');
    expect(decoded.role).toBe('driver');
  });
});
