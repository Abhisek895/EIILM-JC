import authReducer, {
  loginSuccess,
  loginFailure,
  logout,
  hydrateAuth,
} from '../store/slices/authSlice';

describe('Frontend Auth & RBAC State Management', () => {
  const initialEmptyState = {
    user: null,
    token: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    isHydrated: false,
  };

  it('should authenticate user and inject legacy permissions for admin role', () => {
    const user = {
      id: 1,
      name: 'System Admin',
      email: 'admin@eiilm.edu',
      roleId: 2,
      role: 'admin',
    };

    const nextState = authReducer(
      initialEmptyState,
      loginSuccess({
        user,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      })
    );

    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.token).toBe('mock-jwt-token');
    expect(nextState.user?.role).toBe('admin');
    expect(nextState.user?.permissions?.modules?.dashboard).toContain('read');
    expect(nextState.user?.permissions?.modules?.users).toContain('write');
  });

  it('should authenticate student role without legacy admin permissions', () => {
    const studentUser = {
      id: 42,
      name: 'Demo Student',
      email: 'student@eiilm.edu',
      roleId: 4,
      role: 'student',
    };

    const nextState = authReducer(
      initialEmptyState,
      loginSuccess({
        user: studentUser,
        token: 'student-token',
        refreshToken: 'student-refresh',
      })
    );

    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.user?.role).toBe('student');
    expect(nextState.user?.permissions).toBeUndefined();
  });

  it('should clear tokens and user state on logout', () => {
    const loggedInState = {
      user: { id: 1, name: 'Admin', email: 'admin@eiilm.edu', roleId: 2, role: 'admin' },
      token: 'jwt-token',
      refreshToken: 'refresh-token',
      isLoading: false,
      error: null,
      isAuthenticated: true,
      isHydrated: true,
    };

    const loggedOutState = authReducer(loggedInState, logout());

    expect(loggedOutState.isAuthenticated).toBe(false);
    expect(loggedOutState.user).toBeNull();
    expect(loggedOutState.token).toBeNull();
    expect(loggedOutState.refreshToken).toBeNull();
  });

  it('should record login failure error message', () => {
    const failedState = authReducer(initialEmptyState, loginFailure('Invalid credentials'));

    expect(failedState.isAuthenticated).toBe(false);
    expect(failedState.error).toBe('Invalid credentials');
    expect(failedState.isLoading).toBe(false);
  });

  it('should hydrate auth state from persistent storage', () => {
    const persistedUser = {
      id: 10,
      name: 'Faculty Member',
      email: 'faculty@eiilm.edu',
      roleId: 3,
      role: 'faculty',
    };

    const hydratedState = authReducer(
      initialEmptyState,
      hydrateAuth({
        user: persistedUser,
        token: 'persisted-token',
        refreshToken: 'persisted-refresh',
      })
    );

    expect(hydratedState.isHydrated).toBe(true);
    expect(hydratedState.isAuthenticated).toBe(true);
    expect(hydratedState.user?.role).toBe('faculty');
    expect(hydratedState.user?.permissions?.modules?.dashboard).toContain('read');
  });
});
