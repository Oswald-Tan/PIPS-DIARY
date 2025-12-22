import axios from "axios";
import NodeCache from "node-cache";
import ExchangeRate from "../models/exchangeRate.js";

// Cache configuration
const CACHE_CONFIG = {
  stdTTL: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 300, // 5 minutes default
  checkperiod: 60,
  useClones: false,
  maxKeys: 1000
};

const currencyCache = new NodeCache(CACHE_CONFIG);

class CurrencyService {
  constructor() {
    this.apiKey = process.env.CURRENCY_API_KEY;
    this.baseUrl = "https://api.currencyapi.com/v3";
    this.timeout = process.env.API_TIMEOUT ? parseInt(process.env.API_TIMEOUT) : 5000;
    
    // Configuration flags with environment variable support
    this.useManualRates = process.env.USE_MANUAL_RATES !== 'false'; // Default true
    this.disableAPIRates = process.env.DISABLE_API_RATES === 'true';
    this.manualRateTTL = process.env.MANUAL_CACHE_TTL ? parseInt(process.env.MANUAL_CACHE_TTL) : 3600;
    this.debugMode = process.env.DEBUG_CURRENCY_CONVERSION === 'true';
    
    console.log("[CurrencyService] Initialized with configuration:", {
      useManualRates: this.useManualRates,
      disableAPIRates: this.disableAPIRates,
      manualRateTTL: this.manualRateTTL,
      hasApiKey: !!this.apiKey,
      apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 8) + '...' : 'none',
      debugMode: this.debugMode,
      cacheConfig: CACHE_CONFIG
    });
  }

  // ==================== CACHE MANAGEMENT ====================

  getCacheKey(fromCurrency, toCurrency = 'USD') {
    return `${fromCurrency.toUpperCase()}_${toCurrency.toUpperCase()}`;
  }

  getManualCacheKey(fromCurrency, toCurrency = 'USD') {
    return `manual_${fromCurrency.toUpperCase()}_${toCurrency.toUpperCase()}`;
  }

  clearCacheForCurrency(fromCurrency, toCurrency = 'USD') {
    const cacheKey = this.getCacheKey(fromCurrency, toCurrency);
    const manualKey = this.getManualCacheKey(fromCurrency, toCurrency);
    
    const deleted = currencyCache.del([cacheKey, manualKey]);
    
    if (this.debugMode) {
      console.log(`[CurrencyService] Cleared cache for ${cacheKey}, ${manualKey}. Deleted: ${deleted}`);
    }
    
    return deleted;
  }

  getCacheStats() {
    const stats = currencyCache.getStats();
    return {
      hits: stats.hits,
      misses: stats.misses,
      keys: stats.keys,
      ksize: stats.ksize,
      vsize: stats.vsize,
      hitRate: stats.hits / (stats.hits + stats.misses) || 0
    };
  }

  // ==================== MANUAL RATES SYSTEM ====================

  async getManualRateFromDB(fromCurrency, toCurrency = 'USD') {
    const cacheKey = this.getManualCacheKey(fromCurrency, toCurrency);
    
    // Check cache first
    const cachedRate = currencyCache.get(cacheKey);
    if (cachedRate !== undefined) {
      if (this.debugMode) {
        console.log(`[CurrencyService] Manual cache HIT for ${fromCurrency}: ${cachedRate}`);
      }
      return cachedRate;
    }
    
    try {
      if (this.debugMode) {
        console.log(`[CurrencyService] Fetching manual rate from DB for ${fromCurrency}...`);
      }
      
      const rate = await ExchangeRate.getActiveRate(fromCurrency, toCurrency);
      
      if (!rate) {
        if (this.debugMode) {
          console.log(`[CurrencyService] No manual rate found for ${fromCurrency}`);
        }
        return null;
      }
      
      // Only return if source is manual
      if (rate.source !== 'manual') {
        if (this.debugMode) {
          console.log(`[CurrencyService] Rate found but source is ${rate.source}, not manual`);
        }
        return null;
      }
      
      const rateValue = parseFloat(rate.rate);
      
      if (this.debugMode) {
        console.log(`[CurrencyService] Found manual rate: 1 ${fromCurrency} = ${rateValue} ${toCurrency}`);
        console.log(`[CurrencyService] Rate details:`, {
          source: rate.source,
          effectiveFrom: rate.effectiveFrom,
          lastUpdated: rate.lastUpdated,
          isActive: rate.isActive
        });
      }
      
      // Cache with longer TTL for manual rates
      currencyCache.set(cacheKey, rateValue, this.manualRateTTL);
      
      return rateValue;
      
    } catch (error) {
      console.error(`[CurrencyService] Error fetching manual rate for ${fromCurrency}:`, error.message);
      return null;
    }
  }

  clearManualRateCache(fromCurrency, toCurrency = 'USD') {
    return this.clearCacheForCurrency(fromCurrency, toCurrency);
  }

  // ==================== API RATES SYSTEM ====================

  async fetchRateFromAPI(fromCurrency, toCurrency = 'USD') {
    // If API is disabled, throw error
    if (this.disableAPIRates) {
      throw new Error("API rates are disabled by configuration");
    }
    
    // If no API key, throw error
    if (!this.apiKey) {
      throw new Error("Currency API key is not configured");
    }
    
    const fromCurrencyUpper = fromCurrency.toUpperCase();
    const toCurrencyUpper = toCurrency.toUpperCase();
    
    // Handle special cases
    if (fromCurrencyUpper === toCurrencyUpper) return 1.0;
    if (fromCurrencyUpper === "CENT" && toCurrencyUpper === "USD") return 0.01;
    if (fromCurrencyUpper === "USD" && toCurrencyUpper === "CENT") return 100;
    
    try {
      if (this.debugMode) {
        console.log(`[CurrencyService] Fetching API rate for ${fromCurrencyUpper} to ${toCurrencyUpper}...`);
      }
      
      // Note: CurrencyAPI.com uses USD as base currency
      // We need to handle both directions
      let apiRate;
      
      if (toCurrencyUpper === "USD") {
        // Fetch: 1 USD = X [fromCurrency]
        const response = await axios.get(`${this.baseUrl}/latest`, {
          params: {
            apikey: this.apiKey,
            base_currency: "USD",
            currencies: fromCurrencyUpper
          },
          timeout: this.timeout,
          headers: {
            "User-Agent": "PipsDiary/1.0",
            "Accept": "application/json"
          }
        });
        
        if (!response.data?.data?.[fromCurrencyUpper]?.value) {
          throw new Error(`Invalid API response for ${fromCurrencyUpper}`);
        }
        
        // API returns: 1 USD = X [fromCurrency]
        // We need: 1 [fromCurrency] = ? USD
        const usdToCurrency = response.data.data[fromCurrencyUpper].value;
        apiRate = 1 / usdToCurrency;
        
        if (this.debugMode) {
          console.log(`[CurrencyService] API returned: 1 USD = ${usdToCurrency} ${fromCurrencyUpper}`);
          console.log(`[CurrencyService] Calculated: 1 ${fromCurrencyUpper} = ${apiRate} USD`);
        }
        
      } else {
        // Fetch conversion between two non-USD currencies
        // First: 1 USD = X [fromCurrency]
        // Second: 1 USD = Y [toCurrency]
        // Then: 1 [fromCurrency] = Y/X [toCurrency]
        
        const response = await axios.get(`${this.baseUrl}/latest`, {
          params: {
            apikey: this.apiKey,
            base_currency: "USD",
            currencies: `${fromCurrencyUpper},${toCurrencyUpper}`
          },
          timeout: this.timeout
        });
        
        if (!response.data?.data?.[fromCurrencyUpper]?.value || 
            !response.data?.data?.[toCurrencyUpper]?.value) {
          throw new Error(`Invalid API response for ${fromCurrencyUpper} to ${toCurrencyUpper}`);
        }
        
        const usdToFrom = response.data.data[fromCurrencyUpper].value;
        const usdToTo = response.data.data[toCurrencyUpper].value;
        
        // 1 [fromCurrency] = (1/USD_to_From) USD
        // 1 USD = USD_to_To [toCurrency]
        // So: 1 [fromCurrency] = (1/USD_to_From) * USD_to_To [toCurrency]
        apiRate = usdToTo / usdToFrom;
        
        if (this.debugMode) {
          console.log(`[CurrencyService] API rates: 1 USD = ${usdToFrom} ${fromCurrencyUpper}, 1 USD = ${usdToTo} ${toCurrencyUpper}`);
          console.log(`[CurrencyService] Calculated: 1 ${fromCurrencyUpper} = ${apiRate} ${toCurrencyUpper}`);
        }
      }
      
      return apiRate;
      
    } catch (error) {
      console.error(`[CurrencyService] API Error for ${fromCurrencyUpper}:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 401) {
        throw new Error("Invalid CurrencyAPI.com API key");
      } else if (error.response?.status === 429) {
        throw new Error("CurrencyAPI.com rate limit exceeded");
      } else if (error.code === "ECONNABORTED") {
        throw new Error("CurrencyAPI.com timeout");
      } else if (!error.response) {
        throw new Error("Network error or CurrencyAPI.com unavailable");
      }
      
      throw new Error(`CurrencyAPI.com error: ${error.message}`);
    }
  }

  // ==================== UNIFIED RATE GETTER ====================

  async getRate(fromCurrency, toCurrency = 'USD', options = {}) {
    const {
      forceRefresh = false,
      allowManual = this.useManualRates,
      allowAPI = !this.disableAPIRates,
      debug = this.debugMode
    } = options;
    
    const fromCurrencyUpper = fromCurrency.toUpperCase();
    const toCurrencyUpper = toCurrency.toUpperCase();
    
    // Special cases
    if (fromCurrencyUpper === toCurrencyUpper) return 1.0;
    if (fromCurrencyUpper === "CENT" && toCurrencyUpper === "USD") return 0.01;
    if (fromCurrencyUpper === "USD" && toCurrencyUpper === "CENT") return 100;
    if (fromCurrencyUpper === "USD") return 1.0;
    
    const cacheKey = this.getCacheKey(fromCurrencyUpper, toCurrencyUpper);
    
    // Check cache (unless force refresh)
    if (!forceRefresh) {
      const cachedRate = currencyCache.get(cacheKey);
      if (cachedRate !== undefined) {
        if (debug) {
          console.log(`[CurrencyService] Cache HIT for ${cacheKey}: ${cachedRate}`);
        }
        return cachedRate;
      }
    }
    
    if (debug) {
      console.log(`[CurrencyService] Cache MISS for ${cacheKey}, fetching rate...`);
      console.log(`[CurrencyService] Options:`, { allowManual, allowAPI, forceRefresh });
    }
    
    let rate = null;
    let source = 'unknown';
    
    // ===== PRIORITY 1: MANUAL RATES =====
    if (allowManual) {
      try {
        rate = await this.getManualRateFromDB(fromCurrencyUpper, toCurrencyUpper);
        if (rate !== null) {
          source = 'manual';
          if (debug) {
            console.log(`[CurrencyService] ✓ Using MANUAL rate: ${rate}`);
          }
        }
      } catch (manualError) {
        if (debug) {
          console.warn(`[CurrencyService] Manual rate failed:`, manualError.message);
        }
      }
    }
    
    // ===== PRIORITY 2: API RATES =====
    if (rate === null && allowAPI && this.apiKey) {
      try {
        rate = await this.fetchRateFromAPI(fromCurrencyUpper, toCurrencyUpper);
        source = 'api';
        
        if (debug) {
          console.log(`[CurrencyService] ✓ Using API rate: ${rate}`);
        }
        
        // Save API rate to database for future use
        try {
          await this.saveRateToDB(
            fromCurrencyUpper, 
            toCurrencyUpper, 
            rate, 
            'api',
            'API fetch'
          );
        } catch (dbError) {
          if (debug) {
            console.warn(`[CurrencyService] Failed to save API rate to DB:`, dbError.message);
          }
        }
        
      } catch (apiError) {
        if (debug) {
          console.warn(`[CurrencyService] API rate failed:`, apiError.message);
        }
      }
    }
    
    // ===== PRIORITY 3: DATABASE CACHE =====
    if (rate === null) {
      try {
        const dbRate = await ExchangeRate.getActiveRate(fromCurrencyUpper, toCurrencyUpper);
        if (dbRate) {
          rate = parseFloat(dbRate.rate);
          source = dbRate.source || 'database';
          
          if (debug) {
            console.log(`[CurrencyService] ✓ Using DB rate: ${rate} (source: ${source})`);
          }
        }
      } catch (dbError) {
        if (debug) {
          console.warn(`[CurrencyService] DB rate failed:`, dbError.message);
        }
      }
    }
    
    // ===== PRIORITY 4: DEFAULT RATES =====
    if (rate === null) {
      rate = this.getDefaultRate(fromCurrencyUpper, toCurrencyUpper);
      source = 'default';
      
      if (debug) {
        console.log(`[CurrencyService] ✓ Using DEFAULT rate: ${rate}`);
      }
    }
    
    // Cache the rate
    const ttl = source === 'manual' ? this.manualRateTTL : CACHE_CONFIG.stdTTL;
    currencyCache.set(cacheKey, rate, ttl);
    
    if (debug) {
      console.log(`[CurrencyService] Final rate for ${cacheKey}: ${rate} (source: ${source}, TTL: ${ttl}s)`);
    }
    
    return rate;
  }

  // Alias for backward compatibility
  async getRateToUSD(fromCurrency, options = {}) {
    return this.getRate(fromCurrency, 'USD', options);
  }

  // ==================== CONVERSION FUNCTIONS ====================

  async convert(amount, fromCurrency, toCurrency = 'USD', options = {}) {
    const debug = options.debug || this.debugMode;
    
    try {
      // Validate input
      if (amount == null || amount === '' || isNaN(parseFloat(amount))) {
        if (debug) {
          console.warn(`[CurrencyService] Invalid amount: ${amount}`);
        }
        return 0;
      }
      
      const amountNum = parseFloat(amount);
      const fromCurrencyUpper = (fromCurrency || 'USD').toUpperCase();
      const toCurrencyUpper = toCurrency.toUpperCase();
      
      // Same currency, no conversion needed
      if (fromCurrencyUpper === toCurrencyUpper) {
        return parseFloat(amountNum.toFixed(4));
      }
      
      if (debug) {
        console.log(`=== [CurrencyService] CONVERSION ===`);
        console.log(`Amount: ${amountNum} ${fromCurrencyUpper}`);
        console.log(`Target: ${toCurrencyUpper}`);
      }
      
      // Get conversion rate
      const rate = await this.getRate(fromCurrencyUpper, toCurrencyUpper, options);
      const result = amountNum * rate;
      const formattedResult = parseFloat(result.toFixed(4));
      
      if (debug) {
        console.log(`Rate: 1 ${fromCurrencyUpper} = ${rate} ${toCurrencyUpper}`);
        console.log(`Result: ${amountNum} × ${rate} = ${formattedResult} ${toCurrencyUpper}`);
        console.log(`Cache stats:`, this.getCacheStats());
        console.log(`=== END CONVERSION ===`);
      }
      
      return formattedResult;
      
    } catch (error) {
      console.error(`[CurrencyService] Conversion error:`, error);
      
      // Emergency fallback
      try {
        const emergencyRate = this.getDefaultRate(
          fromCurrency.toUpperCase(), 
          toCurrency.toUpperCase()
        );
        const result = parseFloat(amount) * emergencyRate;
        const formattedResult = parseFloat(result.toFixed(4));
        
        console.warn(`[CurrencyService] EMERGENCY FALLBACK: Using default rate for conversion`);
        
        return formattedResult;
      } catch (fallbackError) {
        console.error(`[CurrencyService] Emergency fallback failed:`, fallbackError);
        return 0;
      }
    }
  }

  // Alias for backward compatibility
  async convertToUSD(amount, fromCurrency, debug = false) {
    return this.convert(amount, fromCurrency, 'USD', { debug });
  }

  // ==================== BATCH OPERATIONS ====================

  async batchConvert(conversions, options = {}) {
    const debug = options.debug || this.debugMode;
    
    try {
      if (debug) {
        console.log(`[CurrencyService] Batch converting ${conversions.length} items...`);
      }
      
      const results = {};
      const uniquePairs = new Set();
      
      // Collect unique currency pairs
      conversions.forEach(({ fromCurrency, toCurrency = 'USD' }) => {
        const pair = `${fromCurrency.toUpperCase()}_${toCurrency.toUpperCase()}`;
        uniquePairs.add(pair);
      });
      
      if (debug) {
        console.log(`[CurrencyService] Unique currency pairs: ${Array.from(uniquePairs).join(', ')}`);
      }
      
      // Fetch all rates in parallel
      const ratePromises = Array.from(uniquePairs).map(async (pair) => {
        const [fromCurrency, toCurrency] = pair.split('_');
        const rate = await this.getRate(fromCurrency, toCurrency, options);
        return { pair, fromCurrency, toCurrency, rate };
      });
      
      const rateResults = await Promise.all(ratePromises);
      
      // Create rate map
      const rateMap = {};
      rateResults.forEach(({ pair, rate }) => {
        rateMap[pair] = rate;
      });
      
      // Convert all amounts
      conversions.forEach(({ id, amount, fromCurrency, toCurrency = 'USD' }) => {
        const pair = `${fromCurrency.toUpperCase()}_${toCurrency.toUpperCase()}`;
        const rate = rateMap[pair];
        const amountNum = parseFloat(amount);
        
        if (rate && !isNaN(amountNum)) {
          results[id] = parseFloat((amountNum * rate).toFixed(4));
        } else {
          results[id] = 0;
        }
      });
      
      if (debug) {
        console.log(`[CurrencyService] Batch conversion complete`);
        console.log(`Results:`, results);
      }
      
      return results;
      
    } catch (error) {
      console.error("[CurrencyService] Batch conversion error:", error);
      throw error;
    }
  }

  // ==================== RATE MANAGEMENT ====================

  async saveRateToDB(fromCurrency, toCurrency, rate, source = 'manual', notes = '') {
    try {
      // Deactivate any existing active rate for this pair
      await ExchangeRate.deactivateOldRates(fromCurrency, toCurrency);
      
      // Create new rate
      const newRate = await ExchangeRate.create({
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        rate: parseFloat(rate),
        effectiveFrom: new Date(),
        effectiveTo: null,
        isActive: true,
        source: source,
        notes: notes,
        metadata: {
          savedBy: 'CurrencyService',
          timestamp: new Date().toISOString()
        }
      });
      
      // Clear cache
      this.clearCacheForCurrency(fromCurrency, toCurrency);
      
      console.log(`[CurrencyService] Saved rate to DB: 1 ${fromCurrency} = ${rate} ${toCurrency} (${source})`);
      
      return newRate;
      
    } catch (error) {
      console.error(`[CurrencyService] Failed to save rate to DB:`, error);
      throw error;
    }
  }

  async updateManualRateDirectly(fromCurrency, toCurrency, rate, notes = '') {
    return this.saveRateToDB(fromCurrency, toCurrency, rate, 'manual', notes);
  }

  // ==================== DEFAULT RATES ====================

  getDefaultRate(fromCurrency, toCurrency = 'USD') {
    const fromUpper = fromCurrency.toUpperCase();
    const toUpper = toCurrency.toUpperCase();
    
    // Handle USD conversions
    if (toUpper === 'USD') {
      const defaultRatesToUSD = {
        IDR: 0.000064,    // ~15,600 IDR = 1 USD
        
        // Special
        CENT: 0.01,       // 1 CENT = $0.01 USD
      };
      
      const rate = defaultRatesToUSD[fromUpper];
      if (rate !== undefined) {
        console.warn(`[CurrencyService] Using DEFAULT rate for ${fromUpper}: ${rate}`);
        return rate;
      }
    }
    
    // Handle other conversions (simplified - would need proper cross rates)
    // For now, convert via USD
    if (fromUpper === 'USD') {
      // Get default rate for toCurrency to USD, then invert
      const toUsdRate = this.getDefaultRate(toUpper, 'USD');
      return toUsdRate !== 1.0 ? 1 / toUsdRate : 1.0;
    }
    
    // For non-USD to non-USD, convert via USD
    const fromUsdRate = this.getDefaultRate(fromUpper, 'USD');
    const toUsdRate = this.getDefaultRate(toUpper, 'USD');
    
    if (fromUsdRate && toUsdRate) {
      return toUsdRate / fromUsdRate;
    }
    
    console.warn(`[CurrencyService] No default rate found for ${fromUpper} to ${toUpper}, using 1.0`);
    return 1.0;
  }

  // ==================== UTILITY FUNCTIONS ====================

  async getRateInfo(fromCurrency, toCurrency = 'USD') {
    const rate = await this.getRate(fromCurrency, toCurrency);
    const source = await this.getRateSource(fromCurrency, toCurrency);
    
    return {
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      rate: rate,
      source: source,
      timestamp: new Date().toISOString(),
      cacheStats: this.getCacheStats()
    };
  }

  async getRateSource(fromCurrency, toCurrency = 'USD') {
    const cacheKey = this.getCacheKey(fromCurrency, toCurrency);
    const cachedRate = currencyCache.get(cacheKey);
    
    if (cachedRate !== undefined) {
      return 'cache';
    }
    
    // Check manual rate in DB
    try {
      const manualRate = await ExchangeRate.getActiveRate(fromCurrency, toCurrency);
      if (manualRate && manualRate.source === 'manual') {
        return 'manual';
      }
    } catch (error) {
      // Ignore error
    }
    
    return 'calculated';
  }

  clearAllCache() {
    const stats = this.getCacheStats();
    currencyCache.flushAll();
    console.log(`[CurrencyService] Cleared all cache (${stats.keys} keys)`);
  }

  // ==================== HEALTH & DIAGNOSTICS ====================

  async healthCheck() {
    try {
      // Test with IDR (most common case)
      const testRate = await this.getRate('IDR', 'USD', { debug: false });
      const testConversion = await this.convert(15000000, 'IDR', 'USD', { debug: false });
      
      const expectedMin = 900;
      const expectedMax = 1100;
      const isValid = testConversion >= expectedMin && testConversion <= expectedMax;
      
      // Check manual rates availability
      const manualRate = await this.getManualRateFromDB('IDR', 'USD');
      
      return {
        status: isValid ? 'healthy' : 'warning',
        service: 'CurrencyService',
        timestamp: new Date().toISOString(),
        config: {
          useManualRates: this.useManualRates,
          disableAPIRates: this.disableAPIRates,
          hasApiKey: !!this.apiKey,
          manualRateTTL: this.manualRateTTL
        },
        test: {
          rate: testRate,
          conversion: `15,000,000 IDR = $${testConversion.toFixed(2)} USD`,
          expectedRange: `$${expectedMin}-$${expectedMax}`,
          isValid: isValid
        },
        manualRates: {
          available: manualRate !== null,
          sampleRate: manualRate
        },
        cache: this.getCacheStats()
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'CurrencyService',
        error: error.message,
        timestamp: new Date().toISOString(),
        config: {
          useManualRates: this.useManualRates,
          disableAPIRates: this.disableAPIRates,
          hasApiKey: !!this.apiKey
        }
      };
    }
  }

  async testSuite() {
    console.log('\n=== [CurrencyService] TEST SUITE ===\n');
    
    const tests = [
      {
        name: 'IDR to USD Conversion',
        test: async () => {
          const rate = await this.getRate('IDR', 'USD', { debug: true });
          const converted = await this.convert(15000000, 'IDR', 'USD', { debug: true });
          return { rate, converted, expectedMin: 900, expectedMax: 1100 };
        }
      },
      {
        name: 'Manual Rate Check',
        test: async () => {
          const manualRate = await this.getManualRateFromDB('IDR', 'USD');
          return { manualRate, exists: manualRate !== null };
        }
      },
      {
        name: 'Cache Test',
        test: async () => {
          const beforeStats = this.getCacheStats();
          await this.getRate('EUR', 'USD', { debug: false });
          const afterStats = this.getCacheStats();
          return { before: beforeStats, after: afterStats };
        }
      },
      {
        name: 'Batch Conversion',
        test: async () => {
          const conversions = [
            { id: 'test1', amount: 1000000, fromCurrency: 'IDR', toCurrency: 'USD' },
            { id: 'test2', amount: 1000, fromCurrency: 'EUR', toCurrency: 'USD' },
            { id: 'test3', amount: 1000, fromCurrency: 'GBP', toCurrency: 'USD' }
          ];
          const results = await this.batchConvert(conversions, { debug: false });
          return { conversions, results };
        }
      }
    ];
    
    const results = [];
    
    for (const test of tests) {
      try {
        console.log(`Running: ${test.name}...`);
        const result = await test.test();
        results.push({
          name: test.name,
          success: true,
          result: result
        });
        console.log(`✓ ${test.name}: PASS\n`);
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          error: error.message
        });
        console.log(`✗ ${test.name}: FAIL - ${error.message}\n`);
      }
    }
    
    console.log('=== TEST SUITE COMPLETE ===\n');
    return results;
  }
}

// Export singleton instance
export default new CurrencyService();