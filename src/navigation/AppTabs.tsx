import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AccountsStack } from './AccountsStack';
import { PortfolioStack } from './PortfolioStack';
import { InvestmentsStack } from './InvestmentsStack';
import { ActivityLogScreen } from '../screens/activity/ActivityLogScreen';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.gray,
        tabBarIcon: ({ color, size }) => {
          const icon =
            route.name === 'Accounts'
              ? 'wallet-outline'
              : route.name === 'Portfolio'
              ? 'pie-chart-outline'
              : route.name === 'Investments'
              ? 'trending-up-outline'
              : 'list-outline';
          return <Ionicons name={icon as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Accounts" component={AccountsStack} />
      <Tab.Screen name="Portfolio" component={PortfolioStack} />
      <Tab.Screen name="Investments" component={InvestmentsStack} />
      <Tab.Screen name="Activity" component={ActivityLogScreen} options={{ headerShown: true, title: 'Activity Log' }} />
    </Tab.Navigator>
  );
}
