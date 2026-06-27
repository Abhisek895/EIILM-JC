import React, { ReactNode } from 'react';
import Navigation from '@components/Navigation';
import Footer from '@components/Footer';
import GlobalModalBanner from '@components/GlobalModalBanner';
import ChatbotWidget from '@components/ChatbotWidget';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <GlobalModalBanner />
      <Navigation />
      <main className="flex-grow">{children}</main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default MainLayout;
