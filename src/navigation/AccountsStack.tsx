import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AccountsListScreen } from '../screens/accounts/AccountsListScreen';
import { AccountDetailScreen } from '../screens/accounts/AccountDetailScreen';
import { FundAccountScreen } from '../screens/payments/FundAccountScreen';
import { WithdrawAccountScreen } from '../screens/payments/WithdrawAccountScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { colors } from '../theme/theme';

export type AccountsStackParamList = {
  AccountsList: undefined;
  AccountDetail: { accountId: string };
  FundAccount: { accountId: string };
  WithdrawAccount: { accountId: string };
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<AccountsStackParamList>();

export function AccountsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="AccountsList"
        component={AccountsListScreen}
        options={{ title: 'Dashboard & Accounts' }}
      />
      <Stack.Screen
        name="AccountDetail"
        component={AccountDetailScreen}
        options={{ title: 'Account' }}
      />
      <Stack.Screen
        name="FundAccount"
        component={FundAccountScreen}
        options={{ title: 'Fund Account' }}
      />
      <Stack.Screen
        name="WithdrawAccount"
        component={WithdrawAccountScreen}
        options={{ title: 'Withdraw Funds' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
}
