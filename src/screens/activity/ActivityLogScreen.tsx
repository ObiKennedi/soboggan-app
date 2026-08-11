import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { fetchActivityLog } from '../../api/transactions';
import { ActivityLogEntry } from '../../types';
import { colors, spacing, typography } from '../../theme/theme';

const ACTION_LABEL: Record<string, string> = {
  LOGIN: 'Signed in',
  PROFILE_UPDATED: 'Updated profile',
  ACCOUNT_CREATED: 'Opened a new account',
  TRANSACTION_CREATED: 'Made a transaction',
  PAYMENT_INITIALIZED: 'Started a payment',
  LOAN_APPLIED: 'Applied for a loan',
  LOAN_APPROVED: 'Loan approved',
  LOAN_REJECTED: 'Loan rejected',
  LOAN_DISBURSED: 'Loan disbursed',
  LOAN_REPAYMENT: 'Made a loan repayment',
};

export function ActivityLogScreen() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEntries(await fetchActivityLog());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          !loading ? (
            <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.xl }]}>
              No activity recorded yet.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.dot} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={typography.body}>{ACTION_LABEL[item.action] ?? item.action}</Text>
              <Text style={typography.caption}>
                {format(new Date(item.createdAt), 'MMM d, yyyy · h:mm a')}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
    marginTop: 6,
  },
});
