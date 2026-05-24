import React, { ReactNode } from 'react';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Website CMS', href: '/dashboard/cms', icon: '📝' },
    { label: 'Courses', href: '/dashboard/courses', icon: '📚' },
    { label: 'Departments', href: '/dashboard/departments', icon: '🏢' },
    { label: 'Faculty', href: '/dashboard/faculty', icon: '👨‍🏫' },
    { label: 'Admissions', href: '/dashboard/admissions', icon: '📋' },
    { label: 'Inquiries', href: '/dashboard/inquiries', icon: '💬' },
    { label: 'Notices', href: '/dashboard/notices', icon: '📢' },
    { label: 'Events', href: '/dashboard/events', icon: '📅' },
    { label: 'Media Library', href: '/dashboard/media', icon: '🖼️' },
    { label: 'Users & Roles', href: '/dashboard/users', icon: '👥' },
    { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
    { label: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 fixed h-screen overflow-y-auto`}
      >
        <div className="p-4 border-b border-gray-700">
          <h2 className={`font-bold text-lg ${!sidebarOpen && 'text-center'}`}>
            {sidebarOpen ? '🎓 College Admin' : '🎓'}
          </h2>
          <p className={`text-xs text-gray-400 ${sidebarOpen ? '' : 'hidden'}`}>Management System</p>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors mb-2 text-gray-200"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 flex flex-col transition-all duration-300`}>
        {/* Top bar */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            ☰
          </button>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
