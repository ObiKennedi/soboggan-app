import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { colors, spacing, typography } from '../theme/theme';
import { formatCurrency } from './formatCurrency';
import { Transaction } from '../types';

const CREDIT_TYPES = new Set([
  'DEPOSIT',
  'SELL',
  'INTEREST',
  'DIVIDEND',
  'LOAN_DISBURSEMENT',
  'TRANSFER_IN',
]);

function labelFor(type: string) {
  return type
    .split('_')
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(' ');
}

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isCredit = CREDIT_TYPES.has(transaction.type);

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: isCredit ? '#E7F5EC' : '#FCEAEA' },
        ]}
      >
        <Ionicons
          name={isCredit ? 'arrow-down' : 'arrow-up'}
          size={16}
          color={isCredit ? colors.success : colors.danger}
        />
      </View>

      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <Text style={typography.body}>{labelFor(transaction.type)}</Text>
        <Text style={typography.caption}>
          {format(new Date(transaction.createdAt), 'MMM d, yyyy · h:mm a')}
        </Text>
      </View>

      <Text
        style={[
          typography.body,
          { fontWeight: '600', color: isCredit ? colors.success : colors.danger },
        ]}
      >
        {isCredit ? '+' : '-'}
        {formatCurrency(transaction.amount, transaction.currency)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
