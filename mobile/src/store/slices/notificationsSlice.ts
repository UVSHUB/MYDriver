import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppNotification } from '../../types';

interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<AppNotification[]>) => {
      state.notifications = action.payload;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    addNotification: (state, action: PayloadAction<AppNotification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    markRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead: (state) => {
      state.notifications.forEach(n => { n.isRead = true; });
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, setUnreadCount, addNotification, markRead, markAllRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
