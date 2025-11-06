import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Configuração de conexão MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/teleup';

// Opções de conexão
const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Conectar ao MongoDB
export const connectDatabase = async (): Promise<void> => {
  try {
    console.log('🔍 [DATABASE] Conectando ao MongoDB...');
    console.log('🔍 [DATABASE] NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 [DATABASE] MONGODB_URI presente:', !!MONGODB_URI);
    
    if (MONGODB_URI) {
      const url = new URL(MONGODB_URI);
      console.log('🔍 [DATABASE] Host:', url.hostname);
      console.log('🔍 [DATABASE] Porta:', url.port || '27017');
      console.log('🔍 [DATABASE] Database:', url.pathname.slice(1));
    }

    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('✅ [DATABASE] Conectado ao MongoDB com sucesso');
  } catch (error: any) {
    console.error('❌ [DATABASE] Erro ao conectar ao MongoDB:');
    console.error('❌ [DATABASE] Mensagem:', error.message);
    console.error('❌ [DATABASE] Código:', error.code);
    console.error('❌ [DATABASE] Stack trace:', error.stack);
    throw error;
  }
};

// Testar conexão
export const testConnection = async (): Promise<boolean> => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Já conectado
      await mongoose.connection.db.admin().ping();
      console.log('✅ [DATABASE] Conexão MongoDB verificada');
      return true;
    } else {
      // Conectar se não estiver conectado
      await connectDatabase();
      return true;
    }
  } catch (error: any) {
    console.error('❌ [DATABASE] Erro ao testar conexão MongoDB:', error.message);
    return false;
  }
};

// Desconectar
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ [DATABASE] Desconectado do MongoDB');
  } catch (error: any) {
    console.error('❌ [DATABASE] Erro ao desconectar:', error.message);
  }
};

// Eventos de conexão
mongoose.connection.on('connected', () => {
  console.log('✅ [DATABASE] Mongoose conectado ao MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ [DATABASE] Erro na conexão Mongoose:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ [DATABASE] Mongoose desconectado do MongoDB');
});

export default mongoose;
