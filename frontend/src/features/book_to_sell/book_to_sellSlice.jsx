import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/config/axiosSetup';

// Fetch all books to sell
export const fetchBooksToSell = createAsyncThunk(
  'bookToSell/fetchBooks',
  async () => {
    const response = await axiosInstance.get('/book-to-sell');
    return response.data; 
  }
);

// Fetch all categories
export const fetchCategories = createAsyncThunk(
  'bookToSell/fetchCategories',
  async () => {
    const response = await axiosInstance.get('/categories');
    return response.data;
  }
);

// Add a new book to sell
// In your book_to_sellSlice.jsx
export const addBookToSell = createAsyncThunk(
  'bookToSell/addBookToSell',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/book-to-sell', formData, {
        headers: {
          // Don't set Content-Type manually - let the browser handle it
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update a book to sell
export const updateBookToSell = createAsyncThunk(
  'bookToSell/updateBook',
  async ({ id, bookData }) => {
    const response = await axiosInstance.put(`/book-to-sell/${id}`, bookData);
    return response.data;
  }
);

// Delete a book from sale
export const deleteBookToSell = createAsyncThunk(
  'bookToSell/deleteBook',
  async (id) => {
    await axiosInstance.delete(`/book-to-sell/${id}`);
    return id;
  }
);

const bookToSellSlice = createSlice({
  name: 'bookToSell',
  initialState: {
    books: [],
    categories: [], // Added categories array
    loading: false,
    categoriesLoading: false, // Separate loading state for categories
    error: null,
    categoriesError: null, // Separate error state for categories
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Books reducers
      .addCase(fetchBooksToSell.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooksToSell.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooksToSell.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Categories reducers
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.error.message;
      })
      
      // Add book reducers
      .addCase(addBookToSell.pending, (state) => {
        state.loading = true;
      })
      .addCase(addBookToSell.fulfilled, (state, action) => {
        state.loading = false;
        state.books.push(action.payload);
      })
      .addCase(addBookToSell.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update book reducers
      .addCase(updateBookToSell.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBookToSell.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBooks = state.books.map((book) =>
          book.id === action.payload.id ? action.payload : book
        );
        state.books = updatedBooks;
      })
      .addCase(updateBookToSell.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Delete book reducers
      .addCase(deleteBookToSell.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBookToSell.fulfilled, (state, action) => {
        state.loading = false;
        state.books = state.books.filter((book) => book.id !== action.payload);
      })
      .addCase(deleteBookToSell.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default bookToSellSlice.reducer;