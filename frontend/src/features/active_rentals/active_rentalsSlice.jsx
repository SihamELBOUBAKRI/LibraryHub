import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchActiveRentals = createAsyncThunk(
  "activeRentals/fetchActiveRentals",
  async (_, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.get("http://localhost:8000/api/active-rentals", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

const activeRentalsSlice = createSlice({
  name: "activeRentals",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveRentals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveRentals.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchActiveRentals.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export default activeRentalsSlice.reducer;