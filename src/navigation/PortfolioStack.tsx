import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PortfolioListScreen } from '../screens/portfolio/PortfolioListScreen';
import { PortfolioDetailScreen } from '../screens/portfolio/PortfolioDetailScreen';
import { colors } from '../theme/theme';

export type PortfolioStackParamList = {
  PortfolioList: undefined;
  PortfolioDetail: { accountId: string; accountNumber: string };
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
        name="PortfolioList"
        component={PortfolioListScreen}
        options={{ title: 'Portfolio' }}
      />
      <Stack.Screen
        name="PortfolioDetail"
        component={PortfolioDetailScreen}
        options={{ title: 'Holdings' }}
      />
    </Stack.Navigator>
  );
}
