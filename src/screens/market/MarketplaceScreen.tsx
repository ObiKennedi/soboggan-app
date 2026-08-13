import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchAvailableStocks,
  fetchAvailableCrypto,
  fetchRealEstateListings,
  createBuyInstruction,
} from '../../api/investments';
import { StockQuote, CryptoQuote, RealEstateListing, AssetCategory } from '../../types';
import { Card } from '../../components/Card';
import { formatCurrency } from '../../components/formatCurrency';
import { colors, radii, spacing, typography } from '../../theme/theme';

type MarketplaceCategory = 'STOCKS' | 'CRYPTO' | 'REAL_ESTATE';

export function MarketplaceScreen() {
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory>('STOCKS');
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [crypto, setCrypto] = useState<CryptoQuote[]>([]);
  const [realEstate, setRealEstate] = useState<RealEstateListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Selected item for Buy Instruction Modal
  const [selectedAsset, setSelectedAsset] = useState<{
    category: AssetCategory;
    symbol: string;
    name: string;
    unitPrice: number;
    listingId?: string;
  } | null>(null);

  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [stks, crp, re] = await Promise.all([
        fetchAvailableStocks().catch(() => []),
        fetchAvailableCrypto().catch(() => []),
        fetchRealEstateListings().catch(() => []),
      ]);
      setStocks(stks);
      setCrypto(crp);
      setRealEstate(re);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const openBuyModal = (
    category: AssetCategory,
    symbol: string,
    name: string,
    unitPrice: number,
    listingId?: string,
  ) => {
    setSelectedAsset({ category, symbol, name, unitPrice, listingId });
    setQuantity(category === 'CRYPTO' ? '0.1' : '1');
    setNotes('');
  };

  const handleConfirmBuy = async () => {
    if (!selectedAsset) return;
    const parsedQty = parseFloat(quantity);
    if (!parsedQty || parsedQty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid positive quantity.');
      return;
    }

    setSubmitting(true);
    try {
      await createBuyInstruction({
        assetCategory: selectedAsset.category,
        stockSymbol: selectedAsset.symbol,
        stockName: selectedAsset.name,
        unitPrice: selectedAsset.unitPrice,
        quantity: parsedQty,
        notes: notes.trim() || undefined,
        listingId: selectedAsset.listingId,
      });

      const totalEst = parsedQty * selectedAsset.unitPrice;
      const categoryName =
        selectedAsset.category === 'CRYPTO' ? 'Crypto' :
        selectedAsset.category === 'REAL_ESTATE' ? 'Real Estate' : 'Stock';

      setSelectedAsset(null);
      Alert.alert(
        'Instruction Sent to Admin',
        `Your request to purchase ${parsedQty} unit(s) of ${selectedAsset.symbol} (Est. ₦${totalEst.toLocaleString()}) has been logged. Admin will process it shortly.`,
      );
    } catch (err: any) {
      Alert.alert('Submission Failed', err?.response?.data?.message || 'Could not send buy instruction.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter items by search query
  const filteredStocks = stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredCrypto = crypto.filter(
    (c) =>
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredRealEstate = realEstate.filter(
    (re) =>
      re.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      re.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const qtyNum = parseFloat(quantity) || 0;
  const estimatedCost = selectedAsset ? qtyNum * selectedAsset.unitPrice : 0;

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tabItem, activeCategory === 'STOCKS' && styles.tabItemActive]}
          onPress={() => setActiveCategory('STOCKS')}
        >
          <Ionicons
            name="trending-up"
            size={16}
            color={activeCategory === 'STOCKS' ? colors.gold : colors.gray}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabLabel, activeCategory === 'STOCKS' && styles.tabLabelActive]}>
            Stocks ({stocks.length})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabItem, activeCategory === 'CRYPTO' && styles.tabItemActive]}
          onPress={() => setActiveCategory('CRYPTO')}
        >
          <Ionicons
            name="logo-bitcoin"
            size={16}
            color={activeCategory === 'CRYPTO' ? colors.gold : colors.gray}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabLabel, activeCategory === 'CRYPTO' && styles.tabLabelActive]}>
            Crypto ({crypto.length})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabItem, activeCategory === 'REAL_ESTATE' && styles.tabItemActive]}
          onPress={() => setActiveCategory('REAL_ESTATE')}
        >
          <Ionicons
            name="home"
            size={16}
            color={activeCategory === 'REAL_ESTATE' ? colors.gold : colors.gray}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabLabel, activeCategory === 'REAL_ESTATE' && styles.tabLabelActive]}>
            Real Estate ({realEstate.length})
          </Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.gray} style={{ marginRight: 8 }} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${activeCategory.toLowerCase()}...`}
          placeholderTextColor={colors.gray}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Main List */}
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
      >
        {/* STOCKS LIST */}
        {activeCategory === 'STOCKS' && (
          <View>
            <View style={styles.infoBanner}>
              <Ionicons name="stats-chart" size={16} color="#3b82f6" style={{ marginRight: 6 }} />
              <Text style={styles.infoBannerText}>
                Live quotes from Nigerian Exchange (NGX). Tap to instruct admin to buy.
              </Text>
            </View>

            {filteredStocks.map((stock) => {
              const isPos = !stock.changePercent.startsWith('-');
              return (
                <Card key={stock.symbol} style={styles.assetCard}>
                  <View style={styles.assetHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={typography.h3}>{stock.symbol}</Text>
                      <Text style={typography.caption}>{stock.name}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[typography.h3, { color: colors.navy }]}>
                        ₦{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </Text>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: isPos ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' },
                        ]}
                      >
                        <Text style={[styles.badgeText, { color: isPos ? '#10b981' : '#ef4444' }]}>
                          {stock.changePercent}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => openBuyModal('STOCK', stock.symbol, stock.name, stock.price)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="cart-outline" size={16} color={colors.gold} style={{ marginRight: 6 }} />
                    <Text style={styles.buyButtonText}>Instruct Admin to Buy</Text>
                  </TouchableOpacity>
                </Card>
              );
            })}

            {filteredStocks.length === 0 && !loading && (
              <EmptyState message="No stocks found matching your search." />
            )}
          </View>
        )}

        {/* CRYPTO LIST */}
        {activeCategory === 'CRYPTO' && (
          <View>
            <View style={styles.infoBanner}>
              <View style={styles.liveDot} />
              <Text style={styles.infoBannerText}>
                Live prices from Coinbase API. Fractional quantities supported.
              </Text>
            </View>

            {filteredCrypto.map((coin) => (
              <Card key={coin.symbol} style={styles.assetCard}>
                <View style={styles.assetHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={typography.h3}>{coin.symbol}</Text>
                      <View style={styles.cryptoTag}>
                        <Text style={styles.cryptoTagText}>🪙 CRYPTO</Text>
                      </View>
                    </View>
                    <Text style={typography.caption}>{coin.name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[typography.h3, { color: colors.navy }]}>
                      ₦{coin.priceNGN.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </Text>
                    <Text style={[typography.caption, { color: colors.gray }]}>
                      ${coin.priceUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => openBuyModal('CRYPTO', coin.symbol, coin.name, coin.priceNGN)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cart-outline" size={16} color={colors.gold} style={{ marginRight: 6 }} />
                  <Text style={styles.buyButtonText}>Instruct Admin to Buy</Text>
                </TouchableOpacity>
              </Card>
            ))}

            {filteredCrypto.length === 0 && !loading && (
              <EmptyState message="No crypto assets found matching your search." />
            )}
          </View>
        )}

        {/* REAL ESTATE LIST */}
        {activeCategory === 'REAL_ESTATE' && (
          <View>
            <View style={styles.infoBanner}>
              <Ionicons name="business-outline" size={16} color="#10b981" style={{ marginRight: 6 }} />
              <Text style={styles.infoBannerText}>
                Properties managed and uploaded by admin. Fractional unit investment available.
              </Text>
            </View>

            {filteredRealEstate.map((property) => (
              <Card key={property.id} style={[styles.assetCard, { padding: 0, overflow: 'hidden' }]}>
                {property.imageUrl ? (
                  <Image source={{ uri: property.imageUrl }} style={styles.propertyImg} />
                ) : (
                  <View style={styles.propertyPlaceholder}>
                    <Ionicons name="home-outline" size={40} color={colors.gray} />
                  </View>
                )}

                <View style={{ padding: spacing.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={[typography.h3, { flex: 1, marginRight: 8 }]}>{property.title}</Text>
                    <View style={styles.reTag}>
                      <Text style={styles.reTagText}>🏠 REAL ESTATE</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 8 }}>
                    <Ionicons name="location-outline" size={14} color={colors.gray} style={{ marginRight: 4 }} />
                    <Text style={[typography.caption, { color: colors.gray }]}>{property.location}</Text>
                  </View>

                  {property.description ? (
                    <Text style={[typography.bodyMuted, { fontSize: 13, marginBottom: 12 }]} numberOfLines={2}>
                      {property.description}
                    </Text>
                  ) : null}

                  <View style={styles.reDetailsRow}>
                    <View>
                      <Text style={typography.caption}>Price per Unit</Text>
                      <Text style={[typography.h3, { color: colors.gold }]}>
                        {formatCurrency(Number(property.pricePerUnit))}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={typography.caption}>Total Units</Text>
                      <Text style={[typography.body, { fontWeight: '700' }]}>
                        {Number(property.totalUnits)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.buyButton, { marginTop: spacing.md }]}
                    onPress={() =>
                      openBuyModal(
                        'REAL_ESTATE',
                        property.title.split(' ')[0].toUpperCase(),
                        property.title,
                        Number(property.pricePerUnit),
                        property.id,
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Ionicons name="cart-outline" size={16} color={colors.gold} style={{ marginRight: 6 }} />
                    <Text style={styles.buyButtonText}>Instruct Admin to Buy Units</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}

            {filteredRealEstate.length === 0 && !loading && (
              <EmptyState message="No real estate property listings available at this time." />
            )}
          </View>
        )}
      </ScrollView>

      {/* Instruct Admin to Buy Modal */}
      {selectedAsset && (
        <Modal
          transparent
          animationType="fade"
          visible={!!selectedAsset}
          onRequestClose={() => setSelectedAsset(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Instruct Admin to Buy</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedAsset.symbol} — {selectedAsset.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedAsset(null)}>
                  <Ionicons name="close" size={24} color={colors.navy} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalPriceBox}>
                <Text style={typography.caption}>Unit Price</Text>
                <Text style={[typography.h3, { color: colors.navy }]}>
                  {formatCurrency(selectedAsset.unitPrice)}
                </Text>
              </View>

              <Text style={styles.inputLabel}>Quantity / Units</Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={styles.modalInput}
                placeholder={selectedAsset.category === 'CRYPTO' ? 'e.g. 0.25' : '10'}
              />

              <Text style={styles.inputLabel}>Special Instructions / Notes for Admin (Optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Execute at best market price"
                style={styles.modalInput}
              />

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Estimated Total Cost:</Text>
                <Text style={styles.totalVal}>{formatCurrency(estimatedCost)}</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedAsset(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleConfirmBuy}
                  disabled={submitting}
                >
                  <Text style={styles.submitBtnText}>
                    {submitting ? 'Sending...' : 'Send Buy Instruction'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl }}>
      <Ionicons name="search-outline" size={44} color={colors.gray} />
      <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.sm }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.navy,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray,
  },
  tabLabelActive: {
    color: colors.white,
    fontWeight: '700',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.navy,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    padding: spacing.sm + 2,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
  },
  infoBannerText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  assetCard: {
    marginBottom: spacing.md,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cryptoTag: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cryptoTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d97706',
  },
  reTag: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  propertyImg: {
    width: '100%',
    height: 160,
    backgroundColor: colors.offWhite,
  },
  propertyPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginTop: spacing.xs,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.sm,
    marginTop: spacing.xs,
  },
  buyButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },

  // Modal
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
  modalPriceBox: {
    backgroundColor: colors.offWhite,
    padding: spacing.sm + 2,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
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
    borderRadius: radii.sm,
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
});
