import React, { useState } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Input } from '../../components/TextInput';
import { colors, radii, spacing, typography } from '../../theme/theme';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { requestPasswordReset } from '../../api/auth';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
type RouteProps = RouteProp<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  const [email, setEmail] = useState(route.params?.email || '');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetRequest = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address to recover your password.');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Could not send recovery email. Please try again.';
      Alert.alert('Password Recovery', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
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

            <Text style={styles.title}>PASSWORD RECOVERY</Text>
            <Text style={styles.subtitle}>Reset your account password</Text>
            <Text style={styles.description}>
              {isSubmitted
                ? `We have sent password recovery instructions to ${email}. Please check your inbox and follow the link to reset your password.`
                : 'Enter the email address associated with your Soboggan account, and we will send you instructions to reset your password.'}
            </Text>
          </View>

          {!isSubmitted ? (
            <View style={styles.formContainer}>
              <Input
                label="Email Address"
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />

              <Button
                title="Send Recovery Instructions"
                onPress={handleResetRequest}
                loading={loading}
                style={styles.actionBtn}
              />
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Button
                title="Resend Instructions"
                onPress={handleResetRequest}
                loading={loading}
                variant="outline"
                style={styles.actionBtn}
              />
            </View>
          )}

          <View style={styles.footer}>
            <Pressable onPress={() => navigation.navigate('Login')} style={styles.backBtn}>
              <Text style={styles.backText}>Back to Sign In</Text>
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
  formContainer: {
    width: '100%',
  },
  actionBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  backBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  backText: {
    ...typography.caption,
    color: colors.navy,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
