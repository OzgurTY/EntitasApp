export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(1)}%`;
};

export const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

// Yeni eklenen fonksiyon: Ondalık basamak sayısını sınırlar
export const formatDecimal = (value, decimals = 5) => {
  if (value === undefined || value === null) return '-';
  return Number(value).toFixed(decimals);
};