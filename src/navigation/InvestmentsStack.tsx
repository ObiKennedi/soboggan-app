import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InvestmentLogsScreen } from '../screens/investments/InvestmentLogsScreen';
import { PortfolioSellInstructionScreen } from '../screens/investments/PortfolioSellInstructionScreen';
import { colors } from '../theme/theme';

export type InvestmentsStackParamList = {
  InvestmentLogs: undefined;
  PortfolioSellInstruction: undefined;
};

const Stack = createNativeStackNavigator<InvestmentsStackParamList>();

export function InvestmentsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="InvestmentLogs"
        component={InvestmentLogsScreen}
        options={{ title: 'Investments' }}
      />
      <Stack.Screen
        name="PortfolioSellInstruction"
        component={PortfolioSellInstructionScreen}
        options={{ title: 'Portfolio & Admin Sell Instructions' }}
      />
    </Stack.Navigator>
  );
}
