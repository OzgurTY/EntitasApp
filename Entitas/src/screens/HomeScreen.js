import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // DÜZELTME
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';
import { fetchSignals } from '../services/signalService';
import { MODEL_PERFORMANCE, ASSET_NAMES, MODELS } from '../constants/mockData';
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { uploadMockData } from '../utils/seeder';
import { useAuth } from '../context/AuthContext';
import { getFavorites } from '../services/userService';

// FİLTRELER İNGİLİZCE
const MODEL_FILTERS = ['All', 'Favorites', ...MODELS];

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
          <Text style={styles.statLabel}>MODEL</Text>
          <Text style={[styles.statValue, {color: COLORS.primary}]}>{item.modelName}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>CONFIDENCE</Text>
          <Text style={styles.statValue}>{item.confidence ? formatPercentage(item.confidence) : '-'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const loadData = async () => {
    setLoading(true);
    
    // Servise gönderilecek filtre ('All' veya model ismi)
    const filterToSend = activeFilter === 'Favorites' ? 'All' : activeFilter;
    let data = await fetchSignals(filterToSend);

    if (activeFilter === 'Favorites') {
      if (user) {
        try {
          const favs = await getFavorites(user.uid);
          data = data.filter(item => favs.includes(item.symbol));
        } catch (e) {
          console.error("Fav Error:", e);
          data = [];
        }
      } else {
        data = [];
      }
    }

    setSignals(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeFilter, user]);

  const handleProfilePress = () => {
    if (user) {
      Alert.alert(
        "Sign Out",
        `Do you want to sign out from ${user.email}?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign Out", onPress: () => logout(), style: "destructive" }
        ]
      );
    } else {
      router.push('/login');
    }
  };

  const renderFilterItem = ({ item }) => {
    const isActive = item === activeFilter;
    const isFavTab = item === 'Favorites';
    return (
      <TouchableOpacity 
        style={[
          styles.filterChip, 
          isActive && styles.filterChipActive,
          isFavTab && !isActive && { borderColor: '#F59E0B' }
        ]}
        onPress={() => setActiveFilter(item)}
      >
        <Text style={[
          styles.filterText, 
          isActive && styles.filterTextActive,
          isFavTab && !isActive && { color: '#F59E0B' }
        ]}>
          {isFavTab ? '★ FAVORITES' : item.toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerTitle}>Entitas</Text>
            <Text style={styles.headerSubtitle}>
              {user ? `Welcome Back 👋` : 'AI Powered Signals'}
            </Text>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/models')}
            >
              <Ionicons name="stats-chart-outline" size={24} color={COLORS.textMain} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleProfilePress}
            >
              <Ionicons 
                name={user ? "log-out-outline" : "person-circle-outline"} 
                size={32} 
                color={user ? COLORS.danger : COLORS.textMain} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.devButton}
          onPress={async () => {
            const success = await uploadMockData();
            if (success) await loadData();
          }}
        >
          <Text style={styles.devButtonText}>RESET DATABASE (DEV) 🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={MODEL_FILTERS}
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
              <Text style={{color: COLORS.secondary}}>
                {activeFilter === 'Favorites' && !user 
                  ? "Please login to view favorites." 
                  : "No signals found for this criteria."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// Styles aynı kalabilir, sadece content değişiklikleri yapıldı.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  header: { padding: 20, paddingBottom: 10, backgroundColor: COLORS.background },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  actionsContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { padding: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textMain, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  devButton: { backgroundColor: '#000', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  devButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  filterContainer: { marginBottom: 10, height: 50 },
  filterChip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, height: 36, justifyContent: 'center' },
  filterChipActive: { backgroundColor: COLORS.textMain, borderColor: COLORS.textMain },
  filterText: { fontSize: 13, fontWeight: '600', color: COLORS.secondary },
  filterTextActive: { color: '#FFFFFF' },
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