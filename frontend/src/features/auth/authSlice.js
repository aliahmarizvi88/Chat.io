import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

axios.defaults.withCredentials = true;

const userFromStorage = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const initialState = {
  user: userFromStorage,
  error: null,
  loading: false,
  otpSent: false,
  otpVerified: false,
  emailForOtp: null,
};

//  REGISTER & SEND OTP
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ username, email, password }, thunkAPI) => {
    try {
      const res = await axios.post(`${BASE_URL}/user/register`, {
        username,
        email,
        password,
      });
      toast.success('OTP sent to your email!');
      return { email: res.data.email };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

// VERIFY OTP & LOGIN USER
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, thunkAPI) => {
    try {
      const res = await axios.post(`${BASE_URL}/user/verify-otp`, {
        email,
        otp,
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('OTP verified. Logged in!');
      return res.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'OTP verification failed'
      );
    }
  }
);

//LOGIN
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await axios.post(`${BASE_URL}/user/login`, {
        email,
        password,
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

// LOGOUT
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, thunkAPI) => {
    try {
      await axios.post(`${BASE_URL}/user/logout`);
      localStorage.removeItem('user');
      window.location.href = '/login';
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue('Logout failed', error);
    }
  }
);

//  DELETE ACCOUNT
export const deleteUser = createAsyncThunk(
  'auth/deleteUser',
  async (_, thunkAPI) => {
    try {
      await axios.delete(`${BASE_URL}/user/deleteUser`);
      localStorage.removeItem('user');
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue('Delete failed', error);
    }
  }
);

// UPDATE PROFILE
export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (data, thunkAPI) => {
    try {
      const res = await axios.put(`${BASE_URL}/user/update`, data);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue('Update failed', error);
    }
  }
);

//  UPLOAD PROFILE PICTURE
export const uploadProfilePic = createAsyncThunk(
  'auth/uploadProfilePic',
  async (image, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append('image', image);

      const res = await axios.put(`${BASE_URL}/user/upload-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const state = thunkAPI.getState();
      const user = state.auth.user;
      const updatedUser = { ...user, profilePic: res.data.profilePic };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      return thunkAPI.rejectWithValue('Profile picture upload failed', error);
    }
  }
);

//block and unblock:
export const blockUser = createAsyncThunk(
  'user/blockUser',
  async (userId, thunkAPI) => {
    try {
      const res = await axios.put(`${BASE_URL}/user/block`, { userId });
      return { userId, blockedUsers: res.data.blockedUsers };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Block failed'
      );
    }
  }
);

export const unblockUser = createAsyncThunk(
  'user/unblockUser',
  async (userId, thunkAPI) => {
    try {
      const res = await axios.put(`${BASE_URL}/user/unblock`, { userId });
      return { userId, blockedUsers: res.data.blockedUsers };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Unblock failed'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('user');
    },
    resetOtp: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
      state.emailForOtp = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.emailForOtp = action.payload.email;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // VERIFY OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.otpVerified = true;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.error = null;
      })

      // DELETE
      .addCase(deleteUser.fulfilled, (state) => {
        state.user = null;
        state.error = null;
      })

      // UPDATE
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })

      // PROFILE PIC
      .addCase(uploadProfilePic.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      // BLOCK
      .addCase(blockUser.fulfilled, (state, action) => {
        const { blockedUsers } = action.payload;
        if (state.user) {
          state.user.blockedUsers = blockedUsers;
        }
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.error = action.payload;
      })

      // UNBLOCK
      .addCase(unblockUser.fulfilled, (state, action) => {
        const { blockedUsers } = action.payload;
        if (state.user) {
          state.user.blockedUsers = blockedUsers;
        }
      })
      .addCase(unblockUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { logout, resetOtp } = authSlice.actions;
export default authSlice.reducer;
