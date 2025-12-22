// features/balanceSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../config";

const initialState = {
  initialBalance: 0,
  currentBalance: 0,
  currency: "USD", // Default value
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

export const getBalance = createAsyncThunk(
  "balance/getBalance",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/balance`);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

export const updateInitialBalance = createAsyncThunk(
  "balance/updateInitialBalance",
  async ({ initialBalance, currency }, thunkAPI) => {
    try {
      const res = await axios.patch(`${API_URL}/balance/update-initial`, {
        initialBalance,
        currency,
      });
      
      // Auto-refresh balance data setelah update
      setTimeout(() => {
        thunkAPI.dispatch(getBalance());
      }, 500);
      
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

export const updateCurrentBalance = createAsyncThunk(
  "balance/updateCurrentBalance",
  async (currentBalance, thunkAPI) => {
    try {
      const res = await axios.patch(`${API_URL}/balance/update-current`, {
        currentBalance,
      });
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

export const balanceSlice = createSlice({
  name: "balance",
  initialState,
  reducers: {
    resetBalance: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
    setCurrentBalance: (state, action) => {
      state.currentBalance = action.payload;
    },
    setCurrency: (state, action) => { // Tambahkan reducer manual untuk currency
      state.currency = action.payload;
    },
    calculateBalanceFromTrades: (state, action) => {
      const { initialBalance, trades } = action.payload;
      let currentBalance = initialBalance;

      trades.forEach((trade) => {
        currentBalance += trade.profit;
      });

      state.currentBalance = currentBalance;
      state.initialBalance = initialBalance;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Balance - PERBAIKAN: Simpan currency dari response
      .addCase(getBalance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.initialBalance = action.payload.initialBalance;
        state.currentBalance = action.payload.currentBalance;
        state.currency = action.payload.currency || "IDR"; // SIMPAN CURRENCY
      })
      .addCase(getBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Initial Balance - PERBAIKAN: Simpan currency dari response
      .addCase(updateInitialBalance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateInitialBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.initialBalance = action.payload.initialBalance;
        state.currentBalance = action.payload.currentBalance;
        state.currency = action.payload.currency; // SIMPAN CURRENCY DARI RESPONSE
        state.message = action.payload.message;
        console.log('✅ BALANCE & CURRENCY UPDATED:', state); // Debug log
      })
      .addCase(updateInitialBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Current Balance
      .addCase(updateCurrentBalance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCurrentBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentBalance = action.payload.currentBalance;
        state.currency = action.payload.currency; // SIMPAN CURRENCY DARI RESPONSE
        state.message = action.payload.message;
      })
      .addCase(updateCurrentBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { 
  resetBalance, 
  setCurrentBalance, 
  setCurrency,
  calculateBalanceFromTrades 
} = balanceSlice.actions;
export default balanceSlice.reducer;