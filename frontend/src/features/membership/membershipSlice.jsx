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


// Get user's membership card
export const fetchUserMembership = createAsyncThunk(
    'membership/fetchUserMembership',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/users/${userId}/membership-cards`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch user membership');
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
    initialState: { memberships: [], status: 'idle',userMembership: null, error: null },
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
                state.status = 'succeeded';
                // Ultra-safe array handling
                const currentMemberships = Array.isArray(state.memberships) ? state.memberships : [];
                state.memberships = [...currentMemberships, action.payload];
              })
              
            .addCase(updateMembership.fulfilled, (state, action) => {
                const index = state.memberships.findIndex(m => m.id === action.payload.membership.id);
                if (index !== -1) {
                    state.memberships[index] = action.payload.membership;
                }
            })
            .addCase(deleteMembership.fulfilled, (state, action) => {
                state.memberships = state.memberships.filter(m => m.id !== action.payload);
            })
            .addCase(fetchUserMembership.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserMembership.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.userMembership = action.payload.data || null;
            })
            .addCase(fetchUserMembership.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.userMembership = null;
            });
    },
});

export default membershipSlice.reducer;
