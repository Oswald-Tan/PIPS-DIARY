import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../config";

const initialState = {
  user: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  error: "",
};

export const LoginUser = createAsyncThunk(
  "user/LoginUser",
  async (user, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: user.email,
        password: user.password,
      });
      return res.data;
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data.message ||
          error.response.data.msg ||
          "Login failed";
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

export const getMe = createAsyncThunk("user/getMe", async (_, thunkAPI) => {
  try {
    const res = await axios.get(`${API_URL}/auth/me`);
    return res.data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data.msg;
      return thunkAPI.rejectWithValue(message);
    }
  }
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData, thunkAPI) => {
    try {
      const response = await axios.patch(
        `${API_URL}/auth/update-profile`,
        formData
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.msg || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (formData, thunkAPI) => {
    try {
      const response = await axios.patch(
        `${API_URL}/auth/change-password`,
        formData
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token, thunkAPI) => {
    try {
      const res = await axios.get(
        `${API_URL}/auth/verify-email?token=${token}`
      );
      return res.data;
    } catch (error) {
      if (error.response) {
        // Prioritaskan mengambil pesan error dari backend
        const message =
          error.response.data?.error ||
          error.response.data?.message ||
          error.response.data?.msg ||
          "Email verification failed";
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

export const resendVerification = createAsyncThunk(
  "auth/resendVerification",
  async (email, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/auth/resend-verification`, {
        email,
      });
      console.log("Resend verification response:", res.data); // Debug response
      return res.data;
    } catch (error) {
      console.log("Resend verification error:", error.response?.data);
      if (error.response) {
        const message =
          error.response.data?.error ||
          error.response.data?.message ||
          error.response.data?.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

export const requestResetOtp = createAsyncThunk(
  "auth/requestResetOtp",
  async (email, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/auth/request-reset-otp`, {
        email,
      });
      return res.data;
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.msg ||
          "Failed to send OTP";
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// Verify Reset OTP
export const verifyResetOtp = createAsyncThunk(
  "auth/verifyResetOtp",
  async ({ email, otp }, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/auth/verify-reset-otp`, {
        email,
        otp,
      });
      return res.data;
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.msg ||
          "OTP verification failed";
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

// Reset Password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, newPassword, confirmPassword }, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        newPassword,
        confirmPassword,
      });
      return res.data;
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.msg ||
          "Password reset failed";
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

export const LogOut = createAsyncThunk("user/LogOut", async () => {
  await axios.delete(`${API_URL}/auth/logout`);
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => initialState,
    clearError: (state) => {
      state.isError = false;
      state.error = "";
      state.message = "";
    },
    resetPasswordState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.error = "";
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(LoginUser.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.error = "";
    });
    builder.addCase(LoginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.user = action.payload;
      state.error = "";
    });
    builder.addCase(LoginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload; // Simpan di error, bukan message
    });

    // Get User Login
    builder.addCase(getMe.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getMe.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.user = action.payload;
    });
    builder.addCase(getMe.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
    });

    // Tambahkan di extraReducers
    builder.addCase(updateProfile.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.user = {
        ...state.user,
        ...action.payload,
      };
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
    });

    builder.addCase(changePassword.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(changePassword.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.message = action.payload.message;
    });
    builder.addCase(changePassword.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
    });

    // Tambahkan di extraReducers
    builder.addCase(verifyEmail.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(verifyEmail.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.message = action.payload.message;
    });
    builder.addCase(verifyEmail.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
      state.message = "";
    });

    builder.addCase(resendVerification.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(resendVerification.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.message = action.payload.message;
      state.error = "";
    });
    builder.addCase(resendVerification.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.error = action.payload;
      state.message = "";
    });

    // Request Reset OTP Cases
    builder.addCase(requestResetOtp.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.error = "";
    });
    builder.addCase(requestResetOtp.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.message = action.payload.message;
    });
    builder.addCase(requestResetOtp.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload;
    });

    // Verify Reset OTP Cases
    builder.addCase(verifyResetOtp.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.error = "";
    });
    builder.addCase(verifyResetOtp.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.message = action.payload.message;
    });
    builder.addCase(verifyResetOtp.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload;
    });

    // Reset Password Cases
    builder.addCase(resetPassword.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.error = "";
    });
    builder.addCase(resetPassword.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.message = action.payload.message;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload;
    });
  },
});

export const { reset, clearError, resetPasswordState  } = authSlice.actions;
export default authSlice.reducer;
