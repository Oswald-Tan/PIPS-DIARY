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
    isActive: true,
    sortBy: "effectiveFrom",
    sortOrder: "DESC",
  },
  statistics: null,
  recentUpdates: [],
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
        isActive = true,
        sortBy = "effectiveFrom",
        sortOrder = "DESC",
      } = params;

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("Authentication required");
      }

      const res = await axios.get(`${API_URL}/manual-rates`, {
        params: {
          page,
          limit,
          search,
          currency,
          isActive,
          sortBy,
          sortOrder,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Network error occurred";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get active rate for currency
export const getActiveRate = createAsyncThunk(
  "manualRates/getActive",
  async ({ fromCurrency, toCurrency = "USD" }, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/manual-rates/active`, {
        params: { fromCurrency, toCurrency },
      });

      return res.data;
    } catch (error) {
      // Don't throw error for 404 - it just means no rate exists
      if (error.response?.status === 404) {
        return thunkAPI.rejectWithValue({
          message: error.response.data.message,
          hasRate: false,
        });
      }
      
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Network error occurred";
      return thunkAPI.rejectWithValue({ message, hasRate: false });
    }
  }
);

// Create new manual rate
export const createManualRate = createAsyncThunk(
  "manualRates/create",
  async (rateData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("Authentication required");
      }

      const res = await axios.post(
        `${API_URL}/manual-rates`,
        rateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Network error occurred";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update manual rate
export const updateManualRate = createAsyncThunk(
  "manualRates/update",
  async ({ id, ...updateData }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("Authentication required");
      }

      const res = await axios.put(
        `${API_URL}/manual-rates/${id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Network error occurred";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Deactivate manual rate
export const deactivateManualRate = createAsyncThunk(
  "manualRates/deactivate",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("Authentication required");
      }

      const res = await axios.delete(`${API_URL}/manual-rates/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { id, ...res.data };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Network error occurred";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Bulk upsert rates
export const bulkUpsertRates = createAsyncThunk(
  "manualRates/bulkUpsert",
  async (bulkData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("Authentication required");
      }

      const res = await axios.post(
        `${API_URL}/manual-rates/bulk`,
        bulkData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Network error occurred";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get rate statistics
export const getRateStatistics = createAsyncThunk(
  "manualRates/statistics",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("Authentication required");
      }

      const res = await axios.get(`${API_URL}/manual-rates/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Network error occurred";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Validate conversion
export const validateConversion = createAsyncThunk(
  "manualRates/validate",
  async ({ amount, fromCurrency, toCurrency = "USD" }, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/manual-rates/validate`, {
        params: { amount, fromCurrency, toCurrency },
      });

      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Network error occurred";
      return thunkAPI.rejectWithValue(message);
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
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        search: "",
        currency: "",
        isActive: true,
        sortBy: "effectiveFrom",
        sortOrder: "DESC",
      };
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
        state.filters = { ...state.filters, ...action.payload.filters };
      })
      .addCase(getManualRates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
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
        // Only set error if it's not a 404 (no rate found)
        if (!action.payload?.hasRate === false) {
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
        // Add to rates list if we're on page 1
        if (state.pagination.currentPage === 1) {
          state.rates.unshift(action.payload.data);
          state.pagination.totalItems += 1;
        }
      })
      .addCase(createManualRate.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      // Update rate
      .addCase(updateManualRate.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateManualRate.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.success = true;
        // Update in rates list
        const index = state.rates.findIndex(rate => rate.id === action.payload.data?.oldRateId);
        if (index !== -1) {
          // If new version created, update the rate
          if (action.payload.data?.newRateId) {
            state.rates[index] = { 
              ...state.rates[index], 
              ...action.payload.data,
              id: action.payload.data.newRateId
            };
          }
        }
      })
      .addCase(updateManualRate.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
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
        // Remove from rates list
        state.rates = state.rates.filter(rate => rate.id !== action.payload.id);
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
      })
      .addCase(deactivateManualRate.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
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
        // Refresh rates list
        state.pagination.currentPage = 1;
      })
      .addCase(bulkUpsertRates.rejected, (state, action) => {
        state.isBulkUpdating = false;
        state.error = action.payload;
      })

      // Get statistics
      .addCase(getRateStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload.data;
      })

      // Validate conversion
      .addCase(validateConversion.fulfilled, (state, action) => {
        // Store validation result if needed
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
} = manualRateSlice.actions;

export default manualRateSlice.reducer;