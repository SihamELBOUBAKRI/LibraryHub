// src/features/authors/authorsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/config/axiosSetup'; // Importing your axios instance

// Fetch authors
export const fetchAuthors = createAsyncThunk('authors/fetchAuthors', async () => {
  const response = await axiosInstance.get('/authors');
  return response.data;
});

// Fetch author details
export const fetchAuthorDetails = createAsyncThunk('authors/fetchAuthorDetails', async (authorId) => {
  const response = await axiosInstance.get(`/authors/${authorId}`);
  return response.data;
});

// Create an author
export const createAuthor = createAsyncThunk('authors/createAuthor', async (authorData) => {
  const response = await axiosInstance.post('/authors', authorData);
  return response.data.author;
});

// Update an author
export const updateAuthor = createAsyncThunk('authors/updateAuthor', async ({ id, authorData }) => {
  const response = await axiosInstance.put(`/authors/${id}`, authorData);
  return response.data;
});

// Delete an author
export const deleteAuthor = createAsyncThunk('authors/deleteAuthor', async (id) => {
  await axiosInstance.delete(`/authors/${id}`);
  return id;
});

const authorsSlice = createSlice({
  name: 'authors',
  initialState: {
    authors: [],
    author: null,
    books: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all authors
      .addCase(fetchAuthors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.loading = false;
        state.authors = action.payload;
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch author details
      .addCase(fetchAuthorDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuthorDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.author = action.payload;
        state.books = action.payload.books;
      })
      .addCase(fetchAuthorDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create an author
      .addCase(createAuthor.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAuthor.fulfilled, (state, action) => {
        state.loading = false;
        state.authors.push(action.payload); // Add the new author to the authors array
      })
      .addCase(createAuthor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update an author
      .addCase(updateAuthor.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAuthor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.authors.findIndex((author) => author.id === action.payload.id);
        if (index !== -1) {
          state.authors[index] = action.payload; // Update the author in the list
        }
      })
      .addCase(updateAuthor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete an author
      .addCase(deleteAuthor.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAuthor.fulfilled, (state, action) => {
        state.loading = false;
        state.authors = state.authors.filter((author) => author.id !== action.payload); // Remove the deleted author
      })
      .addCase(deleteAuthor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default authorsSlice.reducer;
