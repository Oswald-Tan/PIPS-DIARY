import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../config";
import { getBalance } from "./balanceSlice";

const initialState = {
  trades: [],
  trade: null,
  stats: {},
  pagination: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// Get all trades dengan pagination dan filter
export const getTrades = createAsyncThunk(
  "trades/getTrades",
  async (params = {}, thunkAPI) => {
    try {
      // Default parameters
      const defaultParams = {
        page: 0,
        limit: 10,
        search: "",
        type: "",
        result: ""
      };
      
      const queryParams = { ...defaultParams, ...params };
      
      // Build query string
      const queryString = new URLSearchParams();
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== undefined && queryParams[key] !== "") {
          queryString.append(key, queryParams[key]);
        }
      });
      
      const res = await axios.get(`${API_URL}/trades?${queryString.toString()}`);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message || error.response.data.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// Create new trade
export const createTrade = createAsyncThunk(
  "trades/createTrade",
  async (tradeData, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/trades`, tradeData);
      
      // Get current pagination state to maintain the same page
      const state = thunkAPI.getState();
      const { pagination, trades: currentTrades } = state.trades;
      
      // Dispatch getTrades with current parameters to refresh list
      if (pagination) {
        await thunkAPI.dispatch(getTrades({
          page: pagination.currentPage || 0,
          limit: pagination.itemsPerPage || 10,
        }));
      } else {
        await thunkAPI.dispatch(getTrades());
      }
      
      await thunkAPI.dispatch(getBalance());
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message || error.response.data.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// Update trade
export const updateTrade = createAsyncThunk(
  "trades/updateTrade",
  async ({ tradeId, tradeData }, thunkAPI) => {
    try {
      console.log("Updating trade in Redux:", { tradeId, tradeData });
      const res = await axios.put(`${API_URL}/trades/${tradeId}`, tradeData);

      // Get current pagination state to maintain the same page
      const state = thunkAPI.getState();
      const { pagination } = state.trades;
      
      // Refresh trades list with current pagination parameters
      if (pagination) {
        await thunkAPI.dispatch(getTrades({
          page: pagination.currentPage || 0,
          limit: pagination.itemsPerPage || 10,
        }));
      } else {
        await thunkAPI.dispatch(getTrades());
      }
      
      await thunkAPI.dispatch(getBalance());
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message || error.response.data.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// Delete trade
export const deleteTrade = createAsyncThunk(
  "trades/deleteTrade",
  async (tradeId, thunkAPI) => {
    try {
      const res = await axios.delete(`${API_URL}/trades/${tradeId}`);
      
      // Get current pagination state to maintain the same page
      const state = thunkAPI.getState();
      const { pagination, trades } = state.trades;
      
      // If deleting the last item on a page, go back one page
      let targetPage = pagination?.currentPage || 0;
      if (pagination && trades.length === 1 && targetPage > 0) {
        targetPage = targetPage - 1;
      }
      
      // Refresh trades list
      if (pagination) {
        await thunkAPI.dispatch(getTrades({
          page: targetPage,
          limit: pagination.itemsPerPage || 10,
        }));
      } else {
        await thunkAPI.dispatch(getTrades());
      }
      
      await thunkAPI.dispatch(getBalance());
      return { ...res.data, deletedTradeId: tradeId };
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message || error.response.data.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// Delete all trades
export const deleteAllTrades = createAsyncThunk(
  "trades/deleteAllTrades",
  async (_, thunkAPI) => {
    try {
      const res = await axios.delete(`${API_URL}/trades/delete-all`);
      
      // Refresh data setelah delete
      await thunkAPI.dispatch(getBalance());
      await thunkAPI.dispatch(getTrades());
      
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message || error.response.data.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

export const tradeSlice = createSlice({
  name: "trades",
  initialState,
  reducers: {
    resetTrade: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
    resetTradeState: (state) => initialState,
    // Update trade secara manual
    updateTradeInState: (state, action) => {
      const updatedTrade = action.payload;
      const index = state.trades.findIndex(
        (trade) => trade.id === updatedTrade.id
      );
      if (index !== -1) {
        state.trades[index] = updatedTrade;
      }
    },
    // Reset pagination ke halaman pertama
    resetPage: (state) => {
      if (state.pagination) {
        state.pagination.currentPage = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Trades dengan pagination
      .addCase(getTrades.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getTrades.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trades = action.payload.data || [];
        state.stats = action.payload.stats || {};
        state.pagination = action.payload.pagination || null;
        state.message = action.payload.message || "Trades retrieved successfully";
      })
      .addCase(getTrades.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to get trades";
      })
      // Create Trade
      .addCase(createTrade.pending, (state) => {
        state.isCreating  = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(createTrade.fulfilled, (state, action) => {
        state.isCreating  = false;
        state.isSuccess = true;
        // Note: We don't manually add to trades array because we refresh from server
        state.message = action.payload.message || "Trade created successfully";
      })
      .addCase(createTrade.rejected, (state, action) => {
        state.isCreating  = false;
        state.isError = true;
        if (typeof action.payload === "string") {
          state.message = action.payload;
        } else if (action.payload?.message) {
          state.message = action.payload.message;
        } else {
          state.message = "Failed to create trade";
        }
      })
      // Update Trade
      .addCase(updateTrade.pending, (state) => {
        state.isUpdating  = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(updateTrade.fulfilled, (state, action) => {
        state.isUpdating  = false;
        // Handle unchanged case
        if (action.payload.unchanged) {
          state.message = "No changes made";
          return;
        }
        state.isSuccess = true;
        // Note: We don't manually update in state because we refresh from server
        state.message = action.payload.message || "Trade updated successfully";
      })
      .addCase(updateTrade.rejected, (state, action) => {
        state.isUpdating  = false;
        state.isError = true;
        state.message = action.payload || "Failed to update trade";
      })
      // Delete Trade
      .addCase(deleteTrade.pending, (state) => {
        state.isDeleting  = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(deleteTrade.fulfilled, (state, action) => {
        state.isDeleting  = false;
        state.isSuccess = true;
        // Note: We don't manually remove from trades array because we refresh from server
        state.message = action.payload.message || "Trade deleted successfully";
      })
      .addCase(deleteTrade.rejected, (state, action) => {
        state.isDeleting  = false;
        state.isError = true;
        state.message = action.payload || "Failed to delete trade";
      })
      // Delete All Trades
      .addCase(deleteAllTrades.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(deleteAllTrades.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trades = [];
        state.pagination = null;
        state.message = action.payload.message || "All trades deleted successfully";
      })
      .addCase(deleteAllTrades.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to delete all trades";
      });
  },
});

export const { resetTrade, resetTradeState, updateTradeInState, resetPage } =
  tradeSlice.actions;
export default tradeSlice.reducer;