import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/config/axiosSetup';

// Fetch all purchases
export const fetchPurchases = createAsyncThunk('purchases/fetchPurchases', async () => {
    const response = await axiosInstance.get(`/purchases`);
    return response.data;
});

// Fetch purchases for a specific user
export const fetchUserPurchases = createAsyncThunk('purchases/fetchUserPurchases', async (userId) => {
    const response = await axiosInstance.get(`/users/${userId}/purchases`);
    return response.data;
});

// Add a new purchase
export const addPurchase = createAsyncThunk('purchases/addPurchase', async (newPurchase) => {
    const response = await axiosInstance.post(`/purchases`, newPurchase);
    return response.data;
});

// Update a purchase
export const updatePurchase = createAsyncThunk('purchases/updatePurchase', async ({ id, updatedData }) => {
    const response = await axiosInstance.put(`/purchases/${id}`, updatedData);
    return response.data;
});

// Delete a purchase
export const deletePurchase = createAsyncThunk('purchases/deletePurchase', async (id) => {
    await axiosInstance.delete(`/purchases/${id}`);
    return id;
});

const purchasesSlice = createSlice({
    name: 'purchases',
    initialState: {
        purchases: [],
        userPurchases: [], // Stores purchases for a specific user
        status: 'idle', // idle, loading, succeeded, failed
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch all purchases
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
            })

            // Fetch purchases for a specific user
            .addCase(fetchUserPurchases.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserPurchases.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.userPurchases = action.payload;
            })
            .addCase(fetchUserPurchases.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            // Add Purchase
            .addCase(addPurchase.fulfilled, (state, action) => {
                state.purchases.push(action.payload);
            })

            // Update Purchase
            .addCase(updatePurchase.fulfilled, (state, action) => {
                const index = state.purchases.findIndex((purchase) => purchase.id === action.payload.id);
                if (index !== -1) {
                    state.purchases[index] = action.payload;
                }
            })

            // Delete Purchase
            .addCase(deletePurchase.fulfilled, (state, action) => {
                state.purchases = state.purchases.filter((purchase) => purchase.id !== action.payload);
            });
    },
});

export default purchasesSlice.reducer;
