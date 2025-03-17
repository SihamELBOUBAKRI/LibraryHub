import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/config/axiosSetup';

// Fetch memberships
export const fetchMemberships = createAsyncThunk(
    'membership/fetchMemberships',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/membership-cards');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch memberships');
        }
    }
);

// Create a new membership
export const createMembership = createAsyncThunk(
    'membership/createMembership',
    async (membershipData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/membership-cards', membershipData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create membership');
        }
    }
);

// Update a membership
export const updateMembership = createAsyncThunk(
    'membership/updateMembership',
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/membership-cards/${id}`, updatedData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update membership');
        }
    }
);

// Delete a membership
export const deleteMembership = createAsyncThunk(
    'membership/deleteMembership',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/membership-cards/${id}`);
            return id; // Return the deleted membership ID
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to delete membership');
        }
    }
);

const membershipSlice = createSlice({
    name: 'membership',
    initialState: { memberships: [], status: 'idle', error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMemberships.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchMemberships.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.memberships = action.payload;
            })
            .addCase(fetchMemberships.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(createMembership.fulfilled, (state, action) => {
                state.memberships.push(action.payload.membership);
            })
            .addCase(updateMembership.fulfilled, (state, action) => {
                const index = state.memberships.findIndex(m => m.id === action.payload.membership.id);
                if (index !== -1) {
                    state.memberships[index] = action.payload.membership;
                }
            })
            .addCase(deleteMembership.fulfilled, (state, action) => {
                state.memberships = state.memberships.filter(m => m.id !== action.payload);
            });
    },
});

export default membershipSlice.reducer;
