import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountsStackParamList } from '../../navigation/AccountsStack';
import { withdrawFromAccount } from '../../api/accounts';
import { Button } from '../../components/Button';
import { colors, spacing, typography } from '../../theme/theme';

type Props = NativeStackScreenProps<AccountsStackParamList, 'WithdrawAccount'>;

export function WithdrawAccountScreen({ route, navigation }: Props) {
  const accountId = route.params?.accountId;
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdrawal = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to withdraw.');
      return;
    }
    if (!accountId) {
      Alert.alert('Error', 'No account selected for withdrawal.');
      return;
    }

    setLoading(true);
    try {
      await withdrawFromAccount(accountId, parsed, description.trim() || undefined);
      Alert.alert('Withdrawal Successful', `₦${parsed.toLocaleString()} has been withdrawn from your account.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Withdrawal Failed', err?.response?.data?.message || 'Could not complete withdrawal. Please check your balance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={typography.h3}>Withdraw Funds</Text>
      <Text style={[typography.bodyMuted, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
        Specify amount to withdraw from your account balance.
      </Text>

      <Text style={styles.label}>Amount (₦)</Text>
      <View style={styles.inputRow}>
        <Text style={styles.currencyPrefix}>₦</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          style={styles.input}
          autoFocus
        />
      </View>

      <Text style={[styles.label, { marginTop: spacing.md }]}>Notes / Reference (Optional)</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="e.g. Transfer to bank account"
        style={styles.textInput}
      />

      <View style={{ height: spacing.xl }} />
      <Button title="Confirm Withdrawal" onPress={handleWithdrawal} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.lg },
  label: { ...typography.caption, color: colors.navy, marginBottom: spacing.xs, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.offWhite,
  },
  currencyPrefix: { ...typography.amount, marginRight: spacing.xs },
  input: { ...typography.amount, flex: 1, paddingVertical: spacing.sm },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    backgroundColor: colors.offWhite,
  },
});
