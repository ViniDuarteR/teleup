import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  nome: string;
  email: string;
  tipo: 'operador' | 'gestor' | 'empresa';
  nivel?: number;
  xp_atual?: number;
  xp_proximo_nivel?: number;
  pontos_totais?: number;
  status: string;
  avatar?: string;
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

import { API_BASE_URL } from '../lib/api';

// Log direto para debug
console.log('🔧 AuthContext - API_BASE_URL:', API_BASE_URL);

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
      
      // Detectar tipo de usuário baseado no email
      let endpoint = '/auth/login'; // padrão para operadores
      let userType = 'operador';
      
      // Gestores específicos
      if (email === 'hyttalo@teleup.com' || email === 'roberto.silva@techcorp.com') {
        endpoint = '/gestor-auth/login';
        userType = 'gestor';
        console.log('AuthContext - Tentando login como gestor para:', email);
      }
      // Empresas específicas
      else if (email === 'contato@teleup.com' || email === 'admin@techcorp.com') {
        endpoint = '/empresa-auth/login';
        userType = 'empresa';
        console.log('AuthContext - Tentando login como empresa para:', email);
      }
      // Operadores (padrão)
      else {
        console.log('AuthContext - Tentando login como operador para:', email);
      }

      console.log(`AuthContext - Usando endpoint: ${API_BASE_URL}${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      console.log(`🔍 [FRONTEND LOGIN] Response status: ${response.status}`);
      console.log(`🔍 [FRONTEND LOGIN] Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.log(`❌ [FRONTEND LOGIN] HTTP Error: ${response.status} ${response.statusText}`);
        try {
          const errorData = await response.json();
          console.log(`❌ [FRONTEND LOGIN] Error response data:`, errorData);
        } catch (parseError) {
          console.log(`❌ [FRONTEND LOGIN] Could not parse error response as JSON`);
        }
        return false;
      }

      const data = await response.json();
      console.log(`📊 [FRONTEND LOGIN] Response data:`, data);

      if (data.success) {
        const { token: newToken } = data.data;
        let userData;
        
        if (userType === 'empresa') {
          userData = data.data.empresa;
          userData.tipo = 'empresa';
          console.log(`✅ [FRONTEND LOGIN] Login empresa bem-sucedido - ID: ${userData.id}, Nome: ${userData.nome}`);
        } else {
          userData = data.data.operador;
          console.log(`✅ [FRONTEND LOGIN] Login ${userType} bem-sucedido - ID: ${userData.id}, Nome: ${userData.nome}`);
        }
        
        console.log(`🔍 [FRONTEND LOGIN] User tipo final:`, userData.tipo);
        
        console.log(`💾 [FRONTEND LOGIN] Salvando dados no localStorage`);
        setToken(newToken);
        setUser(userData);
        
        // Salvar no localStorage
        localStorage.setItem('teleup_token', newToken);
        localStorage.setItem('teleup_user', JSON.stringify(userData));
        
        console.log(`🎉 [FRONTEND LOGIN] Login realizado com sucesso para: ${email}`);
        return true;
      } else {
        console.error(`❌ [FRONTEND LOGIN] Login failed: ${data.message}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ [FRONTEND LOGIN] Erro na requisição de login para ${email}:`, error);
      console.error(`❌ [FRONTEND LOGIN] Stack trace:`, error.stack);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Chamar API de logout para invalidar sessão no backend
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
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
