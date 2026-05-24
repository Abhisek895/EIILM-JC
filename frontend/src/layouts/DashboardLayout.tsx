import React, { ReactNode, useState } from 'react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Courses', href: '/dashboard/courses' },
    { label: 'Departments', href: '/dashboard/departments' },
    { label: 'Faculty', href: '/dashboard/faculty' },
    { label: 'Admissions', href: '/dashboard/admissions' },
    { label: 'Inquiries', href: '/dashboard/inquiries' },
    { label: 'Notices', href: '/dashboard/notices' },
    { label: 'Events', href: '/dashboard/events' },
    { label: 'Media Library', href: '/dashboard/media' },
    { label: 'Users & Roles', href: '/dashboard/users' },
    { label: 'Settings', href: '/dashboard/settings' },
    { label: 'Analytics', href: '/dashboard/analytics' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 fixed h-screen overflow-y-auto`}
      >
        <div className="p-4 border-b border-gray-700">
          <h2 className={`font-bold text-lg ${!sidebarOpen && 'text-center'}`}>
            {sidebarOpen ? 'College Admin' : 'CA'}
          </h2>
          <p className={`text-xs text-gray-400 ${sidebarOpen ? '' : 'hidden'}`}>
            Management System
          </p>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors mb-2 text-gray-200"
            >
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
              {!sidebarOpen && <span className="text-sm">•</span>}
            </Link>
          ))}
        </nav>
      </aside>

      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 flex flex-col transition-all duration-300`}>
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Toggle Sidebar"
          >
            Menu
          </button>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              U
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;

