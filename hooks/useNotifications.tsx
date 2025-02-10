import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useState, useRef, useEffect } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


interface NotificationState {
  expoPushToken: string;
  notification: Notifications.Notification | false;
}

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | false>(false);
  
  // Refs to store listener cleanup functions
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // Request notification permissions and get push token
  const requestPermissionsAndToken = async () => {
    if (!Device.isDevice) {
      alert('Must use physical device for Push Notifications');
      return;
    }

    // Check and request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    // Get the push token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: '82e29b50-495e-4a03-ad92-2554704990d6',
    });
     
    console.log('Expo Push Token:', token.data);
    setExpoPushToken(token.data);
  };

  // Configure Android notification channel
  const configureNotificationChannel = () => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default Channel',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

  // Send a local notification
  const sendLocalNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Reminder 📬",
        body: "Do not forget to record today's transactions",
        data: { additionalData: 'goes here' },
      },
      trigger: {
        seconds: 24 * 60 * 60,
        repeats: true
      } as Notifications.NotificationTriggerInput,
    });
  };

  // Send a push notification to a specific token
  const sendPushNotification = async (pushToken: string) => {
    const message = {
      to: pushToken,
      sound: 'default',
      title: 'New Notification',
      body: 'This is a test notification',
      data: { someData: 'goes here' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  // Setup effect for notification listeners
  useEffect(() => {
    // Request permissions and get token
    requestPermissionsAndToken();

    // Configure Android channel
    configureNotificationChannel();

    // Listen for notifications when app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listen for user interaction with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
    });

    // Cleanup listeners when component unmounts
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
    sendLocalNotification,
    sendPushNotification,
  };
}