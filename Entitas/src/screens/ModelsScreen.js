import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';
import { fetchModelStats } from '../services/signalService'; // Firebase Servisi
import { formatPercentage } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

const ModelCard = ({ item }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="hardware-chip-outline" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.modelName}>{item.model_name?.toUpperCase()}</Text>
          <Text style={styles.subText}>AI Algorithm</Text>
        </View>
        <View style={[styles.badge, {backgroundColor: '#DCFCE7'}]}>
          <Text style={[styles.badgeText, {color: '#166534'}]}>ACTIVE</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Sharpe</Text>
          {/* İSTEĞİN ÜZERİNE 5 BASAMAKLI FORMATLAMA */}
          <Text style={styles.statValue}>
            {item.sharpe_ratio ? Number(item.sharpe_ratio).toFixed(5) : '-'}
          </Text>
        </View>
        <View style={[styles.statBox, styles.statBorder]}>
          <Text style={styles.statLabel}>Accuracy</Text>
          <Text style={[styles.statValue, {color: COLORS.success}]}>
            {formatPercentage(item.accuracy)}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Signals</Text>
          <Text style={styles.statValue}>{item.total_predictions}</Text>
        </View>
      </View>
    </View>
  );
};

export default function ModelsScreen() {
  const router = useRouter();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      // Mock data yerine Firebase'den çekiyoruz
      const stats = await fetchModelStats();
      // Gelen objeyi diziye (array) çeviriyoruz
      const modelsArray = Object.values(stats);
      setModels(modelsArray);
      setLoading(false);
    };
    
    loadModels();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Models</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={models}
          keyExtractor={(item, index) => item.model_name || index.toString()}
          renderItem={({ item }) => <ModelCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{color: COLORS.secondary}}>No models found.</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTextContainer: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.secondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
});