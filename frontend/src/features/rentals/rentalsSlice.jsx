import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/config/axiosSetup";

// Fetch all rentals
export const fetchRentals = createAsyncThunk("rentals/fetchRentals", async () => {
  const response = await axiosInstance.get("/rentals");
  return response.data;
});

// Add a new rental
export const addRental = createAsyncThunk("rentals/addRental", async (rentalData) => {
  const response = await axiosInstance.post("/rentals", rentalData);
  return response.data;
});

// Update a rental
export const updateRental = createAsyncThunk("rentals/updateRental", async ({ id, updatedData }) => {
  const response = await axiosInstance.put(`/rentals/${id}`, updatedData);
  return response.data;
});

// Delete a rental
export const deleteRental = createAsyncThunk("rentals/deleteRental", async (id) => {
  await axiosInstance.delete(`/rentals/${id}`);
  return id;
});

const rentalSlice = createSlice({
  name: "rentals",
  initialState: {
    rentals: [],
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchRentals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRentals.fulfilled, (state, action) => {
        state.loading = false;
        state.rentals = action.payload;
      })
      .addCase(fetchRentals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addRental.fulfilled, (state, action) => {
        state.rentals.push(action.payload);
      })
      .addCase(updateRental.fulfilled, (state, action) => {
        const index = state.rentals.findIndex((rental) => rental.id === action.payload.id);
        if (index !== -1) {
          state.rentals[index] = action.payload;
        }
      })
      .addCase(deleteRental.fulfilled, (state, action) => {
        state.rentals = state.rentals.filter((rental) => rental.id !== action.payload);
      });
  },
});

export default rentalSlice.reducer;
