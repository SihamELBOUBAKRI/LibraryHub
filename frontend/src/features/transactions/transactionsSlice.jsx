import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/config/axiosSetup';

// Fetch all transactions
export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions", 
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/transactions");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch transactions for a specific user
export const fetchUserTransactions = createAsyncThunk(
  "transactions/fetchUserTransactions", 
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}/transactions`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Add a transaction
export const addTransaction = createAsyncThunk(
  "transactions/addTransaction", 
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/transactions", transactionData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update a transaction
export const updateTransaction = createAsyncThunk(
  "transactions/updateTransaction", 
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/transactions/${id}`, updatedData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update transaction status
export const updateTransactionStatus = createAsyncThunk(
  "transactions/updateTransactionStatus",
  async ({ id, payment_status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/transactions/${id}/status`, { 
        payment_status 
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete a transaction
export const deleteTransaction = createAsyncThunk(
  "transactions/deleteTransaction", 
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/transactions/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: {
    transactions: [],
    userTransactions: [],
    loading: false,
    error: null,
    statusUpdateLoading: false,
    statusUpdateError: null,
  },
  reducers: {
    clearTransactionErrors: (state) => {
      state.error = null;
      state.statusUpdateError = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch all transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch user transactions
      .addCase(fetchUserTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.userTransactions = action.payload;
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add transaction
      .addCase(addTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload);
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update transaction
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transactions.findIndex(
          transaction => transaction.id === action.payload.id
        );
        if (index !== -1) {
          // Merge the existing transaction with the updated fields
          state.transactions[index] = {
            ...state.transactions[index],
            ...action.payload
          };
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update transaction status
      .addCase(updateTransactionStatus.pending, (state) => {
        state.statusUpdateLoading = true;
        state.statusUpdateError = null;
      })
      .addCase(updateTransactionStatus.fulfilled, (state, action) => {
        state.statusUpdateLoading = false;
        const index = state.transactions.findIndex(
          transaction => transaction.id === action.payload.id
        );
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      .addCase(updateTransactionStatus.rejected, (state, action) => {
        state.statusUpdateLoading = false;
        state.statusUpdateError = action.payload;
      })
      
      // Delete transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter(
          transaction => transaction.id !== action.payload
        );
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTransactionErrors } = transactionsSlice.actions;
export default transactionsSlice.reducer;