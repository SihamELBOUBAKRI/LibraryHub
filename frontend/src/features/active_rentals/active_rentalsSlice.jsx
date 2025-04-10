import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/config/axiosSetup";

// Fetch all active rentals
export const fetchActiveRentals = createAsyncThunk(
  "activeRentals/fetchActiveRentals",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`active-rentals`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch active rentals of a specific user
export const fetchUserActiveRentals = createAsyncThunk(
  "activeRentals/fetchUserActiveRentals",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`users/${userId}/active-rentals`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create a new active rental
export const createActiveRental = createAsyncThunk(
  "activeRentals/createActiveRental",
  async (rentalData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`active-rentals`, rentalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update an active rental (return or overdue handling)
export const updateActiveRental = createAsyncThunk(
  "activeRentals/updateActiveRental",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/active-rentals/${id}`,
        { status }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete an active rental
export const deleteActiveRental = createAsyncThunk(
  "activeRentals/deleteActiveRental",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`active-rentals/${id}`);
      return id; // Just return the ID to remove it from the state
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  activeRentals: [],
  userRentals: [], // For a specific user's rentals
  loading: false,
  error: null,
};

const activeRentalsSlice = createSlice({
  name: "activeRentals",
  initialState,
  reducers: {
    clearUserRentals: (state) => {
      state.userRentals = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all active rentals
      .addCase(fetchActiveRentals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveRentals.fulfilled, (state, action) => {
        state.activeRentals = action.payload;
        state.loading = false;
      })
      .addCase(fetchActiveRentals.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.loading = false;
      })
      
      // Fetch active rentals of a specific user
      .addCase(fetchUserActiveRentals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserActiveRentals.fulfilled, (state, action) => {
        state.userRentals = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserActiveRentals.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.userRentals = []; // Reset userRentals on failure
        state.loading = false;
      })
      
      // Create new active rental
      .addCase(createActiveRental.pending, (state) => {
        state.loading = true;
      })
      .addCase(createActiveRental.fulfilled, (state, action) => {
        state.activeRentals.push(action.payload);
        state.loading = false;
      })
      .addCase(createActiveRental.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.loading = false;
      })
      
      // Update active rental status
      .addCase(updateActiveRental.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateActiveRental.fulfilled, (state, action) => {
        const index = state.activeRentals.findIndex(
          (rental) => rental.id === action.payload.id
        );
        if (index !== -1) {
          state.activeRentals[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateActiveRental.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.loading = false;
      })
      
      // Delete active rental
      .addCase(deleteActiveRental.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteActiveRental.fulfilled, (state, action) => {
        state.activeRentals = state.activeRentals.filter(
          (rental) => rental.id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteActiveRental.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.loading = false;
      });
  },
});

export const { clearUserRentals } = activeRentalsSlice.actions;
export default activeRentalsSlice.reducer;