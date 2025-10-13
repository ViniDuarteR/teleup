import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'operador' | 'gestor' | 'empresa';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

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
    return <Navigate to="/login" replace />;
  }

  // Verificar se o usuário tem a role necessária
  if (requiredRole && user) {
    // Bloquear acesso se o tipo não corresponder
    if (requiredRole === 'operador' && user.tipo !== 'operador') {
      if (user.tipo === 'gestor') {
        return <Navigate to="/gestor" replace />;
      }
      return <Navigate to="/login" replace />;
    }
    
    if (requiredRole === 'gestor' && user.tipo !== 'gestor') {
      if (user.tipo === 'operador') {
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
