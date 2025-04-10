import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/config/axiosSetup";

// Async Thunks
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders", 
  async () => {
    const response = await axiosInstance.get("/orders");
    return response.data;
  }
);

export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (userId) => {
    const response = await axiosInstance.get(`/users/${userId}/orders`);
    return response.data;
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/orders", orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/orders/${id}`, updatedData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/orders/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createTransactionForOrder = createAsyncThunk(
  "orders/createTransaction",
  async ({ orderId, transactionData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/orders/${orderId}/transactions`,
        transactionData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    userOrders: [],
    loading: false,
    error: null,
    currentOrder: null,
    transactionStatus: 'idle'
  },
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearOrderError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch User Orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update Order
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Delete Order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(
          (order) => order.id !== action.payload
        );
        if (state.currentOrder?.id === action.payload) {
          state.currentOrder = null;
        }
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Create Transaction
      .addCase(createTransactionForOrder.pending, (state) => {
        state.transactionStatus = 'processing';
      })
      .addCase(createTransactionForOrder.fulfilled, (state, action) => {
        state.transactionStatus = 'succeeded';
        const orderIndex = state.orders.findIndex(
          (order) => order.id === action.payload.order_id
        );
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = 'Paid';
          state.orders[orderIndex].payment_status = 'Completed';
        }
        if (state.currentOrder?.id === action.payload.order_id) {
          state.currentOrder.status = 'Paid';
          state.currentOrder.payment_status = 'Completed';
        }
      })
      .addCase(createTransactionForOrder.rejected, (state, action) => {
        state.transactionStatus = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setCurrentOrder, clearOrderError } = ordersSlice.actions;

export default ordersSlice.reducer;