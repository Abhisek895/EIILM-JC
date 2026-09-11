describe('Frontend RBAC & Role Utilities', () => {
  const canAccessModule = (
    role: string | undefined,
    moduleName: string,
    action: 'read' | 'write' | 'delete',
    permissions: any
  ): boolean => {
    if (!role) return false;
    if (role === 'super_admin') return true;
    if (role === 'student') return moduleName === 'student' && action === 'read';

    const modPerms = permissions?.modules?.[moduleName];
    if (Array.isArray(modPerms)) {
      return modPerms.includes(action);
    }
    return false;
  };

  it('super_admin should have unconditional access to any module and action', () => {
    expect(canAccessModule('super_admin', 'users', 'delete', null)).toBe(true);
    expect(canAccessModule('super_admin', 'courses', 'write', null)).toBe(true);
  });

  it('student should only have read access to student portal and denied from admin dashboard', () => {
    expect(canAccessModule('student', 'student', 'read', null)).toBe(true);
    expect(canAccessModule('student', 'courses', 'delete', null)).toBe(false);
    expect(canAccessModule('student', 'dashboard', 'read', null)).toBe(false);
  });

  it('admin/faculty should be evaluated based on granted permissions', () => {
    const adminPerms = {
      modules: {
        courses: ['read', 'write'],
        notices: ['read'],
      },
    };

    expect(canAccessModule('admin', 'courses', 'write', adminPerms)).toBe(true);
    expect(canAccessModule('admin', 'courses', 'delete', adminPerms)).toBe(false);
    expect(canAccessModule('admin', 'notices', 'read', adminPerms)).toBe(true);
    expect(canAccessModule('admin', 'notices', 'write', adminPerms)).toBe(false);
  });
});
