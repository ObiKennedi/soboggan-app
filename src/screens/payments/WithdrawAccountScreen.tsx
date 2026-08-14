import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountsStackParamList } from '../../navigation/AccountsStack';
import { withdrawFromAccount } from '../../api/accounts';
import { Button } from '../../components/Button';
import { colors, radii, spacing, typography } from '../../theme/theme';

type Props = NativeStackScreenProps<AccountsStackParamList, 'WithdrawAccount'>;

export function WithdrawAccountScreen({ route, navigation }: Props) {
  const accountId = route.params?.accountId;
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [notes, setNotes] = useState('');
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

    if (!bankName.trim()) {
      Alert.alert('Missing Bank Name', 'Please enter the name of your destination bank.');
      return;
    }

    const cleanedAccountNumber = accountNumber.replace(/[^0-9]/g, '');
    if (cleanedAccountNumber.length < 10) {
      Alert.alert(
        'Invalid Account Number',
        'Please enter a valid 10-digit NUBAN bank account number.',
      );
      return;
    }

    if (!accountHolderName.trim()) {
      Alert.alert(
        'Missing Account Name',
        'Please enter the beneficiary / account holder name.',
      );
      return;
    }

    const destinationDescription = `Withdrawal to ${bankName.trim()} - ${cleanedAccountNumber} (${accountHolderName.trim()})${
      notes.trim() ? ` | ${notes.trim()}` : ''
    }`;

    const metadata = {
      bankName: bankName.trim(),
      accountNumber: cleanedAccountNumber,
      accountHolderName: accountHolderName.trim(),
      notes: notes.trim() || undefined,
    };

    setLoading(true);
    try {
      await withdrawFromAccount(accountId, parsed, destinationDescription, metadata);
      Alert.alert(
        'Withdrawal Request Submitted',
        `₦${parsed.toLocaleString()} withdrawal to ${bankName.trim()} (${cleanedAccountNumber}) has been processed.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      Alert.alert(
        'Withdrawal Failed',
        err?.response?.data?.message ||
          'Could not complete withdrawal. Please check your balance.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.white }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={typography.h3}>Withdraw Funds</Text>
        <Text style={[typography.bodyMuted, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
          Specify amount and your destination bank account details.
        </Text>

        {/* Amount Input */}
        <Text style={styles.label}>Withdrawal Amount (₦)</Text>
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

        {/* Bank Details Card */}
        <View style={styles.bankCard}>
          <Text style={styles.bankCardHeader}>Destination Bank Account Details</Text>

          <Text style={[styles.label, { marginTop: spacing.sm }]}>Bank Name</Text>
          <TextInput
            value={bankName}
            onChangeText={setBankName}
            placeholder="e.g. Zenith Bank, GTBank, Access Bank"
            style={styles.textInput}
            autoCapitalize="words"
          />

          <Text style={[styles.label, { marginTop: spacing.sm }]}>Account Number (10 Digits)</Text>
          <TextInput
            value={accountNumber}
            onChangeText={(text) => setAccountNumber(text.replace(/[^0-9]/g, ''))}
            placeholder="0123456789"
            keyboardType="number-pad"
            maxLength={10}
            style={styles.textInput}
          />

          <Text style={[styles.label, { marginTop: spacing.sm }]}>Account Holder Name</Text>
          <TextInput
            value={accountHolderName}
            onChangeText={setAccountHolderName}
            placeholder="e.g. John Doe"
            style={styles.textInput}
            autoCapitalize="words"
          />
        </View>

        {/* Optional Notes */}
        <Text style={[styles.label, { marginTop: spacing.md }]}>Additional Remarks / Note (Optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Personal savings transfer"
          style={styles.textInput}
        />

        <View style={{ height: spacing.xl }} />
        <Button title="Confirm Withdrawal" onPress={handleWithdrawal} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  label: { ...typography.caption, color: colors.navy, marginBottom: spacing.xs, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.offWhite,
    marginBottom: spacing.md,
  },
  currencyPrefix: { ...typography.amount, marginRight: spacing.xs },
  input: { ...typography.amount, flex: 1, paddingVertical: spacing.sm },
  bankCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  bankCardHeader: {
    ...typography.body,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    backgroundColor: colors.white,
  },
});

