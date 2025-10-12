import { ENV_CONFIG } from '../config/env';

// Configuração centralizada da API
const API_BASE_URL = `${ENV_CONFIG.API_URL.replace(/\/$/, '')}/api`;

export { API_BASE_URL };

// Função auxiliar para fazer requisições autenticadas
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('teleup_token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
};

// Funções específicas da API
export const api = {
  // Auth
  login: (email: string, senha: string) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    }),

  register: (data: any) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Empresas
  getEmpresaDashboard: () =>
    apiRequest('/empresas/dashboard'),

  getGestores: () =>
    apiRequest('/empresas/gestores'),

  createGestor: (data: any) =>
    apiRequest('/empresas/gestores', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteGestor: (id: number) =>
    apiRequest(`/empresas/gestores/${id}`, {
      method: 'DELETE',
    }),

  // Operadores
  getOperadores: () =>
    apiRequest('/operadores'),

  getOperadorDashboard: () =>
    apiRequest('/operadores/dashboard'),

  getOperadorStats: () =>
    apiRequest('/operadores/stats'),

  getOperadorMetas: () =>
    apiRequest('/operadores/metas'),

  // Gestores
  getGestorDashboard: () =>
    apiRequest('/gestores/dashboard'),

  // Recompensas
  getRecompensas: () =>
    apiRequest('/recompensas'),

  createRecompensa: (data: any) =>
    apiRequest('/recompensas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRecompensa: (id: number, data: any) =>
    apiRequest(`/recompensas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteRecompensa: (id: number) =>
    apiRequest(`/recompensas/${id}`, {
      method: 'DELETE',
    }),

  // Compras
  buyRecompensa: (recompensaId: number) =>
    apiRequest('/compras', {
      method: 'POST',
      body: JSON.stringify({ recompensa_id: recompensaId }),
    }),

  // Chamadas
  iniciarChamada: (numero: string) =>
    apiRequest('/chamadas/iniciar', {
      method: 'POST',
      body: JSON.stringify({ numero }),
    }),

  finalizarChamada: (chamadaId: number, duracao: number) =>
    apiRequest(`/chamadas/${chamadaId}/finalizar`, {
      method: 'PUT',
      body: JSON.stringify({ duracao }),
    }),
};
