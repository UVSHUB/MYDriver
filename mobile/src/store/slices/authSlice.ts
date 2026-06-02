import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../api/auth.api';
import { User, AuthState } from '../../types';
import { STORAGE_KEYS } from '../../constants';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
};

// ─── Async Thunks ──────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials);
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, data.accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken],
        [STORAGE_KEYS.USER, JSON.stringify(data.user)],
      ]);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { fullName: string; phone: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authApi.register(userData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (userData: { email: string; fullName: string; avatar: string }, { rejectWithValue }) => {
    try {
      const data = await authApi.googleLogin(userData);
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, data.accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken],
        [STORAGE_KEYS.USER, JSON.stringify(data.user)],
      ]);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Google Sign-In failed');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (data: { userId: string; otp: string }, { rejectWithValue }) => {
    try {
      const result = await authApi.verifyOTP(data);
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, result.accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, result.refreshToken],
        [STORAGE_KEYS.USER, JSON.stringify(result.user)],
      ]);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const loadStoredAuth = createAsyncThunk('auth/loadStored', async () => {
  const [token, refreshToken, userStr] = await AsyncStorage.multiGet([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.USER,
  ]);
  return {
    accessToken: token[1],
    refreshToken: refreshToken[1],
    user: userStr[1] ? JSON.parse(userStr[1]) : null,
  };
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.USER,
  ]);
});

// ─── Slice ─────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => { state.isLoading = true; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state) => { state.isLoading = false; });

    // Register
    builder
      .addCase(registerUser.pending, (state) => { state.isLoading = true; })
      .addCase(registerUser.fulfilled, (state) => { state.isLoading = false; })
      .addCase(registerUser.rejected, (state) => { state.isLoading = false; });

    // Google Login
    builder
      .addCase(loginWithGoogle.pending, (state) => { state.isLoading = true; })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(loginWithGoogle.rejected, (state) => { state.isLoading = false; });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => { state.isLoading = true; })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(verifyOTP.rejected, (state) => { state.isLoading = false; });

    // Load stored auth
    builder.addCase(loadStoredAuth.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.accessToken && !!action.payload.user;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    });
  },
});

export const { setUser, setTokens, updateUser } = authSlice.actions;
export default authSlice.reducer;
