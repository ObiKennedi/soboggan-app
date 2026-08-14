import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';

import { useAuth } from '../auth/AuthContext';

export type AuthStackParamList = {
  Login: undefined;
  VerifyEmail: { email?: string } | undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  const { user } = useAuth();
  const needsVerification = Boolean(user && user.emailVerified === false);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {needsVerification ? (
        <Stack.Screen
          name="VerifyEmail"
          component={VerifyEmailScreen}
          initialParams={{ email: user?.email }}
        />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}



