import twilio from 'twilio';
import { logger } from '../utils/logger';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendOTPSMS = async (phone: string, otp: string): Promise<boolean> => {
  try {
    if (process.env.NODE_ENV === 'development') {
      logger.info(`[DEV] OTP for ${phone}: ${otp}`);
      return true;
    }

    await client.messages.create({
      body: `Your Driver On Demand verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return true;
  } catch (error) {
    logger.error('Failed to send OTP SMS:', error);
    return false;
  }
};
