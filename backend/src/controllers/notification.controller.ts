import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Notification } from '../models/Notification';
import { AppError } from '../utils/appError';

// GET /api/notifications
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user!._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments({ userId: req.user!._id, isRead: false }),
    ]);

    res.status(200).json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/:id/read
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) throw new AppError('Notification not found.', 404);
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/read-all
export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.updateMany({ userId: req.user!._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};
