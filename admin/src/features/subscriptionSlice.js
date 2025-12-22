import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../config';

const initialState = {
  subscription: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Async thunk untuk get subscription
export const getSubscription = createAsyncThunk(
  'subscription/getSubscription',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/subscription`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      console.log('Get subscription response:', res.data);
      return res.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async thunk untuk check subscription status
export const checkSubscriptionStatus = createAsyncThunk(
  'subscription/checkSubscriptionStatus',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/subscription/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      return res.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async thunk untuk update subscription - DENGAN HEADER
export const updateSubscription = createAsyncThunk(
  'subscription/updateSubscription',
  async (subscriptionData, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Updating subscription with data:', subscriptionData);
      
      const res = await axios.put(`${API_URL}/subscription/update`, subscriptionData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Update subscription response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Update subscription error:', error.response?.data || error.message);
      
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        'Gagal mengupdate subscription';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async thunk khusus untuk downgrade ke free
export const downgradeToFree = createAsyncThunk(
  'subscription/downgradeToFree',
  async (_, thunkAPI) => {
    try {
      console.log('Downgrading to free...');
      
      // Coba endpoint yang mungkin
      let response;
      
      try {
        // Coba endpoint update
        response = await axios.put(`${API_URL}/subscription/update`, {
          plan: 'free',
          isActive: true,
          expiresAt: null,
          paymentMethod: 'free'
        });
      } catch (updateError) {
        console.log('Update endpoint failed, trying alternative...');
        
        // Coba endpoint khusus downgrade jika ada
        try {
          response = await axios.post(`${API_URL}/subscription/downgrade-free`, {});
        } catch (downgradeError) {
          console.log('Both endpoints failed');
          throw downgradeError;
        }
      }
      
      console.log('Downgrade response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Downgrade to free error:', error);
      
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        'Gagal melakukan downgrade ke free';
      
      // Fallback: return data untuk langsung update state
      if (error.response?.status === 404) {
        return {
          success: true,
          message: 'Berhasil downgrade ke plan Free (local)',
          data: {
            plan: 'free',
            isActive: true,
            expiresAt: null,
            isValid: true,
            isExpired: false,
            paymentMethod: 'free'
          }
        };
      }
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    updateSubscriptionLocal: (state, action) => {
      if (state.subscription) {
        state.subscription = { ...state.subscription, ...action.payload };
      } else {
        state.subscription = action.payload;
      }
      state.isSuccess = true;
      state.message = 'Subscription updated locally';
    },
    setFreePlan: (state) => {
      state.subscription = {
        plan: 'free',
        isActive: true,
        expiresAt: null,
        isValid: true,
        isExpired: false,
        paymentMethod: 'free'
      };
      state.isSuccess = true;
      state.message = 'Berhasil downgrade ke plan Free';
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Subscription
      .addCase(getSubscription.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.subscription = action.payload.data;
        state.message = action.payload.message || 'Success';
      })
      .addCase(getSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.subscription = null;
      })
      
      // Check Subscription Status
      .addCase(checkSubscriptionStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkSubscriptionStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.subscription = action.payload.data;
      })
      .addCase(checkSubscriptionStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update Subscription
      .addCase(updateSubscription.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.subscription = action.payload.data;
        state.message = action.payload.message || 'Subscription berhasil diupdate';
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Downgrade to Free
      .addCase(downgradeToFree.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(downgradeToFree.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.subscription = action.payload.data;
        state.message = action.payload.message || 'Berhasil downgrade ke free plan';
      })
      .addCase(downgradeToFree.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, updateSubscriptionLocal, setFreePlan } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;