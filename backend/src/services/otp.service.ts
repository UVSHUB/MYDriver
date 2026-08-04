import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const getTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user,
      pass,
    },
  });
};

export const sendOTPSMS = async (phone: string, otp: string): Promise<boolean> => {
  try {
    if (process.env.NODE_ENV === 'development' && (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID.startsWith('ACxxxxxxxxxx'))) {
      logger.info(`[DEV SMS] OTP for ${phone}: ${otp}`);
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

export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    const transporter = getTransporter();

    if (!transporter) {
      logger.info(`[DEV EMAIL] OTP for ${email}: ${otp}`);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"MYDriver Support" <noreply@mydriver.com>',
      to: email,
      subject: `${otp} is your MYDriver verification code`,
      text: `Your MYDriver verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MYDriver Verification Code</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #FFFFFF;
              color: #000000;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 40px 20px;
              border: 1px solid #E5E5EA;
              border-radius: 8px;
              margin-top: 40px;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .logo {
              font-size: 24px;
              font-weight: 900;
              letter-spacing: -1px;
              color: #000000;
              text-transform: uppercase;
            }
            .content {
              line-height: 1.6;
              text-align: center;
            }
            .title {
              font-size: 22px;
              font-weight: 800;
              margin-bottom: 24px;
            }
            .otp-container {
              background-color: #F2F2F7;
              border-radius: 6px;
              padding: 24px;
              margin: 24px 0;
              display: inline-block;
              letter-spacing: 6px;
              font-size: 32px;
              font-weight: 800;
              color: #000000;
            }
            .warning {
              font-size: 13px;
              color: #8E8E93;
              margin-top: 24px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #8E8E93;
              border-top: 1px solid #E5E5EA;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚗 MYDriver</div>
            </div>
            <div class="content">
              <div class="title">Verify Your Email Address</div>
              <p>Thank you for choosing MYDriver. Please use the verification code below to complete your registration or login:</p>
              <div class="otp-container">${otp}</div>
              <p>This code is valid for <strong>10 minutes</strong>. If you did not request this code, please ignore this email.</p>
              <p class="warning">⚠️ Never share your verification code with anyone, including MYDriver support staff.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} MYDriver App. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`OTP Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    logger.error('Failed to send OTP Email:', error);
    return false;
  }
};
