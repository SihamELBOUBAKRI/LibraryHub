import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/config/axiosSetup';

// GET all reservations
export const fetchReservations = createAsyncThunk(
  'reservations/fetchAll',
  async () => {
    const response = await axiosInstance.get('reservations');
    return response.data;
  }
);

// GET reservations by status
export const fetchReservationsByStatus = createAsyncThunk(
  'reservations/fetchByStatus',
  async (status) => {
    const response = await axiosInstance.get(`reservations/status/${status}`);
    return response.data;
  }
);

// GET reservations by user ID
export const fetchReservationsByUser = createAsyncThunk(
  'reservations/fetchByUser',
  async (userId) => {
    const response = await axiosInstance.get(`users/${userId}/reservations`);
    return response.data;
  }
);

// POST create a reservation
export const createReservation = createAsyncThunk(
  'reservations/create',
  async (reservationData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/reservations', reservationData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Add this to your bookReservationSlice.js
export const updateReservation = createAsyncThunk(
  'reservations/update',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`reservations/${id}`, updateData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// PUT mark reservation as picked
export const markReservationPicked = createAsyncThunk(
  'reservations/markPicked',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`reservations/${id}/mark-picked`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// DELETE reservation
export const deleteReservation = createAsyncThunk(
  'reservations/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`reservations/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const initialState = {
  reservations: [],       // For storing all reservations
  userReservations: [],      // For storing user-specific reservations
  status: 'idle',
  error: null,
  filters: {
    status: null,
    userId: null
  }
};

const bookReservationSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    clearUserReservations: (state) => {
      state.userReservations = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchReservations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reservations = action.payload;
        
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      // FETCH BY STATUS
      .addCase(fetchReservationsByStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReservationsByStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reservations = action.payload;
        state.filters.status = action.meta.arg;
      })
      .addCase(fetchReservationsByStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      // FETCH BY USER
      .addCase(fetchReservationsByUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReservationsByUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userReservations = action.payload;
        state.filters.userId = action.meta.arg;
        
      })
      .addCase(fetchReservationsByUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      // CREATE
      .addCase(createReservation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reservations.unshift(action.payload);
        // Also add to userReservations if it matches the current filter
        if (state.filters.userId && action.payload.user_id === state.filters.userId) {
          state.userReservations.unshift(action.payload);
        }
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // MARK PICKED
      .addCase(markReservationPicked.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(markReservationPicked.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update in allReservations
        const allIndex = state.reservations.findIndex(
          res => res.id === action.payload.rental.reservation_id
        );
        if (allIndex !== -1) {
          state.reservations[allIndex].status = 'picked';
        }
        
        // Update in userReservations
        const userIndex = state.userReservations.findIndex(
          res => res.id === action.payload.rental.reservation_id
        );
        if (userIndex !== -1) {
          state.userReservations[userIndex].status = 'picked';
        }
      })
      .addCase(markReservationPicked.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })// Add this case to your extraReducers
      .addCase(updateReservation.fulfilled, (state, action) => {
        const index = state.reservations.findIndex(
          res => res.id === action.payload.id
        );
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
        
        // Also update in userReservations if it exists there
        const userIndex = state.userReservations.findIndex(
          res => res.id === action.payload.id
        );
        if (userIndex !== -1) {
          state.userReservations[userIndex] = action.payload;
        }
      })

      // DELETE
      .addCase(deleteReservation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteReservation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Remove from allReservations
        state.reservations = state.reservations.filter(
          res => res.id !== action.payload
        );
        // Remove from userReservations
        state.userReservations = state.userReservations.filter(
          res => res.id !== action.payload
        );
      })
      .addCase(deleteReservation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
      
  }
});

export const { clearUserReservations } = bookReservationSlice.actions;

// Selectors
export const selectreservations = (state) => state.reservations.reservations;
export const selectUserReservations = (state) => state.reservations.userReservations;
export const selectReservationsStatus = (state) => state.reservations.status;
export const selectReservationsError = (state) => state.reservations.error;
export const selectReservationsFilters = (state) => state.reservations.filters;

export default bookReservationSlice.reducer;