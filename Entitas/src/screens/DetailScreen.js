import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { LineChart } from 'react-native-gifted-charts';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';
import { MODEL_PERFORMANCE, ASSET_NAMES } from '../constants/mockData';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getFavorites, toggleFavorite } from '../services/userService';

const { width } = Dimensions.get('window');
// ZAMAN DİLİMLERİ İNGİLİZCE
const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

const SignalMarker = ({ type }) => {
  const color = type === 'BUY' ? COLORS.success : COLORS.danger;
  return (
    <View style={{
      height: 14, width: 14, borderRadius: 7, backgroundColor: '#fff',
      borderWidth: 3, borderColor: color,
      alignItems: 'center', justifyContent: 'center'
    }} />
  );
};

const CurrentPriceLabel = ({ value, type }) => {
  const color = type === 'BUY' ? COLORS.success : COLORS.danger;
  return (
    <View style={{
      backgroundColor: color, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
      marginBottom: 6, marginLeft: -20
    }}>
      <Text style={{color: '#fff', fontSize: 10, fontWeight: 'bold'}}>{type}</Text>
      <Text style={{color: '#fff', fontSize: 10}}>{value.toFixed(1)}</Text>
    </View>
  );
};

const generateRealisticData = (basePrice, points = 40, volatility = 2, currentSignal) => {
  const data = [];
  let priceRunner = Number(basePrice) || 100;
  
  for (let i = 0; i < points; i++) {
    let customPoint = null;
    let dataPointLabelComponent = null;

    if (i === 0) {
      customPoint = () => <SignalMarker type={currentSignal} />;
      dataPointLabelComponent = () => <CurrentPriceLabel value={basePrice} type={currentSignal} />;
    } 
    else if (Math.random() > 0.92) { 
      const randomType = Math.random() > 0.5 ? 'BUY' : 'SELL';
      customPoint = () => <SignalMarker type={randomType} />;
    }

    data.unshift({
      value: priceRunner,
      customDataPoint: customPoint,
      dataPointLabelComponent: dataPointLabelComponent,
      dataPointLabelShiftY: -40,
      dataPointLabelShiftX: 0,
    });

    const change = (Math.random() - 0.5) * volatility;
    priceRunner -= change;
    
    if (priceRunner < 1) priceRunner = 1;
  }
  
  return data;
};

const StatBox = ({ label, value, color = COLORS.textMain, icon }) => (
  <View style={styles.statBox}>
    <View style={styles.statHeader}>
      <Text style={styles.statLabel}>{label}</Text>
      {icon && <Ionicons name={icon} size={14} color={COLORS.secondary} />}
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

export default function DetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { itemData } = useLocalSearchParams();
  const item = itemData ? JSON.parse(itemData) : {};
  
  const modelStats = MODEL_PERFORMANCE[item.modelName] || {};
  const assetName = ASSET_NAMES[item.symbol] || item.symbol;
  
  const [activeTimeframe, setActiveTimeframe] = useState('1M'); // Varsayılan 1 Month
  const [chartData, setChartData] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const currentPrice = item.price || 0; 

  const isBuy = item.signal === 'BUY';
  const signalColor = isBuy ? COLORS.success : COLORS.danger;

  useEffect(() => {
    if (user && item.symbol) {
      getFavorites(user.uid).then(favs => setIsFavorite(favs.includes(item.symbol)));
    }
  }, [user, item.symbol]);

  useEffect(() => {
    let points = 20;
    let priceVal = Number(item.price) || 100;
    let volatility = priceVal * 0.015; 

    switch (activeTimeframe) {
      case '1D': points = 24; volatility /= 3; break;
      case '1W': points = 30; volatility /= 1.5; break;
      case '1M': points = 40; break;
      case '3M': points = 60; volatility *= 1.2; break;
      case '1Y': points = 80; volatility *= 2; break;
      default: points = 50;
    }

    const newData = generateRealisticData(priceVal, points, volatility, item.signal);
    setChartData(newData);

  }, [activeTimeframe]);

  const handleFavorite = async () => {
    if (!user) return router.push('/login');
    setIsFavorite(!isFavorite);
    await toggleFavorite(user.uid, item.symbol);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.headerTitle}>{item.symbol}</Text>
          <Text style={styles.headerSub}>{item.assetType}</Text>
        </View>
        <TouchableOpacity onPress={handleFavorite} style={styles.iconBtn}>
          <Ionicons 
            name={isFavorite ? "star" : "star-outline"} 
            size={24} 
            color={isFavorite ? "#F59E0B" : COLORS.textMain} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.priceSection}>
          <Text style={styles.bigPrice}>{formatCurrency(currentPrice)}</Text>
          <View style={{flexDirection:'row', gap: 10, alignItems: 'center'}}>
             <Ionicons 
                name={isBuy ? "caret-up" : "caret-down"} 
                size={20} 
                color={signalColor} 
             />
             <Text style={[styles.signalText, { color: signalColor }]}>
                {item.signal === 'BUY' ? 'STRONG BUY' : 'STRONG SELL'}
             </Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          {chartData.length > 0 ? (
            <LineChart
              data={chartData}
              height={250}
              width={width}
              spacing={width / (chartData.length + 8)}
              initialSpacing={20}
              color={COLORS.primary}
              thickness={2}
              startFillColor={COLORS.primary}
              endFillColor="#FFFFFF"
              startOpacity={0.1}
              endOpacity={0.0}
              areaChart
              curved
              hideYAxisText={false} 
              yAxisTextStyle={{color: COLORS.secondary, fontSize: 10}}
              yAxisColor="transparent"
              rulesColor="#F3F4F6"
              hideAxesAndRules={false}
              hideRules={false}
              xAxisColor="transparent"
              isAnimated
              animationDuration={600}
              dataPointsColor="transparent"
              textColor={COLORS.textMain}
            />
          ) : (
            <View style={{height: 250, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{color: COLORS.secondary}}>Loading Chart...</Text>
            </View>
          )}
        </View>

        <View style={styles.timeframeRow}>
          {TIMEFRAMES.map((tf) => {
            const isActive = activeTimeframe === tf;
            return (
              <TouchableOpacity 
                key={tf} 
                style={[styles.tfItem, isActive && styles.tfItemActive]}
                onPress={() => setActiveTimeframe(tf)}
              >
                <Text style={[styles.tfText, isActive && styles.tfTextActive]}>{tf}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Model: {item.modelName.toUpperCase()}</Text>
          <View style={styles.statsRow}>
            <StatBox label="Confidence" value={item.confidence ? formatPercentage(item.confidence) : '%0'} color={COLORS.primary} icon="shield-checkmark-outline" />
            <StatBox label="Sharpe" value={modelStats.sharpe_ratio || '2.1'} icon="pulse-outline" />
          </View>
          <View style={[styles.divider, { marginVertical: 15 }]} />
          <View style={styles.statsRow}>
            <StatBox label="Accuracy" value={formatPercentage(modelStats.accuracy || 0.75)} icon="locate-outline" />
            <StatBox label="Date" value={item.ts ? item.ts.split('T')[0] : 'Today'} icon="calendar-outline" />
          </View>
        </View>

        <View style={styles.aiBox}>
          <Ionicons name="analytics" size={24} color={COLORS.primary} />
          <Text style={styles.aiText}>
            Our AI model analyzed volatility and momentum data as of <Text style={{fontWeight: '700'}}>{item.ts ? item.ts.split('T')[0] : ''}</Text> and suggests a <Text style={{color: signalColor, fontWeight: '800'}}>{item.signal}</Text> position for this asset.
          </Text>
        </View>

      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}>
          <Text style={styles.actionText}>SELL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981' }]}>
          <Text style={styles.actionText}>BUY</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Stiller aynı kalabilir...
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  priceSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  bigPrice: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  signalText: {
    fontWeight: '700',
    fontSize: 14,
    marginTop: 4,
  },
  chartContainer: {
    height: 250,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 10,
  },
  timeframeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tfItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  tfItemActive: {
    backgroundColor: COLORS.textMain,
  },
  tfText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  tfTextActive: {
    color: '#fff',
  },
  statsCard: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 15,
    color: COLORS.textMain,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  aiBox: {
    margin: 20,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    flexDirection: 'row',
    gap: 12,
  },
  aiText: {
    flex: 1,
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});