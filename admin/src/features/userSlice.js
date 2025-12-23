import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../config";

const initialState = {
  users: [],
  user: null,
  stats: {},
  pagination: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isError: false,
  isSuccess: false,
  message: "",
  searchMessage: "",
  lastAction: null, // Tambahkan untuk melacak aksi terakhir
};

// Get all users dengan pagination dan filter
export const getUsers = createAsyncThunk(
  "users/getUsers",
  async (params = {}, thunkAPI) => {
    try {
      const defaultParams = {
        page: 0,
        limit: 10,
        search: "",
        role: "user",
      };

      const queryParams = { ...defaultParams, ...params };

      const queryString = new URLSearchParams();
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] !== undefined && queryParams[key] !== "") {
          queryString.append(key, queryParams[key]);
        }
      });

      const res = await axios.get(
        `${API_URL}/user/by-role?${queryString.toString()}`
      );
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

// Get users stats
export const getUsersStats = createAsyncThunk(
  "users/getUsersStats",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/user/stats`);
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

// Get user by ID
export const getUserById = createAsyncThunk(
  "users/getUserById",
  async (userId, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/user/user/${userId}`);
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

// Create user
export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/user/user`, userData);

      // Refresh users list
      const state = thunkAPI.getState();
      const { pagination } = state.users;

      if (pagination) {
        await thunkAPI.dispatch(
          getUsers({
            page: pagination.currentPage || 0,
            limit: pagination.itemsPerPage || 10,
            role: pagination.roleFilter || "user",
          })
        );
      }

      // Refresh stats
      await thunkAPI.dispatch(getUsersStats());

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

// Update user
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ userId, userData }, thunkAPI) => {
    try {
      const res = await axios.patch(`${API_URL}/user/user/${userId}`, userData);

      // Refresh users list
      const state = thunkAPI.getState();
      const { pagination } = state.users;

      if (pagination) {
        await thunkAPI.dispatch(
          getUsers({
            page: pagination.currentPage || 0,
            limit: pagination.itemsPerPage || 10,
            role: pagination.roleFilter || "user",
          })
        );
      }

      // Refresh stats
      await thunkAPI.dispatch(getUsersStats());

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

// Delete user
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId, thunkAPI) => {
    try {
      const res = await axios.delete(`${API_URL}/user/user/${userId}`);

      // Refresh users list
      const state = thunkAPI.getState();
      const { users, pagination } = state.users;

      let targetPage = pagination?.currentPage || 0;
      if (pagination && users.length === 1 && targetPage > 0) {
        targetPage = targetPage - 1;
      }

      if (pagination) {
        await thunkAPI.dispatch(
          getUsers({
            page: targetPage,
            limit: pagination.itemsPerPage || 10,
            role: pagination.roleFilter || "user",
          })
        );
      }

      // Refresh stats
      await thunkAPI.dispatch(getUsersStats());

      return { ...res.data, deletedUserId: userId };
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message || error.response.data.msg;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue("Network error occurred");
    }
  }
);

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetUser: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
      state.searchMessage = "";
      state.lastAction = null;
    },
    resetUserState: (state) => initialState,
    clearSelectedUser: (state) => {
      state.user = null;
    },
    clearSearchMessage: (state) => {
      state.searchMessage = "";
    },
    clearMessage: (state) => {
      state.message = "";
      state.lastAction = null;
    },
    setRoleFilterInPagination: (state, action) => {
      if (state.pagination) {
        state.pagination.roleFilter = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Users
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.searchMessage = "";
        // Jangan reset message untuk getUsers
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const payload = action.payload;

        // Pastikan data yang disimpan adalah array
        if (payload && Array.isArray(payload.data)) {
          state.users = payload.data;
        } else {
          state.users = [];
        }

        // Simpan informasi pagination dari backend
        if (payload) {
          state.pagination = {
            currentPage: payload.page || 0,
            itemsPerPage: payload.limit || 10,
            totalItems: payload.totalRows || 0,
            totalPages: payload.totalPage || 0,
            roleFilter: state.pagination?.roleFilter || "user",
          };
        }

        // Simpan pesan khusus pencarian jika ada
        if (payload?.message && payload.empty) {
          state.searchMessage = payload.message;
        } else {
          state.searchMessage = "";
        }

        // Jangan set message untuk getUsers, hanya untuk CRUD
        // state.message = payload?.message || "Users retrieved successfully";
        state.lastAction = "get";
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.searchMessage = action.payload || "Failed to get users";
        state.lastAction = "get";
      })

      // Get Users Stats
      .addCase(getUsersStats.pending, (state) => {
        // Tidak set isLoading agar tidak mengganggu loading tabel
      })
      .addCase(getUsersStats.fulfilled, (state, action) => {
        state.stats = action.payload.data || {};
      })
      .addCase(getUsersStats.rejected, (state) => {
        state.stats = {};
      })

      // Get User By ID
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.lastAction = "get";
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to get user";
        state.lastAction = "get";
      })

      // Create User
      .addCase(createUser.pending, (state) => {
        state.isCreating = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isCreating = false;
        state.isSuccess = true;
        state.message = action.payload.message || "User created successfully";
        state.lastAction = "create";
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isCreating = false;
        state.isError = true;
        state.message = action.payload || "Failed to create user";
        state.lastAction = "create";
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.isUpdating = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.isSuccess = true;
        state.message = action.payload.message || "User updated successfully";
        state.lastAction = "update";
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.isError = true;
        state.message = action.payload || "Failed to update user";
        state.lastAction = "update";
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.isDeleting = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.isSuccess = true;
        state.message = action.payload.message || "User deleted successfully";
        state.lastAction = "delete";
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isDeleting = false;
        state.isError = true;
        state.message = action.payload || "Failed to delete user";
        state.lastAction = "delete";
      });
  },
});

export const { 
  resetUser, 
  resetUserState, 
  clearSelectedUser, 
  clearSearchMessage,
  clearMessage,
  setRoleFilterInPagination 
} = userSlice.actions;
export default userSlice.reducer;