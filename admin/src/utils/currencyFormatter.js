// utils/currencyFormatter.js
export const formatCurrency = (value, currency) => {
  if (!value && value !== 0) return `0 ${getCurrencySymbol(currency)}`;
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return `0 ${getCurrencySymbol(currency)}`;

  switch (currency) {
    case 'USD':
      return `$${numValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    case 'IDR':
      // Untuk IDR, kita tampilkan tanpa desimal karena biasanya Rupiah tidak pakai desimal
      return `Rp ${Math.round(numValue).toLocaleString('id-ID')}`;
    case 'CENT':
      return `${numValue.toLocaleString('en-US')}¢`;
    default:
      return `Rp ${Math.round(numValue).toLocaleString('id-ID')}`;
  }
};

export const getCurrencySymbol = (currency) => {
  switch (currency) {
    case 'USD': return '$';
    case 'IDR': return 'Rp';
    case 'CENT': return '¢';
    default: return 'Rp';
  }
};

// Format untuk display compact (seperti sebelumnya)
export const formatCompactCurrency = (value, currency) => {
  if (!value && value !== 0) return `0 ${getCurrencySymbol(currency)}`;
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return `0 ${getCurrencySymbol(currency)}`;

  switch (currency) {
    case 'USD':
      if (numValue >= 1000000) {
        return `$${(numValue / 1000000).toFixed(1)}M`;
      } else if (numValue >= 1000) {
        return `$${(numValue / 1000).toFixed(0)}K`;
      }
      return `$${numValue.toFixed(2)}`;
    
    case 'IDR':
      if (numValue >= 1000000) {
        return `Rp${(numValue / 1000000).toFixed(1)}Jt`;
      } else if (numValue >= 1000) {
        return `Rp${(numValue / 1000).toFixed(0)}Rb`;
      }
      return `Rp${Math.round(numValue)}`;
    
    case 'CENT':
      if (numValue >= 1000000) {
        return `${(numValue / 1000000).toFixed(1)}M¢`;
      } else if (numValue >= 1000) {
        return `${(numValue / 1000).toFixed(0)}K¢`;
      }
      return `${numValue}¢`;
    
    default:
      return `Rp${Math.round(numValue)}`;
  }
};

// utils/currencyFormatter.js - Tambahkan fungsi baru
export const formatBalance = (value, currency) => {
  if (!value && value !== 0) return `0 ${getCurrencySymbol(currency)}`;
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return `0 ${getCurrencySymbol(currency)}`;

  switch (currency) {
    case 'USD':
      return `$${numValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    case 'IDR':
      return `Rp ${Math.round(numValue).toLocaleString('id-ID')}`;
    case 'CENT':
      return `${numValue.toLocaleString('en-US')}¢`;
    default:
      return `Rp ${Math.round(numValue).toLocaleString('id-ID')}`;
  }
};