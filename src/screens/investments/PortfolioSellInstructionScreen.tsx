import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  RefreshControl,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InvestmentsStackParamList } from '../../navigation/InvestmentsStack';
import { createSellInstruction, fetchInvestmentOverview, fetchSellInstructions } from '../../api/investments';
import { InvestmentOverview, SellInstruction } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/TextInput';
import { formatCurrency } from '../../components/formatCurrency';
import { colors, radii, spacing, typography } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<InvestmentsStackParamList, 'PortfolioSellInstruction'>;

export function PortfolioSellInstructionScreen({ navigation }: Props) {
  const [overview, setOverview] = useState<InvestmentOverview | null>(null);
  const [instructions, setInstructions] = useState<SellInstruction[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for Admin Sell Instruction
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<{ symbol: string; name: string; quantity: number } | null>(null);
  const [assetSymbol, setAssetSymbol] = useState('');
  const [assetName, setAssetName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, inst] = await Promise.all([
        fetchInvestmentOverview().catch(() => null),
        fetchSellInstructions().catch(() => []),
      ]);
      setOverview(ov);
      setInstructions(inst);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openSellModalForAsset = (holding: { symbol: string; name: string; quantity: number }) => {
    setSelectedAsset(holding);
    setAssetSymbol(holding.symbol);
    setAssetName(holding.name);
    setQuantity(holding.quantity.toString());
    setTargetPrice('');
    setNotes('');
    setModalVisible(true);
  };

  const openCustomSellModal = () => {
    setSelectedAsset(null);
    setAssetSymbol('');
    setAssetName('');
    setQuantity('');
    setTargetPrice('');
    setNotes('');
    setModalVisible(true);
  };

  const handleSubmitInstruction = async () => {
    if (!assetSymbol.trim() || !assetName.trim()) {
      Alert.alert('Missing Info', 'Please provide the property or asset symbol/name.');
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

      Alert.alert('Instruction Sent', 'Your sell instruction has been sent to the Admin for processing.', [
        {
          text: 'OK',
          onPress: () => {
            setModalVisible(false);
            load();
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

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {/* Top Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Portfolio & Property Sales</Text>
          <Text style={styles.headerSubtitle}>
            Instruct Soboggan Admin to liquidate or sell your investment properties and assets.
          </Text>
          <Button
            title="+ Submit New Sell Instruction to Admin"
            onPress={openCustomSellModal}
            style={styles.newInstructionBtn}
          />
        </View>

        {/* Portfolio Holdings / Properties List */}
        <Text style={[typography.h3, { marginBottom: spacing.xs, marginTop: spacing.md }]}>
          Your Investment Portfolio Holdings
        </Text>

        {overview?.holdings && overview.holdings.length > 0 ? (
          overview.holdings.map((h) => (
            <Card key={h.id} style={styles.holdingCard}>
              <View style={styles.holdingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={typography.h3}>{h.symbol}</Text>
                  <Text style={typography.caption}>{h.name}</Text>
                  <Text style={[typography.caption, { color: colors.navy, fontWeight: '600' }]}>
                    {h.quantity} units owned
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={typography.body}>{formatCurrency(h.marketValue, 'NGN')}</Text>
                  <Text
                    style={{
                      color: h.unrealizedPnL >= 0 ? colors.success : colors.danger,
                      fontWeight: '600',
                      fontSize: 12,
                    }}
                  >
                    {h.unrealizedPnL >= 0 ? '+' : ''}
                    {formatCurrency(h.unrealizedPnL, 'NGN')}
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.sellHoldingBtn}
                onPress={() =>
                  openSellModalForAsset({
                    symbol: h.symbol,
                    name: h.name,
                    quantity: h.quantity,
                  })
                }
              >
                <Ionicons name="paper-plane-outline" size={16} color={colors.gold} />
                <Text style={styles.sellHoldingBtnText}>Instruct Admin to Sell This Property</Text>
              </Pressable>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={[typography.bodyMuted, { textAlign: 'center' }]}>
              No holdings in your active portfolio. You can still submit custom sale instructions below.
            </Text>
          </Card>
        )}

        {/* Submitted Sell Instructions History */}
        <Text style={[typography.h3, { marginBottom: spacing.xs, marginTop: spacing.lg }]}>
          Submitted Admin Sell Instructions
        </Text>

        {instructions.length > 0 ? (
          instructions.map((inst) => {
            const statusColor =
              inst.status === 'EXECUTED'
                ? colors.success
                : inst.status === 'REJECTED' || inst.status === 'CANCELLED'
                ? colors.danger
                : colors.gold;

            return (
              <Card key={inst.id} style={{ marginBottom: spacing.sm }}>
                <View style={styles.instructionHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={typography.h3}>
                      Sell {inst.quantity} units of {inst.assetSymbol}
                    </Text>
                    <Text style={typography.caption}>{inst.assetName}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>{inst.status}</Text>
                  </View>
                </View>

                {inst.targetPrice && (
                  <Text style={[typography.caption, { marginTop: spacing.xs }]}>
                    Target Valuation: {formatCurrency(Number(inst.targetPrice), 'NGN')}
                  </Text>
                )}

                {inst.notes && (
                  <Text style={[typography.bodyMuted, { marginTop: 4, fontStyle: 'italic' }]}>
                    "{inst.notes}"
                  </Text>
                )}

                <Text style={[typography.caption, { color: colors.gray, marginTop: spacing.xs }]}>
                  Submitted on {new Date(inst.createdAt).toLocaleDateString()}
                </Text>

                {inst.adminNotes && (
                  <View style={styles.adminNoteBox}>
                    <Text style={styles.adminNoteTitle}>Admin Remarks:</Text>
                    <Text style={styles.adminNoteText}>{inst.adminNotes}</Text>
                  </View>
                )}
              </Card>
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={[typography.bodyMuted, { textAlign: 'center' }]}>
              No sell instructions submitted yet.
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Modal for Submitting Admin Sell Instruction */}
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
                placeholder="e.g. PROP-LEKKI-01 or STK-MTN"
                value={assetSymbol}
                onChangeText={setAssetSymbol}
                autoCapitalize="characters"
              />

              <Input
                label="Property / Asset Name"
                placeholder="e.g. Lekki Phase 1 Commercial Property"
                value={assetName}
                onChangeText={setAssetName}
              />

              <Input
                label="Quantity / Units to Sell"
                placeholder="1.0"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />

              <Input
                label="Target Valuation / Price per unit (Optional, ₦)"
                placeholder="50,000,000"
                value={targetPrice}
                onChangeText={setTargetPrice}
                keyboardType="numeric"
              />

              <Input
                label="Special Instructions for Admin"
                placeholder="e.g. Please liquidate prior to quarter end or set reserve price at ₦45M."
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
  headerCard: {
    backgroundColor: colors.navy,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.xs,
  },
  headerTitle: { ...typography.h2, color: colors.gold },
  headerSubtitle: {
    ...typography.body,
    color: colors.white,
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 18,
  },
  newInstructionBtn: {
    backgroundColor: colors.gold,
    marginTop: spacing.md,
  },

  holdingCard: {
    marginBottom: spacing.sm,
  },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sellHoldingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.sm,
    marginTop: spacing.sm,
  },
  sellHoldingBtnText: {
    color: colors.gold,
    fontWeight: '600',
    fontSize: 13,
    marginLeft: spacing.xs,
  },

  emptyCard: {
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },

  instructionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
