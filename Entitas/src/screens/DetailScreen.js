import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  Platform,
  StatusBar
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';
import { MODEL_PERFORMANCE, ASSET_NAMES } from '../constants/mockData';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const TIMEFRAMES = ['1G', '1H', '1A', '3A', '1Y', 'TÜM'];

const StatBox = ({ label, value, color = COLORS.textMain }) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

// Simülasyon için rastgele veri üreten fonksiyon (Timeframe'e göre)
const generateSimulatedData = (timeframe) => {
  const data = [];
  let points = 20;
  let startPrice = 100;
  let volatility = 5;

  // Timeframe'e göre veri sıklığını ve değişimini ayarla
  switch (timeframe) {
    case '1G': points = 24; volatility = 2; break; // Saatlik
    case '1H': points = 7; volatility = 8; break;  // Günlük
    case '1A': points = 30; volatility = 5; break; // Günlük
    case '3A': points = 90; volatility = 12; break;
    case '1Y': points = 50; volatility = 20; break;
    default: points = 40; volatility = 10;
  }

  let value = startPrice;
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * volatility;
    value += change;
    data.push({
      value,
      // Sadece belirli noktaların altına etiket koy (grafik karışmasın)
      label: i % Math.ceil(points / 5) === 0 ? i.toString() : '',
    });
  }
  return data;
};

export default function DetailScreen() {
  const router = useRouter();
  const { itemData } = useLocalSearchParams();
  const item = itemData ? JSON.parse(itemData) : {};
  
  const modelStats = MODEL_PERFORMANCE[item.modelName] || {};
  const [activeTimeframe, setActiveTimeframe] = useState('1A');
  
  // DÜZELTME 1: setChartData eklendi
  const [chartData, setChartData] = useState(generateSimulatedData('1A'));
  
  const assetName = ASSET_NAMES[item.symbol] || item.symbol;
  const isBuy = item.signal === 'BUY';
  const signalColor = isBuy ? COLORS.success : COLORS.danger;

  // DÜZELTME 2: Timeframe değişince veriyi yenileyen efekt
  useEffect(() => {
    // Gerçek uygulamada burada API isteği atılır: fetchChartData(symbol, activeTimeframe)
    // Şimdilik simüle ediyoruz:
    const newData = generateSimulatedData(activeTimeframe);
    setChartData(newData);
  }, [activeTimeframe]); // activeTimeframe değiştiğinde çalışır

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{item.symbol}</Text>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="star-outline" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.topInfo}>
          <Text style={styles.assetName}>{assetName}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {item.price ? formatCurrency(item.price) : '-'}
            </Text>
            <View style={[styles.signalTag, { backgroundColor: signalColor }]}>
              <Text style={styles.signalText}>{item.signal}</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartWrapper}>
          <LineChart
            key={activeTimeframe} // DÜZELTME 3: Key değişince grafik yeniden çizilir (animasyon tekrar çalışır)
            data={chartData}
            areaChart
            curved
            isAnimated
            animationDuration={800}
            color={COLORS.primary}
            startFillColor={COLORS.primary}
            endFillColor="#FFFFFF"
            startOpacity={0.2}
            endOpacity={0.0}
            thickness={2}
            hideRules
            hideYAxisText
            hideAxesAndRules
            width={width}
            height={240}
          />
        </View>

        <View style={styles.timeframeContainer}>
          {TIMEFRAMES.map((tf) => (
            <TouchableOpacity 
              key={tf} 
              style={[styles.tfButton, activeTimeframe === tf && styles.tfButtonActive]}
              onPress={() => setActiveTimeframe(tf)}
            >
              <Text style={[styles.tfText, activeTimeframe === tf && styles.tfTextActive]}>{tf}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Model Performansı ({item.modelName})</Text>
          <View style={styles.statsGrid}>
            <StatBox label="Güven Skoru" value={item.confidence ? formatPercentage(item.confidence) : '-'} color={COLORS.primary} />
            <StatBox label="Sharpe Oranı" value={modelStats.sharpe_ratio || '-'} />
            <StatBox label="Doğruluk" value={formatPercentage(modelStats.accuracy || 0)} />
            <StatBox label="Toplam Sinyal" value={modelStats.total_predictions || '-'} />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="sparkles" size={20} color={COLORS.primary} style={{marginBottom: 8}} />
          <Text style={styles.infoText}>
            Yapay zeka modelimiz <Text style={{fontWeight: '700'}}>{item.ts ? item.ts.split('T')[0] : ''}</Text> tarihinde 
            bu varlık için <Text style={{color: signalColor, fontWeight: '700'}}>{item.signal}</Text> sinyali üretmiştir. 
            Güven skoru <Text style={{fontWeight: '700'}}>{item.confidence ? formatPercentage(item.confidence) : '-'}</Text> seviyesindedir.
          </Text>
        </View>

      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#EF4444' }]}>
          <Text style={styles.actionButtonText}>Sat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#10B981' }]}>
          <Text style={styles.actionButtonText}>Al</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  topInfo: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  assetName: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.textMain,
    letterSpacing: -1,
  },
  signalTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  signalText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  chartWrapper: {
    height: 240,
    width: '100%',
    marginLeft: -10,
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 20,
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tfButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tfButtonActive: {
    backgroundColor: COLORS.textMain,
  },
  tfText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  tfTextActive: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    width: (width - 52) / 2,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  infoCard: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textMain,
    lineHeight: 22,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});