import React from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../realtime/useNotifications';
import { AppNotification } from '../types';
import { colors, radii, spacing, typography } from '../theme/theme';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const { notifications, isLoading, refresh, markAsRead, markAllAsRead } = useNotifications();

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="notifications-outline" size={22} color={colors.navy} style={{ marginRight: 8 }} />
              <Text style={styles.title}>Notifications</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              {notifications.some((n) => !n.read) && (
                <Pressable onPress={markAllAsRead} style={styles.markAllBtn}>
                  <Text style={styles.markAllText}>Mark all as read</Text>
                </Pressable>
              )}
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={colors.navy} />
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: spacing.lg }}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.emptyWrap}>
                  <Ionicons name="notifications-off-outline" size={44} color={colors.gray} />
                  <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.sm }]}>
                    You're all caught up. No new notifications.
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <NotificationRow
                item={item}
                onPress={() => markAsRead(item.id)}
              />
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

function NotificationRow({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, !item.read && styles.unreadRow]}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={
            item.type === 'PORTFOLIO_UPDATE'
              ? 'trending-up-outline'
              : item.type === 'TRANSACTION'
              ? 'cash-outline'
              : 'information-circle-outline'
          }
          size={20}
          color={colors.navy}
        />
      </View>
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <Text style={[typography.body, { fontWeight: item.read ? '500' : '700' }]}>
          {item.title}
        </Text>
        <Text style={[typography.bodyMuted, { marginTop: 2, fontSize: 13 }]}>{item.body}</Text>
        <Text style={[typography.caption, { marginTop: 4, color: colors.gray }]}>
          {format(new Date(item.createdAt), 'MMM d, h:mm a')}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '50%',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gold,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius: radii.sm,
  },
  unreadRow: {
    backgroundColor: '#FBF6E9',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
    marginTop: 6,
    marginLeft: 6,
  },
});
