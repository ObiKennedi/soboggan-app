import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoansStackParamList } from '../../navigation/LoansStack';
import { applyForLoan } from '../../api/loans';
import { Button } from '../../components/Button';
import { colors, spacing, typography } from '../../theme/theme';

type Props = NativeStackScreenProps<LoansStackParamList, 'LoanApplication'>;

export function LoanApplicationScreen({ navigation }: Props) {
  const [principal, setPrincipal] = useState('');
  const [tenureMonths, setTenureMonths] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const principalNum = parseFloat(principal);
    const tenureNum = parseInt(tenureMonths, 10);

    if (!principalNum || principalNum <= 0) {
      Alert.alert('Enter a valid loan amount');
      return;
    }
    if (!tenureNum || tenureNum < 1 || tenureNum > 60) {
      Alert.alert('Tenure must be between 1 and 60 months');
      return;
    }

    setLoading(true);
    try {
      await applyForLoan(principalNum, tenureNum, purpose || undefined);
      Alert.alert('Application submitted', 'We will review your loan request shortly.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Could not submit application', err?.response?.data?.message ?? 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={typography.bodyMuted}>Loan amount (₦)</Text>
      <TextInput
        value={principal}
        onChangeText={setPrincipal}
        keyboardType="decimal-pad"
        placeholder="e.g. 500000"
        style={styles.input}
      />

      <Text style={[typography.bodyMuted, { marginTop: spacing.md }]}>Tenure (months)</Text>
      <TextInput
        value={tenureMonths}
        onChangeText={setTenureMonths}
        keyboardType="number-pad"
        placeholder="e.g. 12"
        style={styles.input}
      />

      <Text style={[typography.bodyMuted, { marginTop: spacing.md }]}>Purpose (optional)</Text>
      <TextInput
        value={purpose}
        onChangeText={setPurpose}
        placeholder="e.g. Business expansion"
        style={styles.input}
      />

      <View style={{ height: spacing.xl }} />
      <Button title="Submit Application" onPress={submit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.xs,
    fontSize: 15,
  },
});
