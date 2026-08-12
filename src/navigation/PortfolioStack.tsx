import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PortfolioDetailScreen } from '../screens/portfolio/PortfolioDetailScreen';
import { colors } from '../theme/theme';

export type PortfolioStackParamList = {
  PortfolioDetail: { accountId?: string; accountNumber?: string } | undefined;
};

const Stack = createNativeStackNavigator<PortfolioStackParamList>();

export function PortfolioStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="PortfolioDetail"
        component={PortfolioDetailScreen}
        options={{ title: 'Portfolio & History' }}
      />
    </Stack.Navigator>
  );
}
