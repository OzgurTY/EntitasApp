import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';
import { fetchSignals } from '../services/signalService';
import { MODEL_PERFORMANCE, ASSET_NAMES } from '../constants/mockData';
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

const FILTERS = ['Tümü', 'Al', 'Sat', 'Tut'];

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

const SignalCard = ({ item }) => {
  const router = useRouter();
  const modelStats = MODEL_PERFORMANCE[item.modelName] || {};
  const assetFullName = ASSET_NAMES[item.symbol] || item.assetType || item.symbol;

  const handlePress = () => {
    router.push({
      pathname: '/detail',
      params: { itemData: JSON.stringify(item) } 
    });
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={handlePress}>
      <View style={styles.cardHeader}>
        <View>
          <View style={styles.symbolRow}>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={styles.timestamp}>{item.ts ? formatDate(item.ts) : ''}</Text>
          </View>
          <Text style={styles.assetName}>{assetFullName}</Text>
        </View>
        <View style={styles.priceContainer}>
           <Text style={styles.price}>{item.price ? formatCurrency(item.price) : '-'}</Text>
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
          <Text style={styles.statValue}>{item.confidence ? formatPercentage(item.confidence) : '-'}</Text>
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
  const router = useRouter();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tümü');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchSignals(activeFilter);
    setSignals(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeFilter]);

  const renderFilterItem = ({ item }) => {
    const isActive = item === activeFilter;
    return (
      <TouchableOpacity 
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => setActiveFilter(item)}
      >
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerTitle}>Entitas</Text>
            <Text style={styles.headerSubtitle}>Canlı Model Sinyalleri</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/login')}
          >
            <Ionicons name="person-circle-outline" size={32} color={COLORS.textMain} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={renderFilterItem}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={signals}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={({ item }) => <SignalCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadData}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{color: COLORS.secondary}}>Bu kriterde sinyal bulunamadı.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  filterContainer: {
    marginBottom: 10,
    height: 50,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 36,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: COLORS.textMain, 
    borderColor: COLORS.textMain,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  assetName: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain,
  },
});