import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AccountsStackParamList } from '../../navigation/AccountsStack';
import { fetchAccounts, createAccount } from '../../api/accounts';
import { fetchAvailableStocks, createBuyInstruction } from '../../api/investments';
import { fetchLatestBlogPosts } from '../../api/blog';
import { Account, StockQuote, BlogPost } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { formatCurrency } from '../../components/formatCurrency';
import { useNotifications } from '../../realtime/useNotifications';
import { NotificationsModal } from '../../components/NotificationsModal';
import { colors, spacing, typography } from '../../theme/theme';

type Props = NativeStackScreenProps<AccountsStackParamList, 'AccountsList'>;

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  SAVINGS: 'Savings',
  INVESTMENT: 'Investment',
  LOAN: 'Loan',
  FIXED_DEPOSIT: 'Fixed Deposit',
};

export function AccountsListScreen({ navigation }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedPostForReading, setSelectedPostForReading] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useNotifications();
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Buy Stock Modal State
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [quantity, setQuantity] = useState('10');
  const [notes, setNotes] = useState('');
  const [submittingBuy, setSubmittingBuy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [accs, stks, posts] = await Promise.all([
        fetchAccounts().catch(() => []),
        fetchAvailableStocks().catch(() => []),
        fetchLatestBlogPosts(6).catch(() => []),
      ]);
      setAccounts(accs);
      setStocks(stks);
      setBlogPosts(posts);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => setShowNotificationsModal(true)} style={{ marginRight: spacing.sm }}>
          <View>
            <Ionicons name="notifications-outline" size={22} color={colors.white} />
            {unreadCount > 0 && <View style={styles.badge} />}
          </View>
        </Pressable>
      ),
    });
  }, [navigation, unreadCount]);

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);
  const primaryAccountId = accounts[0]?.id || '';

  const handleCreateAccount = async (type: 'SAVINGS' | 'INVESTMENT' = 'SAVINGS') => {
    try {
      setLoading(true);
      const newAcc = await createAccount(type);
      Alert.alert('Account Created', `Your new ${type.toLowerCase()} account (•••• ${newAcc.accountNumber.slice(-4)}) has been created!`);
      await load();
    } catch (err: any) {
      Alert.alert('Account Creation Error', err?.response?.data?.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleFund = () => {
    if (!primaryAccountId) {
      Alert.alert(
        'No Account Found',
        'You have not created a financial account yet. Would you like to create a Savings Account now?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Account', onPress: () => handleCreateAccount('SAVINGS') },
        ],
      );
      return;
    }
    navigation.navigate('FundAccount', { accountId: primaryAccountId });
  };

  const handleWithdraw = () => {
    if (!primaryAccountId) {
      Alert.alert(
        'No Account Found',
        'You have not created a financial account yet. Would you like to create a Savings Account now?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Account', onPress: () => handleCreateAccount('SAVINGS') },
        ],
      );
      return;
    }
    navigation.navigate('WithdrawAccount', { accountId: primaryAccountId });
  };

  const handleOpenBuyModal = (stock: StockQuote) => {
    setSelectedStock(stock);
    setQuantity('10');
    setNotes('');
  };

  const handleConfirmBuyInstruction = async () => {
    if (!selectedStock) return;
    const parsedQty = parseInt(quantity, 10);
    if (!parsedQty || parsedQty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid number of units.');
      return;
    }

    setSubmittingBuy(true);
    try {
      await createBuyInstruction({
        assetCategory: 'STOCK',
        stockSymbol: selectedStock.symbol,
        stockName: selectedStock.name,
        unitPrice: selectedStock.price,
        quantity: parsedQty,
        notes: notes.trim() || undefined,
      });

      const totalEstimated = parsedQty * selectedStock.price;
      setSelectedStock(null);
      Alert.alert(
        'Instruction Submitted',
        `Your request to purchase ${parsedQty} units of ${selectedStock.symbol} (Est. ₦${totalEstimated.toLocaleString()}) has been sent to the admin.`,
      );
    } catch (err: any) {
      Alert.alert('Submission Failed', err?.response?.data?.message || 'Could not send instruction to admin.');
    } finally {
      setSubmittingBuy(false);
    }
  };

  const parsedQtyNum = parseInt(quantity, 10) || 0;
  const estimatedCost = selectedStock ? parsedQtyNum * selectedStock.price : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {/* Balance Card with Action Buttons */}
        <View style={styles.summaryCard}>
          <Text style={[typography.bodyMuted, { color: 'rgba(255, 255, 255, 0.7)' }]}>
            Total Balance Across Accounts
          </Text>
          <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.fundBtn]} onPress={handleFund} activeOpacity={0.8}>
              <Ionicons name="arrow-down-circle" size={20} color={colors.navy} />
              <Text style={styles.fundBtnText}>Fund Account</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.withdrawBtn]} onPress={handleWithdraw} activeOpacity={0.8}>
              <Ionicons name="arrow-up-circle" size={20} color={colors.white} />
              <Text style={styles.withdrawBtnText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* NGN Market Available Stocks Section - Immediately below Balance Card */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="trending-up" size={20} color={colors.navy} style={{ marginRight: 6 }} />
            <Text style={typography.h3}>Available Stocks</Text>
          </View>
          <View style={styles.liveApiBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveApiText}>NGNMARKET.COM API</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}
        >
          {stocks.map((stock) => {
            const isPositive = !stock.changePercent.startsWith('-');
            return (
              <View key={stock.symbol} style={styles.stockCard}>
                <View style={styles.stockTopRow}>
                  <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                  <View style={[styles.pill, { backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
                    <Text style={[styles.pillText, { color: isPositive ? '#10b981' : '#ef4444' }]}>
                      {stock.changePercent}
                    </Text>
                  </View>
                </View>
                <Text style={styles.stockName} numberOfLines={1}>
                  {stock.name}
                </Text>
                <Text style={styles.stockPrice}>₦{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                {stock.volume && <Text style={styles.stockVolume}>Vol: {stock.volume}</Text>}

                <TouchableOpacity
                  style={styles.buyBtn}
                  onPress={() => handleOpenBuyModal(stock)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cart-outline" size={16} color={colors.white} style={{ marginRight: 4 }} />
                  <Text style={styles.buyBtnText}>Instruct Admin to Buy</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {/* User Accounts Section */}
        <View style={[styles.sectionHeader, { marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <Text style={typography.h3}>Your Accounts</Text>
          <TouchableOpacity onPress={() => handleCreateAccount('SAVINGS')} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="add-circle-outline" size={18} color={colors.navy} style={{ marginRight: 4 }} />
            <Text style={{ color: colors.navy, fontWeight: '700', fontSize: 13 }}>+ Open Account</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: spacing.md }}>
          {accounts.map((acc) => (
            <Pressable
              key={acc.id}
              onPress={() => navigation.navigate('AccountDetail', { accountId: acc.id })}
            >
              <Card style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={typography.h3}>{ACCOUNT_TYPE_LABEL[acc.type] ?? acc.type}</Text>
                    <Text style={typography.caption}>•••• {acc.accountNumber.slice(-4)}</Text>
                  </View>
                  <Text style={[typography.h3, { color: colors.navy }]}>
                    {formatCurrency(acc.balance, acc.currency)}
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))}

          {accounts.length === 0 && !loading && (
            <Card style={{ alignItems: 'center', padding: spacing.lg }}>
              <Ionicons name="wallet-outline" size={40} color={colors.gray} style={{ marginBottom: spacing.xs }} />
              <Text style={[typography.h3, { textAlign: 'center' }]}>No Financial Account Yet</Text>
              <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: 4, marginBottom: spacing.md }]}>
                To deposit funds or trade assets, you need an active Savings or Investment account.
              </Text>
              <Button title="+ Create Savings Account Now" onPress={() => handleCreateAccount('SAVINGS')} />
            </Card>
          )}
        </View>

        {/* ─── Market Insights & Post Suggestions Banner (Immediately Below Accounts) ─── */}
        {blogPosts.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="newspaper-outline" size={20} color={colors.navy} style={{ marginRight: 6 }} />
                <Text style={typography.h3}>Market Insights & Research</Text>
              </View>
              <View style={[styles.liveApiBadge, { backgroundColor: 'rgba(201, 162, 39, 0.15)' }]}>
                <Text style={[styles.liveApiText, { color: colors.gold }]}>INTELLIGENCE</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}
            >
              {blogPosts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.blogBannerCard}
                  onPress={() => setSelectedPostForReading(post)}
                  activeOpacity={0.88}
                >
                  {post.coverImageUrl ? (
                    <Image source={{ uri: post.coverImageUrl }} style={styles.blogBannerImage} />
                  ) : (
                    <View style={styles.blogBannerFallbackImage}>
                      <Ionicons name="book-outline" size={28} color={colors.gold} />
                    </View>
                  )}
                  <View style={styles.blogBannerContent}>
                    <View style={styles.blogBannerCategoryRow}>
                      <Text style={styles.blogBannerCategory}>{post.category}</Text>
                      <Text style={styles.blogBannerReadTime}>⏱ {post.readTime} min</Text>
                    </View>
                    <Text style={styles.blogBannerTitle} numberOfLines={2}>
                      {post.title}
                    </Text>
                    <Text style={styles.blogBannerExcerpt} numberOfLines={2}>
                      {post.excerpt}
                    </Text>
                    <View style={styles.blogBannerFooter}>
                      <Text style={styles.blogBannerAuthor} numberOfLines={1}>
                        {post.authorName}
                      </Text>
                      <Text style={styles.blogBannerCta}>Read Article →</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Full Article Reader Modal */}
      {selectedPostForReading && (
        <Modal
          animationType="slide"
          visible={!!selectedPostForReading}
          onRequestClose={() => setSelectedPostForReading(null)}
        >
          <View style={styles.readerContainer}>
            <View style={styles.readerHeader}>
              <TouchableOpacity onPress={() => setSelectedPostForReading(null)} style={styles.readerBackBtn}>
                <Ionicons name="arrow-back" size={24} color={colors.navy} />
              </TouchableOpacity>
              <Text style={styles.readerHeaderTitle} numberOfLines={1}>
                {selectedPostForReading.category}
              </Text>
              <TouchableOpacity onPress={() => Alert.alert('Share', 'Link copied to clipboard!')}>
                <Ionicons name="share-social-outline" size={22} color={colors.navy} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.readerScroll} showsVerticalScrollIndicator={false}>
              {selectedPostForReading.coverImageUrl && (
                <Image source={{ uri: selectedPostForReading.coverImageUrl }} style={styles.readerCoverImage} />
              )}

              <View style={styles.readerBody}>
                <View style={styles.readerMetaRow}>
                  <Text style={styles.readerBadge}>{selectedPostForReading.category}</Text>
                  <Text style={styles.readerMetaText}>⏱ {selectedPostForReading.readTime} min read</Text>
                </View>

                <Text style={styles.readerTitle}>{selectedPostForReading.title}</Text>

                <View style={styles.readerAuthorRow}>
                  <Ionicons name="person-circle-outline" size={20} color={colors.gold} />
                  <Text style={styles.readerAuthorName}>{selectedPostForReading.authorName}</Text>
                  <Text style={styles.readerDate}>
                    • {new Date(selectedPostForReading.publishedAt || selectedPostForReading.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.readerExcerpt}>{selectedPostForReading.excerpt}</Text>

                <View style={styles.readerDivider} />

                <Text style={styles.readerContentText}>{selectedPostForReading.content}</Text>

                <View style={styles.readerDisclaimerBox}>
                  <Ionicons name="shield-checkmark" size={24} color={colors.gold} style={{ marginRight: 10 }} />
                  <Text style={styles.readerDisclaimerText}>
                    Soboggan Research Desk. This article is provided for educational and capital allocation guidance.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Instruct Admin to Buy Stock Modal */}
      {selectedStock && (
        <Modal transparent animationType="fade" visible={!!selectedStock} onRequestClose={() => setSelectedStock(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Instruct Admin to Buy</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedStock.symbol} — {selectedStock.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedStock(null)}>
                  <Ionicons name="close" size={24} color={colors.navy} />
                </TouchableOpacity>
              </View>

              <View style={styles.stockDetailsBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.detailLabel}>Current Market Price</Text>
                  <Text style={styles.detailVal}>₦{selectedStock.price.toLocaleString()}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                  <Text style={styles.detailLabel}>24h Price Change</Text>
                  <Text style={[styles.detailVal, { color: selectedStock.changePercent.startsWith('-') ? '#ef4444' : '#10b981' }]}>
                    {selectedStock.changePercent}
                  </Text>
                </View>
              </View>

              <Text style={styles.inputLabel}>Quantity (Units)</Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                style={styles.modalInput}
                placeholder="10"
              />

              <Text style={styles.inputLabel}>Note / Special Instruction (Optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Execute at market open"
                style={styles.modalInput}
              />

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Estimated Total Cost:</Text>
                <Text style={styles.totalVal}>₦{estimatedCost.toLocaleString()}</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedStock(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleConfirmBuyInstruction} disabled={submittingBuy}>
                  <Text style={styles.submitBtnText}>{submittingBuy ? 'Submitting...' : 'Send Instruction'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {/* Notifications Modal */}
      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
  summaryCard: {
    backgroundColor: colors.navy,
    padding: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: spacing.md,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.gold,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: 12,
  },
  fundBtn: {
    backgroundColor: colors.gold,
  },
  fundBtnText: {
    color: colors.navy,
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 14,
  },
  withdrawBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  withdrawBtnText: {
    color: colors.white,
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  liveApiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
    marginRight: 4,
  },
  liveApiText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b45309',
  },
  stockCard: {
    width: 220,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginRight: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stockTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockSymbol: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.navy,
  },
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stockName: {
    fontSize: 12,
    color: colors.gray,
    marginVertical: 4,
  },
  stockPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
  },
  stockVolume: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
    borderRadius: 10,
    paddingVertical: spacing.xs + 4,
  },
  buyBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.gray,
    marginTop: 2,
  },
  stockDetailsBox: {
    backgroundColor: colors.offWhite,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.gray,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.navy,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    marginBottom: spacing.sm,
    backgroundColor: colors.offWhite,
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    padding: spacing.md,
    borderRadius: 12,
    marginVertical: spacing.xs,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.navy,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1.5,
    backgroundColor: colors.navy,
    paddingVertical: spacing.sm + 2,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: colors.gold,
    fontWeight: '700',
  },

  /* Blog Post Suggestion Banners */
  blogBannerCard: {
    width: 260,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginRight: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  blogBannerImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.offWhite,
  },
  blogBannerFallbackImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blogBannerContent: {
    padding: spacing.md,
  },
  blogBannerCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  blogBannerCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  blogBannerReadTime: {
    fontSize: 11,
    color: colors.gray,
  },
  blogBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 18,
    marginBottom: 6,
  },
  blogBannerExcerpt: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  blogBannerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  blogBannerAuthor: {
    fontSize: 11,
    color: colors.gray,
    flex: 1,
    marginRight: 6,
  },
  blogBannerCta: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.navy,
  },

  /* Article Reader Modal */
  readerContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: Platform.OS === 'ios' ? 44 : spacing.md,
  },
  readerBackBtn: {
    padding: 4,
  },
  readerHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy,
    maxWidth: '70%',
  },
  readerScroll: {
    paddingBottom: spacing.xxl,
  },
  readerCoverImage: {
    width: '100%',
    height: 220,
    backgroundColor: colors.offWhite,
  },
  readerBody: {
    padding: spacing.lg,
  },
  readerMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  readerBadge: {
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    color: colors.gold,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  readerMetaText: {
    fontSize: 12,
    color: colors.gray,
  },
  readerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
    lineHeight: 28,
    marginBottom: 12,
  },
  readerAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  readerAuthorName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
    marginLeft: 6,
  },
  readerDate: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 4,
  },
  readerExcerpt: {
    fontSize: 15,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    paddingLeft: 12,
    marginBottom: 20,
  },
  readerDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 20,
  },
  readerContentText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textPrimary,
    marginBottom: 32,
  },
  readerDisclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  readerDisclaimerText: {
    flex: 1,
    fontSize: 12,
    color: colors.gray,
    lineHeight: 16,
  },
});
