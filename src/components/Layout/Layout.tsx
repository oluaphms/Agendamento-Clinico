import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import FirstAccessHandler from '../Auth/FirstAccessHandler';
import { SideDrawer } from '../MenuCardiaco';
import { ConnectivityStatus } from '../UI';
import { useThemeStore } from '@/stores/themeStore';

const Layout: React.FC = () => {
  const { isDark } = useThemeStore();
  const [isCardiacMenuOpen, setIsCardiacMenuOpen] = useState(false);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}
      style={{ position: 'relative' }}
    >
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className='pt-24 pb-20 px-6'>
        <div className='max-w-7xl mx-auto'>
          {/* Page Content */}
          <Outlet />
        </div>
      </main>

      {/* First Access Handler */}
      <FirstAccessHandler />

      {/* Status de Conectividade */}
      <ConnectivityStatus />

      {/* Menu Lateral Global */}
      <SideDrawer
        isOpen={isCardiacMenuOpen}
        onClose={() => setIsCardiacMenuOpen(false)}
      />
    </div>
  );
};

export default Layout;
