import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, logout } from '@store/slices/authSlice';
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
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          dispatch(loginSuccess(response.data));
          return { success: true };
        }
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
          roleId: 6, // Default to Guest/Student role
        });

        if (response.success) {
          return { success: true };
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Registration failed';
        dispatch(loginFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    dispatch(logout());
  }, [dispatch]);

  return {
    ...auth,
    login,
    register,
    logout: handleLogout,
  };
};
