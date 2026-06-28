import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';
import DashboardLayout from '@layouts/DashboardLayout';
import { userApi } from '@api/endpoints';
import { useAuth } from '@hooks/useAuth';
import ConfirmDialogModal, { ConfirmDialogState } from '@components/admin/ConfirmDialogModal';

type UserMember = {
  id: number;
  name: string;
  email: string;
  roleId: number;
  role: string;
  status: 'active' | 'inactive' | 'blocked' | 'pending';
  permissions?: any;
};

type UserForm = {
  name: string;
  email: string;
  password?: string;
  roleName: 'super_admin' | 'admin' | 'faculty' | 'student';
  status: 'active' | 'inactive' | 'blocked' | 'pending';
  permissions?: any;
};

const EMPTY_FORM: UserForm = {
  name: '',
  email: '',
  password: '',
  roleName: 'student',
  status: 'pending',
  permissions: { canManageRbac: false, modules: {} },
};

const ROLE_IDS: Record<string, number> = {
  super_admin: 1,
  admin: 2,
  faculty: 4,
  student: 5,
};

export default function AdminUsersPage() {
  const { isAuthenticated, isHydrated, user } = useAuth();
  const role = user?.role;
  const canWrite = role === 'super_admin' || user?.permissions?.canManageRbac || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.users?.includes('write'));
  const canDelete = role === 'super_admin' || user?.permissions?.canManageRbac || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.users?.includes('delete'));
  const router = useRouter();
  const [users, setUsers] = useState<UserMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Custom success Toast State
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string; type?: 'success' | 'error' } | null>(null);

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        const canRead = role === 'super_admin' || user?.permissions?.canManageRbac || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.users?.includes('read'));
        if (!canRead) router.push('/dashboard');
      }
    }
  }, [isHydrated, isAuthenticated, user, router, role]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await userApi.getAll(1, 100);
      setUsers(res?.data?.data || res?.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showSuccessToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError('');
  };

  const openEdit = (u: UserMember) => {
    setEditId(u.id);
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      roleName: u.role as any,
      status: u.status,
      permissions: u.permissions || { canManageRbac: false, modules: {} },
    });
    setShowForm(true);
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editId) {
        const payload = {
          name: form.name,
          email: form.email,
          status: form.status,
          roleName: form.roleName,
          permissions: form.permissions,
          ...(form.password ? { password: form.password } : {}),
        };
        await userApi.update(editId, payload);
        showSuccessToast('User Updated', 'User account has been updated successfully!');
      } else {
        await userApi.create(form);
        showSuccessToast('User Created', 'New user account has been created successfully!');
      }
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    setConfirmDialog({
      visible: true,
      title: 'Delete User',
      message: `Delete user "${name}"? This cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await userApi.remove(id);
          showSuccessToast('User Deleted', 'User account has been deleted successfully!', 'success');
          await load();
        } catch {
          showSuccessToast('Deletion Failed', 'Failed to delete user account', 'error');
        }
      }
    });
  };

  const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-yellow-100 text-yellow-700',
    blocked: 'bg-red-100 text-red-700',
    pending: 'bg-orange-100 text-orange-700',
  };

  const ROLE_BADGES: Record<string, string> = {
    super_admin: 'text-purple-600 bg-purple-50 border-purple-200',
    admin: 'text-primary-600 bg-primary-50 border-primary-200',
    faculty: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    student: 'text-gray-600 bg-gray-50 border-gray-200',
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      if (!u.name?.toLowerCase().includes(sq) && !u.email?.toLowerCase().includes(sq)) {
        return false;
      }
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500 text-sm mt-1">{filteredUsers.length} users total</p>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="col-span-2 sm:col-span-1 relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto capitalize"
            >
              <option value="">All Roles</option>
              {Object.keys(ROLE_IDS).map((r) => (
                <option key={r} value={r}>{r.replace('_', ' ')}</option>
              ))}
            </select>
            {canWrite && (
              <button
                onClick={openCreate}
                className="bg-primary-600 text-white px-2 sm:px-3 py-2 rounded-lg hover:bg-primary-700 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap w-full sm:w-auto"
              >
                + Add User
              </button>
            )}
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">{editId ? 'Edit User Account' : 'Add User Account'}</h2>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4" autoComplete="off">
                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      autoComplete="off"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  {editId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password (Leave blank to keep current)
                      </label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={form.roleName}
                        onChange={(e: any) => setForm({ ...form, roleName: e.target.value })}
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        {user?.role === 'super_admin' && (
                          <option value="admin">Admin</option>
                        )}
                        {user?.email === 'sarkarabhisek50@gmail.com' && (
                          <option value="super_admin">Super Admin</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={form.status}
                        onChange={(e: any) => setForm({ ...form, status: e.target.value })}
                        disabled={!editId}
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* RBAC Permissions Grid */}
                {(form.roleName === 'admin' || form.roleName === 'super_admin' || form.roleName === 'faculty') && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800">Module Permissions</h3>
                        <p className="text-xs text-gray-500">Assign granular access to this admin.</p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                          checked={form.permissions?.canManageRbac || false}
                          disabled={!user?.permissions?.canManageRbac && user?.role !== 'super_admin'}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              permissions: { ...form.permissions, canManageRbac: e.target.checked },
                            })
                          }
                        />
                        <span className="text-sm font-medium text-gray-700">Can Manage RBAC</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['dashboard', 'analytics', 'courses', 'departments', 'faculty', 'placements', 'inquiries', 'notices', 'events', 'media', 'users', 'settings'].map((mod) => (
                        <div key={mod} className="flex flex-col gap-2 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                          <span className="text-sm font-semibold capitalize text-gray-700">
                            {mod}
                          </span>
                          <div className="flex items-center gap-4">
                            {['read', 'write', 'delete'].map((action) => {
                              const canGrant = user?.role === 'super_admin' || (user?.permissions?.modules?.[mod] || []).includes(action);
                              return (
                                <label key={action} className="flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="w-3.5 h-3.5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                    checked={(form.permissions?.modules?.[mod] || []).includes(action)}
                                    disabled={form.roleName === 'super_admin' || (!canGrant && user?.role !== 'super_admin')}
                                    onChange={(e) => {
                                      const currentActs = form.permissions?.modules?.[mod] || [];
                                      let newActs;
                                      if (e.target.checked) {
                                        newActs = [...currentActs, action];
                                      } else {
                                        newActs = currentActs.filter((a: string) => a !== action);
                                      }
                                      setForm({
                                        ...form,
                                        permissions: {
                                          ...form.permissions,
                                          modules: { ...form.permissions?.modules, [mod]: newActs },
                                        },
                                      });
                                    }}
                                  />
                                  <span className="text-xs text-gray-600 capitalize">{action}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : editId ? 'Update User' : 'Create User'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-gray-600 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm responsive-table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-2.5">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td data-label="Name" className="px-4 py-2.5 font-medium text-gray-900">{u.name}</td>
                      <td data-label="Email" className="px-4 py-2.5 text-gray-600">{u.email}</td>
                      <td data-label="Role" className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded border ${ROLE_BADGES[u.role] || ROLE_BADGES.student} font-medium capitalize`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td data-label="Status" className="px-4 py-2.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[u.status] || STATUS_COLORS.active}`}>
                          {u.status}
                        </span>
                      </td>
                      <td data-label="Actions" className="px-4 py-2.5">
                        <div className="flex items-center gap-3 whitespace-nowrap -mt-0.5">
                          {u.email === 'sarkarabhisek50@gmail.com' && user?.email !== 'sarkarabhisek50@gmail.com' ? (
                            <span className="text-purple-600 font-bold text-sm italic">Protected</span>
                          ) : canWrite ? (
                            (user?.role === 'super_admin' || (u.role !== 'super_admin' && u.role !== 'admin')) ? (
                              <>
                                <button
                                  onClick={() => openEdit(u)}
                                  className="text-sm font-medium text-primary-600 hover:text-primary-800"
                                >
                                  Edit
                                </button>
                                {canDelete && (
                                  <button
                                    onClick={() => handleDelete(u.id, u.name)}
                                    className="text-sm font-medium text-red-500 hover:text-red-700"
                                  >
                                    Delete
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm italic">Protected</span>
                            )
                          ) : (
                            <span className="text-gray-400 text-sm italic">Read Only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Slide-in custom success Toast popup notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-900 border border-slate-800 text-white px-5 py-4 rounded-2xl shadow-2xl transition-all duration-300">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
            {toast.type === 'error' ? '✗' : '✓'}
          </div>
          <div>
            <div className="text-sm font-extrabold text-white">{toast.title}</div>
            <div className={`text-xs mt-0.5 ${toast.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>{toast.message}</div>
          </div>
        </div>
      )}

      <ConfirmDialogModal dialog={confirmDialog} onCancel={() => setConfirmDialog(null)} />
    </DashboardLayout>
  );
}
