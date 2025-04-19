import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/config/axiosSetup";

// Fetch all rentals
export const fetchRentals = createAsyncThunk("rentals/fetchRentals", async () => {
  const response = await axiosInstance.get("/rentals");
  return response.data;
});

// Fetch rentals for a specific user
export const fetchUserRentals = createAsyncThunk("rentals/fetchUserRentals", async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}/rentals`);
  return response.data;
});

// Add a new rental
export const createRental = createAsyncThunk("rentals/createRental", async (newRental) => {
  const response = await axiosInstance.post("/rentals", newRental);
  return response.data;
});

// Update a rental record
export const updateRental = createAsyncThunk(
  "rentals/updateRental",
  async ({ id, ...updatedFields }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/rentals/${id}`, updatedFields);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete a rental record
export const deleteRental = createAsyncThunk("rentals/deleteRental", async (id) => {
  await axiosInstance.delete(`/rentals/${id}`);
  return id;
});

const rentalSlice = createSlice({
  name: "rentals",
  initialState: {
    rentals: [],
    userRentals: [], // Stores rentals for a specific user
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      // Fetch all rentals
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

      // Fetch rentals for a specific user
      .addCase(fetchUserRentals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserRentals.fulfilled, (state, action) => {
        state.loading = false;
        state.userRentals = action.payload;
      })
      .addCase(fetchUserRentals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Add a rental
      .addCase(createRental.fulfilled, (state, action) => {
        state.rentals.push(action.payload);
      })

      // Update a rental
      .addCase(updateRental.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRental.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.rentals.findIndex((rental) => rental.id === action.payload.id);
        if (index !== -1) {
          // Only update the fields that were changed
          Object.keys(action.payload).forEach(key => {
            if (key !== 'id') {
              state.rentals[index][key] = action.payload[key];
            }
          });
        }
      })
      .addCase(updateRental.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete a rental
      .addCase(deleteRental.fulfilled, (state, action) => {
        state.rentals = state.rentals.filter((rental) => rental.id !== action.payload);
      });
  },
});

export default rentalSlice.reducer;
