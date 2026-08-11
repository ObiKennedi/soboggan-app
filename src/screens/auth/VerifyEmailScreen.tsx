import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/TextInput';
import { colors, radii, spacing, typography } from '../../theme/theme';

interface VerifyEmailScreenProps {
  route?: {
    params?: {
      email?: string;
    };
  };
  navigation?: any;
}

export function VerifyEmailScreen({ route, navigation }: VerifyEmailScreenProps) {
  const { user, verifyEmail, resendVerification, logout } = useAuth();
  const email = route?.params?.email || user?.email || '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const handleVerify = async () => {
    if (!code.trim() || code.trim().length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the complete 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(email, code.trim());
      Alert.alert('Email Verified', 'Your email address has been verified successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Verification failed. Please try again.';
      Alert.alert('Verification Failed', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Error', 'No email address found.');
      return;
    }

    if (cooldown > 0) return;

    setResending(true);
    try {
      const res = await resendVerification(email);
      setCooldown(60); // 60 seconds cooldown
      Alert.alert('Code Resent', res.message || 'A new verification code has been sent to your email address.');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Could not resend verification code. Please try again.';
      Alert.alert('Resend Failed', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoLetter}>S</Text>
            </View>

            <Text style={styles.title}>EMAIL VERIFICATION</Text>
            <Text style={styles.subtitle}>Check your inbox</Text>
            <Text style={styles.description}>
              We sent a 6-digit code to{' '}
              <Text style={styles.emailHighlight}>{email || 'your email address'}</Text>.
              Enter the code below to complete your registration.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="6-Digit Code"
              placeholder="123456"
              value={code}
              onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              style={styles.codeInput}
            />

            <Button
              title="Verify Email"
              onPress={handleVerify}
              loading={loading}
              style={styles.actionBtn}
            />

            <Button
              title={cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Verification Code'}
              onPress={handleResend}
              loading={resending}
              disabled={cooldown > 0}
              variant="outline"
              style={styles.resendBtn}
            />
          </View>

          <View style={styles.footer}>
            <Pressable onPress={() => logout()} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Back to Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoLetter: { color: colors.gold, fontSize: 28, fontWeight: '700' },
  title: { ...typography.h1, letterSpacing: 2, textAlign: 'center' },
  subtitle: { ...typography.bodyMuted, letterSpacing: 1, marginTop: 4 },
  description: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: '700',
    color: colors.navy,
  },
  formContainer: {
    width: '100%',
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '700',
  },
  actionBtn: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  resendBtn: {
    marginTop: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  logoutBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  logoutText: {
    ...typography.caption,
    color: colors.gray,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
