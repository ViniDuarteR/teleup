"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.testConnection = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'teleup_user',
    password: process.env.DB_PASSWORD || 'teleup_pass',
    database: process.env.DB_NAME || 'teleup_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};
const pool = promise_1.default.createPool(dbConfig);
exports.pool = pool;
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado ao banco de dados MySQL');
        connection.release();
        return true;
    }
    catch (error) {
        console.error('❌ Erro ao conectar ao banco de dados:', error);
        return false;
    }
};
exports.testConnection = testConnection;
exports.default = pool;
//# sourceMappingURL=database.js.map