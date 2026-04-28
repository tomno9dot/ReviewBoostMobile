import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// ✅ Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ✅ Register for push notifications (standalone function)
export async function registerForPushNotifications() {
  // Must be a real device
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return null;
  }

  try {
    // Check current permission status
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    // Ask for permission if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission denied');
      return null;
    }

    // ✅ Android: Create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'ReviewBoost Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7c3aed',
        sound: 'default',
      });
    }

    // ✅ Get Expo Push Token
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      console.warn('No projectId found in app config');
      return null;
    }

    const pushTokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const token = pushTokenData.data;

    // Save token locally
    await AsyncStorage.setItem('pushToken', token);

    return token;

  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

// ✅ MAIN HOOK - Fixed subscription cleanup
export default function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // ✅ Use correct ref types
  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  useEffect(() => {
    // Register and get token
    registerForPushNotifications().then((token) => {
      if (token) {
        setExpoPushToken(token);
        setPermissionGranted(true);

        // Save token to your backend
        saveTokenToBackend(token);
      }
    });

    // ✅ FIXED: addNotificationReceivedListener returns subscription
    // with its own .remove() method
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('Notification received:', notification);
        setNotification(notification);
      });

    // ✅ FIXED: addNotificationResponseReceivedListener
    // also returns subscription with .remove() method
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification tapped:', response);
        handleNotificationResponse(response);
      });

    // ✅ FIXED CLEANUP: Use .remove() on the subscription object
    // NOT Notifications.removeNotificationSubscription()
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove(); // ✅ Correct way
      }
      if (responseListener.current) {
        responseListener.current.remove(); // ✅ Correct way
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
    permissionGranted,
  };
}

// Save token to your backend API
async function saveTokenToBackend(token) {
  try {
    const authToken = await AsyncStorage.getItem('token');
    if (!authToken) return;

    await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/user/push-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token }),
      }
    );
  } catch (error) {
    console.error('Failed to save push token to backend:', error);
  }
}

// Handle what happens when user taps notification
function handleNotificationResponse(response) {
  const data = response.notification.request.content.data;
  console.log('Notification data:', data);

  // You can emit events or use a navigation ref here
  // We'll handle navigation in the component that uses this hook
  return data;
}