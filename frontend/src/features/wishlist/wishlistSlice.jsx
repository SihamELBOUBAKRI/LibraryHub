import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'; // Assuming you're using axios for API requests

const initialState = {
  items: [], // array of book objects
  loading: false,
  error: null,
};

// Async thunk to fetch wishlist items
export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (userId) => {
  const response = await axios.get(`/api/wishlist/${userId}`);
  return response.data;
});

// Async thunk to create a new wishlist item
export const addWishlistItem = createAsyncThunk('wishlist/addWishlistItem', async (itemData) => {
  const response = await axios.post('/api/wishlist', itemData);
  return response.data;
});

// Async thunk to update a wishlist item
export const updateWishlistItem = createAsyncThunk('wishlist/updateWishlistItem', async (updatedItem) => {
  const response = await axios.put(`/api/wishlist/${updatedItem.id}`, updatedItem);
  return response.data;
});

// Async thunk to remove a wishlist item
export const removeWishlistItem = createAsyncThunk('wishlist/removeWishlistItem', async (itemId) => {
  await axios.delete(`/api/wishlist/${itemId}`);
  return itemId;
});

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
        state.error = action.error.message;
      })

      // Add item to Wishlist
      .addCase(addWishlistItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(addWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update Wishlist item
      .addCase(updateWishlistItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateWishlistItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Remove item from Wishlist
      .addCase(removeWishlistItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default wishlistSlice.reducer;
