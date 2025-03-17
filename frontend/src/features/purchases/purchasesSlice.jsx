// features/purchasesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch purchases from the backend
export const fetchPurchases = createAsyncThunk('purchases/fetchPurchases', async (userId) => {
    const response = await axios.get(`/api/users/${userId}/purchases`);
    return response.data;  // Assuming the API returns the list of purchases
});

const purchasesSlice = createSlice({
    name: 'purchases',
    initialState: {
        purchases: [],
        status: 'idle', // idle, loading, succeeded, failed
        error: null
    },
    reducers: {
        // You can still include other reducers like addPurchase, updatePurchase, etc.
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPurchases.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPurchases.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.purchases = action.payload;
            })
            .addCase(fetchPurchases.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default purchasesSlice.reducer;
