import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/config/axiosSetup';

export const fetchBooksToRent = createAsyncThunk('book_to_rent/fetchBooksToRent', async () => {
    // Use axiosInstance to make the API request
    const response = await axiosInstance.get('/book-to-rent');
    if (response.status !== 200) throw new Error('Failed to fetch books to rent');
    return response.data;  // Return the response data (the books to rent)
});

const bookToRentSlice = createSlice({
    name: 'book_to_rent',
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
                state.books = action.payload;  // Set books to the fetched data
            })
            .addCase(fetchBooksToRent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;  // Set error message if the request failed
            });
    },
});

export default bookToRentSlice.reducer;
