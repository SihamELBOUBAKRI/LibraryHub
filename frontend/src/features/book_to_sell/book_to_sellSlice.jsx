// src/features/book_to_sell/book_to_sellSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/config/axiosSetup';

// Async thunk for fetching books to sell
export const fetchBooksToSell = createAsyncThunk(
  'bookToSell/fetchBooks',
  async () => {
    const response = await axiosInstance.get('/book-to-sell');
    return response.data; 
  }
);

const bookToSellSlice = createSlice({
  name: 'bookToSell',
  initialState: {
    books: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooksToSell.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooksToSell.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload; // Set fetched books
      })
      .addCase(fetchBooksToSell.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message; // Set error message
      });
  },
});

// Export the action to be used in your component
export default bookToSellSlice.reducer;
