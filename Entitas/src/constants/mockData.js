// Rastgele veri üretimi için yardımcılar
const SYMBOLS = ['QQQ', 'GLD', 'SLV', 'SPY', 'XLF', 'XLU', 'NVDA', 'AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META'];
const MODELS = ['umamba', 'convmixer-tf', 'transformer-v2', 'lstm-quant'];
const SIGNALS_TYPES = ['BUY', 'SELL', 'HOLD'];
const ASSET_TYPES = ['ETF', 'Commodity', 'Stock'];

// Rastgele sayı üretici
const random = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 100 adet Rastgele Sinyal Üreten Fonksiyon
const generateSignals = (count = 100) => {
  const signals = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Tarihi geriye doğru rastgele dağıt (Son 10 gün)
    const timeOffset = randomInt(0, 10 * 24 * 60 * 60 * 1000);
    const date = new Date(now.getTime() - timeOffset);

    const symbol = randomItem(SYMBOLS);
    
    signals.push({
      _id: `mock_id_${i}_${Date.now()}`, // Benzersiz ID
      symbol: symbol,
      modelName: randomItem(MODELS),
      assetType: ['QQQ', 'SPY', 'XLF', 'XLU'].includes(symbol) ? 'ETF' : (['GLD', 'SLV'].includes(symbol) ? 'Commodity' : 'Stock'),
      signal: randomItem(SIGNALS_TYPES),
      price: random(100, 2000), // 100$ ile 2000$ arası fiyat
      confidence: random(0.45, 0.99), // %45 ile %99 arası güven
      ts: date.toISOString(), // ISO formatında tarih
    });
  }
  
  // Tarihe göre sırala (En yeni en üstte)
  return signals.sort((a, b) => new Date(b.ts) - new Date(a.ts));
};

// --- DIŞARI AKTARILAN VERİLER ---

export const SIGNALS = generateSignals(150); // 150 adet test verisi üret!

export const MODEL_PERFORMANCE = {
  'umamba': {
    model_name: 'umamba',
    sharpe_ratio: 2.4,
    accuracy: 0.68,
    total_predictions: 1764,
  },
  'convmixer-tf': {
    model_name: 'convmixer-tf',
    sharpe_ratio: 3.1,
    accuracy: 0.82,
    total_predictions: 1205,
  },
  'transformer-v2': {
    model_name: 'transformer-v2',
    sharpe_ratio: 2.8,
    accuracy: 0.75,
    total_predictions: 850,
  },
  'lstm-quant': {
    model_name: 'lstm-quant',
    sharpe_ratio: 1.9,
    accuracy: 0.62,
    total_predictions: 3200,
  }
};

export const ASSET_NAMES = {
  'XLF': 'Financial Select Sector SPDR',
  'GLD': 'SPDR Gold Shares',
  'QQQ': 'Invesco QQQ Trust',
  'SLV': 'iShares Silver Trust',
  'SPY': 'SPDR S&P 500 ETF Trust',
  'XLU': 'Utilities Select Sector SPDR',
  'NVDA': 'NVIDIA Corporation',
  'AAPL': 'Apple Inc.',
  'TSLA': 'Tesla, Inc.',
  'MSFT': 'Microsoft Corporation',
  'AMZN': 'Amazon.com, Inc.',
  'GOOGL': 'Alphabet Inc.',
  'META': 'Meta Platforms, Inc.'
};

// Grafik için rastgele veri (Eskisiyle aynı mantık)
export const GET_CHART_DATA = () => {
  const data = [];
  let value = 100;
  for (let i = 0; i < 50; i++) {
    const change = Math.random() * 10 - 4.5;
    value += change;
    data.push({
      value,
      label: i % 10 === 0 ? i.toString() : '', 
    });
  }
  return data;
};