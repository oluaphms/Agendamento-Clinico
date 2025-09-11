import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, usePermissions } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallbackPath = '/login',
}) => {
  const { user, loading } = useAuthStore();
  const permissions = usePermissions();
  const location = useLocation();

  // Se ainda está carregando, mostrar loading
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário autenticado, redirecionar para login
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Se há roles específicos requeridos, verificar permissões
  if (requiredRoles.length > 0) {
    const hasPermission = permissions.canAccess(requiredRoles);

    if (!hasPermission) {
      // Redirecionar para dashboard se não tiver permissão
      return <Navigate to='/app/dashboard' replace />;
    }
  }

  // Se passou por todas as verificações, renderizar o conteúdo
  return <>{children}</>;
};

export default ProtectedRoute;
