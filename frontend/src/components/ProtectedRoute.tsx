import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'operador' | 'gestor';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('🔍 ProtectedRoute - START');
  console.log('🔍 ProtectedRoute - requiredRole:', requiredRole);
  console.log('🔍 ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Verificar se o usuário tem a role necessária
  if (requiredRole && user) {
    console.log('🔍 ProtectedRoute - requiredRole:', requiredRole, 'user.tipo:', user.tipo);
    
    // Bloquear acesso se o tipo não corresponder
    if (requiredRole === 'operador' && user.tipo !== 'operador') {
      console.log('🚫 Access denied: User is not an operador, redirecting to appropriate page');
      console.log('🚫 User tipo:', user.tipo, 'Required:', requiredRole);
      if (user.tipo === 'gestor') {
        console.log('🚫 Redirecting gestor to /gestor');
        return <Navigate to="/gestor" replace />;
      }
      return <Navigate to="/login" replace />;
    }
    
    if (requiredRole === 'gestor' && user.tipo !== 'gestor') {
      console.log('🚫 Access denied: User is not a gestor, redirecting to appropriate page');
      console.log('🚫 User tipo:', user.tipo, 'Required:', requiredRole);
      if (user.tipo === 'operador') {
        console.log('🚫 Redirecting operador to /dashboard');
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/login" replace />;
    }
    
    console.log('✅ Access granted: User type matches required role');
  }

  return <>{children}</>;
};

export default ProtectedRoute;
