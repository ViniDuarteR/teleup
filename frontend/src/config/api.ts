// Configuração da API baseada no ambiente
export const API_CONFIG = {
  BASE_URL: `${import.meta.env.VITE_API_URL}/api`, // URL do backend com /api
  VERSION: '2.0.0-' + Date.now() // Cache bust
};

console.log('🔧 API_CONFIG carregado:', API_CONFIG);
console.log('🎯 URL da API:', API_CONFIG.BASE_URL);

export default API_CONFIG;
