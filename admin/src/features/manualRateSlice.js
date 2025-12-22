import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../config";

const initialState = {
  rates: [],
  currentRate: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isBulkUpdating: false,
  error: null,
  success: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },
  filters: {
    search: "",
    currency: "",
    isActive: "true",
    sortBy: "effectiveFrom",
    sortOrder: "DESC",
  },
  statistics: null,
  recentUpdates: [],
  validationResult: null,
};

// Helper untuk menangani error response
const handleApiError = (error) => {
  console.error("API Error:", error.response?.data || error.message);
  
  if (error.response?.status === 409) {
    return {
      message: error.response.data?.message || "Duplicate entry detected",
      field: error.response.data?.field,
      suggestion: error.response.data?.suggestion,
      code: "DUPLICATE_RATE"
    };
  }
  
  return {
    message: error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Network error occurred",
    code: error.response?.status || "UNKNOWN_ERROR"
  };
};

// ==================== ASYNC THUNKS ====================

// Get all manual rates with pagination
export const getManualRates = createAsyncThunk(
  "manualRates/getAll",
  async (params = {}, thunkAPI) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = "",
        currency = "",
        isActive = "true",
        sortBy = "effectiveFrom",
        sortOrder = "DESC",
      } = params;

      // Convert string "true"/"false" to boolean for backend
      const isActiveBool = isActive === "true" || isActive === true;

      const res = await axios.get(`${API_URL}/manual-rates`, {
        params: {
          page,
          limit,
          search,
          currency,
          isActive: isActiveBool,
          sortBy,
          sortOrder,
        }
      });

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(handleApiError(error));
    }
  }
);

// Get active rate for currency
export const getActiveRate = createAsyncThunk(
  "manualRates/getActive",
  async ({ fromCurrency, toCurrency = "USD" }, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/manual-rates/active`, {
        params: { fromCurrency, toCurrency }
      });

      return res.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return thunkAPI.rejectWithValue({
          message: error.response.data.message,
          hasRate: false,
        });
      }
      
      return thunkAPI.rejectWithValue(handleApiError(error));
    }
  }
);

// Create new manual rate
export const createManualRate = createAsyncThunk(
  "manualRates/create",
  async (rateData, thunkAPI) => {
    try {
      // Validasi: hanya IDR ke USD yang diperbolehkan
      if (rateData.fromCurrency !== "IDR" || rateData.toCurrency !== "USD") {
        throw new Error("Hanya konversi IDR ke USD yang diperbolehkan");
      }
      
      const res = await axios.post(
        `${API_URL}/manual-rates`,
        rateData
      );

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(handleApiError(error));
    }
  }
);

// Update manual rate
export const updateManualRate = createAsyncThunk(
  "manualRates/update",
  async ({ id, ...updateData }, thunkAPI) => {
    try {
      console.log("📝 [Frontend] Updating rate:", id, updateData);
      
      // Tambahkan timestamp untuk menghindari conflict
      const dataWithTimestamp = {
        ...updateData,
        _timestamp: Date.now()
      };
      
      const res = await axios.put(
        `${API_URL}/manual-rates/${id}`,
        dataWithTimestamp
      );

      console.log("✅ [Frontend] Rate updated successfully:", res.data);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(handleApiError(error));
    }
  }
);

// Deactivate manual rate
export const deactivateManualRate = createAsyncThunk(
  "manualRates/deactivate",
  async (id, thunkAPI) => {
    try {
      const res = await axios.delete(`${API_URL}/manual-rates/${id}`);
      return { id, ...res.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(handleApiError(error));
    }
  }
);

// Bulk upsert rates
export const bulkUpsertRates = createAsyncThunk(
  "manualRates/bulkUpsert",
  async (bulkData, thunkAPI) => {
    try {
      // Validasi: hanya IDR ke USD yang diperbolehkan
      const invalidRates = bulkData.rates.filter(
        rate => rate.fromCurrency !== "IDR" || rate.toCurrency !== "USD"
      );
      
      if (invalidRates.length > 0) {
        throw new Error("Hanya rate IDR ke USD yang diperbolehkan dalam bulk operation");
      }
      
      const res = await axios.post(
        `${API_URL}/manual-rates/bulk`,
        bulkData,
      );

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(handleApiError(error));
    }
  }
);

// Get rate statistics
export const getRateStatistics = createAsyncThunk(
  "manualRates/statistics",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/manual-rates/statistics`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(handleApiError(error));
    }
  }
);

// Validate conversion
export const validateConversion = createAsyncThunk(
  "manualRates/validate",
  async ({ amount, fromCurrency, toCurrency = "USD" }, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/manual-rates/validate`, {
        params: { amount, fromCurrency, toCurrency }
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(handleApiError(error));
    }
  }
);

// ==================== SLICE ====================

const manualRateSlice = createSlice({
  name: "manualRates",
  initialState,
  reducers: {
    // Clear error state
    clearError: (state) => {
      state.error = null;
      state.success = false;
    },
    
    // Clear all rates data
    clearRates: (state) => {
      state.rates = [];
      state.currentRate = null;
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20,
      };
    },
    
    // Update filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to page 1 when filters change
      state.pagination.currentPage = 1;
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        search: "",
        currency: "",
        isActive: "true",
        sortBy: "effectiveFrom",
        sortOrder: "DESC",
      };
      state.pagination.currentPage = 1;
    },
    
    // Set pagination
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    
    // Add a rate locally (optimistic update)
    addRateLocally: (state, action) => {
      state.rates.unshift(action.payload);
      state.pagination.totalItems += 1;
    },
    
    // Update a rate locally (optimistic update)
    updateRateLocally: (state, action) => {
      const index = state.rates.findIndex(rate => rate.id === action.payload.id);
      if (index !== -1) {
        state.rates[index] = { ...state.rates[index], ...action.payload };
      }
    },
    
    // Remove a rate locally (optimistic update)
    removeRateLocally: (state, action) => {
      state.rates = state.rates.filter(rate => rate.id !== action.payload);
      state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
    },

    // Clear validation result
    clearValidationResult: (state) => {
      state.validationResult = null;
    },

    // Clear specific error
    clearFieldError: (state) => {
      if (state.error?.field) {
        state.error = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all rates
      .addCase(getManualRates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getManualRates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rates = action.payload.data || [];
        state.pagination = {
          currentPage: action.payload.pagination?.currentPage || 1,
          totalPages: action.payload.pagination?.totalPages || 1,
          totalItems: action.payload.pagination?.totalItems || 0,
          itemsPerPage: action.payload.pagination?.itemsPerPage || 20,
        };
      })
      .addCase(getManualRates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to load rates";
      })

      // Get active rate
      .addCase(getActiveRate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getActiveRate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRate = action.payload.data || null;
      })
      .addCase(getActiveRate.rejected, (state, action) => {
        state.isLoading = false;
        state.currentRate = null;
        if (action.payload?.hasRate !== false) {
          state.error = action.payload?.message;
        }
      })

      // Create rate
      .addCase(createManualRate.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createManualRate.fulfilled, (state, action) => {
        state.isCreating = false;
        state.success = true;
        if (state.pagination.currentPage === 1) {
          state.rates.unshift(action.payload.data);
          state.pagination.totalItems += 1;
        }
      })
      .addCase(createManualRate.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.message || "Failed to create rate";
      })

      // Update rate - PERBAIKAN UTAMA DI SINI
      .addCase(updateManualRate.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateManualRate.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.success = true;
        
        const { oldRateId, newRateId, updatedRate } = action.payload.data || {};
        
        if (updatedRate) {
          // Jika backend mengembalikan rate yang sudah diupdate
          const index = state.rates.findIndex(rate => rate.id === updatedRate.id);
          if (index !== -1) {
            // Update existing rate
            state.rates[index] = updatedRate;
          } else {
            // Jika tidak ditemukan, cari berdasarkan oldRateId
            const oldIndex = state.rates.findIndex(rate => rate.id === oldRateId);
            if (oldIndex !== -1) {
              // Ganti rate lama dengan yang baru
              state.rates[oldIndex] = updatedRate;
            } else {
              // Tambahkan sebagai rate baru
              state.rates.unshift(updatedRate);
              state.pagination.totalItems += 1;
            }
          }
        } else if (newRateId && oldRateId) {
          // Fallback: jika hanya ada oldRateId dan newRateId
          const index = state.rates.findIndex(rate => rate.id === oldRateId);
          if (index !== -1) {
            state.rates[index] = { 
              ...state.rates[index], 
              id: newRateId,
              rate: action.payload.data.newRate || state.rates[index].rate,
              effectiveFrom: action.payload.data.effectiveFrom || state.rates[index].effectiveFrom,
              lastUpdated: new Date().toISOString(),
            };
          }
        }
      })
      .addCase(updateManualRate.rejected, (state, action) => {
        state.isUpdating = false;
        // Simpan error sebagai string
        state.error = action.payload?.message || "Failed to update rate";
      })

      // Deactivate rate
      .addCase(deactivateManualRate.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deactivateManualRate.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.success = true;
        state.rates = state.rates.filter(rate => rate.id !== action.payload.id);
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
      })
      .addCase(deactivateManualRate.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload?.message || "Failed to deactivate rate";
      })

      // Bulk upsert
      .addCase(bulkUpsertRates.pending, (state) => {
        state.isBulkUpdating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(bulkUpsertRates.fulfilled, (state) => {
        state.isBulkUpdating = false;
        state.success = true;
      })
      .addCase(bulkUpsertRates.rejected, (state, action) => {
        state.isBulkUpdating = false;
        state.error = action.payload?.message || "Bulk operation failed";
      })

      // Get statistics
      .addCase(getRateStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload.data;
      })

      // Validate conversion
      .addCase(validateConversion.fulfilled, (state, action) => {
        if (action.payload.data) {
          state.validationResult = action.payload.data;
        }
      });
  },
});

export const {
  clearError,
  clearRates,
  setFilters,
  clearFilters,
  setPage,
  addRateLocally,
  updateRateLocally,
  removeRateLocally,
  clearValidationResult,
  clearFieldError,
} = manualRateSlice.actions;

export default manualRateSlice.reducer;