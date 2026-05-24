import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@hooks/useAuth';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout, user } = useAuth();
  const router = useRouter();

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Courses', href: '/dashboard/courses', icon: '📚' },
    { label: 'Departments', href: '/dashboard/departments', icon: '🏢' },
    { label: 'Faculty', href: '/dashboard/faculty', icon: '👨‍🏫' },
    { label: 'Admissions', href: '/dashboard/admissions', icon: '🎓' },
    { label: 'Inquiries', href: '/dashboard/inquiries', icon: '📞' },
    { label: 'Notices', href: '/dashboard/notices', icon: '📢' },
    { label: 'Events', href: '/dashboard/events', icon: '📅' },
    { label: 'Media Library', href: '/dashboard/media', icon: '🖼️' },
    { label: 'Users & Roles', href: '/dashboard/users', icon: '👥' },
    { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
    { label: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
  ];

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-100/60 font-sans">
      {/* Sidebar aside */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 fixed h-screen overflow-y-auto flex flex-col z-20 shadow-xl border-r border-slate-800`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between min-h-[70px]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-blue-500/20 shrink-0">
              E
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-slate-100 tracking-tight leading-none">EIILM ERP</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">CMS Admin Hub</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5 flex-1">
          {menuItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 border ${
                  isActive
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20 font-bold scale-[1.02]'
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="text-sm tracking-tight">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with Logout action */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          {/* User mini badge */}
          {sidebarOpen && (
            <div className="flex items-center gap-3 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm tracking-wider">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Administrator'}</span>
                <span className="text-[10px] text-slate-400 font-semibold truncate uppercase mt-0.5">{user?.role || 'Admin'}</span>
              </div>
            </div>
          )}

          {/* Red Logout trigger button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent text-rose-400 hover:text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-600/10 transition-all font-bold cursor-pointer ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <span className="text-base shrink-0">🚪</span>
            {sidebarOpen && <span className="text-sm">Logout Session</span>}
          </button>
        </div>
      </aside>

      {/* Main body panel */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 flex flex-col transition-all duration-300 min-h-screen`}>
        {/* Top Header navbar */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 p-4 flex items-center justify-between sticky top-0 z-10 min-h-[70px]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              aria-label="Toggle Sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:block text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/40">
              Environment: Production-ready SaaS
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 shadow-inner">
              <span className="text-xs text-gray-500 font-semibold mr-2">Status:</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5" />
              <span className="text-xs font-bold text-gray-700">Online</span>
            </div>
            
            <div 
              onClick={() => setShowLogoutModal(true)}
              className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center font-bold shadow-sm transition-all cursor-pointer border border-blue-500/10 group"
              title="Secure Logout"
            >
              <span className="group-hover:scale-110 transition-transform">👤</span>
            </div>
          </div>
        </header>

        {/* Dashboard inner content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8 bg-gray-50/50">{children}</main>
      </div>

      {/* Premium Glassmorphic Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Modal backdrop */}
          <div 
            onClick={() => setShowLogoutModal(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          />
          
          {/* Modal content box */}
          <div className="relative bg-white rounded-3xl p-6 lg:p-8 max-w-sm w-full border border-gray-100 shadow-2xl transform transition-all animate-scaleUp">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-3xl mx-auto shadow-inner">
                🚪
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Confirm Secure Logout</h3>
                <p className="text-xs text-gray-500 leading-relaxed px-2">
                  Are you sure you want to end your active administrator session? You will need to re-authenticate to access the dashboard.
                </p>
              </div>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleConfirmLogout}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-3 rounded-2xl text-sm transition-all shadow-md shadow-rose-600/10 cursor-pointer text-center"
                >
                  Yes, Log Out
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold px-5 py-3 rounded-2xl text-sm transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
