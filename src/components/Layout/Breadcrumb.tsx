import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface RouteMap {
  [key: string]: string;
}

const Breadcrumb: React.FC = () => {
  const location = useLocation();

  const routeMap: RouteMap = {
    '/dashboard': 'Dashboard',
    '/agenda': 'Agenda',
    '/pacientes': 'Pacientes',
    '/servicos': 'Serviços',
    '/profissionais': 'Profissionais',
    '/analytics': 'Analytics',
    '/configuracoes': 'Configurações',
  };

  const currentPath = location.pathname;
  const currentPage = routeMap[currentPath] || 'Página';

  if (currentPath === '/dashboard') {
    return (
      <div className='mb-6'>
        <div className='text-sm text-gray-500 flex items-center'>
          <Home size={16} className='mr-1' />
          Dashboard
        </div>
      </div>
    );
  }

  return (
    <div className='mb-6'>
      <nav className='flex' aria-label='Breadcrumb'>
        <ol className='inline-flex items-center space-x-1 md:space-x-3'>
          <li className='inline-flex items-center'>
            <Link
              to='/dashboard'
              className='inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600'
            >
              <Home size={16} className='mr-1' />
              Dashboard
            </Link>
          </li>
          <li>
            <div className='flex items-center'>
              <ChevronRight size={16} className='text-gray-400' />
              <span className='ml-1 text-sm font-medium text-gray-500 md:ml-2'>
                {currentPage}
              </span>
            </div>
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
