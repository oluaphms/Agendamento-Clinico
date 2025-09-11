import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Breadcrumb from './Breadcrumb';
import FirstAccessHandler from '../Auth/FirstAccessHandler';
import MenuRaioX from '../MenuRaioX/MenuRaioX';
import { ConnectivityStatus } from '../UI';
import { useThemeStore } from '@/stores/themeStore';
import { useMenu } from '@/contexts/MenuContext';

const Layout: React.FC = () => {
  const { isDark } = useThemeStore();
  const { isMenuOpen, setIsMenuOpen } = useMenu();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      {/* Menu Raio-X - Disponível em todas as páginas */}
      <MenuRaioX isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className='pt-14 pb-20 px-6'>
        <div className='max-w-7xl mx-auto'>
          {/* Breadcrumb */}
          <Breadcrumb />

          {/* Page Content */}
          <Outlet />
        </div>
      </main>

      {/* First Access Handler */}
      <FirstAccessHandler />

      {/* Status de Conectividade */}
      <ConnectivityStatus />
    </div>
  );
};

export default Layout;
