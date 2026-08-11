// src/realtime/pusherClient.ts

import Constants from 'expo-constants';
import { getToken } from '../auth/tokenStorage';

const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  'http://localhost:4000/api/v1';

let pusherInstance: any = null;

function resolvePusherClass(): any {
  try {
    const mod = require('pusher-js');
    if (typeof mod === 'function') return mod;
    if (mod && typeof mod.default === 'function') return mod.default;
    if (mod && mod.default && typeof mod.default.default === 'function') return mod.default.default;
    if (mod && typeof mod.Pusher === 'function') return mod.Pusher;
    if (mod && mod.default && typeof mod.default.Pusher === 'function') return mod.default.Pusher;
  } catch (e) {
    console.warn('Failed to require pusher-js:', e);
  }
  return null;
}

/**
 * Lazily creates a single Pusher client for the app's lifetime. Uses a
 * custom authorizer so the JWT goes out as a normal Bearer header instead
 * of relying on cookies (which we don't use).
 */
export function getPusherClient(): any {
  if (pusherInstance) return pusherInstance;

  const PusherClass = resolvePusherClass();
  if (!PusherClass || typeof PusherClass !== 'function') {
    console.warn('Pusher constructor not found or not callable. Realtime notifications disabled.');
    return {
      subscribe: () => ({
        bind: () => {},
        unbind_all: () => {},
      }),
      unsubscribe: () => {},
      disconnect: () => {},
    };
  }

  pusherInstance = new PusherClass(Constants.expoConfig?.extra?.pusherKey as string, {
    cluster: Constants.expoConfig?.extra?.pusherCluster as string,
    channelAuthorization: {
      transport: 'ajax',
      endpoint: `${API_BASE_URL}/notifications/pusher/auth`,
      customHandler: async (params: any, callback: any) => {
        try {
          const token = await getToken();
          const response = await fetch(`${API_BASE_URL}/notifications/pusher/auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify({
              socket_id: params.socketId,
              channel_name: params.channelName,
            }),
          });
          if (!response.ok) throw new Error('Pusher channel auth failed');
          const data = await response.json();
          callback(null, data);
        } catch (err) {
          callback(err as Error, null);
        }
      },
    },
  });

  return pusherInstance;
}

export function disconnectPusher() {
  pusherInstance?.disconnect();
  pusherInstance = null;
}

export function userChannelName(userId: string) {
  return `private-user-${userId}`;
}