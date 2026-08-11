import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoansStackParamList } from '../../navigation/LoansStack';
import { fetchMyLoans, repayLoan } from '../../api/loans';
import { Loan } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { formatCurrency } from '../../components/formatCurrency';
import { colors, spacing, typography } from '../../theme/theme';

type Props = NativeStackScreenProps<LoansStackParamList, 'LoansList'>;

const STATUS_LABEL: Record<string, string> = {
  APPLIED: 'Under review',
  UNDER_REVIEW: 'Under review',
  APPROVED: 'Approved — awaiting disbursement',
  REJECTED: 'Rejected',
  DISBURSED: 'Disbursed',
  REPAYING: 'Repaying',
  CLOSED: 'Paid off',
  DEFAULTED: 'Defaulted',
};

export function LoansListScreen({ navigation }: Props) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setLoans(await fetchMyLoans());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // NOTE: Alert.prompt is iOS-only. On Android this silently does nothing —
  // swap this for a proper modal + TextInput (same pattern as
  // FundAccountScreen) before shipping to Android users.
  const handleRepay = (loan: Loan) => {
    Alert.prompt?.(
      'Repay loan',
      `Outstanding: ${formatCurrency(loan.outstandingBalance)}`,
      async (input) => {
        const amount = parseFloat(input ?? '');
        if (!amount || amount <= 0) return;
        try {
          await repayLoan(loan.id, amount);
          load();
        } catch (err: any) {
          Alert.alert('Repayment failed', err?.response?.data?.message ?? 'Try again.');
        }
      },
      'plain-text',
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={loans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          !loading ? (
            <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.xl }]}>
              No loans yet.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Card style={{ marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={typography.h3}>{formatCurrency(item.principal)}</Text>
                <Text style={typography.caption}>{item.tenureMonths} months · {item.interestRate}% interest</Text>
                <Text style={[typography.caption, { color: colors.gold, marginTop: 2 }]}>
                  {STATUS_LABEL[item.status] ?? item.status}
                </Text>
              </View>
              {item.status === 'REPAYING' && (
                <Button title="Repay" onPress={() => handleRepay(item)} />
              )}
            </View>
            {item.status === 'REPAYING' && (
              <Text style={[typography.caption, { marginTop: spacing.xs }]}>
                Outstanding: {formatCurrency(item.outstandingBalance)}
              </Text>
            )}
          </Card>
        )}
      />

      <View style={{ padding: spacing.md }}>
        <Button title="Apply for a Loan" onPress={() => navigation.navigate('LoanApplication')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
});
