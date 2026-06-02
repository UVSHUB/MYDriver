import { Router } from 'express';
import { getProfile, updateProfile, uploadAvatar, getWallet, addWalletFunds } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
});

const router = Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/upload-image', upload.single('avatar'), uploadAvatar);
router.get('/wallet', getWallet);
router.post('/wallet/add', addWalletFunds);

export default router;
