// Configuração da API baseada no ambiente
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://teleup-backend.vercel.app', // URL do backend sem /api duplicado
  VERSION: '2.0.0-' + Date.now() // Cache bust
};

console.log('🔧 API_CONFIG carregado:', API_CONFIG);
console.log('🎯 URL da API:', API_CONFIG.BASE_URL);

export default API_CONFIG;
