import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router'; // GÜNCELLEME: Expo Router hook'u
import { COLORS } from '../constants/colors';
import { SIGNALS, MODEL_PERFORMANCE, ASSET_NAMES } from '../constants/mockData';
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';

// ... SignalBadge aynı kalacak ...
const SignalBadge = ({ type }) => {
  let bg = COLORS.secondary;
  if (type === 'BUY') bg = COLORS.success;
  if (type === 'SELL') bg = COLORS.danger;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.badgeText}>{type}</Text>
    </View>
  );
};

// ... SignalCard aynı kalacak ...
const SignalCard = ({ item }) => {
  const router = useRouter(); // GÜNCELLEME: Router tanımlandı
  const modelStats = MODEL_PERFORMANCE[item.modelName] || {};
  const assetFullName = ASSET_NAMES[item.symbol] || item.assetType;

  const handlePress = () => {
    // Veriyi string'e çevirip gönderiyoruz
    router.push({
      pathname: '/detail',
      params: { itemData: JSON.stringify(item) } 
    });
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={handlePress}>
       {/* ... Kart içeriği tamamen aynı ... */}
       <View style={styles.cardHeader}>
        <View>
          <View style={styles.symbolRow}>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={styles.timestamp}>{formatDate(item.ts)}</Text>
          </View>
          <Text style={styles.assetName}>{assetFullName}</Text>
        </View>
        <View style={styles.priceContainer}>
           <Text style={styles.price}>{formatCurrency(item.price)}</Text>
           <SignalBadge type={item.signal} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Model</Text>
          <Text style={styles.statValue}>{item.modelName}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Güven</Text>
          <Text style={styles.statValue}>{formatPercentage(item.confidence)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Doğruluk</Text>
          <Text style={styles.statValue}>
            {modelStats.accuracy ? formatPercentage(modelStats.accuracy) : '-'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Entitas</Text>
        <Text style={styles.headerSubtitle}>Canlı Model Sinyalleri</Text>
      </View>
      <FlatList
        data={SIGNALS}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <SignalCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    // ... Stiller aynı kalacak ...
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: 20, backgroundColor: COLORS.background },
    headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textMain, letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
    listContent: { paddingHorizontal: 20, paddingBottom: 20 },
    card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: COLORS.border },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    symbolRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    symbol: { fontSize: 18, fontWeight: '700', color: COLORS.textMain },
    timestamp: { fontSize: 12, color: COLORS.textLight },
    assetName: { fontSize: 13, color: COLORS.secondary, marginTop: 2 },
    priceContainer: { alignItems: 'flex-end' },
    price: { fontSize: 16, fontWeight: '600', color: COLORS.textMain, marginBottom: 4 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    badgeText: { color: '#fff', fontWeight: '700', fontSize: 11 },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statItem: { flex: 1 },
    statLabel: { fontSize: 10, color: COLORS.textLight, marginBottom: 2, textTransform: 'uppercase' },
    statValue: { fontSize: 13, fontWeight: '600', color: COLORS.textMain },
});