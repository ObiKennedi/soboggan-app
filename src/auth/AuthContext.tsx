import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { User } from '../types';
import { getToken, setToken, clearToken } from './tokenStorage';
import { setUnauthorizedHandler } from '../api/client';
import {
  loginWithGoogleIdToken,
  loginWithCredentials as apiLoginWithCredentials,
  registerWithCredentials as apiRegisterWithCredentials,
  resendVerificationCode as apiResendVerificationCode,
  verifyEmailCode as apiVerifyEmailCode,
  fetchMyProfile,
} from '../api/auth';
import { signInWithGoogle, signOutOfGoogle } from './googleSignIn';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<{ accessToken: string; user: User }>;
  registerWithCredentials: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<{ accessToken: string; user: User; message?: string }>;
  resendVerification: (email: string) => Promise<{ message: string }>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await clearToken();
    await signOutOfGoogle();
    setUser(null);
  }, []);

  // If any API call ever comes back 401, drop the session and bounce to login.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
  }, []);

  // On boot: if there's a stored token, try to resolve the current user.
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await fetchMyProfile();
        setUser(profile);
      } catch {
        await clearToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const idToken = await signInWithGoogle();
    const { accessToken, user: loggedInUser } = await loginWithGoogleIdToken(idToken);
    await setToken(accessToken);
    setUser(loggedInUser);
  }, []);

  const loginWithCredentials = useCallback(async (email: string, password: string) => {
    const data = await apiLoginWithCredentials(email, password);
    await setToken(data.accessToken);
    setUser(data.user);
    return data;
  }, []);

  const registerWithCredentials = useCallback(
    async (payload: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }) => {
      const data = await apiRegisterWithCredentials(payload);
      // Save token locally
      await setToken(data.accessToken);
      // If email verification is needed, user will proceed to verification screen
      setUser(data.user);
      return data;
    },
    [],
  );

  const resendVerification = useCallback(async (email: string) => {
    return apiResendVerificationCode(email);
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    const data = await apiVerifyEmailCode(email, code);
    await setToken(data.accessToken);
    setUser(data.user);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      loginWithGoogle,
      loginWithCredentials,
      registerWithCredentials,
      resendVerification,
      verifyEmail,
      logout,
    }),
    [user, isLoading, loginWithGoogle, loginWithCredentials, registerWithCredentials, resendVerification, verifyEmail, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
