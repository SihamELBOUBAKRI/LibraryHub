import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/config/axiosSetup';

// Fetch all books to rent
export const fetchBooksToRent = createAsyncThunk(
  'bookToRent/fetchBooks',
  async () => {
    const response = await axiosInstance.get('/book-to-rent');
    return response.data; 
  }
);

// Add a new book to rent
export const addBookToRent = createAsyncThunk(
  'bookToRent/addBook',
  async (bookData) => {
    const response = await axiosInstance.post('/book-to-rent', bookData);
    return response.data.book;
  }
);

// Update a book to rent
export const updateBookToRent = createAsyncThunk(
  'bookToRent/updateBook',
  async ({ id, bookData }) => {
    const response = await axiosInstance.put(`/book-to-rent/${id}`, bookData);
    return response.data;
  }
);

// Delete a book from rent
export const deleteBookToRent = createAsyncThunk(
  'bookToRent/deleteBook',
  async (id) => {
    await axiosInstance.delete(`/book-to-rent/${id}`);
    return id; // Return the id of the deleted book
  }
);

const bookToRentSlice = createSlice({
  name: 'bookToRent',
  initialState: {
    books: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooksToRent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooksToRent.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooksToRent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Handle add book to rent
      .addCase(addBookToRent.pending, (state) => {
        state.loading = true;
      })
      .addCase(addBookToRent.fulfilled, (state, action) => {
        state.loading = false;
        state.books.push(action.payload); // Add the new book to the state
      })
      .addCase(addBookToRent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Handle update book to rent
      .addCase(updateBookToRent.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBookToRent.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBooks = state.books.map((book) =>
          book.id === action.payload.id ? action.payload : book
        );
        state.books = updatedBooks;
      })
      .addCase(updateBookToRent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Handle delete book from rent
      .addCase(deleteBookToRent.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBookToRent.fulfilled, (state, action) => {
        state.loading = false;
        state.books = state.books.filter((book) => book.id !== action.payload);
      })
      .addCase(deleteBookToRent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default bookToRentSlice.reducer;
