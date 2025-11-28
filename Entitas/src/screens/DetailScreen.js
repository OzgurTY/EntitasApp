import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router'; // GÜNCELLEME
import { LineChart } from 'react-native-gifted-charts';
import { COLORS } from '../constants/colors';
import { MODEL_PERFORMANCE, GET_CHART_DATA, ASSET_NAMES } from '../constants/mockData';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const { width } = Dimensions.get('window');

const StatBox = ({ label, value, color = COLORS.textMain }) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

export default function DetailScreen() {
  const { itemData } = useLocalSearchParams(); // GÜNCELLEME
  // Gelen veri string olduğu için parse ediyoruz
  const item = itemData ? JSON.parse(itemData) : {}; 
  
  const modelStats = MODEL_PERFORMANCE[item.modelName] || {};
  const chartData = GET_CHART_DATA();
  const assetName = ASSET_NAMES[item.symbol];

  const isBuy = item.signal === 'BUY';
  const signalColor = isBuy ? COLORS.success : COLORS.danger;

  // ... Geri kalan return ve styles kısmı aynı ...
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <Text style={styles.assetName}>{assetName}</Text>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
          <View style={[styles.signalTag, { backgroundColor: signalColor }]}>
            <Text style={styles.signalText}>{item.signal} SİNYALİ</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            color={COLORS.primary}
            thickness={3}
            startFillColor={COLORS.primary}
            endFillColor={COLORS.surface}
            startOpacity={0.2}
            endOpacity={0.0}
            areaChart
            yAxisThickness={0}
            xAxisThickness={0}
            hideRules
            hideYAxisText
            width={width - 40}
            height={220}
            curved
            isAnimated
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Model Analizi: {item.modelName}</Text>
          <View style={styles.statsGrid}>
            <StatBox label="Güven Skoru" value={formatPercentage(item.confidence)} color={COLORS.primary} />
            <StatBox label="Sharpe Oranı" value={modelStats.sharpe_ratio} />
            <StatBox label="Doğruluk" value={formatPercentage(modelStats.accuracy)} />
            <StatBox label="Toplam Tahmin" value={modelStats.total_predictions} />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Bu sinyal <Text style={{fontWeight: 'bold'}}>{item.ts ? item.ts.split('T')[0] : ''}</Text> tarihinde üretilmiştir. 
            Model geçmiş verilere dayanarak <Text style={{color: signalColor, fontWeight: 'bold'}}>{item.signal}</Text> pozisyonu önermektedir.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    // ... Stiller aynı kalacak, yukarıdaki DetailScreen.js'den kopyalayabilirsin ...
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { paddingBottom: 40 },
    header: { alignItems: 'center', paddingVertical: 24, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    symbol: { fontSize: 24, fontWeight: '800', color: COLORS.textMain },
    assetName: { fontSize: 14, color: COLORS.secondary, marginBottom: 8 },
    price: { fontSize: 32, fontWeight: '700', color: COLORS.textMain, marginBottom: 12 },
    signalTag: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    signalText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    chartContainer: { marginVertical: 24, paddingHorizontal: 20, alignItems: 'center' },
    section: { paddingHorizontal: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 16 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statBox: { width: (width - 52) / 2, backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
    statLabel: { fontSize: 12, color: COLORS.secondary, marginBottom: 4, textTransform: 'uppercase' },
    statValue: { fontSize: 20, fontWeight: '700', color: COLORS.textMain },
    infoCard: { margin: 20, padding: 16, backgroundColor: '#EEF2FF', borderRadius: 12 },
    infoText: { fontSize: 13, color: COLORS.primary, lineHeight: 20, textAlign: 'center' },
});