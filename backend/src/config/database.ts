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
  // Railway usa SSL por padrão, mas aceita rejectUnauthorized: false
  ssl: process.env.NODE_ENV === 'production' || !!process.env.DATABASE_URL,
};

// Criar pool de conexões Postgres
const pgPool = new Pool(
  dbConfig.connectionString
    ? {
        connectionString: dbConfig.connectionString,
        // Railway PostgreSQL requer rejectUnauthorized: false
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: dbConfig.host || 'localhost',
        port: dbConfig.port || 5432,
        user: dbConfig.user || 'postgres',
        password: dbConfig.password || 'postgres',
        database: dbConfig.database || 'teleup_db',
        ssl: dbConfig.ssl ? { rejectUnauthorized: false } : undefined,
      }
);

// Compat layer: converte placeholders '?' -> '$1, $2, ...'
function toPgParams(query: string, params: any[] = []): { text: string; values: any[] } {
  let index = 0;
  let text = query.replace(/\?/g, () => `$${++index}`);

  // Normalizações simples MySQL -> Postgres
  text = text
    .replace(/`/g, '"')                 // backticks -> aspas (se houver)
    .replace(/=\s*1(\b)/g, '= TRUE$1')  // comparações booleanas
    .replace(/=\s*0(\b)/g, '= FALSE$1')
    .replace(/TINYINT\(1\)/gi, 'BOOLEAN');

  return { text, values: params };
}

// API compatível com mysql2.execute
export const pool = {
  async execute<T = any>(query: string, params: any[] = []): Promise<[T[], any]> {
    const { text, values } = toPgParams(query, params);
    const result = await pgPool.query(text, values);
    // Retorna [rows, fields] no formato aproximado do mysql2
    return [result.rows as unknown as T[], result.fields];
  },
  async query<T = any>(query: string, params: any[] = []): Promise<T[]> {
    const { text, values } = toPgParams(query, params);
    const result = await pgPool.query(text, values);
    return result.rows as unknown as T[];
  },
  get native() {
    return pgPool;
  },
};

// Testar conexão
export const testConnection = async (): Promise<boolean> => {
  try {
    await pgPool.query('SELECT 1');
    console.log('✅ Conectado ao banco de dados Postgres');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    return false;
  }
};

export default pool;
