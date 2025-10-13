// Configuração de ambiente da aplicação
export const ENV_CONFIG = {
  // URL da API - será usada por padrão se não houver variável de ambiente
  API_URL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : 'https://teleup-backend.vercel.app'),
  
  // Configurações da aplicação
  APP_NAME: import.meta.env.VITE_APP_NAME || 'TeleUp',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Verificar se está em desenvolvimento
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD
};

