"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.PGSSL === 'true' || !!process.env.DATABASE_URL,
};
const pgPool = new pg_1.Pool(dbConfig.connectionString
    ? {
        connectionString: dbConfig.connectionString,
        ssl: dbConfig.ssl ? { rejectUnauthorized: false } : undefined,
    }
    : {
        host: dbConfig.host || 'localhost',
        port: dbConfig.port || 5432,
        user: dbConfig.user || 'postgres',
        password: dbConfig.password || 'postgres',
        database: dbConfig.database || 'teleup_db',
        ssl: dbConfig.ssl ? { rejectUnauthorized: false } : undefined,
    });
function toPgParams(query, params = []) {
    let index = 0;
    let text = query.replace(/\?/g, () => `$${++index}`);
    text = text
        .replace(/`/g, '"')
        .replace(/=\s*1(\b)/g, '= TRUE$1')
        .replace(/=\s*0(\b)/g, '= FALSE$1')
        .replace(/TINYINT\(1\)/gi, 'BOOLEAN');
    return { text, values: params };
}
exports.pool = {
    async execute(query, params = []) {
        const { text, values } = toPgParams(query, params);
        const result = await pgPool.query(text, values);
        return [result.rows, result.fields];
    },
    async query(query, params = []) {
        const { text, values } = toPgParams(query, params);
        const result = await pgPool.query(text, values);
        return result.rows;
    },
    get native() {
        return pgPool;
    },
};
const testConnection = async () => {
    try {
        await pgPool.query('SELECT 1');
        console.log('✅ Conectado ao banco de dados Postgres');
        return true;
    }
    catch (error) {
        console.error('❌ Erro ao conectar ao banco de dados:', error);
        return false;
    }
};
exports.testConnection = testConnection;
exports.default = exports.pool;
//# sourceMappingURL=database.js.map