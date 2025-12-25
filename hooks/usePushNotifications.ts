import { supabase } from '@/lib/supabase';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const usePushNotifications = () => {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
    const [notification, setNotification] = useState<Notifications.Notification | undefined>();
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);

    async function registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }

            try {
                token = (await Notifications.getExpoPushTokenAsync()).data;
            } catch (e) {
                console.log("Error getting token, trying with project ID if available", e);
            }

            console.log("Expo Push Token:", token);
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    }

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            setExpoPushToken(token);

            if (token) {
                updateUserPushToken(token);
            }
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    const updateUserPushToken = async (token: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { error } = await supabase
                .from('profiles')
                .update({ expo_push_token: token })
                .eq('id', session.user.id);

            if (error) {
                console.error("Error updating push token:", error);
            } else {
                console.log("Push token updated in Supabase");
            }
        }
    };

    return {
        expoPushToken,
        notification,
    };
};
