import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { logger } from '../utils/logger';

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

export interface PushPayload {
  userId: string;
  title: string;
  body: string;
  type: 'driver_assigned' | 'driver_arrived' | 'trip_started' | 'trip_completed' | 'promotion' | 'general';
  data?: Record<string, string>;
}

export const sendPushNotification = async (payload: PushPayload): Promise<void> => {
  try {
    // Save to DB
    await Notification.create({
      userId: payload.userId,
      title: payload.title,
      body: payload.body,
      type: payload.type,
      data: payload.data || {},
    });

    // Get user's push token
    const user = await User.findById(payload.userId).select('pushToken');
    if (!user?.pushToken || !Expo.isExpoPushToken(user.pushToken)) return;

    const message: ExpoPushMessage = {
      to: user.pushToken,
      sound: 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data,
    };

    const chunks = expo.chunkPushNotifications([message]);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
  } catch (error) {
    logger.error('Failed to send push notification:', error);
  }
};
