/**
 * Currency and rate validation utilities
 */

// ISO 4217 currency code validation (basic check)
export const validateCurrencyCode = (currency) => {
  if (!currency || typeof currency !== 'string') {
    return "Currency code must be a string";
  }
  
  const cleaned = currency.trim().toUpperCase();
  
  if (cleaned.length < 2 || cleaned.length > 10) {
    return "Currency code must be 2-10 characters";
  }
  
  // Basic pattern check (letters only)
  if (!/^[A-Z]+$/.test(cleaned)) {
    return "Currency code must contain only letters";
  }
  
  // Special cases
  if (cleaned === 'USD' || cleaned === 'CENT') {
    return null; // Always valid
  }
  
  return null;
};

// Rate value validation
export const validateRateValue = (rate) => {
  if (!rate && rate !== 0) {
    return "Rate is required";
  }
  
  const rateNum = parseFloat(rate);
  
  if (isNaN(rateNum)) {
    return "Rate must be a valid number";
  }
  
  if (rateNum <= 0) {
    return "Rate must be greater than 0";
  }
  
  if (rateNum > 1000000) {
    return "Rate cannot exceed 1,000,000";
  }
  
  // Validasi digit desimal (maksimal 12)
  const rateStr = rate.toString();
  const decimalPart = rateStr.split('.')[1];
  
  if (decimalPart && decimalPart.length > 12) {
    return "Rate cannot have more than 12 decimal places";
  }
  
  // Validasi untuk rate IDR→USD yang realistis
  // 1 IDR = 0.000001 USD sampai 0.01 USD (jarang, tapi mungkin)
  if (rateNum < 0.000001) {
    const confirmMessage = `Rate ${rateNum} is very small (1 IDR = $${rateNum} USD). Are you sure?`;
    // Anda bisa menambahkan logika konfirmasi di sini jika perlu
    console.warn(confirmMessage);
  }
  
  if (rateNum > 0.01) {
    return "Rate seems too high for IDR to USD conversion";
  }
  
  return null; // No error
};

// Bulk rate data validation
export const validateBulkRateData = (rateData) => {
  const errors = [];
  
  if (!Array.isArray(rateData)) {
    return ["Rate data must be an array"];
  }
  
  if (rateData.length === 0) {
    return ["Rate data array cannot be empty"];
  }
  
  if (rateData.length > 100) {
    return ["Maximum 100 rates per bulk operation"];
  }
  
  rateData.forEach((item, index) => {
    const itemErrors = [];
    
    if (!item.fromCurrency) {
      itemErrors.push("fromCurrency is required");
    } else {
      const currencyError = validateCurrencyCode(item.fromCurrency);
      if (currencyError) itemErrors.push(`fromCurrency: ${currencyError}`);
    }
    
    if (item.toCurrency) {
      const currencyError = validateCurrencyCode(item.toCurrency);
      if (currencyError) itemErrors.push(`toCurrency: ${currencyError}`);
    }
    
    if (!item.rate) {
      itemErrors.push("rate is required");
    } else {
      const rateError = validateRateValue(item.rate);
      if (rateError) itemErrors.push(`rate: ${rateError}`);
    }
    
    if (item.notes && typeof item.notes !== 'string') {
      itemErrors.push("notes must be a string");
    }
    
    if (item.notes && item.notes.length > 500) {
      itemErrors.push("notes cannot exceed 500 characters");
    }
    
    if (itemErrors.length > 0) {
      errors.push(`Item ${index + 1} (${item.fromCurrency}): ${itemErrors.join(', ')}`);
    }
  });
  
  return errors;
};

// Date validation for effective dates
export const validateEffectiveDate = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return "Invalid date format";
  }
  
  if (date > new Date()) {
    return "Effective date cannot be in the future";
  }
  
  return null;
};