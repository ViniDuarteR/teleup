// Configuração direta da API - SEM variáveis de ambiente
export const API_CONFIG = {
  BASE_URL: 'https://teleup-back.vercel.app/api',
  VERSION: '2.0.0-' + Date.now() // Cache bust
};

console.log('🔧 API_CONFIG carregado:', API_CONFIG);
console.log('🎯 URL da API:', API_CONFIG.BASE_URL);

export default API_CONFIG;
