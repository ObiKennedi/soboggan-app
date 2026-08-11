import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PortfolioStackParamList } from '../../navigation/PortfolioStack';
import { fetchPortfolio } from '../../api/portfolio';
import { Portfolio, Holding } from '../../types';
import { Card } from '../../components/Card';
import { formatCurrency } from '../../components/formatCurrency';
import { colors, spacing, typography } from '../../theme/theme';

type Props = NativeStackScreenProps<PortfolioStackParamList, 'PortfolioDetail'>;

export function PortfolioDetailScreen({ route }: Props) {
  const { accountId } = route.params;
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPortfolio(await fetchPortfolio(accountId));
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.bodyMuted, { color: colors.gray }]}>Total portfolio value</Text>
        <Text style={[typography.amount, { color: colors.white }]}>
          {formatCurrency(portfolio?.totalValue ?? 0, portfolio?.currency)}
        </Text>
      </View>

      <FlatList
        data={portfolio?.holdings ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListHeaderComponent={<Text style={[typography.h3, { marginBottom: spacing.xs }]}>Holdings</Text>}
        ListEmptyComponent={
          !loading ? (
            <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.lg }]}>
              No holdings in this portfolio yet.
            </Text>
          ) : null
        }
        renderItem={({ item }) => <HoldingRow holding={item} currency={portfolio?.currency ?? 'NGN'} />}
      />
    </View>
  );
}

function HoldingRow({ holding, currency }: { holding: Holding; currency: string }) {
  const isUp = holding.unrealizedPnL >= 0;
  return (
    <Card style={{ marginBottom: spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={typography.h3}>{holding.asset.symbol}</Text>
          <Text style={typography.caption}>{holding.asset.name}</Text>
          <Text style={typography.caption}>{holding.quantity} units</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={typography.body}>{formatCurrency(holding.marketValue, currency)}</Text>
          <Text style={{ color: isUp ? colors.success : colors.danger, fontWeight: '600' }}>
            {isUp ? '+' : ''}
            {formatCurrency(holding.unrealizedPnL, currency)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
  header: {
    backgroundColor: colors.navy,
    padding: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
});
