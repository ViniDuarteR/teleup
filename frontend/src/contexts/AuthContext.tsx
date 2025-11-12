import React, { useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../lib/api';
import { User } from './types';
import { AuthContext } from './AuthContextInstance';

interface AuthProviderProps {
  children: ReactNode;
}


const normalizeAvatar = (avatar?: string) => {
  if (!avatar) return undefined;
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}/${avatar.replace(/^\//, '')}`;
};

const withNormalizedAvatar = (userData: User | null): User | null => {
  if (!userData) return null;
  return {
    ...userData,
    avatar: normalizeAvatar(userData.avatar),
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se há token salvo no localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('teleup_token');
    const savedUser = localStorage.getItem('teleup_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(withNormalizedAvatar(JSON.parse(savedUser)));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Lista de endpoints para tentar (em ordem de prioridade)
      const endpoints = [
        { path: '/api/empresa-auth/login', type: 'empresa' },
        { path: '/api/gestor-auth/login', type: 'gestor' },
        { path: '/api/auth/login', type: 'operador' }
      ];

      // Tentar cada endpoint até encontrar um que funcione
      for (const { path, type } of endpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${path}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha }),
          });

          if (response.ok) {
            const data = await response.json();

            if (data.success) {
              const { token: newToken } = data.data;
              let userData;
              
              if (type === 'empresa') {
                userData = data.data.empresa;
                userData.tipo = 'empresa';
              } else if (type === 'gestor') {
                userData = data.data.operador; // Backend retorna como 'operador' mesmo para gestores
                userData.tipo = 'gestor';
              } else {
                userData = data.data.operador;
                userData.tipo = 'operador';
              }
              
              const normalizedUser = withNormalizedAvatar(userData);

              setToken(newToken);
              setUser(normalizedUser);
              localStorage.setItem('teleup_token', newToken);
              localStorage.setItem('teleup_user', JSON.stringify(normalizedUser));
              return true;
            }
          }
        } catch (endpointError) {
          // Continuar para o próximo endpoint
        }
      }

      return false;

    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Chamar API de logout para invalidar sessão no backend
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
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
    const normalizedUser = withNormalizedAvatar(updatedUser);
    setUser(normalizedUser);
    localStorage.setItem('teleup_user', JSON.stringify(normalizedUser));
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
