import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AccountsStackParamList } from '../../navigation/AccountsStack';
import { fetchAccounts } from '../../api/accounts';
import { Account } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { formatCurrency } from '../../components/formatCurrency';
import { useNotifications } from '../../realtime/useNotifications';
import { colors, spacing, typography } from '../../theme/theme';

type Props = NativeStackScreenProps<AccountsStackParamList, 'AccountsList'>;

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  SAVINGS: 'Savings',
  INVESTMENT: 'Investment',
  LOAN: 'Loan',
  FIXED_DEPOSIT: 'Fixed Deposit',
};

export function AccountsListScreen({ navigation }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useNotifications();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAccounts(await fetchAccounts());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('Notifications')} style={{ marginRight: spacing.sm }}>
          <View>
            <Ionicons name="notifications-outline" size={22} color={colors.white} />
            {unreadCount > 0 && <View style={styles.badge} />}
          </View>
        </Pressable>
      ),
    });
  }, [navigation, unreadCount]);

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={[typography.bodyMuted, { color: colors.gray }]}>Total balance across accounts</Text>
        <Text style={[typography.amount, { color: colors.white }]}>{formatCurrency(totalBalance)}</Text>
      </View>

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md, paddingTop: 0 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          !loading ? (
            <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.xl }]}>
              No accounts yet — open one below.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('AccountDetail', { accountId: item.id })}>
            <Card style={{ marginBottom: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={typography.h3}>{ACCOUNT_TYPE_LABEL[item.type] ?? item.type}</Text>
                  <Text style={typography.caption}>•••• {item.accountNumber.slice(-4)}</Text>
                </View>
                <Text style={[typography.h3, { color: colors.navy }]}>
                  {formatCurrency(item.balance, item.currency)}
                </Text>
              </View>
            </Card>
          </Pressable>
        )}
      />

      <View style={{ padding: spacing.md }}>
        <Button title="Open New Account" variant="outline" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
  summary: {
    backgroundColor: colors.navy,
    padding: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: spacing.md,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
});
