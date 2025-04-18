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
export const updatePurchase = createAsyncThunk(
    'purchases/updatePurchase',
    async ({ id, ...updatedFields }, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.put(`/purchases/${id}`, updatedFields);
        return { id, ...response.data };
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
    }
  );

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
            .addCase(updatePurchase.pending, (state) => {
                state.loading = true;
                state.error = null;
              })
              .addCase(updatePurchase.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.purchases.findIndex(
                  purchase => purchase.id === action.payload.id
                );
                if (index !== -1) {
                  // Only update the fields that were changed
                  Object.keys(action.payload).forEach(key => {
                    if (key !== 'id') {
                      state.purchases[index][key] = action.payload[key];
                    }
                  });
                  
                  // Recalculate total price if quantity or price_per_unit was updated
                  if (action.payload.quantity || action.payload.price_per_unit) {
                    const purchase = state.purchases[index];
                    purchase.total_price = purchase.quantity * purchase.price_per_unit;
                  }
                }
              })
              .addCase(updatePurchase.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
              })

            // Delete Purchase
            .addCase(deletePurchase.fulfilled, (state, action) => {
                state.purchases = state.purchases.filter((purchase) => purchase.id !== action.payload);
            });
    },
});

export default purchasesSlice.reducer;
