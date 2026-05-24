import React from 'react';
import Link from 'next/link';
import { useAuth } from '@hooks/useAuth';

export const Navigation: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const portalHref =
    user?.role === 'admin' || user?.role === 'super_admin'
      ? '/dashboard'
      : '/student';
  const portalLabel =
    user?.role === 'admin' || user?.role === 'super_admin'
      ? 'Dashboard'
      : 'Student Portal';

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl text-blue-600">
          College ERP
        </Link>

        <div className="flex space-x-6 items-center">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            Home
          </Link>
          <Link href="/courses" className="text-gray-700 hover:text-blue-600">
            Courses
          </Link>
          <Link href="/departments" className="text-gray-700 hover:text-blue-600">
            Departments
          </Link>
          <Link href="/admissions" className="text-gray-700 hover:text-blue-600">
            Admissions
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-blue-600">
            About
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-blue-600">
            Contact
          </Link>

          {isAuthenticated ? (
            <>
              <Link href={portalHref} className="text-gray-700 hover:text-blue-600">
                {portalLabel}
              </Link>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
