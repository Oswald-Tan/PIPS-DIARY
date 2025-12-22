import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../config";

const initialState = {
  profile: null,
  badges: [],
  leaderboard: null,
  leaderboardHistory: null,
  availablePeriods: [], // Ditambahkan
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
  recentUnlocks: [],
  isLoadingLeaderboard: false,
  isLoadingBadges: false,
  isLoadingPeriods: false, // Ditambahkan
};

// Get user gamification profile
export const getGamificationProfile = createAsyncThunk(
  "gamification/getProfile",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/gamification/profile`);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.msg ||
          error.response.data?.error;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// Get all badges
export const getAllBadges = createAsyncThunk(
  "gamification/getAllBadges",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/gamification/badges`);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.msg ||
          error.response.data?.error;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// Get leaderboard dengan parameter baru
export const getLeaderboard = createAsyncThunk(
  "gamification/getLeaderboard",
  async (
    { periodType = "monthly", periodValue, limit = 50, page = 1 },
    thunkAPI
  ) => {
    try {
      let url = `${API_URL}/gamification/leaderboard?periodType=${periodType}&limit=${limit}&page=${page}`;

      if (periodValue) {
        url += `&periodValue=${periodValue}`;
      }

      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.msg ||
          error.response.data?.error;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// Get leaderboard history
export const getLeaderboardHistory = createAsyncThunk(
  "gamification/getLeaderboardHistory",
  async ({ periodType = "monthly", limit = 6 }, thunkAPI) => {
    try {
      const res = await axios.get(
        `${API_URL}/gamification/leaderboard/history?periodType=${periodType}&limit=${limit}`
      );
      return res.data;
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.msg ||
          error.response.data?.error;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// Get available periods - THUNK BARU
export const getAvailablePeriods = createAsyncThunk(
  "gamification/getAvailablePeriods",
  async ({ periodType = "monthly" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `${API_URL}/gamification/leaderboard/periods?periodType=${periodType}`
      );
      return res.data;
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.msg ||
          error.response.data?.error;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

export const gamificationSlice = createSlice({
  name: "gamification",
  initialState,
  reducers: {
    reset: (state) => initialState,
    clearError: (state) => {
      state.isError = false;
      state.message = "";
    },
    addRecentUnlock: (state, action) => {
      state.recentUnlocks.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearRecentUnlocks: (state) => {
      state.recentUnlocks = [];
    },
    updateProfileData: (state, action) => {
      if (state.profile && state.profile.level) {
        state.profile.level = {
          ...state.profile.level,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Profile
      .addCase(getGamificationProfile.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getGamificationProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.profile = action.payload.data || action.payload;
        state.message = "";
      })
      .addCase(getGamificationProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to load profile";
        state.profile = null;
      })

      // Get All Badges
      .addCase(getAllBadges.pending, (state) => {
        state.isLoadingBadges = true;
        state.isError = false;
      })
      .addCase(getAllBadges.fulfilled, (state, action) => {
        state.isLoadingBadges = false;
        state.isSuccess = true;
        state.badges = action.payload.data || action.payload || [];
        state.message = "";
      })
      .addCase(getAllBadges.rejected, (state, action) => {
        state.isLoadingBadges = false;
        state.isError = true;
        state.message = action.payload || "Failed to load badges";
        state.badges = [];
      })

      // Get Leaderboard
      .addCase(getLeaderboard.pending, (state) => {
        state.isLoadingLeaderboard = true;
        state.isError = false;
      })
      .addCase(getLeaderboard.fulfilled, (state, action) => {
        state.isLoadingLeaderboard = false;
        state.isSuccess = true;
        state.leaderboard = action.payload.data || action.payload;
        state.message = "";
      })
      .addCase(getLeaderboard.rejected, (state, action) => {
        state.isLoadingLeaderboard = false;
        state.isError = true;
        state.message = action.payload || "Failed to load leaderboard";
        state.leaderboard = null;
      })

      // Get Leaderboard History
      .addCase(getLeaderboardHistory.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getLeaderboardHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.leaderboardHistory = action.payload.data || action.payload;
        state.message = "";
      })
      .addCase(getLeaderboardHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to load leaderboard history";
        state.leaderboardHistory = null;
      })

      // Get Available Periods - HANDLER BARU
      .addCase(getAvailablePeriods.pending, (state) => {
        state.isLoadingPeriods = true;
        state.isError = false;
      })
      .addCase(getAvailablePeriods.fulfilled, (state, action) => {
        state.isLoadingPeriods = false;
        state.isSuccess = true;
        state.availablePeriods = action.payload.data || action.payload;
        state.message = "";
      })
      .addCase(getAvailablePeriods.rejected, (state, action) => {
        state.isLoadingPeriods = false;
        state.isError = true;
        state.message = action.payload || "Failed to load available periods";
        state.availablePeriods = [];
      });
  },
});

export const {
  reset,
  clearError,
  addRecentUnlock,
  clearRecentUnlocks,
  updateProfileData,
} = gamificationSlice.actions;
export default gamificationSlice.reducer;
