import React from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-2">{title || 'Welcome'}</h1>
        {subtitle && <p className="text-blue-100 text-lg">{subtitle}</p>}
      </div>
    </div>
  );
};

export default Header;
