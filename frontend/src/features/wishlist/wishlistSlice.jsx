import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/config/axiosSetup';

const initialState = {
  items: [], // Wishlist items
  loading: false,
  error: null,
};

// Fetch wishlist items for a user
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}/wishlist`);
      return response.data.books; // Assuming `books` array is returned
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch wishlist');
    }
  }
);

// Add a book to wishlist
export const addWishlistItem = createAsyncThunk(
  'wishlist/addWishlistItem',
  async ({ userId, bookId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/users/${userId}/wishlist`, { book_id: bookId });
      return { id: bookId, ...response.data }; // Add book to local state
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add book to wishlist');
    }
  }
);

// Remove a book from wishlist
export const removeWishlistItem = createAsyncThunk(
  'wishlist/removeWishlistItem',
  async ({ userId, bookId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/users/${userId}/wishlist/${bookId}`);
      return bookId; // Return book ID to remove from state
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to remove book from wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Wishlist Item
      .addCase(addWishlistItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(addWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove Wishlist Item
      .addCase(removeWishlistItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default wishlistSlice.reducer;
