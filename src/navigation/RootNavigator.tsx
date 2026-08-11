import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { AuthStack } from './AuthStack';
import { AppTabs } from './AppTabs';
import { colors } from '../theme/theme';

export function RootNavigator() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    );
  }

  const isVerified = user?.emailVerified !== false;

  return (
    <NavigationContainer>
      {isAuthenticated && isVerified ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

