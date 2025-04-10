import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../components/config/axiosSetup';

// Load initial state from localStorage
const storedUser = JSON.parse(localStorage.getItem('user'));
const storedToken = localStorage.getItem('token');

const initialState = {
  user: storedUser || null,
  token: storedToken || null,
  loading: false,
  registerStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  registerError: null,
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/register', userData);
      return response.data;
    } catch (error) {
      console.log('Full error response:', error.response); // Add this line
      return rejectWithValue(error.response.data);
    }
  }
);

// Async Thunk for Changing Password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ current_password, new_password, new_password_confirmation }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axiosInstance.post(
        '/change-password',
        { current_password, new_password, new_password_confirmation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async Thunk for Deleting Account
export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async ({ password }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axiosInstance.delete(
        '/delete-account',
        {
          data: { password },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    resetRegisterStatus: (state) => {
      state.registerStatus = 'idle';
      state.registerError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Registration
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.registerStatus = 'loading';
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registerStatus = 'succeeded';
        const { user, token } = action.payload;
        state.user = user;
        state.token = token;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.registerStatus = 'failed';
        state.registerError = action.payload?.message || 'Registration failed';
        toast.error(action.payload?.message || 'Registration failed');
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
      })
      // Delete Account
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        state.user = null;
        state.token = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload?.error || 'Failed to delete account');
      });
  },
});

export const { setCredentials, logout, resetRegisterStatus } = authSlice.actions;
export default authSlice.reducer;