export const SIGNALS = [
  {
    _id: '68f628817f62542d54191b2f',
    symbol: 'XLF',
    modelName: 'umamba',
    assetType: 'ETF',
    signal: 'SELL',
    price: 41.25, 
    confidence: 0.78, 
    ts: '2025-10-18T15:18:09.669+00:00',
  },
  {
    _id: '68f628817f62542d54191b3a',
    symbol: 'GLD',
    modelName: 'convmixer-tf',
    assetType: 'Commodity',
    signal: 'BUY',
    price: 184.50,
    confidence: 0.92,
    ts: '2025-10-18T14:30:00.000+00:00',
  },
  {
    _id: '68f628817f62542d54191b4b',
    symbol: 'QQQ',
    modelName: 'umamba',
    assetType: 'ETF',
    signal: 'HOLD',
    price: 368.10,
    confidence: 0.45,
    ts: '2025-10-18T12:00:00.000+00:00',
  }
];

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
  }
};

export const ASSET_NAMES = {
  'XLF': 'Financial Select Sector SPDR',
  'GLD': 'SPDR Gold Shares',
  'QQQ': 'Invesco QQQ Trust',
  'SLV': 'iShares Silver Trust'
};

export const GET_CHART_DATA = () => {
  const data = [];
  let value = 100;
  for (let i = 0; i < 30; i++) {
    const change = Math.random() * 10 - 4.5;
    value += change;
    data.push({
      value,
      label: i % 5 === 0 ? `${i} Kas` : '',
      dataPointText: i === 29 ? value.toFixed(1) : '',
    });
  }
  return data;
};