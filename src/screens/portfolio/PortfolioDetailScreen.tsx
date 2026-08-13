import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PortfolioStackParamList } from '../../navigation/PortfolioStack';
import { fetchPortfolio } from '../../api/portfolio';
import {
  fetchInvestmentOverview,
  fetchInvestmentLogs,
  fetchSellInstructions,
  createSellInstruction,
} from '../../api/investments';
import {
  Portfolio,
  Holding,
  InvestmentOverview,
  InvestmentLogEntry,
  SellInstruction,
  AssetCategory,
} from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/TextInput';
import { formatCurrency } from '../../components/formatCurrency';
import { colors, radii, spacing, typography } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<PortfolioStackParamList, 'PortfolioDetail'>;

type MainTab = 'HOLDINGS' | 'HISTORY';
type HistoryFilter = 'ALL' | 'SELL_REQUESTS';

export function PortfolioDetailScreen({ route, navigation }: Props) {
  const accountId = route?.params?.accountId;
  const [activeTab, setActiveTab] = useState<MainTab>('HOLDINGS');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('ALL');

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [overview, setOverview] = useState<InvestmentOverview | null>(null);
  const [logs, setLogs] = useState<InvestmentLogEntry[]>([]);
  const [instructions, setInstructions] = useState<SellInstruction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Admin Sell Instruction
  const [modalVisible, setModalVisible] = useState(false);
  const [assetSymbol, setAssetSymbol] = useState('');
  const [assetName, setAssetName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [port, ov, lg, inst] = await Promise.all([
        accountId ? fetchPortfolio(accountId).catch(() => null) : Promise.resolve(null),
        fetchInvestmentOverview().catch(() => null),
        fetchInvestmentLogs().catch(() => []),
        fetchSellInstructions().catch(() => []),
      ]);
      setPortfolio(port);
      setOverview(ov);
      setLogs(lg);
      setInstructions(inst);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const openSellModalForAsset = (holding: { symbol: string; name: string; quantity: number }) => {
    setAssetSymbol(holding.symbol);
    setAssetName(holding.name);
    setQuantity(holding.quantity.toString());
    setTargetPrice('');
    setNotes('');
    setModalVisible(true);
  };

  const openCustomSellModal = () => {
    setAssetSymbol('');
    setAssetName('');
    setQuantity('');
    setTargetPrice('');
    setNotes('');
    setModalVisible(true);
  };

  const handleSubmitInstruction = async () => {
    if (!assetSymbol.trim() || !assetName.trim()) {
      Alert.alert('Missing Info', 'Please provide the property or asset symbol and name.');
      return;
    }

    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity to sell.');
      return;
    }

    setSubmitting(true);
    try {
      await createSellInstruction({
        assetSymbol: assetSymbol.trim(),
        assetName: assetName.trim(),
        quantity: qtyNum,
        targetPrice: targetPrice.trim() ? parseFloat(targetPrice) : undefined,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Instruction Submitted', 'Your sell instruction has been sent to Admin.', [
        {
          text: 'OK',
          onPress: () => {
            setModalVisible(false);
            loadData();
          },
        },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to submit instruction.';
      Alert.alert('Submission Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const totalValue = overview?.totalValue ?? portfolio?.totalValue ?? 0;
  const holdingsList = overview?.holdings ?? (portfolio?.holdings ? portfolio.holdings.map(h => ({
    id: h.id,
    symbol: h.asset.symbol,
    name: h.asset.name,
    assetType: h.asset.type,
    assetCategory: 'STOCK' as AssetCategory,
    quantity: Number(h.quantity),
    averageCost: Number(h.averageCost),
    currentPrice: Number(h.asset.currentPrice),
    priceUSD: null,
    isLivePrice: false,
    marketValue: h.marketValue,
    unrealizedPnL: h.unrealizedPnL,
    listingId: null,
  })) : []);

  return (
    <View style={styles.container}>
      {/* Portfolio Header Summary Card */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerLabel}>Total Portfolio Value</Text>
            <Text style={styles.headerAmount}>
              {formatCurrency(totalValue, portfolio?.currency ?? 'NGN')}
            </Text>
          </View>
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>{holdingsList.length} Assets</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.sellActionBtn} onPress={openCustomSellModal}>
            <Ionicons name="paper-plane-outline" size={16} color={colors.navy} />
            <Text style={styles.sellActionBtnText}>+ Sell Instruction</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Tabs: Holdings vs History */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tabItem, activeTab === 'HOLDINGS' && styles.tabItemActive]}
          onPress={() => setActiveTab('HOLDINGS')}
        >
          <Ionicons
            name="pie-chart-outline"
            size={18}
            color={activeTab === 'HOLDINGS' ? colors.white : colors.textSecondary}
          />
          <Text style={[styles.tabItemText, activeTab === 'HOLDINGS' && styles.tabItemTextActive]}>
            Holdings ({holdingsList.length})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabItem, activeTab === 'HISTORY' && styles.tabItemActive]}
          onPress={() => setActiveTab('HISTORY')}
        >
          <Ionicons
            name="time-outline"
            size={18}
            color={activeTab === 'HISTORY' ? colors.white : colors.textSecondary}
          />
          <Text style={[styles.tabItemText, activeTab === 'HISTORY' && styles.tabItemTextActive]}>
            History ({logs.length})
          </Text>
        </Pressable>
      </View>

      {/* TAB CONTENT: HOLDINGS */}
      {activeTab === 'HOLDINGS' && (
        <FlatList
          data={holdingsList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
          ListEmptyComponent={
            !loading ? (
              <Card style={{ padding: spacing.xl, alignItems: 'center' }}>
                <Ionicons name="briefcase-outline" size={48} color={colors.gray} />
                <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.sm }]}>
                  No holdings in this portfolio yet.
                </Text>
              </Card>
            ) : null
          }
          renderItem={({ item }) => (
            <Card style={styles.holdingCard}>
              <View style={styles.holdingRow}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={typography.h3}>{item.symbol}</Text>
                    <AssetCategoryBadge category={item.assetCategory ?? 'STOCK'} />
                    {item.isLivePrice && (
                      <View style={styles.liveDot} />
                    )}
                  </View>
                  <Text style={typography.caption}>{item.name}</Text>
                  <Text style={[typography.caption, { color: colors.navy, fontWeight: '600', marginTop: 2 }]}>
                    {item.quantity} units owned
                  </Text>
                  {item.priceUSD != null && (
                    <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 11 }]}>
                      ${item.priceUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={typography.body}>{formatCurrency(item.marketValue, 'NGN')}</Text>
                  <Text
                    style={{
                      color: item.unrealizedPnL >= 0 ? colors.success : colors.danger,
                      fontWeight: '700',
                      fontSize: 13,
                      marginTop: 2,
                    }}
                  >
                    {item.unrealizedPnL >= 0 ? '+' : ''}
                    {formatCurrency(item.unrealizedPnL, 'NGN')}
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.holdingSellBtn}
                onPress={() =>
                  openSellModalForAsset({
                    symbol: item.symbol,
                    name: item.name,
                    quantity: item.quantity,
                  })
                }
              >
                <Ionicons name="arrow-redo-outline" size={15} color={colors.gold} />
                <Text style={styles.holdingSellBtnText}>Instruct Admin to Sell</Text>
              </Pressable>
            </Card>
          )}
        />
      )}

      {/* TAB CONTENT: HISTORY (Merged Investment Logs & Admin Requests) */}
      {activeTab === 'HISTORY' && (
        <View style={{ flex: 1 }}>
          {/* History Sub-Filter */}
          <View style={styles.subFilterRow}>
            <Pressable
              style={[styles.subFilterBtn, historyFilter === 'ALL' && styles.subFilterBtnActive]}
              onPress={() => setHistoryFilter('ALL')}
            >
              <Text style={[styles.subFilterText, historyFilter === 'ALL' && styles.subFilterTextActive]}>
                All Investment Logs ({logs.length})
              </Text>
            </Pressable>

            <Pressable
              style={[styles.subFilterBtn, historyFilter === 'SELL_REQUESTS' && styles.subFilterBtnActive]}
              onPress={() => setHistoryFilter('SELL_REQUESTS')}
            >
              <Text style={[styles.subFilterText, historyFilter === 'SELL_REQUESTS' && styles.subFilterTextActive]}>
                Admin Sell Requests ({instructions.length})
              </Text>
            </Pressable>
          </View>

          <FlatList
            data={historyFilter === 'ALL' ? logs : instructions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: spacing.md }}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="document-text-outline" size={48} color={colors.gray} />
                  <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.sm }]}>
                    {historyFilter === 'ALL'
                      ? 'No investment history logs recorded yet.'
                      : 'No admin sell requests submitted yet.'}
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item }: { item: any }) =>
              historyFilter === 'ALL' ? (
                <LogCard log={item} />
              ) : (
                <InstructionCard instruction={item} />
              )
            }
          />
        </View>
      )}

      {/* Admin Sell Instruction Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={typography.h2}>Instruct Admin to Sell</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle-outline" size={28} color={colors.gray} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Asset / Property Code or Symbol"
                placeholder="e.g. DANGCEM or PROP-LEKKI-01"
                value={assetSymbol}
                onChangeText={setAssetSymbol}
                autoCapitalize="characters"
              />

              <Input
                label="Property / Asset Name"
                placeholder="e.g. Dangote Cement Plc"
                value={assetName}
                onChangeText={setAssetName}
              />

              <Input
                label="Quantity / Units to Sell"
                placeholder="10"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />

              <Input
                label="Target Valuation / Price per unit (Optional, ₦)"
                placeholder="650.00"
                value={targetPrice}
                onChangeText={setTargetPrice}
                keyboardType="numeric"
              />

              <Input
                label="Special Instructions for Admin"
                placeholder="e.g. Liquidate prior to end of month at best market rate."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
              />

              <Button
                title="Send Sell Instruction to Admin"
                onPress={handleSubmitInstruction}
                loading={submitting}
                style={{ marginTop: spacing.md, marginBottom: spacing.md }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const ASSET_CATEGORY_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  STOCK: { label: '📈 Stock', bg: '#eff6ff', color: '#3b82f6' },
  CRYPTO: { label: '🪙 Crypto', bg: '#fffbeb', color: '#d97706' },
  REAL_ESTATE: { label: '🏠 Property', bg: '#ecfdf5', color: '#059669' },
};

function AssetCategoryBadge({ category }: { category: string }) {
  const cfg = ASSET_CATEGORY_STYLES[category] ?? ASSET_CATEGORY_STYLES.STOCK;
  return (
    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
      <Text style={{ fontSize: 10, fontWeight: '700', color: cfg.color }}>{cfg.label}</Text>
    </View>
  );
}

function LogCard({ log }: { log: InvestmentLogEntry }) {
  const isInstruction = log.type === 'SELL_INSTRUCTION' || log.type === 'BUY_INSTRUCTION';


  return (
    <Card style={styles.cardItem}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>
          <Ionicons
            name={isInstruction ? 'paper-plane-outline' : 'trending-up-outline'}
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
    <Card style={styles.cardItem}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
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
  header: {
    backgroundColor: colors.navy,
    padding: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLabel: { ...typography.caption, color: colors.gray },
  headerAmount: { ...typography.amount, color: colors.gold, marginTop: 4 },
  badgeWrap: {
    backgroundColor: colors.white + '18',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  actionRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  sellActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.sm,
  },
  sellActionBtnText: {
    color: colors.navy,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radii.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  tabItemActive: {
    backgroundColor: colors.navy,
  },
  tabItemText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  tabItemTextActive: {
    color: colors.white,
  },

  subFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  subFilterBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.sm,
    marginRight: spacing.xs,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subFilterBtnActive: {
    backgroundColor: colors.gold + '25',
    borderColor: colors.gold,
  },
  subFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  subFilterTextActive: {
    color: colors.navy,
  },

  holdingCard: {
    marginBottom: spacing.sm,
  },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  holdingSellBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.sm,
    marginTop: spacing.sm,
  },
  holdingSellBtnText: {
    color: colors.gold,
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },

  cardItem: {
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
});
