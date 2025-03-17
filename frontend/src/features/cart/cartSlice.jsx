import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/config/axiosSetup';

const initialState = {
  items: [],
  totalAmount: 0,
  status: 'idle',
  error: null
};

// Fetch cart for a specific user
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}/cart`);
      return response.data; // returns items and totalAmount
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// Add to cart for a specific user
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ userId, bookId, quantity }, { rejectWithValue }) => {
    try {
      // Posting book_id and quantity to the backend
      const response = await axiosInstance.post(`/users/${userId}/cart`, { 
        book_id: bookId,
        quantity: quantity 
      });

      return response.data; // Assuming this returns items and totalAmount
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// Remove from cart for a specific user
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ userId, bookId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/users/${userId}/cart/${bookId}`);
      return response.data; // returns items and totalAmount
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.quantity = quantity;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
      });
  }
});

export const { clearCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
