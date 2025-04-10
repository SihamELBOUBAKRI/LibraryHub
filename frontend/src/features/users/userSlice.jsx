import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/config/axiosSetup';

// Async Thunk to Fetch Users
const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const response = await axiosInstance.get("/users");
  return response.data;
});

const addUser = createAsyncThunk("users/addUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/users", userData); // Matches your store method route
    return response.data;
  } catch (error) {
    // Handle Laravel validation errors
    if (error.response?.status === 422) {
      return rejectWithValue(error.response.data.errors);
    }
    return rejectWithValue(error.response?.data || error.message);
  }
});

// Async Thunk to Edit Logged-in User Profile
const editProfile = createAsyncThunk("users/editProfile", async (userData) => {
  const response = await axiosInstance.put("/user/profile", userData);
  return response.data; // Return the updated user data to update the state
});


// Async Thunk to Delete User
const deleteUser = createAsyncThunk("users/deleteUser", async (userId) => {
  await axiosInstance.delete(`/users/${userId}`);
  return userId; // Return the deleted user ID to update the state
});

const updateUser = createAsyncThunk("users/updateUser", async ({ userId, userData }) => {
  const response = await axiosInstance.put(`/users/${userId}`, userData);
  return response.data; // Return the updated user data to update the state
});

const fetchUserProfile = createAsyncThunk(
  "users/fetchUserProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// Initial State
const initialState = {
  users: [], // List of all users (for admin purposes)
  user: null, // Currently logged-in user
  isAuthenticated: false, // Authentication status
  loading: false,
  error: null,
  validationErrors: null, // Add specific field for validation errors
  cart: [], // User's cart
  wishlist: [], // User's wishlist
};

// Create Slice
const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // Synchronous reducer to set authentication status
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Add User
      .addCase(addUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload); // Remove user from state
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
//update
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        // Update the user in the state with the updated data
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Edit Profile
      .addCase(editProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(editProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; // Update the logged-in user profile in state
      })
      .addCase(editProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      });
      
  },
});

// Export Actions
export const { setAuthenticated } = usersSlice.actions;

// Export Reducer
export default usersSlice.reducer;

// Export Async Thunks
export { fetchUsers, addUser, deleteUser ,updateUser,editProfile,fetchUserProfile};
