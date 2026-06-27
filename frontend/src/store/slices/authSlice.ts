import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  role: string;
  permissions?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isHydrated: false,
};

const injectLegacyPermissions = (user: User | null): User | null => {
  if (!user) return null;
  
  // Apply legacy fallback only to 'admin' role if modules are missing
  if (user.role === 'admin' && (!user.permissions || !user.permissions.modules)) {
    return {
      ...user,
      permissions: {
        ...(user.permissions || {}),
        modules: {
          dashboard: ['read', 'write', 'delete'],
          inquiries: ['read', 'write', 'delete'],
          notices: ['read', 'write', 'delete'],
          events: ['read', 'write', 'delete'],
          media: ['read', 'write', 'delete'],
          users: ['read', 'write', 'delete'],
        },
      },
    };
  }

  // Apply fallback for 'faculty' role if modules are missing
  if (user.role === 'faculty' && (!user.permissions || !user.permissions.modules)) {
    return {
      ...user,
      permissions: {
        ...(user.permissions || {}),
        modules: {
          dashboard: ['read'],
          inquiries: ['read'],
        },
      },
    };
  }

  return user;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken: string }>
    ) => {
      state.isLoading = false;
      state.user = injectLegacyPermissions(action.payload.user);
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    hydrateAuth: (
      state,
      action: PayloadAction<{
        user: User | null;
        token: string | null;
        refreshToken: string | null;
      }>
    ) => {
      state.user = injectLegacyPermissions(action.payload.user);
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = Boolean(action.payload.token);
      state.isHydrated = true;
    },
    setHydrated: (state) => {
      state.isHydrated = true;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  hydrateAuth,
  setHydrated,
} = authSlice.actions;

export default authSlice.reducer;

