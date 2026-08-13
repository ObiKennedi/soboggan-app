import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AccountsStack } from './AccountsStack';
import { PortfolioStack } from './PortfolioStack';
import { MarketplaceScreen } from '../screens/market/MarketplaceScreen';
import { InvestmentsStack } from './InvestmentsStack';
import { ActivityLogScreen } from '../screens/activity/ActivityLogScreen';
import { ProfileStack } from './ProfileStack';
import { colors } from '../theme/theme';
import { usePushNotifications } from '../hooks/usePushNotifications';

const Tab = createBottomTabNavigator();

export function AppTabs() {
  // Initialize push notification listener & token registration
  usePushNotifications();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.gray,
        tabBarIcon: ({ color, size }) => {
          let icon = 'ellipse-outline';
          if (route.name === 'Accounts') icon = 'wallet-outline';
          else if (route.name === 'Market') icon = 'storefront-outline';
          else if (route.name === 'Portfolio') icon = 'pie-chart-outline';
          else if (route.name === 'Investments') icon = 'trending-up-outline';
          else if (route.name === 'Activity') icon = 'list-outline';
          else if (route.name === 'Profile') icon = 'person-outline';

          return <Ionicons name={icon as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Accounts" component={AccountsStack} />
      <Tab.Screen
        name="Market"
        component={MarketplaceScreen}
        options={{
          headerShown: true,
          title: 'Asset Marketplace',
          headerStyle: { backgroundColor: colors.navy },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      <Tab.Screen name="Portfolio" component={PortfolioStack} />
      <Tab.Screen name="Investments" component={InvestmentsStack} />
      <Tab.Screen name="Activity" component={ActivityLogScreen} options={{ headerShown: true, title: 'Activity Log' }} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
