import Constants from 'expo-constants';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: Constants.expoConfig?.extra?.googleWebClientId as string,
    // ^ Must be the Web OAuth client ID, not the Android/iOS one — this is
    // what lets the backend verify the token against the same audience
    // configured in GOOGLE_CLIENT_ID on the API.
    offlineAccess: false,
  });
}

/** Runs the native Google Sign-In flow and returns the ID token to send to the backend. */
export async function signInWithGoogle(): Promise<string> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  const idToken = (response as any).idToken ?? (response as any).data?.idToken;
  if (!idToken) {
    throw new Error('Google Sign-In did not return an ID token');
  }
  return idToken;
}

export async function signOutOfGoogle() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Not fatal — our own token clear is what actually ends the session
  }
}
