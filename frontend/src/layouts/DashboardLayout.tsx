import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@hooks/useAuth';
import { siteSettingsApi } from '@api/endpoints';
import { getImageUrl } from '@utils/getImageUrl';


interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout, user } = useAuth();
  const router = useRouter();
  const [collegeName, setCollegeName] = useState('');
  const [logo, setLogo] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Initialize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
  }, []);

  React.useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  React.useEffect(() => {
    siteSettingsApi
      .getMap()
      .then((res: any) => {
        const data = res?.data;
        if (data?.college_name) {
          setCollegeName(data.college_name);
        } else {
          setCollegeName('');
        }
        if (data?.logo) setLogo(data.logo);
      })
      .catch(() => {
        setCollegeName('');
      });
  }, []);

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Courses', href: '/dashboard/courses', icon: '📚' },
    { label: 'Departments', href: '/dashboard/departments', icon: '🏢' },
    { label: 'Faculty', href: '/dashboard/faculty', icon: '👨‍🏫' },
    { label: 'Placements', href: '/dashboard/placements', icon: '🏆' },
    { label: 'Inquiries', href: '/dashboard/inquiries', icon: '📞' },
    { label: 'Notices', href: '/dashboard/notices', icon: '📢' },
    { label: 'Events', href: '/dashboard/events', icon: '📅' },
    { label: 'Media & CMS', href: '/dashboard/media', icon: '🖼️' },
    { label: 'Users & Roles', href: '/dashboard/users', icon: '👥' },
    { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
    { label: 'AI Chatbot', href: '/dashboard/chatbot', icon: '🤖' },
    { label: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
  ];

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="flex w-full bg-gray-100/60 font-sans">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`${isMobile ? (sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64') : (sidebarOpen ? 'w-56' : 'w-16')
          } bg-slate-900 text-white transition-all duration-300 fixed h-screen flex flex-col z-50 shadow-xl border-r border-slate-800 top-0 left-0`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between min-h-[70px]">
          <div className="flex items-center gap-3 overflow-hidden w-full">
            {collegeName || logo ? (
              <>
                {logo ? (
                  <img src={getImageUrl(logo)} alt={collegeName || 'Logo'} className="w-12 h-12 object-contain shrink-0 bg-white rounded-xl p-0.5 shadow-md shadow-primary-500/20" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-primary-500/20 shrink-0">
                    {collegeName.charAt(0)}
                  </div>
                )}
                {sidebarOpen && (
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-slate-100 tracking-tight leading-none">{collegeName}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">CMS Admin Hub</span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-8 bg-slate-800 rounded-lg animate-pulse" />
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {menuItems
            .filter((item) => {
              const role = user?.role || 'student';
              if (role === 'super_admin') return true;

              if (role === 'admin' || role === 'faculty') {
                const perms = user?.permissions?.modules || {};

                // Map href to module name
                const map: Record<string, string> = {
                  '/dashboard': 'dashboard',
                  '/dashboard/courses': 'courses',
                  '/dashboard/departments': 'departments',
                  '/dashboard/faculty': 'faculty',
                  '/dashboard/placements': 'placements',
                  '/dashboard/inquiries': 'inquiries',
                  '/dashboard/notices': 'notices',
                  '/dashboard/events': 'events',
                  '/dashboard/media': 'media',
                  '/dashboard/users': 'users',
                  '/dashboard/settings': 'settings',
                  '/dashboard/chatbot': 'dashboard', // anyone with dashboard can access chatbot basics
                  '/dashboard/analytics': 'dashboard', // dashboard read gives analytics access
                };

                const moduleName = map[item.href];
                if (!moduleName) return false;

                return perms[moduleName]?.includes('read') || false;
              }

              return false;
            })
            .map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-250 border ${isActive
                      ? 'bg-primary-600 border-primary-500 text-white shadow-md shadow-primary-500/20 font-bold scale-[1.02]'
                      : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  {sidebarOpen && <span className="text-xs font-semibold tracking-tight">{item.label}</span>}
                </Link>
              );
            })}
        </nav>

        {/* Sidebar Footer with Logout action */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          {/* User mini badge */}
          {sidebarOpen && (
            <div className="flex items-center gap-3 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-sm tracking-wider">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Administrator'}</span>
                <span className="text-[10px] text-slate-400 font-semibold truncate uppercase mt-0.5">{user?.role || 'Admin'}</span>
              </div>
            </div>
          )}

          {/* Dynamic Logout trigger button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-transparent text-primary-400 hover:text-white hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-600/10 transition-all font-bold cursor-pointer ${!sidebarOpen && 'justify-center'
              }`}
          >
            <span className="text-base shrink-0">🚪</span>
            {sidebarOpen && <span className="text-xs">Logout Session</span>}
          </button>
        </div>
      </aside>

      {/* Main body panel */}
      <div className={`${isMobile ? 'ml-0' : (sidebarOpen ? 'ml-56' : 'ml-16')} flex-1 flex flex-col transition-all duration-300 min-h-screen w-full overflow-x-hidden`}>
        {/* Top Header navbar */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 py-1.5 px-4 flex items-center justify-between sticky top-0 z-10 min-h-[48px]">
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
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 shadow-inner">
              <span className="text-xs text-gray-500 font-semibold mr-2">Status:</span>
              <span className={`w-2 h-2 rounded-full mr-1.5 ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-xs font-bold text-gray-700">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            <div
              onClick={() => setShowLogoutModal(true)}
              className="w-10 h-10 rounded-xl bg-primary-600/10 text-primary-600 hover:bg-primary-600 hover:text-white flex items-center justify-center font-bold shadow-sm transition-all cursor-pointer border border-primary-500/10 group"
              title="Secure Logout"
            >
              <span className="group-hover:scale-110 transition-transform">👤</span>
            </div>
          </div>
        </header>

        {/* Dashboard inner content */}
        <main className="flex-1 overflow-auto px-3 lg:px-5 pt-4 pb-8 bg-gray-50/50">{children}</main>
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
              <div className="w-16 h-16 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-3xl mx-auto shadow-inner">
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
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-3 rounded-2xl text-sm transition-all shadow-md shadow-primary-600/10 cursor-pointer text-center"
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
