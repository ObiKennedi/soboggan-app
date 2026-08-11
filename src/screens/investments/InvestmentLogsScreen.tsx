import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InvestmentsStackParamList } from '../../navigation/InvestmentsStack';
import { fetchInvestmentLogs, fetchInvestmentOverview, fetchSellInstructions } from '../../api/investments';
import { InvestmentLogEntry, InvestmentOverview, SellInstruction } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { formatCurrency } from '../../components/formatCurrency';
import { colors, radii, spacing, typography } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<InvestmentsStackParamList, 'InvestmentLogs'>;

export function InvestmentLogsScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<'LOGS' | 'INSTRUCTIONS'>('LOGS');
  const [overview, setOverview] = useState<InvestmentOverview | null>(null);
  const [logs, setLogs] = useState<InvestmentLogEntry[]>([]);
  const [instructions, setInstructions] = useState<SellInstruction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, lg, inst] = await Promise.all([
        fetchInvestmentOverview().catch(() => null),
        fetchInvestmentLogs().catch(() => []),
        fetchSellInstructions().catch(() => []),
      ]);
      setOverview(ov);
      setLogs(lg);
      setInstructions(inst);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={activeTab === 'LOGS' ? logs : instructions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
        ListHeaderComponent={
          <View>
            {/* Portfolio Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
                  <Text style={styles.summaryAmount}>
                    {formatCurrency(overview?.totalValue ?? 0, 'NGN')}
                  </Text>
                </View>
                <View style={styles.summaryBadge}>
                  <Text style={styles.summaryBadgeText}>
                    {overview?.totalHoldingsCount ?? 0} Assets
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Button
                title="View Portfolio & Instruct Admin to Sell"
                onPress={() => navigation.navigate('PortfolioSellInstruction')}
                style={styles.actionBtn}
              />
            </View>

            {/* Segmented Filter */}
            <View style={styles.tabContainer}>
              <Pressable
                style={[styles.tabBtn, activeTab === 'LOGS' && styles.tabBtnActive]}
                onPress={() => setActiveTab('LOGS')}
              >
                <Text style={[styles.tabText, activeTab === 'LOGS' && styles.tabTextActive]}>
                  Investment Logs
                </Text>
              </Pressable>

              <Pressable
                style={[styles.tabBtn, activeTab === 'INSTRUCTIONS' && styles.tabBtnActive]}
                onPress={() => setActiveTab('INSTRUCTIONS')}
              >
                <Text style={[styles.tabText, activeTab === 'INSTRUCTIONS' && styles.tabTextActive]}>
                  Admin Sell Requests ({instructions.length})
                </Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={48} color={colors.gray} />
              <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.sm }]}>
                {activeTab === 'LOGS'
                  ? 'No investment activity logs found.'
                  : 'No admin sell instructions submitted yet.'}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }: { item: any }) => (
          activeTab === 'LOGS' ? (
            <LogCard log={item} />
          ) : (
            <InstructionCard instruction={item} />
          )
        )}
      />
    </View>
  );
}

function LogCard({ log }: { log: InvestmentLogEntry }) {
  const isInstruction = log.type === 'SELL_INSTRUCTION';

  return (
    <Card style={styles.itemCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>
          <Ionicons
            name={isInstruction ? 'arrow-redo-outline' : 'cash-outline'}
            size={20}
            color={colors.navy}
          />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={typography.h3}>{log.title}</Text>
          <Text style={typography.caption}>{new Date(log.timestamp).toLocaleString()}</Text>
        </View>
        {log.amount !== null && log.amount !== undefined && (
          <Text style={[typography.body, { fontWeight: '700' }]}>
            {formatCurrency(log.amount, log.currency)}
          </Text>
        )}
      </View>
      <Text style={[typography.bodyMuted, { marginTop: spacing.xs, fontSize: 13 }]}>
        {log.description}
      </Text>
    </Card>
  );
}

function InstructionCard({ instruction }: { instruction: SellInstruction }) {
  const statusColor =
    instruction.status === 'EXECUTED'
      ? colors.success
      : instruction.status === 'REJECTED' || instruction.status === 'CANCELLED'
      ? colors.danger
      : colors.gold;

  return (
    <Card style={styles.itemCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={typography.h3}>
            Sell {instruction.quantity} units of {instruction.assetSymbol}
          </Text>
          <Text style={typography.caption}>{instruction.assetName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>
            {instruction.status}
          </Text>
        </View>
      </View>

      {instruction.targetPrice && (
        <Text style={[typography.caption, { marginTop: spacing.xs }]}>
          Target Valuation: {formatCurrency(Number(instruction.targetPrice), 'NGN')}
        </Text>
      )}

      {instruction.notes && (
        <Text style={[typography.bodyMuted, { marginTop: 4, fontStyle: 'italic' }]}>
          "{instruction.notes}"
        </Text>
      )}

      {instruction.adminNotes && (
        <View style={styles.adminNoteBox}>
          <Text style={styles.adminNoteTitle}>Admin Response:</Text>
          <Text style={styles.adminNoteText}>{instruction.adminNotes}</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
  summaryCard: {
    backgroundColor: colors.navy,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: { ...typography.caption, color: colors.gray },
  summaryAmount: { ...typography.amount, color: colors.gold, marginTop: 4 },
  summaryBadge: {
    backgroundColor: colors.white + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  summaryBadgeText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  divider: {
    height: 1,
    backgroundColor: colors.white + '15',
    marginVertical: spacing.md,
  },
  actionBtn: {
    backgroundColor: colors.gold,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  tabBtnActive: {
    backgroundColor: colors.navy,
  },
  tabText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },

  itemCard: {
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  adminNoteBox: {
    marginTop: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.offWhite,
    borderRadius: radii.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.navy,
  },
  adminNoteTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.navy,
  },
  adminNoteText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
