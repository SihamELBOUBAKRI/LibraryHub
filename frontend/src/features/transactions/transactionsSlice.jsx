import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/config/axiosSetup';

// Fetch all transactions
export const fetchTransactions = createAsyncThunk("transactions/fetchTransactions", async () => {
  const response = await axiosInstance.get("/transactions");
  return response.data.data;
});

// Fetch transactions for a specific user
export const fetchUserTransactions = createAsyncThunk("transactions/fetchUserTransactions", async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}/transactions`);
  return response.data.data;
});

// Add a transaction
export const addTransaction = createAsyncThunk("transactions/addTransaction", async (transactionData) => {
  const response = await axiosInstance.post("/transactions", transactionData);
  return response.data.data;
});

// Update a transaction
export const updateTransaction = createAsyncThunk("transactions/updateTransaction", async ({ id, updatedData }) => {
  const response = await axiosInstance.put(`/transactions/${id}`, updatedData);
  return response.data.data;
});

// Delete a transaction
export const deleteTransaction = createAsyncThunk("transactions/deleteTransaction", async (id) => {
  await axiosInstance.delete(`/transactions/${id}`);
  return id;
});

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: {
    transactions: [],
    userTransactions: [], // Stores transactions for a specific user
    loading: false,
    error: null,
  },
  reducers: {},
  
  extraReducers: (builder) => {
    builder
      // Fetch all transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Fetch specific user transactions
      .addCase(fetchUserTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.userTransactions = action.payload;
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Add transaction
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.transactions.push(action.payload);
      })
      
      // Update transaction
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(transaction => transaction.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      
      // Delete transaction
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(transaction => transaction.id !== action.payload);
      });
  },
});

export default transactionsSlice.reducer;
