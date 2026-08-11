import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PortfolioStackParamList } from '../../navigation/PortfolioStack';
import { fetchAccounts } from '../../api/accounts';
import { Account } from '../../types';
import { Card } from '../../components/Card';
import { colors, spacing, typography } from '../../theme/theme';

type Props = NativeStackScreenProps<PortfolioStackParamList, 'PortfolioList'>;

export function PortfolioListScreen({ navigation }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await fetchAccounts();
      setAccounts(all.filter((a) => a.type === 'INVESTMENT'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          !loading ? (
            <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.xl }]}>
              No investment accounts yet. Open one from the Accounts tab.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('PortfolioDetail', {
                accountId: item.id,
                accountNumber: item.accountNumber,
              })
            }
          >
            <Card style={{ marginBottom: spacing.sm }}>
              <Text style={typography.h3}>Investment Portfolio</Text>
              <Text style={typography.caption}>•••• {item.accountNumber.slice(-4)}</Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
});
