import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Platform, LogBox } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Mute any notification warnings
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  'Remote notifications are not supported in Expo Go',
  'Support for Android Push Notifications',
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Register notification handler statically but conditional on runtime isExpoGo
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export default function App() {
  useEffect(() => {
    if (!isExpoGo) {
      registerForPushNotifications();
    } else {
      console.log(
        'Android remote push notifications are disabled in the Expo Go Client. ' +
        'Bypassing push token registration for local Expo Go testing.'
      );
    }
  }, []);

  const registerForPushNotifications = async () => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      if (!projectId) {
        console.warn('EAS Project ID not found. Notification tokens will bypass in local development.');
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      console.log('Push token:', token.data);
    } catch (error) {
      console.log('Push notification setup error:', error);
    }
  };

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <AppNavigator />
      </QueryClientProvider>
    </Provider>
  );
}
