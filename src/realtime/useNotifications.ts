import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getPusherClient, userChannelName } from './pusherClient';
import { AppNotification } from '../types';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';

/**
 * Subscribes to `private-user-<id>` while mounted, keeps a live list of
 * notifications, and merges in anything pushed over the wire in real time.
 */
export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<ReturnType<typeof getPusherClient>['subscribe']> | null>(
    null,
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fetchNotifications();
      setNotifications(list);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    refresh();

    const pusher = getPusherClient();
    const channel = pusher.subscribe(userChannelName(user.id));
    channelRef.current = channel;

    channel.bind('notification', (payload: AppNotification) => {
      setNotifications((prev) => [payload, ...prev]);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(userChannelName(user.id));
    };
  }, [user, refresh]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await markNotificationRead(id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, isLoading, unreadCount, refresh, markAsRead, markAllAsRead };
}
