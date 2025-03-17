// authorsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch authors
export const fetchAuthors = createAsyncThunk('authors/fetchAuthors', async () => {
  const response = await axios.get('http://127.0.0.1:8000/api/authors');
  return response.data;
});

// Fetch author details
export const fetchAuthorDetails = createAsyncThunk('authors/fetchAuthorDetails', async (authorId) => {
  const response = await axios.get(`http://127.0.0.1:8000/api/authors/${authorId}`);
  return response.data;
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
      });
  },
});

export default authorsSlice.reducer;
