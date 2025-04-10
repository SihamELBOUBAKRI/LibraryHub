import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/config/axiosSetup";

// Fetch all overdues
export const fetchOverdues = createAsyncThunk("overdues/fetchOverdues", async () => {
    const response = await axiosInstance.get("/overdues");
    return response.data;
});

// Fetch overdues for a specific user
export const fetchUserOverdues = createAsyncThunk("overdues/fetchUserOverdues", async (userId) => {
    const response = await axiosInstance.get(`users/${userId}/overdues`);
    return response.data;
});

// Create a new overdue record
export const createOverdue = createAsyncThunk("overdues/createOverdue", async (overdueData) => {
    const response = await axiosInstance.post("/overdues", overdueData);
    return response.data;
});

// Update an overdue record
export const updateOverdue = createAsyncThunk("overdues/updateOverdue", async ({ id, updatedOverdue }) => {
    const response = await axiosInstance.put(`/overdues/${id}`, updatedOverdue);
    return response.data;
});

// Delete an overdue record
export const deleteOverdue = createAsyncThunk("overdues/deleteOverdue", async (id) => {
    await axiosInstance.delete(`/overdues/${id}`);
    return id;
});

const overdueSlice = createSlice({
    name: "overdue",
    initialState: {
        data: [],
        userOverdues: [], // Store overdues for a specific user
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch all overdues
            .addCase(fetchOverdues.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOverdues.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchOverdues.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Fetch overdues for a specific user
            .addCase(fetchUserOverdues.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserOverdues.fulfilled, (state, action) => {
                state.loading = false;
                state.userOverdues = action.payload;
            })
            .addCase(fetchUserOverdues.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Create overdue
            .addCase(createOverdue.pending, (state) => {
                state.loading = true;
            })
            .addCase(createOverdue.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload);
            })
            .addCase(createOverdue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Update overdue
            .addCase(updateOverdue.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateOverdue.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.data.findIndex(overdue => overdue.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })
            .addCase(updateOverdue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Delete overdue
            .addCase(deleteOverdue.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteOverdue.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter(overdue => overdue.id !== action.payload);
            })
            .addCase(deleteOverdue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export default overdueSlice.reducer;
