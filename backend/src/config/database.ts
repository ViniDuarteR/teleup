import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
}

const dbConfig: DatabaseConfig = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Neon PostgreSQL requer SSL em produção
  ssl: process.env.NODE_ENV === 'production' || !!process.env.DATABASE_URL,
};

// Criar pool de conexões Postgres
const pgPool = new Pool(
  dbConfig.connectionString
    ? {
        connectionString: dbConfig.connectionString,
        // Neon PostgreSQL - SSL obrigatório em produção
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        // Configurações otimizadas para Neon
        max: 15, // Neon free tier tem limite de conexões
        idleTimeoutMillis: 10000, // Neon desconecta conexões idle rapidamente
        connectionTimeoutMillis: 5000,
        statement_timeout: 30000, // Timeout para queries
        query_timeout: 30000,
      }
    : {
        host: dbConfig.host || 'localhost',
        port: dbConfig.port || 5432,
        user: dbConfig.user || 'postgres',
        password: dbConfig.password || 'postgres',
        database: dbConfig.database || 'teleup_db',
        ssl: dbConfig.ssl ? { rejectUnauthorized: false } : undefined,
        // Configurações para desenvolvimento local
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
);

// API PostgreSQL nativa
export const pool = {
  async execute<T = any>(query: string, params: any[] = []): Promise<[T[], any]> {
    const result = await pgPool.query(query, params);
    return [result.rows as unknown as T[], result.fields];
  },
  async query<T = any>(query: string, params: any[] = []): Promise<T[]> {
    const result = await pgPool.query(query, params);
    return result.rows as unknown as T[];
  },
  get native() {
    return pgPool;
  },
};

// Testar conexão
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 [DATABASE] Testando conexão com Neon PostgreSQL...');
    console.log('🔍 [DATABASE] NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 [DATABASE] DATABASE_URL presente:', !!process.env.DATABASE_URL);
    
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      console.log('🔍 [DATABASE] Host:', url.hostname);
      console.log('🔍 [DATABASE] Porta:', url.port);
      console.log('🔍 [DATABASE] Database:', url.pathname.slice(1));
    } else {
      console.log('🔍 [DATABASE] DB_HOST:', process.env.DB_HOST || 'não definido');
      console.log('🔍 [DATABASE] DB_NAME:', process.env.DB_NAME || 'não definido');
    }
    
    const result = await pgPool.query('SELECT 1 as test, version() as postgres_version');
    console.log('✅ [DATABASE] Conectado ao Neon PostgreSQL com sucesso');
    return true;
  } catch (error: any) {
    console.error('❌ [DATABASE] Erro ao conectar ao Neon PostgreSQL:');
    console.error('❌ [DATABASE] Mensagem:', error.message);
    console.error('❌ [DATABASE] Código:', error.code);
    console.error('❌ [DATABASE] Stack trace:', error.stack);
    
    // Logs específicos para diferentes tipos de erro
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ [DATABASE] Servidor Neon recusou a conexão');
    } else if (error.code === 'ENOTFOUND') {
      console.error('❌ [DATABASE] Servidor Neon não encontrado - verifique a DATABASE_URL');
    } else if (error.code === 'SASL_SIGNATURE_MISMATCH') {
      console.error('❌ [DATABASE] Erro de autenticação - credenciais inválidas');
    } else if (error.message?.includes('password authentication failed')) {
      console.error('❌ [DATABASE] Falha na autenticação - senha incorreta');
    } else if (error.message?.includes('SSL')) {
      console.error('❌ [DATABASE] Erro de SSL/TLS - verifique configurações SSL');
    } else if (error.message?.includes('timeout')) {
      console.error('❌ [DATABASE] Timeout de conexão - servidor pode estar sobrecarregado');
    }
    
    return false;
  }
};

export default pool;
