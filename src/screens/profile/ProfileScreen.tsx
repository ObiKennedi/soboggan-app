import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { colors, radii, spacing, typography } from '../../theme/theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const getInitials = () => {
    if (!user) return 'U';
    const f = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const l = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    return f + l || 'U';
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your Soboggan account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to sign out.');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={typography.bodyMuted}>No user session found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      {/* User Header Profile Card */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <Text style={styles.userName}>{`${user.firstName} ${user.lastName}`}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: colors.gold + '25' }]}>
            <Ionicons name="shield-checkmark" size={13} color={colors.gold} style={{ marginRight: 4 }} />
            <Text style={[styles.badgeText, { color: colors.gold }]}>
              {user.role}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.success + '20', marginLeft: spacing.xs }]}>
            <Ionicons name="checkmark-circle" size={13} color={colors.success} style={{ marginRight: 4 }} />
            <Text style={[styles.badgeText, { color: colors.success }]}>
              KYC {user.kycStatus}
            </Text>
          </View>
        </View>
      </View>

      {/* Account Details Section */}
      <Text style={styles.sectionHeader}>Personal Information</Text>
      <Card style={styles.cardGroup}>
        <InfoRow
          icon="person-outline"
          label="First Name"
          value={user.firstName}
        />
        <Divider />
        <InfoRow
          icon="person-outline"
          label="Last Name"
          value={user.lastName}
        />
        <Divider />
        <InfoRow
          icon="mail-outline"
          label="Email Address"
          value={user.email}
          verified={user.emailVerified}
        />
        <Divider />
        <InfoRow
          icon="finger-print-outline"
          label="KYC Status"
          value={user.kycStatus}
        />
      </Card>

      {/* Security & Preferences */}
      <Text style={styles.sectionHeader}>Preferences & Security</Text>
      <Card style={styles.cardGroup}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="finger-print" size={20} color={colors.navy} />
            <Text style={styles.settingLabel}>Biometric / FaceID Login</Text>
          </View>
          <Switch
            value={biometricsEnabled}
            onValueChange={setBiometricsEnabled}
            trackColor={{ false: colors.border, true: colors.navy }}
            thumbColor={biometricsEnabled ? colors.gold : colors.gray}
          />
        </View>
        <Divider />
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={20} color={colors.navy} />
            <Text style={styles.settingLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.navy }}
            thumbColor={notificationsEnabled ? colors.gold : colors.gray}
          />
        </View>
      </Card>

      {/* Support & Legal */}
      <Text style={styles.sectionHeader}>Support & Legal</Text>
      <Card style={styles.cardGroup}>
        <Pressable
          style={styles.clickableRow}
          onPress={() => Alert.alert('Help & Support', 'Reach out to support@soboggan.com for 24/7 assistance.')}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="help-circle-outline" size={20} color={colors.navy} />
            <Text style={styles.settingLabel}>Help Center & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.gray} />
        </Pressable>
        <Divider />
        <Pressable
          style={styles.clickableRow}
          onPress={() => Alert.alert('Terms of Service', 'Soboggan Financial Platform Terms and Governance.')}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="document-text-outline" size={20} color={colors.navy} />
            <Text style={styles.settingLabel}>Terms & Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.gray} />
        </Pressable>
      </Card>

      {/* Sign Out Button */}
      <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={22} color={colors.danger} />
        <Text style={styles.signOutBtnText}>Sign Out</Text>
      </Pressable>

      <Text style={styles.versionText}>Soboggan Mobile v1.2.0 • Secure Encryption</Text>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, verified }: { icon: any; label: string; value: string; verified?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={18} color={colors.navy} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.infoValue}>{value}</Text>
        {verified && (
          <Ionicons name="checkmark-circle" size={16} color={colors.success} style={{ marginLeft: 4 }} />
        )}
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeaderCard: {
    backgroundColor: colors.navy,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.navy,
  },
  userName: {
    ...typography.h2,
    color: colors.white,
    marginTop: spacing.xs,
  },
  userEmail: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    ...typography.h3,
    color: colors.navy,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  cardGroup: {
    padding: 0,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.navy,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    ...typography.body,
    color: colors.navy,
    marginLeft: spacing.xs,
  },
  clickableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.danger,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  signOutBtnText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: spacing.xs,
  },
  versionText: {
    textAlign: 'center',
    color: colors.gray,
    fontSize: 12,
    marginBottom: spacing.xl,
  },
});
