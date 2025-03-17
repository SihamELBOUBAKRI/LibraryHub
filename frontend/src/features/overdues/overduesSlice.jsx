import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/config/axiosSetup";

// Fetch all overdues
export const fetchOverdues = createAsyncThunk("overdues/fetchOverdues", async () => {
    const response = await axiosInstance.get("/overdues");
    return response.data;
});

// Add a new overdue record
export const addOverdue = createAsyncThunk("overdues/addOverdue", async (newOverdue) => {
    const response = await axiosInstance.post("/overdues", newOverdue);
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

// Overdues slice
const overdueSlice = createSlice({
    name: "overdue",
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {
        setOverdues(state, action) {
            state.data = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
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
            .addCase(addOverdue.fulfilled, (state, action) => {
                state.data.push(action.payload);
            })
            .addCase(updateOverdue.fulfilled, (state, action) => {
                const index = state.data.findIndex(overdue => overdue.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })
            .addCase(deleteOverdue.fulfilled, (state, action) => {
                state.data = state.data.filter(overdue => overdue.id !== action.payload);
            });
    }
});

export const { setOverdues } = overdueSlice.actions;
export default overdueSlice.reducer;
