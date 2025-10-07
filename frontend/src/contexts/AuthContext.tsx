import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  nome: string;
  email: string;
  tipo: 'operador' | 'gestor';
  nivel?: number;
  xp_atual?: number;
  xp_proximo_nivel?: number;
  pontos_totais?: number;
  status: string;
  avatar: string;
  tempo_online?: number;
  data_criacao: string;
  data_atualizacao: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = 'http://localhost:3001/api';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se há token salvo no localStorage
  useEffect(() => {
    console.log('AuthContext - Checking localStorage for saved auth');
    const savedToken = localStorage.getItem('teleup_token');
    const savedUser = localStorage.getItem('teleup_user');
    
    console.log('AuthContext - savedToken:', savedToken ? 'exists' : 'null');
    console.log('AuthContext - savedUser:', savedUser ? 'exists' : 'null');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      console.log('AuthContext - Restored auth from localStorage');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Para o Hyttalo Costa, tentar login como gestor primeiro
      if (email === 'hyttalo@teleup.com') {
        console.log('AuthContext - Tentando login como gestor para:', email);
        const response = await fetch(`${API_BASE_URL}/gestor-auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, senha }),
        });

        const data = await response.json();

        if (data.success) {
          const { token: newToken, operador } = data.data;
          
          console.log('AuthContext - Login gestor successful, user:', operador);
          console.log('AuthContext - User tipo:', operador.tipo);
          
          setToken(newToken);
          setUser(operador);
          
          // Salvar no localStorage
          localStorage.setItem('teleup_token', newToken);
          localStorage.setItem('teleup_user', JSON.stringify(operador));
          
          return true;
        }
      }

      // Detectar tipo de usuário baseado no email
      let endpoint = '/auth/login'; // padrão para operadores
      let userType = 'operador';
      
      if (email.includes('@teleup.com') && email !== 'hyttalo@teleup.com') {
        // Email da empresa TeleUp
        endpoint = '/empresa-auth/login';
        userType = 'empresa';
        console.log('AuthContext - Tentando login como empresa para:', email);
      } else if (email.includes('@techcorp.com') && email !== 'roberto.silva@techcorp.com' && email !== 'carla.mendes@techcorp.com') {
        // Email da empresa TechCorp
        endpoint = '/empresa-auth/login';
        userType = 'empresa';
        console.log('AuthContext - Tentando login como empresa para:', email);
      } else {
        // Gestores e operadores
        console.log('AuthContext - Tentando login como operador/gestor para:', email);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (data.success) {
        const { token: newToken } = data.data;
        let userData;
        
        if (userType === 'empresa') {
          userData = data.data.empresa;
          userData.tipo = 'empresa';
          console.log('AuthContext - Login empresa successful, empresa:', userData);
        } else {
          userData = data.data.operador || data.data;
          console.log('AuthContext - Login operador/gestor successful, user:', userData);
        }
        
        console.log('AuthContext - User tipo:', userData.tipo);
        
        setToken(newToken);
        setUser(userData);
        
        // Salvar no localStorage
        localStorage.setItem('teleup_token', newToken);
        localStorage.setItem('teleup_user', JSON.stringify(userData));
        
        return true;
      } else {
        console.error('Erro no login:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Erro na requisição de login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Chamar API de logout para invalidar sessão no backend
      if (token) {
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Erro ao fazer logout no backend:', error);
      // Continuar com logout local mesmo se der erro no backend
    } finally {
      // Limpar dados locais
      setToken(null);
      setUser(null);
      localStorage.removeItem('teleup_token');
      localStorage.removeItem('teleup_user');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('teleup_user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUser,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
