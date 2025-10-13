import React, { useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../lib/api';
import { User } from './types';
import { AuthContext } from './AuthContextInstance';

interface AuthProviderProps {
  children: ReactNode;
}


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
      
      // Lista de endpoints para tentar (em ordem de prioridade)
      const endpoints = [
        { path: '/empresa-auth/login', type: 'empresa' },
        { path: '/gestor-auth/login', type: 'gestor' },
        { path: '/auth/login', type: 'operador' }
      ];

      console.log(`🔍 [FRONTEND LOGIN] Tentando login para: ${email}`);

      // Tentar cada endpoint até encontrar um que funcione
      for (const { path, type } of endpoints) {
        try {
          console.log(`🔍 [FRONTEND LOGIN] Tentando ${type} - endpoint: ${API_BASE_URL}${path}`);

          const response = await fetch(`${API_BASE_URL}${path}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha }),
          });

          console.log(`🔍 [FRONTEND LOGIN] ${type} - Response status: ${response.status}`);

          if (response.ok) {
            const data = await response.json();
            console.log(`📊 [FRONTEND LOGIN] ${type} - Response data:`, data);

            if (data.success) {
              const { token: newToken } = data.data;
              let userData;
              
              if (type === 'empresa') {
                userData = data.data.empresa;
                userData.tipo = 'empresa';
                console.log(`✅ [FRONTEND LOGIN] Login empresa bem-sucedido - ID: ${userData.id}, Nome: ${userData.nome}`);
              } else if (type === 'gestor') {
                userData = data.data.operador; // Backend retorna como 'operador' mesmo para gestores
                userData.tipo = 'gestor';
                console.log(`✅ [FRONTEND LOGIN] Login gestor bem-sucedido - ID: ${userData.id}, Nome: ${userData.nome}`);
              } else {
                userData = data.data.operador;
                userData.tipo = 'operador';
                console.log(`✅ [FRONTEND LOGIN] Login operador bem-sucedido - ID: ${userData.id}, Nome: ${userData.nome}`);
              }
              
              console.log(`💾 [FRONTEND LOGIN] Salvando dados no localStorage`);
              setToken(newToken);
              setUser(userData);
              
              // Salvar no localStorage
              localStorage.setItem('teleup_token', newToken);
              localStorage.setItem('teleup_user', JSON.stringify(userData));
              
              console.log(`🎉 [FRONTEND LOGIN] Login realizado com sucesso para: ${email} como ${type}`);
              return true;
            }
          } else {
            console.log(`❌ [FRONTEND LOGIN] ${type} - HTTP Error: ${response.status}`);
            // Se não for 401, pode ser um erro diferente (500, etc)
            if (response.status !== 401) {
              try {
                const errorData = await response.json();
                console.log(`❌ [FRONTEND LOGIN] ${type} - Error response data:`, errorData);
              } catch (parseError) {
                console.log(`❌ [FRONTEND LOGIN] ${type} - Could not parse error response as JSON`);
              }
            }
          }
        } catch (endpointError) {
          console.log(`❌ [FRONTEND LOGIN] ${type} - Erro na requisição:`, endpointError);
          // Continuar para o próximo endpoint
        }
      }

      // Se chegou aqui, nenhum endpoint funcionou
      console.log(`❌ [FRONTEND LOGIN] Todas as tentativas falharam para: ${email}`);
      return false;

    } catch (error) {
      console.error(`❌ [FRONTEND LOGIN] Erro geral na requisição de login para ${email}:`, error);
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
