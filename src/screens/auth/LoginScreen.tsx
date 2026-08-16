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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/TextInput';
import { colors, radii, spacing, typography } from '../../theme/theme';
import { AuthStackParamList } from '../../navigation/AuthStack';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { loginWithGoogle, loginWithCredentials, registerWithCredentials } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const handleCredentialAuth = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }

    if (isSignUp && (!firstName.trim() || !lastName.trim())) {
      Alert.alert('Missing details', 'Please enter your first name and last name.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const res = await registerWithCredentials({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
        });

        if (res?.user && res.user.emailVerified === false) {
          navigation.navigate('VerifyEmail', { email: res.user.email });
        }
      } else {
        const res = await loginWithCredentials(email.trim(), password);
        if (res?.user && res.user.emailVerified === false) {
          navigation.navigate('VerifyEmail', { email: res.user.email });
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'An error occurred. Please try again.';
      Alert.alert(isSignUp ? 'Sign-up failed' : 'Sign-in failed', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      Alert.alert('Google Sign-in failed', err?.message ?? 'Please try again.');
    } finally {
      setGoogleLoading(false);
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

            <Text style={styles.title}>SOBOGGAN</Text>
            <Text style={styles.subtitle}>MANAGEMENT LTD</Text>
            <Text style={styles.tagline}>Managing Capital. Building Futures.</Text>
          </View>

          {/* Mode Switcher */}
          <View style={styles.toggleContainer}>
            <Pressable
              style={[styles.toggleBtn, !isSignUp && styles.toggleBtnActive]}
              onPress={() => setIsSignUp(false)}
            >
              <Text style={[styles.toggleText, !isSignUp && styles.toggleTextActive]}>Sign In</Text>
            </Pressable>

            <Pressable
              style={[styles.toggleBtn, isSignUp && styles.toggleBtnActive]}
              onPress={() => setIsSignUp(true)}
            >
              <Text style={[styles.toggleText, isSignUp && styles.toggleTextActive]}>Sign Up</Text>
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {isSignUp && (
              <>
                <View style={styles.row}>
                  <Input
                    label="First Name"
                    placeholder="John"
                    value={firstName}
                    onChangeText={setFirstName}
                    containerStyle={{ flex: 1, marginRight: spacing.xs }}
                    autoCapitalize="words"
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    value={lastName}
                    onChangeText={setLastName}
                    containerStyle={{ flex: 1, marginLeft: spacing.xs }}
                    autoCapitalize="words"
                  />
                </View>
              </>
            )}

            <Input
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {isSignUp && (
              <Input
                label="Phone Number (Optional)"
                placeholder="+234 800 000 0000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            )}

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {!isSignUp && (
              <View style={styles.forgotContainer}>
                <Pressable
                  onPress={() => navigation.navigate('ForgotPassword', { email: email.trim() })}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </Pressable>
              </View>
            )}

            <Button
              title={isSignUp ? 'Create Account' : 'Sign In'}
              onPress={handleCredentialAuth}
              loading={loading}
              style={styles.actionBtn}
            />
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continue with Google"
            onPress={handleGoogleLogin}
            loading={googleLoading}
            variant="outline"
          />
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
    marginBottom: spacing.lg,
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
  title: { ...typography.h1, letterSpacing: 2 },
  subtitle: { ...typography.bodyMuted, letterSpacing: 3, marginTop: 2 },
  tagline: { ...typography.caption, marginTop: spacing.xs, color: colors.gold },

  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.offWhite,
    borderRadius: radii.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  toggleBtnActive: {
    backgroundColor: colors.navy,
  },
  toggleText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.white,
  },

  formContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  actionBtn: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  forgotText: {
    ...typography.caption,
    color: colors.navy,
    fontWeight: '600',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.gray,
    marginHorizontal: spacing.md,
    fontWeight: '600',
  },
});
