import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoansListScreen } from '../screens/loans/LoansListScreen';
import { LoanApplicationScreen } from '../screens/loans/LoanApplicationScreen';
import { colors } from '../theme/theme';

export type LoansStackParamList = {
  LoansList: undefined;
  LoanApplication: undefined;
};

const Stack = createNativeStackNavigator<LoansStackParamList>();

export function LoansStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="LoansList" component={LoansListScreen} options={{ title: 'Loans' }} />
      <Stack.Screen
        name="LoanApplication"
        component={LoanApplicationScreen}
        options={{ title: 'Apply for a Loan' }}
      />
    </Stack.Navigator>
  );
}
