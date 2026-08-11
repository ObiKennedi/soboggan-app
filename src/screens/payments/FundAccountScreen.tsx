import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountsStackParamList } from '../../navigation/AccountsStack';
import { initializePayment, verifyPayment } from '../../api/payments';
import { Button } from '../../components/Button';
import { colors, spacing, typography } from '../../theme/theme';

type Props = NativeStackScreenProps<AccountsStackParamList, 'FundAccount'>;

// Paystack redirects to its own success page by default; we detect
// completion by watching for Paystack's own domain leaving / callback
// pattern. If you set a custom callback_url on the backend, match that here.
const SUCCESS_URL_MARKER = 'callback';

export function FundAccountScreen({ route, navigation }: Props) {
  const { accountId } = route.params;
  const [amount, setAmount] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const startCheckout = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      Alert.alert('Enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      const result = await initializePayment(accountId, parsed);
      setCheckoutUrl(result.authorizationUrl);
      setReference(result.reference);
    } catch (err: any) {
      Alert.alert('Could not start payment', err?.response?.data?.message ?? 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationChange = async (navState: { url: string }) => {
    if (verifying || !reference) return;
    if (navState.url.includes(SUCCESS_URL_MARKER)) {
      setVerifying(true);
      try {
        await verifyPayment(reference);
        Alert.alert('Payment successful', 'Your account has been credited.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch {
        Alert.alert(
          'Still processing',
          "We're confirming your payment — check your account in a moment.",
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      }
    }
  };

  if (checkoutUrl) {
    return (
      <WebView
        source={{ uri: checkoutUrl }}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={typography.h3}>How much would you like to add?</Text>
      <View style={{ height: spacing.md }} />
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
      <View style={{ height: spacing.lg }} />
      <Button title="Continue to Payment" onPress={startCheckout} loading={loading} />
      <Text style={[typography.caption, { marginTop: spacing.md, textAlign: 'center' }]}>
        You'll be taken to Paystack's secure checkout to complete this payment.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.lg },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  currencyPrefix: { ...typography.amount, marginRight: spacing.xs },
  input: { ...typography.amount, flex: 1, paddingVertical: spacing.sm },
});
