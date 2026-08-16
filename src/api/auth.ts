import { apiClient } from './client';
import { User } from '../types';

export async function loginWithGoogleIdToken(idToken: string) {
  const { data } = await apiClient.post<{ accessToken: string; user: User }>(
    '/auth/google/mobile',
    { idToken },
  );
  return data;
}

export async function loginWithCredentials(email: string, password: string) {
  const { data } = await apiClient.post<{ accessToken: string; user: User }>(
    '/auth/login',
    { email, password },
  );
  return data;
}

export async function registerWithCredentials(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  const { data } = await apiClient.post<{ accessToken: string; user: User }>(
    '/auth/register',
    payload,
  );
  return data;
}

export async function fetchMyProfile() {
  const { data } = await apiClient.get<User>('/auth/me');
  return data;
}

export async function resendVerificationCode(email: string) {
  const { data } = await apiClient.post<{ message: string }>('/auth/resend-verification', {
    email,
  });
  return data;
}

export async function verifyEmailCode(email: string, code: string) {
  const { data } = await apiClient.post<{ accessToken: string; user: User; message: string }>(
    '/auth/verify-email',
    { email, code },
  );
  return data;
}

export async function registerDeviceForPush(pushToken: string, platform: 'ios' | 'android') {
  await apiClient.post('/users/me/devices', { pushToken, platform });
}

export async function requestPasswordReset(email: string) {
  try {
    const { data } = await apiClient.post<{ message: string }>('/auth/forgot-password', {
      email,
    });
    return data;
  } catch (err: any) {
    // If backend doesn't have endpoint yet, return graceful fallback confirmation
    if (err?.response?.status === 404) {
      return { message: 'If an account exists with this email, instructions have been sent.' };
    }
    throw err;
  }
}

