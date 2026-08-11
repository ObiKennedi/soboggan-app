import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountsStackParamList } from '../../navigation/AccountsStack';
import { fetchAccount } from '../../api/accounts';
import { fetchAccountTransactions } from '../../api/transactions';
import { Account, Transaction } from '../../types';
import { Button } from '../../components/Button';
import { TransactionRow } from '../../components/TransactionRow';
import { formatCurrency } from '../../components/formatCurrency';
import { colors, spacing, typography } from '../../theme/theme';

type Props = NativeStackScreenProps<AccountsStackParamList, 'AccountDetail'>;

export function AccountDetailScreen({ route, navigation }: Props) {
  const { accountId } = route.params;
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [acc, txns] = await Promise.all([
        fetchAccount(accountId),
        fetchAccountTransactions(accountId),
      ]);
      setAccount(acc);
      setTransactions(txns);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.bodyMuted, { color: colors.gray }]}>
          {account ? `•••• ${account.accountNumber.slice(-4)}` : ' '}
        </Text>
        <Text style={[typography.amount, { color: colors.white }]}>
          {account ? formatCurrency(account.balance, account.currency) : '—'}
        </Text>
        <View style={{ height: spacing.md }} />
        <Button
          title="Fund Account"
          variant="secondary"
          onPress={() => navigation.navigate('FundAccount', { accountId })}
        />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListHeaderComponent={<Text style={[typography.h3, { marginBottom: spacing.xs }]}>Recent Activity</Text>}
        ListEmptyComponent={
          !loading ? (
            <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.lg }]}>
              No transactions yet.
            </Text>
          ) : null
        }
        renderItem={({ item }) => <TransactionRow transaction={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
  header: {
    backgroundColor: colors.navy,
    padding: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
});
