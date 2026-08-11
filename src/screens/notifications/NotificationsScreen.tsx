import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { format } from 'date-fns';
import { useNotifications } from '../../realtime/useNotifications';
import { AppNotification } from '../../types';
import { colors, spacing, typography } from '../../theme/theme';

export function NotificationsScreen() {
  const { notifications, isLoading, refresh, markAsRead, markAllAsRead } = useNotifications();

  return (
    <View style={styles.container}>
      {notifications.some((n) => !n.read) && (
        <Pressable onPress={markAllAsRead} style={styles.markAllRow}>
          <Text style={[typography.caption, { color: colors.gold, fontWeight: '600' }]}>
            Mark all as read
          </Text>
        </Pressable>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.xl }]}>
              You're all caught up.
            </Text>
          ) : null
        }
        renderItem={({ item }) => <NotificationRow item={item} onPress={() => markAsRead(item.id)} />}
      />
    </View>
  );
}

function NotificationRow({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, !item.read && styles.unreadRow]}>
      {!item.read && <View style={styles.unreadDot} />}
      <View style={{ flex: 1, marginLeft: item.read ? spacing.md : spacing.sm }}>
        <Text style={[typography.body, { fontWeight: item.read ? '400' : '600' }]}>{item.title}</Text>
        <Text style={typography.bodyMuted}>{item.body}</Text>
        <Text style={typography.caption}>{format(new Date(item.createdAt), 'MMM d, h:mm a')}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
  markAllRow: { alignItems: 'flex-end', paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadRow: { backgroundColor: '#FBF6E9' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold, marginTop: 6 },
});
