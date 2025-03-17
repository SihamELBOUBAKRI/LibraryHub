import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/config/axiosSetup';

// Async Thunk to Fetch Users
export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const response = await axiosInstance.get("/api/users");
  return response.data;
});

// Async Thunk to Add to Cart
export const addToCart = createAsyncThunk("users/addToCart", async (bookId, { getState }) => {
  const { user } = getState().users; // Access the user from the state
  if (!user) {
    throw new Error("User not authenticated");
  }
  const response = await axiosInstance.post(`/api/users/${user.id}/cart`, { bookId });
  return response.data;
});

// Async Thunk to Add to Wishlist
export const addToWishlist = createAsyncThunk("users/addToWishlist", async (bookId, { getState }) => {
  const { user } = getState().users; // Access the user from the state
  if (!user) {
    throw new Error("User not authenticated");
  }
  const response = await axiosInstance.post(`/api/users/${user.id}/wishlist`, { bookId });
  return response.data;
});

// Async Thunk to Login
export const login = createAsyncThunk("users/login", async (credentials) => {
  const response = await axiosInstance.post("/api/login", credentials);
  return response.data; // Assuming the API returns user data and token
});

// Async Thunk to Logout
export const logout = createAsyncThunk("users/logout", async () => {
  const response = await axiosInstance.post("/api/logout");
  return response.data; // Assuming the API confirms logout
});

// Initial State
const initialState = {
  users: [], // List of all users (for admin purposes)
  user: null, // Currently logged-in user
  isAuthenticated: false, // Authentication status
  loading: false,
  error: null,
  cart: [], // User's cart
  wishlist: [], // User's wishlist
};

// Create Slice
const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // Synchronous reducer to set authentication status
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart.push(action.payload); // Add book to cart
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Add to Wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist.push(action.payload); // Add book to wishlist
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user; // Set the logged-in user
        state.isAuthenticated = true; // Set authentication status to true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null; // Clear the logged-in user
        state.isAuthenticated = false; // Set authentication status to false
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Export Actions
export const { setAuthenticated } = usersSlice.actions;

// Export Reducer
export default usersSlice.reducer;