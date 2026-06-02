import { Router } from 'express';
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  loginWithPhone,
  verifyPhoneLogin,
  forgotPassword,
  resetPassword,
  refreshToken,
  googleLogin,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/login/phone', loginWithPhone);
router.post('/login/phone/verify', verifyPhoneLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/google', googleLogin);

export default router;

