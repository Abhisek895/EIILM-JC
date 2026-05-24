import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
} from '@store/slices/authSlice';
import { authApi } from '@api/endpoints';
import { RootState } from '@store/index';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        dispatch(loginStart());
        const response: any = await authApi.login(email, password);

        if (response.success) {
          const payload = response.data;
          window.localStorage.setItem('token', payload.token);
          window.localStorage.setItem('refreshToken', payload.refreshToken);
          window.localStorage.setItem('user', JSON.stringify(payload.user));
          dispatch(loginSuccess(payload));
          return { success: true, user: payload.user };
        }

        return { success: false, error: 'Login failed' };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Login failed';
        dispatch(loginFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        dispatch(loginStart());
        const response: any = await authApi.register({
          name,
          email,
          password,
          roleName: 'student',
        });

        if (response.success) {
          return { success: true };
        }

        return { success: false, error: 'Registration failed' };
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.errors ||
          'Registration failed';
        dispatch(loginFailure(String(errorMessage)));
        return { success: false, error: String(errorMessage) };
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout network failure and clear local state regardless.
    }

    window.localStorage.removeItem('token');
    window.localStorage.removeItem('refreshToken');
    window.localStorage.removeItem('user');
    dispatch(logoutAction());
  }, [dispatch]);

  return {
    ...auth,
    login,
    register,
    logout,
  };
};

