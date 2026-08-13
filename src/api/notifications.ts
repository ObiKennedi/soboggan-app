import { apiClient } from './client';
import { AppNotification } from '../types';

export async function fetchNotifications(take = 30, skip = 0) {
  const { data } = await apiClient.get<AppNotification[]>('/notifications', {
    params: { take, skip },
  });
  return data;
}

export async function markNotificationRead(id: string) {
  const { data } = await apiClient.patch<AppNotification>(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  await apiClient.patch('/notifications/read-all');
}

export async function registerPushToken(pushToken: string, platform?: string) {
  const { data } = await apiClient.patch('/notifications/push-token', {
    pushToken,
    platform,
  });
  return data;
}

/** Called by the Pusher client's authorizer — not used directly by screens. */
export async function authorizePusherChannel(socketId: string, channelName: string) {
  const { data } = await apiClient.post('/notifications/pusher/auth', {
    socket_id: socketId,
    channel_name: channelName,
  });
  return data;
}
