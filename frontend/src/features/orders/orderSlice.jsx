import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/config/axiosSetup";

// Async Thunk to Fetch Orders
export const fetchOrders = createAsyncThunk("orders/fetchOrders", async () => {
  const response = await axiosInstance.get("/orders");
  return response.data;
});

// Async Thunk to Create a New Order
export const createOrder = createAsyncThunk("orders/createOrder", async (orderData) => {
  const response = await axiosInstance.post("/orders", orderData);
  return response.data;
});

// Async Thunk to Update an Existing Order
export const updateOrder = createAsyncThunk("orders/updateOrder", async ({ id, updatedData }) => {
  const response = await axiosInstance.put(`/orders/${id}`, updatedData);
  return response.data;
});

// Async Thunk to Delete an Order
export const deleteOrder = createAsyncThunk("orders/deleteOrder", async (id) => {
  await axiosInstance.delete(`/orders/${id}`);
  return id;
});

// Async Thunk to Create a Transaction when an Order is Paid
export const createTransactionForOrder = createAsyncThunk(
  "orders/createTransactionForOrder",
  async (orderId, { dispatch, getState }) => {
    const order = getState().orders.orders.find(order => order.id === orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    // Prepare transaction data (this assumes you're sending order details to create a transaction)
    const transactionData = {
      order_id: order.id,
      amount: order.total_price, // Assuming the total price is the transaction amount
      payment_method: "Credit Card", // Example, should come from the frontend form
      status: "Completed", // Example, change based on actual payment status
    };

    // Make API request to create the transaction
    const response = await axiosInstance.post("transactions", transactionData);
    return response.data;
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetching orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Handle creating an order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload); // Add new order to the list
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Handle updating an order
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        const orderIndex = state.orders.findIndex(order => order.id === action.payload.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload; // Update the order in the state
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Handle deleting an order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(order => order.id !== action.payload); // Remove the order
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Handle creating a transaction when an order is placed and paid
      .addCase(createTransactionForOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTransactionForOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update the order's status to 'Paid' in your state or database
        const orderIndex = state.orders.findIndex(order => order.id === action.payload.order_id);
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = 'Paid'; // Update order status here if necessary
        }
      })
      .addCase(createTransactionForOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default ordersSlice.reducer;
