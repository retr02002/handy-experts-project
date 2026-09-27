'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export function usePushNotifications(onTokenReceived?: (token: string) => void) {
  useEffect(() => {
    // Only execute if running natively inside the Capacitor wrapper
    // AND the PushNotifications plugin bridge is actually reachable.
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable("PushNotifications")) return;

    let isMounted = true;

    const setupPush = async () => {
      // Request permission to use push notifications
      // iOS will prompt user and return if they granted permission
      // Android will just grant without prompting
      const permStatus = await PushNotifications.requestPermissions();

      if (permStatus.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
      } else {
        console.warn('Push notification permission denied');
      }

      // On success, we should be able to receive notifications
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
        if (isMounted && onTokenReceived) {
          onTokenReceived(token.value);
        }
      });

      // Some issue with our setup and push will not work
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // Show us the notification payload if the app is open on our device
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
      });

      // Method called when tapping on a notification
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      });
    };

    setupPush();

    return () => {
      isMounted = false;
      if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("PushNotifications")) {
        PushNotifications.removeAllListeners();
      }
    };
  }, [onTokenReceived]);
}
